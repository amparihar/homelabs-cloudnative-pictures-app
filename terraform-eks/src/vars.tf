variable "aws_region" {
  type = string
}
variable "aws_regions" {
  type = map(string)
}
variable "create_vpc" {
  type    = bool
  default = true
}
variable "vpc_cidr" {
  type = string
}
variable "private_subnets" {
  type = list(string)
}
variable "public_subnets" {
  type = list(string)
}
variable "app_name" {
  type    = string
  default = "Homelabs Pictures"
}
variable "stage_name" {
  type    = string
  default = "non-prod"
}
variable "cluster_name" {
  default = "homelabs-pictures-eks-fargate-terraform-cluster"
}
