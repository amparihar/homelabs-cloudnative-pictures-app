provider "aws" {
  region = var.aws_regions[var.aws_region]
}

data "aws_availability_zones" "available" {
}

module "vpc" {
  source                 = "./vpc"
  aws_availability_zones = data.aws_availability_zones.available.names
  create_vpc             = var.create_vpc
  cidr                   = var.vpc_cidr
  public_subnets         = var.public_subnets
  private_subnets        = var.private_subnets
  cluster_name           = var.cluster_name
}

module "cluster" {
  source             = "./eks-cluster"
  cluster_name       = var.cluster_name
  #public_subnet_ids  = module.vpc.public_subnet_ids
  #private_subnet_ids = module.vpc.private_subnet_ids
  subnet_ids         = module.vpc.subnet_ids
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

output "eks_cluster_status" {
  value = module.cluster.eks_cluster_status
}

output "fargate_profile_id" {
  value = module.cluster.fargate_profile_id
}

output "fargate_profile_status" {
  value = module.cluster.fargate_profile_status
}
