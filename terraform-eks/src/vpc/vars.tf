variable "name" {
  default = "eks-fargate-tf-homelabs-pictures-vpc"
}
variable "create_vpc" {}
variable "aws_availability_zones" {}
variable "cidr" {}

variable "private_subnets" {}
variable "public_subnets" {}
variable "cluster_name" {}
