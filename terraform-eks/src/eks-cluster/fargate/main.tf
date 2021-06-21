resource "aws_eks_fargate_profile" "main" {
  cluster_name         = var.cluster_name
  fargate_profile_name = var.profile_name
  # Identifiers of private Subnets
  subnet_ids             = var.subnet_ids
  pod_execution_role_arn = aws_iam_role.fargate_pod_execution_role.arn

  depends_on = [
    #aws_iam_role.fargate_pod_execution_role
    aws_iam_role_policy_attachment.AmazonEKSFargatePodExecutionPolicy
  ]

  # dynamic "selector" block
  dynamic "selector" {
    iterator = it
    for_each = var.selectors
    content {
      namespace = it.value["namespace"]
      labels    = lookup(it.value, "labels", {})
    }
  }
}

resource "aws_iam_role" "fargate_pod_execution_role" {
  force_detach_policies = true
  assume_role_policy    = <<POLICY
{
   "Version": "2012-10-17",
    "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": ["eks-fargate-pods.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_policy" "AmazonEKSFargatePodExecutionPolicy" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [ "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage"],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "AmazonEKSFargatePodExecutionPolicy" {
  policy_arn = aws_iam_policy.AmazonEKSFargatePodExecutionPolicy.arn
  role       = aws_iam_role.fargate_pod_execution_role.name
}

output "id" {
  value = aws_eks_fargate_profile.main.id
}

output "status" {
  value = aws_eks_fargate_profile.main.status
}