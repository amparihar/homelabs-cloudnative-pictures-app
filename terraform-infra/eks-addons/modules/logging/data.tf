# data "aws_region" "current" {}

data "aws_iam_role" "eks_fargate_pod_execution_role" {
  name = var.eks_fargate_pod_execution_role_name
}

data "aws_iam_policy_document" "eks_fargate_logging_policy" {
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
