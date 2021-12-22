import * as cdk from "@aws-cdk/core";
import * as _ec2 from "@aws-cdk/aws-ec2";
import * as _ecs from "@aws-cdk/aws-ecs";
import * as _s3 from "@aws-cdk/aws-s3";
import * as _sqs from "@aws-cdk/aws-sqs";
import * as _cloudwatch from "@aws-cdk/aws-cloudwatch";
import * as _autoscaling from "@aws-cdk/aws-autoscaling";
import * as _cloudwatch_actions from "@aws-cdk/aws-cloudwatch-actions";
import * as _applicationAutoScaling from "@aws-cdk/aws-applicationautoscaling";

export interface IThumbnailWorkerProps extends cdk.StackProps {
  imageBucket: _s3.Bucket;
  thumbnailBucket: _s3.Bucket;
  thumbnailQueue: _sqs.Queue;
  workerInstanceCount: number;
}

export class ThumbnailWorker extends cdk.Construct {
  private _workerTaskDef: _ecs.FargateTaskDefinition;
  private _workerService: _ecs.FargateService;
  private _cluster: _ecs.Cluster;
  public get workerTaskDef() {
    return this._workerTaskDef;
  }
  public get workerService() {
    return this._workerService;
  }
  public get cluster() {
    return this._cluster;
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
    this._cluster = new _ecs.Cluster(this, "thumbnail-kluster", {
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
    this._workerService = new _ecs.FargateService(
      this,
      "thumbnail-worker-service",
      {
        assignPublicIp: true,
        taskDefinition: this._workerTaskDef,
        cluster: this._cluster,
        desiredCount: props.workerInstanceCount,
      }
    );

    // const workerServiceAutoScaling = this.workerService.autoScaleTaskCount({
    //   maxCapacity: 3,
    // });
    // workerServiceAutoScaling.scaleOnMetric(
    //   "approximate-number-of-messages-visible",
    //   {
    //     metric: props.thumbnailQueue.metricApproximateNumberOfMessagesVisible(),
    //     scalingSteps: [
    //       { lower: 0, change: -1 },
    //       { lower: 1, upper: 500, change: +1 },
    //       { lower: 500, upper: 1000, change: +1 },
    //       { lower: 1000, change: +1 },
    //     ],
    //     evaluationPeriods: 2,
    //   }
    // );

    // CloudWatch Alarms
    const workerServicAutoScalOutpAlarm = new _cloudwatch.Alarm(
      this,
      "worker-service-auto-scale-out-alarm",
      {
        metric: props.thumbnailQueue
          .metricApproximateNumberOfMessagesVisible()
          .with({
            statistic: "max",
            period: cdk.Duration.minutes(1),
          }),

        evaluationPeriods: 3,
        datapointsToAlarm: 2,
        threshold: 1,
        comparisonOperator:
          _cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: _cloudwatch.TreatMissingData.MISSING,
      }
    );

    const workerServicAutoScaleInAlarm = new _cloudwatch.Alarm(
      this,
      "worker-service-auto-scale-in-alarm",
      {
        metric: props.thumbnailQueue
          .metricApproximateNumberOfMessagesVisible()
          .with({
            statistic: "max",
            period: cdk.Duration.minutes(1),
          }),

        evaluationPeriods: 3,
        datapointsToAlarm: 2,
        threshold: 1,
        comparisonOperator: _cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        treatMissingData: _cloudwatch.TreatMissingData.MISSING,
      }
    );

    //// Application Autoscaling
    const workerServiceScalableTarget =
      new _applicationAutoScaling.ScalableTarget(
        this,
        "worker-service-scalable-target",
        {
          serviceNamespace: _applicationAutoScaling.ServiceNamespace.ECS,
          maxCapacity: 3,
          minCapacity: 1,
          resourceId: `service:${this._cluster.clusterName}:${this._workerService.serviceName}`,
          scalableDimension: "ecs:service:DesiredCount",
        }
      );

    const stepScalingAction = new _applicationAutoScaling.StepScalingAction(
      this,
      "",
      {
        scalingTarget: workerServiceScalableTarget,
        
      }
    );

    // const applicationScalingAction =
    //   new _cloudwatch_actions.ApplicationScalingAction(stepScalingAction);

    // workerServicAutoScalOutpAlarm.addAlarmAction(applicationScalingAction);
  }
}
