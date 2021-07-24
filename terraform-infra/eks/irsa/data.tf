data "tls_certificate" "main" {
  url = var.oidc_url
}

data "aws_caller_identity" "current" {}

# Fargate pod execution role
data "aws_iam_policy_document" "eks_fargate_pod_execution_role_assume_role_iam_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks-fargate-pods.amazonaws.com"]
    }
  }
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

data "aws_iam_policy_document" "eks_fargate_pod_execution_iam_policy" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage"
    ]
    resources = ["*"]
  }
}
