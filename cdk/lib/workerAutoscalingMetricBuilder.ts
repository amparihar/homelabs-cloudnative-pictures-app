import * as cdk from "@aws-cdk/core";
import * as _events from "@aws-cdk/aws-events";
import * as _events_targets from "@aws-cdk/aws-events-targets";
import * as _lambda from "@aws-cdk/aws-lambda";
import * as _logs from "@aws-cdk/aws-logs";
import * as _sqs from "@aws-cdk/aws-sqs";

export interface IWorkerAutoscalingMetricBuilder extends cdk.StackProps {
    thumbQueue : _sqs.Queue
}

export class WorkerAutoscalingMetricBuilder extends cdk.Construct {
    
    private _metricBuilderFn: _lambda.Function;
    public get metricBuilderFn() {
        return this._metricBuilderFn;
    }
    
    constructor(stack : cdk.Stack, id: string, props: IWorkerAutoscalingMetricBuilder) {
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
              //QUEUE_NAME: props.queueUrl,
            },
            logRetention: _logs.RetentionDays.ONE_DAY,
          }
        );
        
        const metricBuilderFnPolicyStatement = new _iam.PolicyStatement({
          effect: _iam.Effect.ALLOW,
          actions: ["sqs:GetQueueAttributes"],
          resources: ["*"],
        },{
          effect: _iam.Effect.ALLOW,
          actions: ["ecs:DescribeServices"],
          resources: ["*"],
        });

        this._metricBuilderFn.addToRolePolicy(metricBuilderFnPolicyStatement);
        
        const rule =  new _events.Rule(this, "fn-scheduling-rule", {
            schedule : _events.Schedule.expression("cron(0/15 * * 12 ? 2021)"),
        });
        
        rule.addTarget(new _events_targets.LambdaFunction(this._metricBuilderFn));
    }
    
}
