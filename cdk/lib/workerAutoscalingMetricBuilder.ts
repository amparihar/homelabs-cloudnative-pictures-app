import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';

import * as _events from "aws-cdk-lib/aws-events";
import * as _events_targets from "aws-cdk-lib/aws-events-targets";
import * as _lambda from "aws-cdk-lib/aws-lambda";
import * as _logs from "aws-cdk-lib/aws-logs";
import * as _sqs from "aws-cdk-lib/aws-sqs";
import * as _iam from "aws-cdk-lib/aws-iam";
import * as _ecs from "aws-cdk-lib/aws-ecs";

export interface IWorkerAutoscalingMetricBuilder extends cdk.StackProps {
  thumbQueue: _sqs.Queue;
  thumbWorkerService : _ecs.FargateService
  cluster: string
}

export class WorkerAutoscalingMetricBuilder extends Construct {
  private _metricBuilderFn: _lambda.Function;
  public get metricBuilderFn() {
    return this._metricBuilderFn;
  }

  constructor(
    stack: cdk.Stack,
    id: string,
    props: IWorkerAutoscalingMetricBuilder
  ) {
    super(stack, id);

    this._metricBuilderFn = new _lambda.Function(
      this,
      "metric-builder-function",
      {
        code: _lambda.Code.fromAsset("src/workerAutoscaling"),
        handler: "index.run",
        runtime: _lambda.Runtime.NODEJS_14_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
        environment: {
          QUEUE_URL: props.thumbQueue.queueUrl,
          QUEUE_NAME: props.thumbQueue.queueName,
          ECS_SERVICE_NAME: props.thumbWorkerService.serviceName,
          ECS_CLUSTER_NAME: props.cluster
        },
        logRetention: _logs.RetentionDays.ONE_DAY,
      }
    );

    this._metricBuilderFn.addToRolePolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["sqs:GetQueueAttributes"],
        resources: [props.thumbQueue.queueArn],
      })
    );
    this._metricBuilderFn.addToRolePolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["ecs:DescribeServices"],
        resources: [props.thumbWorkerService.serviceArn],
      })
    );
    this._metricBuilderFn.addToRolePolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["cloudwatch:PutMetricData"],
        resources: ["*"],
      })
    );

    // const rule = new _events.Rule(this, "fn-scheduling-rule", {
    //   schedule: _events.Schedule.expression("cron(0/15 * * 12 ? 2021)"),
    // });

    // rule.addTarget(new _events_targets.LambdaFunction(this._metricBuilderFn));
  }
}
