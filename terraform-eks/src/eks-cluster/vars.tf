variable "app_name" {
  default = ""
}
variable "stage_name" {
  default = ""
}
variable "cluster_name" {}
variable "public_subnet_ids" {
  type    = list(string)
  default = []
}
variable "private_subnet_ids" {
  type    = list(string)
  default = []
}