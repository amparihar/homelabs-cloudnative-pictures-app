data "tls_certificate" "main" {
  url = var.oidc_url
}

data "aws_caller_identity" "current" {}

# k8s sa role
# Policy that grants an k8s sa permission to assume the role
data "aws_iam_policy_document" "k8s_sa_assume_role_iam_policy" {
  statement {
    sid     = "sa_assume_role"
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
      type = "Federated"
      identifiers = [
        "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${replace(var.oidc_url, "https://", "")}",
        "cognito-identity.amazonaws.com"
      ]
    }
  }
}

# Fargate pod execution role
data "aws_iam_policy_document" "eks_fargate_pod_execution_role_assume_role_iam_policy" {

  source_json = data.aws_iam_policy_document.k8s_sa_assume_role_iam_policy.json

  statement {
    sid     = "pe_assume_role"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks-fargate-pods.amazonaws.com"]
    }
  }

  # statement {
  #   actions = ["sts:AssumeRoleWithWebIdentity"]

  #   # condition {
  #   #   test     = "StringLike"
  #   #   variable = "${replace(var.oidc_url, "https://", "")}:sub"
  #   #   values   = ["system:serviceaccount:*"]
  #   # }

  #   condition {
  #     test     = "StringLike"
  #     variable = "${replace(var.oidc_url, "https://", "")}:aud"
  #     values   = ["sts.amazonaws.com"]
  #   }

  #   principals {
  #     type = "Federated"
  #     identifiers = [
  #       "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${replace(var.oidc_url, "https://", "")}",
  #       "cognito-identity.amazonaws.com"
  #     ]
  #   }
  # }
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

# fluentbit log policy
data "aws_iam_policy_document" "eks_fargate_pod_execution_logging_iam_policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:CreateLogGroup",
      "logs:DescribeLogStreams",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}
