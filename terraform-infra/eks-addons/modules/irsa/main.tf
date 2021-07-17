variable "oidc_url" {
  type = string
}

data "tls_certificate" "main" {
  url = var.oidc_url
}

data "aws_caller_identity" "current" {}

# OIDC IdP
resource "aws_iam_openid_connect_provider" "oidcProvider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.main.certificates[0].sha1_fingerprint]
  url             = var.oidc_url
}

data "aws_iam_policy_document" "kubernetes_sa_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    # condition {
    #   test     = "StringLike"
    #   variable = "${replace(var.oidc_url, "https://", "")}:sub"
    #   values   = ["system:serviceaccount:*"]
    # }

    condition {
      test     = "StringLike"
      variable = "${replace(var.oidc_url, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }

    principals {
      type        = "Federated"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${replace(var.oidc_url, "https://", "")}", "cognito-identity.amazonaws.com"]
    }
  }
}

# IRSA
resource "aws_iam_role" "kubernetes_sa_iam_role" {
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.kubernetes_sa_assume_role_policy.json
}

output "kubernetes_sa_iam_role_name" {
  value = aws_iam_role.kubernetes_sa_iam_role.name
}


