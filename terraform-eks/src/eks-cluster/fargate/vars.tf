variable "profile_name" {}
variable "cluster_name" {}
variable "subnet_ids" {
  type    = list(string)
  default = []
}
variable "selector_namespaces" {
  type = list(string)
}