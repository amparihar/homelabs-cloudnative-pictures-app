import * as cdk from "@aws-cdk/core";
import * as _ec2 from "@aws-cdk/aws-ec2";
import * as _ecs from "@aws-cdk/aws-ecs";
import * as _s3 from "@aws-cdk/aws-s3";
import * as _sqs from "@aws-cdk/aws-sqs";

export interface IThumbnailWorkerProps extends cdk.StackProps {
  imageBucket: _s3.Bucket;
  thumbnailBucket: _s3.Bucket;
  thumbnailQueue: _sqs.Queue;
  workerInstanceCount: number
}

export class ThumbnailWorker extends cdk.Construct {
  private _workerTaskDef: _ecs.FargateTaskDefinition;
  public get workerTaskDef() {
    return this._workerTaskDef;
  }
  constructor(scope: cdk.Stack, id: string, props: IThumbnailWorkerProps) {
    super(scope, id);

    // VPC
    // create a public & private subnet in each AZ
    const vpc = new _ec2.Vpc(this, "thumnnail-vpc", {
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: 2,
      natGateways: 0,
      cidr: "10.50.0.0/20", // max : /16, min /28
    });

    // Cluster
    const cluster = new _ecs.Cluster(this, "thumbnail-kluster", {
      containerInsights: false,
      vpc,
    });

    // Fargate Task Def
    this._workerTaskDef = new _ecs.FargateTaskDefinition(
      this,
      "thumbnail-task-def",
      {
        // 0.5 vCPU, 1 GB
        cpu: 512,
        memoryLimitMiB: 1024,
      }
    );

    this._workerTaskDef.addContainer("thumbnail-worker-container", {
      image: _ecs.ContainerImage.fromAsset("src/thumbnailWorker"),
      portMappings: [
        {
          containerPort: 8080,
        },
      ],
      environment: {
        IMAGE_BUCKET: props.imageBucket.bucketName,
        THUMBNAIL_BUCKET: props.thumbnailBucket.bucketName,
        THUMBNAIL_QUEUE: props.thumbnailQueue.queueUrl,
      },

      logging: _ecs.LogDrivers.awsLogs({
        streamPrefix: "thumbnail-worker",
      }),
    });

    // ECS Fargate Service
    var thumbnailService = new _ecs.FargateService(
      this,
      "thumbnail-worker-service",
      {
        assignPublicIp: true,
        taskDefinition: this._workerTaskDef,
        cluster,
        desiredCount: props.workerInstanceCount,
      }
    );
  }
}
