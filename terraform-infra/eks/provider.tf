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

output "vpcid" {
  value = module.vpc.vpcid
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

module "cluster" {
  source                    = "./cluster"
  app_name                  = var.app_name
  stage_name                = var.stage_name
  cluster_name              = var.cluster_name
  cluster_version           = var.k8s_version
  public_subnet_ids         = module.vpc.public_subnet_ids
  private_subnet_ids        = module.vpc.private_subnet_ids
  enabled_cluster_log_types = []
  private_networking        = var.private_networking
}

output "eks_cluster_id" {
  value = module.cluster.eks_cluster_id
}

output "eks_cluster_name" {
  value = module.cluster.eks_cluster_name
}

output "eks_cluster_status" {
  value = module.cluster.eks_cluster_status
}

output "eks_cluster_oidc_url" {
  value = module.cluster.eks_cluster_oidc_url
}

module "irsa" {
  source   = "./irsa"
  oidc_url = module.cluster.eks_cluster_oidc_url
}

output "k8s_sa_iam_role_name" {
  value = module.irsa.k8s_sa_iam_role_name
}

output "k8s_sa_iam_role_arn" {
  value = module.irsa.k8s_sa_iam_role_arn
}

output "eks_fargate_pod_execution_iam_role_name" {
  value = module.irsa.eks_fargate_pod_execution_iam_role_name
}

module "default_fargate_profile" {
  source                 = "./fargate"
  app_name               = var.app_name
  stage_name             = var.stage_name
  profile_name           = "fp-default"
  cluster_name           = module.cluster.eks_cluster_name
  subnet_ids             = module.vpc.private_subnet_ids
  pod_execution_role_arn = module.irsa.eks_fargate_pod_execution_iam_role_arn
  selectors              = [{ namespace = "default" }, { namespace = "development" }]
}

output "default_fargate_profile_id" {
  value = module.default_fargate_profile.id
}

output "default_fargate_profile_status" {
  value = module.default_fargate_profile.status
}

module "core_fargate_profile" {
  source                 = "./fargate"
  app_name               = var.app_name
  stage_name             = var.stage_name
  profile_name           = "fp-core"
  cluster_name           = module.cluster.eks_cluster_name
  subnet_ids             = module.vpc.private_subnet_ids
  pod_execution_role_arn = module.irsa.eks_fargate_pod_execution_iam_role_arn
  selectors = [
    { namespace = "kube-system" },
    { namespace = "kubernetes-dashboard" },
    { namespace = "appmesh-system" },
    { namespace = "aws-observability" }
  ]
  # selectors            = [{ namespace = "kube-system", labels = { k8s-app = "kube-dns" } }]
}

output "core_fargate_profile_id" {
  value = module.core_fargate_profile.id
}

output "core_fargate_profile_status" {
  value = module.core_fargate_profile.status
}