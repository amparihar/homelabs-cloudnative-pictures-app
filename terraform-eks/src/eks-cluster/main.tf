resource "aws_eks_cluster" "main" {
  name                      = var.cluster_name
  # control plane logging to enable
  enabled_cluster_log_types = ["api", "audit", "authenticator", "scheduler", "controllerManager"]

  vpc_config {
    subnet_ids = var.subnet_ids
  }
  depends_on = [
    aws_iam_role_policy_attachment.AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.AmazonEKSServicePolicy,
    aws_iam_role_policy_attachment.AmazonEKSClusterCloudWatchPolicy
  ]

  role_arn = aws_iam_role.eks_cluster_role.arn
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



module "fargate_profile" {
  source              = "./fargate"
  cluster_name        = aws_eks_cluster.main.name
  subnet_ids          = var.subnet_ids
  selector_namespaces = ["default", "kube-system", "development", "production"]
}

output "eks_cluster_id" {
  value = aws_eks_cluster.main.id
}

output "eks_cluster_status" {
  value = aws_eks_cluster.main.status
}

output "fargate_profile_id" {
  value = module.fargate_profile.id
}

output "fargate_profile_status" {
  value = module.fargate_profile.status
}
