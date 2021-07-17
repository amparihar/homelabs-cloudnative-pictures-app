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
variable "enabled_cluster_log_types" {
  type    = list(string)
  default = ["api", "audit", "authenticator", "scheduler", "controllerManager"]
}
variable "private_networking" {
  type = bool
}