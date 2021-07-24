resource "aws_iam_policy" "eks_fargate_pod_execution_iam_role_logging_policy" {
  description = "Allow fargate profiles to write cloud watch logs"
  policy      = data.aws_iam_policy_document.eks_fargate_logging_iam_policy.json
}

resource "aws_iam_role_policy_attachment" "eks_fargate_pod_execution_iam_role_logging_policy" {
  policy_arn = aws_iam_policy.eks_fargate_pod_execution_iam_role_logging_policy.arn
  role       = data.aws_iam_role.eks_fargate_pod_execution_iam_role.name
}

resource "kubernetes_namespace" "aws_observability" {
  metadata {
    name = "aws-observability"
    labels = {
      aws-observability = "enabled"
    }
  }
}

resource "kubernetes_config_map" "aws_logging" {
  metadata {
    name      = "aws-logging"
    namespace = kubernetes_namespace.aws_observability.id
  }
  data = {
    "output.conf" = "[OUTPUT]\n    Name cloudwatch_logs\n    Match   *\n    region ${var.region_id}\n    log_group_name /aws/eks/${var.cluster_name}/fluent-bit-cloudwatch\n    log_stream_prefix from-fluent-bit-\n    auto_create_group On\n"
  }
}
