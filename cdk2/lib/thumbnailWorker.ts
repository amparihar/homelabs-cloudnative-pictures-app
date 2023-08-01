import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';

import * as _ec2 from "aws-cdk-lib/aws-ec2";
import * as _ecs from "aws-cdk-lib/aws-ecs";
import * as _s3 from "aws-cdk-lib/aws-s3";
import * as _sqs from "aws-cdk-lib/aws-sqs";
import * as _cloudwatch from "aws-cdk-lib/aws-cloudwatch";

import * as _cloudwatch_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as _applicationAutoScaling from "aws-cdk-lib/aws-applicationautoscaling";

export interface IThumbnailWorkerProps extends cdk.StackProps {
  imageBucket: _s3.Bucket;
  thumbnailBucket: _s3.Bucket;
  thumbnailQueue: _sqs.Queue;
  workerInstanceCount: number;
}

export class ThumbnailWorker extends Construct {
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
    //     metric: props.thumbnailQueue.metricApproximateNumberOfMessagesVisible().with({
    //         statistic: "max",
    //         period: cdk.Duration.minutes(1),
    //     }),
    //     scalingSteps: [

    //       { lower: 1, upper: 500, change: +1 },
    //       { lower: 500, upper: 1000, change: +1 },
    //       { lower: 1000, change: +1 },
    //     ],
    //     evaluationPeriods: 2,

    //   }
    // );

    // CloudWatch Alarms
    // The scale-out alarm will be trigged when the netric >= 10 for 2 evaluation periods out of 3 of duration 60 seconds
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
        threshold: 10,
        comparisonOperator: _cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: _cloudwatch.TreatMissingData.MISSING,
      }
    );
    
    // The scale-in alarm will be trigged when the netric < 10 for 2 evaluation periods out of 3 of duration 60 seconds
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
        threshold: 10,
        comparisonOperator: _cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        treatMissingData: _cloudwatch.TreatMissingData.MISSING,
      }
    );

    //// Application Autoscaling //////////////////////////////////////////////////////////////
    const workerServiceScalableTarget =
      new _applicationAutoScaling.ScalableTarget(
        this,
        "worker-service-scalable-target",
        {
          serviceNamespace: _applicationAutoScaling.ServiceNamespace.ECS,
          maxCapacity: 3,
          minCapacity: 1,
          resourceId: `service/${this._cluster.clusterName}/${this._workerService.serviceName}`,
          scalableDimension: "ecs:service:DesiredCount",
        }
      );

    // ScaleOut Action
    const workerServiceStepScaleOutAction =
      new _applicationAutoScaling.StepScalingAction(
        this,
        "worker-service-step-scale-out-action",
        {
          scalingTarget: workerServiceScalableTarget,
          adjustmentType: _applicationAutoScaling.AdjustmentType.EXACT_CAPACITY,
          metricAggregationType: _applicationAutoScaling.MetricAggregationType.AVERAGE,
          policyName : "worker-service-step-scale-out"
        }
      );

    // Triggers the adjustment when the metric is greater than or equal to 10 and less than 20
    workerServiceStepScaleOutAction.addAdjustment({
      adjustment: 2,
      lowerBound: 0,
      upperBound: 10,
    });

    // Triggers the adjustment when the metric is greater than or equal to 20
    workerServiceStepScaleOutAction.addAdjustment({
      adjustment: 3,
      lowerBound: 10,
    });

    const applicationScalingOutAction =
      new _cloudwatch_actions.ApplicationScalingAction(
        workerServiceStepScaleOutAction
      );

    workerServicAutoScalOutpAlarm.addAlarmAction(applicationScalingOutAction);

    // ScaleIn Action
    const workerServiceStepScaleInAction =
      new _applicationAutoScaling.StepScalingAction(
        this,
        "worker-service-step-scale-in-action",
        {
          scalingTarget: workerServiceScalableTarget,
          adjustmentType: _applicationAutoScaling.AdjustmentType.EXACT_CAPACITY,
          metricAggregationType:
            _applicationAutoScaling.MetricAggregationType.AVERAGE,
            policyName : "worker-service-step-scale-in"
        }
      );

    // Triggers the adjustment when the metric is less than 10
    workerServiceStepScaleInAction.addAdjustment({
      adjustment: 1,
     upperBound: 0,
    });
    
    const applicationScalingInAction =
      new _cloudwatch_actions.ApplicationScalingAction(
        workerServiceStepScaleInAction
      );

    workerServicAutoScaleInAlarm.addAlarmAction(applicationScalingInAction);
  }
}
