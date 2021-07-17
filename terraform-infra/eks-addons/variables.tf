variable "app_name" {
  type    = string
  default = "homelabs"
}
variable "stage_name" {
  type    = string
  default = "non-prod"
}
variable "aws_region" {
  type    = string
  default = "mumbai"
}
variable "aws_regions" {
  type = map(string)
  default = {
    mumbai = "ap-south-1"
  }
}
variable "cluster_name" {
  type        = string
  description = "The name of an existing EKS Cluster"
  validation {
    condition     = length(var.cluster_name) > 0
    error_message = "Cluster Name is required."
  }
}
variable "vpc_id" {
  type        = string
  description = "The Id of an existing VPC"
  validation {
    condition     = length(var.vpc_id) > 0
    error_message = "VPC Id is required."
  }
}
variable "eks_fargate_pod_execution_role_name" {
  type        = string
  description = "The fargate pod execution role name."
  validation {
    condition     = length(var.eks_fargate_pod_execution_role_name) > 0
    error_message = "Fargate pod execution role name is required."
  }
}
