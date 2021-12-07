import * as cdk from "@aws-cdk/core";
import * as _ec2 from "@aws-cdk/aws-ec2";
import * as _ecs from "@aws-cdk/aws-ecs";
import * as _ecs_pattern from "@aws-cdk/aws-ecs-patterns";

class BaseResources extends cdk.Stack {
  vpc: _ec2.Vpc;
  cluster: _ecs.Cluster;
  constructor(parent: cdk.App, id: string, props: cdk.StackProps) {
    super(parent, id, props);

    this.vpc = new _ec2.Vpc(this, "vpc", {
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 1,
      maxAzs: 2,
    });

    this.cluster = new _ecs.Cluster(this, "cluster", {
      vpc: this.vpc,
    });
  }
}

interface IPictureApp extends cdk.StackProps {
  cluster: _ecs.Cluster;
}

class PictureApp extends cdk.Stack {
  private fargateService: _ecs_pattern.ApplicationLoadBalancedFargateService;
  constructor(parent: cdk.App, id: string, props: IPictureApp) {
    super(parent, id, props);

    this.fargateService =
      new _ecs_pattern.ApplicationLoadBalancedFargateService(this, "web", {
        cluster: props.cluster,
        memoryLimitMiB: 1024,
        taskImageOptions: {
          image: _ecs.ContainerImage.fromAsset("../frontend/container"),
          containerPort: 3000,
        },
        desiredCount: 2,
      });

      this.fargateService.targetGroup.configureHealthCheck({
        path: "/index.html"
      });
     
  }
}

export class App extends cdk.App {
  private baseResource: BaseResources;
  constructor() {
    super();
    this.baseResource = new BaseResources(this, "base-resources", {});

    new PictureApp(this, "picture-app", {
      cluster: this.baseResource.cluster,
    });
  }
}
