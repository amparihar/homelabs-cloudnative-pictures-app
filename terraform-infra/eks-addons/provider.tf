data "aws_eks_cluster" "main" {
  name = var.cluster_name
}

data "aws_eks_cluster_auth" "main" {
  name = var.cluster_name
}

provider "aws" {
  region = var.aws_regions[var.aws_region]
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.main.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.main.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}

module "aws_load_balancer_controller" {
  source       = "./modules/aws-load-balancer-controller"
  app_name     = var.app_name
  stage_name   = var.stage_name
  cluster_name = var.cluster_name
  vpc_id       = var.vpc_id
  region_id    = var.aws_regions[var.aws_region]
  irsa_name    = var.irsa_name
}

module "kubernetes_dashboard" {
  source = "./modules/k8s-dashboard"
}

module "fargate_logging" {
  source       = "./modules/logging"
  cluster_name = var.cluster_name
  irsa_name    = var.irsa_name
  region_id    = var.aws_regions[var.aws_region]
}

module "app-mesh-controller" {
  source     = "./modules/app-mesh-controller"
  app_name   = var.app_name
  stage_name = var.stage_name
  region_id  = var.aws_regions[var.aws_region]
  irsa_name  = var.irsa_name
}
