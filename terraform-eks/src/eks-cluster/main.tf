resource "aws_eks_cluster" "main" {
  name = var.cluster_name
  # control plane logging to enable
  enabled_cluster_log_types = ["api", "audit", "authenticator", "scheduler", "controllerManager"]

  vpc_config {
    subnet_ids = concat(var.public_subnet_ids, var.private_subnet_ids)
  }
  depends_on = [
    aws_iam_role_policy_attachment.AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.AmazonEKSServicePolicy,
    aws_iam_role_policy_attachment.AmazonEKSClusterCloudWatchPolicy
  ]

  role_arn = aws_iam_role.eks_cluster_role.arn

  tags = {
    Name = "eks-cluster-${var.app_name}-${var.stage_name}"
  }
}

resource "aws_iam_role" "eks_cluster_role" {
  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": ["eks.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_policy" "AmazonEKSClusterCloudWatchPolicy" {
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["cloudwatch: *"],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonEKSServicePolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
  role       = aws_iam_role.eks_cluster_role.name
}

resource "aws_iam_role_policy_attachment" "AmazonEKSClusterCloudWatchPolicy" {
  policy_arn = aws_iam_policy.AmazonEKSClusterCloudWatchPolicy.arn
  role       = aws_iam_role.eks_cluster_role.name
}

module "default_fargate_profile" {
  source              = "./fargate"
  profile_name        = "fp-default"
  cluster_name        = aws_eks_cluster.main.name
  subnet_ids          = var.private_subnet_ids
  selector_namespaces = ["default", "kube-system", "development", "production"]
}

output "eks_cluster_id" {
  value = aws_eks_cluster.main.id
}

output "eks_cluster_status" {
  value = aws_eks_cluster.main.status
}

output "default_fargate_profile_id" {
  value = module.default_fargate_profile.id
}

output "default_fargate_profile_status" {
  value = module.default_fargate_profile.status
}
