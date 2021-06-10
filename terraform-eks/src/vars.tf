variable "aws_region" {
  type = string
}
variable "aws_regions" {
  type = map(string)
}
variable "create_vpc" {
  type = bool
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
variable "cluster_name" {
  default = "eks-fargate-tf-homelabs-pictures"
}
