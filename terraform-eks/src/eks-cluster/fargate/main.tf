resource "aws_eks_fargate_profile" "main" {
  cluster_name           = var.cluster_name
  fargate_profile_name   = "fp-default-${var.cluster_name}"
  subnet_ids             = var.subnet_ids
  pod_execution_role_arn = aws_iam_role.fargate_pod_execution_role.arn

  depends_on = [
    aws_iam_role.fargate_pod_execution_role
  ]

  # dynamic "selector" block

  dynamic "selector" {
    iterator = ns
    for_each = var.selector_namespaces
    content {
      namespace = ns.value
    }
  }

  # selector {
  #   namespace = "default"
  # }

  # selector {
  #   namespace = "kube-system"
  # }

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

output "id" {
  value = aws_eks_fargate_profile.main.id
  
}

output "status" {
  value = aws_eks_fargate_profile.main.status
}


