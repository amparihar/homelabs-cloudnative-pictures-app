
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

# Fargate pod Execution
data "aws_iam_policy_document" "fargate_pod_execution_role_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks-fargate-pods.amazonaws.com"]
    }
  }
}

data "aws_iam_policy_document" "fargate_pod_execution_policy" {
  statement {
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage"
    ]
    resources = ["*"]
  }
}
