
# OIDC IdP
resource "aws_iam_openid_connect_provider" "oidcProvider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.main.certificates[0].sha1_fingerprint]
  url             = var.oidc_url
}

# k8s sa role
resource "aws_iam_role" "k8s_sa_iam_role" {
  assume_role_policy = data.aws_iam_policy_document.k8s_sa_assume_role_iam_policy.json
}

# eks fargate pod execution role
resource "aws_iam_role" "eks_fargate_pod_execution_iam_role" {
  assume_role_policy = data.aws_iam_policy_document.eks_fargate_pod_execution_role_assume_role_iam_policy.json
}

resource "aws_iam_policy" "eks_fargate_pod_execution_iam_policy" {
  policy = data.aws_iam_policy_document.eks_fargate_pod_execution_iam_policy.json
}

# fluentbit
resource "aws_iam_policy" "eks_fargate_pod_execution_logging_iam_policy" {
  description = "Allow fargate profiles to write cloud watch logs"
  policy = data.aws_iam_policy_document.eks_fargate_pod_execution_logging_iam_policy.json
}

resource "aws_iam_role_policy_attachment" "eks_fargate_pod_execution_iam_policy" {
  policy_arn = aws_iam_policy.eks_fargate_pod_execution_iam_policy.arn
  role       = aws_iam_role.eks_fargate_pod_execution_iam_role.name
}

# fluentbit
resource "aws_iam_role_policy_attachment" "ks_fargate_pod_execution_logging_iam_policy" {
  policy_arn = aws_iam_policy.eks_fargate_pod_execution_logging_iam_policy.arn
  role       = aws_iam_role.eks_fargate_pod_execution_iam_role.name
}

output "k8s_sa_iam_role_name" {
  value = aws_iam_role.k8s_sa_iam_role.name
}

output "k8s_sa_iam_role_arn" {
  value = aws_iam_role.k8s_sa_iam_role.arn
}

output "eks_fargate_pod_execution_iam_role_name" {
  value = aws_iam_role.eks_fargate_pod_execution_iam_role.name
}

output "eks_fargate_pod_execution_iam_role_arn" {
  value = aws_iam_role.eks_fargate_pod_execution_iam_role.arn
}