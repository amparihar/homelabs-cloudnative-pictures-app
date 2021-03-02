import * as cdk from "@aws-cdk/core";

import * as _s3 from "@aws-cdk/aws-s3";
import * as _dynamodb from "@aws-cdk/aws-dynamodb";
import * as _lambda from "@aws-cdk/aws-lambda";
import * as _lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import * as _iam from "@aws-cdk/aws-iam";

import { ServiceApi } from "./serviceApi";
import { Cognito } from "./cognito";

export class HomeLabsPipBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageBucket = new _s3.Bucket(this, "image-bucket", {
      versioned: false,
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
    });

    rekFn.addEventSource(
      new _lambdaEventSources.S3EventSource(imageBucket, {
        events: [_s3.EventType.OBJECT_CREATED],
      })
    );

    imageBucket.grantRead(rekFn);
    imageTable.grantWriteData(rekFn);

    const rekFnPolicyStatement = new _iam.PolicyStatement({
      effect: _iam.Effect.ALLOW,
      actions: ["rekognition:DetectLabels"],
      resources: ["*"],
    });

    rekFn.addToRolePolicy(rekFnPolicyStatement);

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
      }
    );

    imageTable.grantReadWriteData(deleteImageServiceFn);
    imageBucket.grantDelete(deleteImageServiceFn);

    // const getImageDockerFn = new _lambda.DockerImageFunction(this, "get-image-docker-function", {
    //   code: _lambda.DockerImageCode.fromImageAsset(
    //     "src/serviceFunction/getImage"
    //   ),
    //   environment: {
    //     IMAGE_BUCKET: imageBucket.bucketName,
    //     IMAGE_TABLE: imageTable.tableName,
    //   },
    // });

    // imageTable.grantReadWriteData(getImageDockerFn);

    // cognito
    const cognito = new Cognito(this, "cognito-construct", {
      imageBucket: imageBucket,
    });

    // api
    const api = new ServiceApi(this, "api-construct", {
      serviceFn: {
        getImageFn: getImageServiceFn,
        deleteImageFn: deleteImageServiceFn,
      },
      userPoolArns: [cognito.userPool.userPoolArn],
    });
  }
}
