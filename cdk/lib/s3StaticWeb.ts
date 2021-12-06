import * as cdk from "@aws-cdk/core";
import * as _iam from "@aws-cdk/aws-iam";
import * as _s3 from "@aws-cdk/aws-s3";

import * as _s3_deployment from "@aws-cdk/aws-s3-deployment";

export class S3StaticWebStack extends cdk.Stack {
    constructor(parent: cdk.App, id: string, props?: cdk.StackProps){
        super(parent, id, props);
        
        const webBucket = new _s3.Bucket(parent, "web-bucket", {
            websiteErrorDocument: "index.html",
            websiteIndexDocument: "index.html",
            objectOwnership : _s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
            //blockPublicAccess : new _s3.BlockPublicAccess({})
        });
        
        webBucket.addToResourcePolicy(new _iam.PolicyStatement({
            effect : _iam.Effect.ALLOW,
            actions : ["s3:GetObject"],
            principals: [new _iam.AnyPrincipal()],
            resources: [webBucket.arnForObjects("*")]
        }))
        
        new _s3_deployment.BucketDeployment(parent, "web-deployment", {
            destinationBucket : webBucket,
            sources : [_s3_deployment.Source.asset("../../../frontend/container/build")]
            
        })
        
    }
    
}