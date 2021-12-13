import * as cdk from "@aws-cdk/core";
import * as _ec2 from "@aws-cdk/aws-ec2";
import * as _ecs from "@aws-cdk/aws-ecs";
import * as _s3 from "@aws-cdk/aws-s3";
import * as _sqs from "@aws-cdk/aws-sqs";

export interface IThumbnailWorkerProps extends cdk.StackProps {
    imageBucket : _s3.Bucket
    thumbnailBucket : _s3.Bucket
    thumbnailQueue : _sqs.Queue
};

export class ThumbnailWorker extends cdk.Construct {
    constructor(scope: cdk.Stack, id: string, props: IThumbnailWorkerProps) {
        super(scope, id);
        
        // VPC
        // create a public & private subnet in each AZ
        const vpc = new _ec2.Vpc(this, "thumnnail-vpc", {
            enableDnsHostnames: true,
            enableDnsSupport : true,
            maxAzs: 2,
            natGateways: 0,
            cidr : "10.50.0.0/20", // max : /16, min /28
        });
        
        
        // Cluster
        const cluster = new _ecs.Cluster(this, "thumbnail-kluster", {
            containerInsights: false,
            vpc
        });
        
        // Fargate Task Def
        const thumbnailTaskDef = new _ecs.FargateTaskDefinition(this, "thumbnail-task-def", {
            cpu: 512,
            memoryLimitMiB: 2048
        });
        
        thumbnailTaskDef.addContainer("thumbnail-worker-container" , {
            image : _ecs.ContainerImage.fromAsset("src/thumbnailWorker"),
            portMappings: [{
                containerPort: 8080
            }],
            environment :{
                "IMAGE_BUCKET": props.imageBucket.bucketName,
                "THUMBNAIL_BUCKET": props.thumbnailBucket.bucketName,
                "THUMBNAIL_QUEUE" : props.thumbnailQueue.queueUrl
            },
            
            logging: _ecs.LogDrivers.awsLogs({
                streamPrefix: "thumbnail-worker"
            })
        });
        
        // ECS Fargate Service
        var thumbnailService = new _ecs.FargateService(this, "thumbnail-worker-service", {
            assignPublicIp: true,
            taskDefinition: thumbnailTaskDef,
            cluster,
            desiredCount: 1
        });
        
        // Grant Access
        props.imageBucket.grantRead(thumbnailTaskDef.taskRole);
        props.thumbnailBucket.grantWrite(thumbnailTaskDef.taskRole);
        props.thumbnailQueue.grantConsumeMessages(thumbnailTaskDef.taskRole);
        
    }
}