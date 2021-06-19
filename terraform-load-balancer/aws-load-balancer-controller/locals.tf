locals {
  oidc_url = data.aws_eks_cluster.main.identity[0].oidc[0].issuer
}
