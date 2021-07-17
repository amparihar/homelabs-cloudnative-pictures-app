provider "aws" {
  region = var.aws_regions[var.aws_region]
}

data "aws_availability_zones" "available" {
}

module "vpc" {
  source                 = "./vpc"
  app_name               = var.app_name
  stage_name             = var.stage_name
  aws_availability_zones = data.aws_availability_zones.available.names
  create_vpc             = var.create_vpc
  cidr                   = var.vpc_cidr
  public_subnets         = var.public_subnets
  private_subnets        = var.private_subnets
  cluster_name           = var.cluster_name
}

module "cluster" {
  source             = "./eks-cluster"
  app_name           = var.app_name
  stage_name         = var.stage_name
  cluster_name       = var.cluster_name
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  enabled_cluster_log_types = []
  private_networking = var.private_networking
}

output "vpcid" {
  value = module.vpc.vpcid
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "eks_cluster_id" {
  value = module.cluster.eks_cluster_id
}

output "eks_cluster_name" {
  value = var.cluster_name
}

output "eks_cluster_status" {
  value = module.cluster.eks_cluster_status
}

# role name used to attach policy to allow fargate profiles to write logs to CW using fluentbit log router
output "eks_fargate_pod_execution_role_name" {
  value = module.cluster.eks_fargate_pod_execution_role_name
}

output "default_fargate_profile_id" {
  value = module.cluster.default_fargate_profile_id
}

output "default_fargate_profile_status" {
  value = module.cluster.default_fargate_profile_status
}

output "core_fargate_profile_id" {
  value = module.cluster.core_fargate_profile_id
}

output "core_fargate_profile_status" {
  value = module.cluster.core_fargate_profile_status
}
