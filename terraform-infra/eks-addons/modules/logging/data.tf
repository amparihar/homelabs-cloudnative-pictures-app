# data "aws_region" "current" {}

data "aws_iam_role" "eks_fargate_pod_execution_iam_role" {
  name = var.irsa_name
}

data "aws_iam_policy_document" "eks_fargate_logging_iam_policy" {
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
