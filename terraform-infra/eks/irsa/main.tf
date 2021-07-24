
# OIDC IdP
resource "aws_iam_openid_connect_provider" "oidcProvider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.main.certificates[0].sha1_fingerprint]
  url             = var.oidc_url
}

# fargate pod execution & service account role
resource "aws_iam_role" "eks_fargate_pod_execution_iam_role" {
  assume_role_policy = data.aws_iam_policy_document.eks_fargate_pod_execution_role_assume_role_iam_policy.json
}

resource "aws_iam_policy" "eks_fargate_pod_execution_iam_policy" {
  policy = data.aws_iam_policy_document.eks_fargate_pod_execution_iam_policy.json
}

resource "aws_iam_role_policy_attachment" "eks_fargate_pod_execution_iam_policy" {
  policy_arn = aws_iam_policy.eks_fargate_pod_execution_iam_policy.arn
  role       = aws_iam_role.eks_fargate_pod_execution_iam_role.name
}

output "eks_fargate_pod_execution_iam_role_name" {
  value = aws_iam_role.eks_fargate_pod_execution_iam_role.name
}

output "eks_fargate_pod_execution_iam_role_arn" {
  value = aws_iam_role.eks_fargate_pod_execution_iam_role.arn
}