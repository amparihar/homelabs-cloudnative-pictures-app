import * as cdk from "@aws-cdk/core";
import * as _ec2 from "@aws-cdk/aws-ec2";
import * as _ecs from "@aws-cdk/aws-ecs";

export class ThumbnailTask extends cdk.Construct {
    constructor(scope: cdk.Stack, id: string, props?: cdk.StackProps) {
        super(scope, id);
        
        // VPC
        // create a public & private subnet in each AZ
        const vpc = new _ec2.Vpc(this, "thumnnail-vpc", {
            enableDnsHostnames: true,
            enableDnsSupport : true,
            maxAzs: 2,
            natGateways: 1,
            cidr : "10.50.0.0/20", // max : /16, min /28
        })
        
        
        // Cluster
        
        const cluster = new _ecs.Cluster(this, "thumbnail-kluster", {
            containerInsights: false,
            vpc
        
        })
        
        // Fargate Task Def
        
        const thumbnailTaskDef = new _ecs.FargateTaskDefinition(this, "thumbnail-task-def", {
            
        });
        
        thumbnailTaskDef.addContainer("" , {
            image : _ecs.ContainerImage.fromAsset("src/thumbnailTask"),
            environment :{
                
            }
        })
        
        // ECS Fargate Service
        
        // Grant Access
    }
}