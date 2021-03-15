import * as cdk from "@aws-cdk/core";

import * as _s3 from "@aws-cdk/aws-s3";
import * as _s3n from "@aws-cdk/aws-s3-notifications";
import * as _dynamodb from "@aws-cdk/aws-dynamodb";
import * as _lambda from "@aws-cdk/aws-lambda";
import * as _lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import * as _iam from "@aws-cdk/aws-iam";
import * as _logs from "@aws-cdk/aws-logs";
import * as _sqs from "@aws-cdk/aws-sqs";

import { ServiceApi } from "./serviceApi";
import { Cognito } from "./cognito";
import { MessageService } from "./messageService";

export class HomeLabsPipStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageBucket = new _s3.Bucket(this, "image-bucket", {
      versioned: false,
      encryption: _s3.BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: _s3.BlockPublicAccess.BLOCK_ALL,
      // // lifecycleRules: [
      // //   {
      // //     expiration: cdk.Duration.days(60),
      // //     transitions: [
      // //       {
      // //         transitionAfter: cdk.Duration.days(30),
      // //         storageClass: _s3.StorageClass.INFREQUENT_ACCESS,
      // //       }
      // //     ],
      // //   },
      // // ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // output
    new cdk.CfnOutput(this, "image-bucket-name", {
      value: imageBucket.bucketName,
    });

    const imageTable = new _dynamodb.Table(this, "image-table", {
      partitionKey: { name: "id", type: _dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // output
    new cdk.CfnOutput(this, "image-table-name", {
      value: imageTable.tableName,
    });

    const rekLayer = new _lambda.LayerVersion(this, "image-function-layer", {
      code: _lambda.Code.fromAsset("layer"),
      compatibleRuntimes: [_lambda.Runtime.NODEJS_12_X],
    });

    const rekFn = new _lambda.Function(this, "rek-function", {
      code: _lambda.Code.fromAsset("src/rekognitionFunction"),
      handler: "index.run",
      runtime: _lambda.Runtime.NODEJS_12_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      environment: {
        IMAGE_BUCKET: imageBucket.bucketName,
        IMAGE_TABLE: imageTable.tableName,
      },
      layers: [rekLayer],
      logRetention: _logs.RetentionDays.ONE_DAY,
    });

    // // adds a Resource based Policy to allow S3 to invoke the Fn
    // // rekFn.addEventSource(
    // //   new _lambdaEventSources.S3EventSource(imageBucket, {
    // //     events: [_s3.EventType.OBJECT_CREATED],
    // //   })
    // // );

    imageBucket.grantRead(rekFn);
    imageTable.grantWriteData(rekFn);

    const rekFnPolicyStatement = new _iam.PolicyStatement({
      effect: _iam.Effect.ALLOW,
      actions: ["rekognition:DetectLabels"],
      resources: ["*"],
    });

    rekFn.addToRolePolicy(rekFnPolicyStatement);

    // Service Functions
    const getImageServiceFn = new _lambda.Function(
      this,
      "get-image-service-function",
      {
        code: _lambda.Code.fromAsset("src/serviceFunction/getImage"),
        handler: "index.run",
        runtime: _lambda.Runtime.NODEJS_12_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
        environment: {
          IMAGE_TABLE: imageTable.tableName,
        },
        logRetention: _logs.RetentionDays.ONE_DAY,
      }
    );

    imageTable.grantReadWriteData(getImageServiceFn);

    const deleteImageServiceFn = new _lambda.Function(
      this,
      "delete-image-service-function",
      {
        code: _lambda.Code.fromAsset("src/serviceFunction/deleteImage"),
        handler: "index.run",
        runtime: _lambda.Runtime.NODEJS_12_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(30),
        environment: {
          IMAGE_BUCKET: imageBucket.bucketName,
          IMAGE_TABLE: imageTable.tableName,
        },
        logRetention: _logs.RetentionDays.ONE_DAY,
      }
    );

    imageTable.grantReadWriteData(deleteImageServiceFn);
    imageBucket.grantDelete(deleteImageServiceFn);

    // // const getImageDockerFn = new _lambda.DockerImageFunction(this, "get-image-docker-function", {
    // //   code: _lambda.DockerImageCode.fromImageAsset(
    // //     "src/serviceFunction/getImage"
    // //   ),
    // //   environment: {
    // //     IMAGE_BUCKET: imageBucket.bucketName,
    // //     IMAGE_TABLE: imageTable.tableName,
    // //   },
    // // });
    // // imageTable.grantReadWriteData(getImageDockerFn);

    // cognito
    const cognito = new Cognito(this, "cognito-construct");

    // Define access policies for the authenticated user

    cognito.role.addToPolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["s3:GetObject", "s3:PutObject"],
        resources: [
          `${imageBucket.bucketArn}/private/` +
            "${cognito-identity.amazonaws.com:sub}/*",
        ],
      })
    );

    cognito.role.addToPolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["s3:ListBucket"],
        resources: [`${imageBucket.bucketArn}`],
        conditions: {
          StringLike: {
            "s3:prefix": ["/private/${cognito-identity.amazonaws.com:sub}/*"],
          },
        },
      })
    );

    // api
    const api = new ServiceApi(this, "api-construct", {
      serviceFn: {
        getImageFn: getImageServiceFn,
        deleteImageFn: deleteImageServiceFn,
      },
      userPoolArns: [cognito.userPool.userPoolArn],
    });

    // SQS
    // //const messageService = new MessageService(this, "message-service");
    // // const imageQueue = messageService.imageQueue

    const dlQueue = new _sqs.Queue(this, "dlImageQueue", {
      queueName: "pip-image-buffer-dlqueue",
      visibilityTimeout: cdk.Duration.seconds(30), // this is the default
      receiveMessageWaitTime: cdk.Duration.seconds(20), // long polling
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const imageQueue = new _sqs.Queue(this, "imageQueue", {
      queueName: "pip-image-buffer-queue",
      visibilityTimeout: cdk.Duration.seconds(180), // default is 30s
      receiveMessageWaitTime: cdk.Duration.seconds(20), // long polling
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deadLetterQueue: {
        maxReceiveCount: 2,
        queue: dlQueue,
      },
    });

    rekFn.addEventSource(new _lambdaEventSources.SqsEventSource(imageQueue));

    imageBucket.addEventNotification(
      _s3.EventType.OBJECT_CREATED,
      new _s3n.SqsDestination(imageQueue),
      { prefix: "private/" }
    );
  }
}
