data "aws_iam_role" "eks_fargate_pod_execution_iam_role" {
  name = var.irsa_name
}