
# EKS Cluster
data "aws_iam_policy_document" "eks_cluster_role_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "AmazonEKSClusterCloudWatchPolicy" {
  statement {
    actions = [
      "cloudwatch: *"
    ]
    resources = ["*"]
  }
}