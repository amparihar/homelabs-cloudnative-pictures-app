variable "profile_name" {}
variable "cluster_name" {}
variable "subnet_ids" {
  type    = list(string)
  default = []
}
variable "selectors" {
  type = list(object({ namespace : string, labels : map(string) }))
}