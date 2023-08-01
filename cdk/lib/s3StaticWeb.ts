import * as cdk from "aws-cdk-lib";
import * as _iam from "aws-cdk-lib/aws-iam";
import * as _s3 from "aws-cdk-lib/aws-s3";

import * as _s3_deployment from "aws-cdk-lib/aws-s3-deployment";

export class S3StaticWebStack extends cdk.Stack {
  constructor(parent: cdk.App, id: string, props?: cdk.StackProps) {
    super(parent, id, props);

    const webBucket = new _s3.Bucket(this, "web-bucket", {
      websiteErrorDocument: "index.html",
      websiteIndexDocument: "index.html",
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    webBucket.addToResourcePolicy(
      new _iam.PolicyStatement({
        effect: _iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        principals: [new _iam.AnyPrincipal()],
        resources: [webBucket.arnForObjects("*")],
      })
    );

    new _s3_deployment.BucketDeployment(this, "web-deployment", {
      destinationBucket: webBucket,
      sources: [_s3_deployment.Source.asset("../frontend/container/build")],
    });

    new cdk.CfnOutput(this, "static-web-url", {
      value: webBucket.bucketWebsiteUrl,
    });
  }
}
