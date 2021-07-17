locals {
  name_suffix = "${var.app_name}-${var.stage_name}"
  subnet_ids  = concat(var.private_networking ? [] : var.public_subnet_ids, var.private_subnet_ids)
}
resource "aws_eks_cluster" "main" {
  name = var.cluster_name
  # control plane logging to enable
  enabled_cluster_log_types = var.enabled_cluster_log_types

  vpc_config {
    subnet_ids = local.subnet_ids
  }
  depends_on = [
    aws_iam_role_policy_attachment.AmazonEKSClusterPolicy,
    aws_iam_role_policy_attachment.AmazonEKSServicePolicy,
    aws_iam_role_policy_attachment.AmazonEKSClusterCloudWatchPolicy
  ]

  role_arn = aws_iam_role.eks_cluster_role.arn

  tags = {
    Name = "eks-cluster-${local.name_suffix}"
  }
}

# eks cluster role
resource "aws_iam_role" "eks_cluster_role" {
  assume_role_policy = data.aws_iam_policy_document.eks_cluster_role_assume_role_policy.json
}

resource "aws_iam_policy" "AmazonEKSClusterCloudWatchPolicy" {
  policy = data.aws_iam_policy_document.AmazonEKSClusterCloudWatchPolicy.json
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

# fargate pod execution role
resource "aws_iam_role" "fargate_pod_execution_role" {
  assume_role_policy = data.aws_iam_policy_document.fargate_pod_execution_role_assume_role_policy.json
}

resource "aws_iam_policy" "fargate_pod_execution_policy" {
  policy = data.aws_iam_policy_document.fargate_pod_execution_policy.json
}

resource "aws_iam_role_policy_attachment" "fargate_pod_execution_policy" {
  policy_arn = aws_iam_policy.fargate_pod_execution_policy.arn
  role       = aws_iam_role.fargate_pod_execution_role.name
}

module "default_fargate_profile" {
  source                 = "./fargate"
  app_name               = var.app_name
  stage_name             = var.stage_name
  profile_name           = "fp-default"
  cluster_name           = aws_eks_cluster.main.name
  subnet_ids             = var.private_subnet_ids
  pod_execution_role_arn = aws_iam_role.fargate_pod_execution_role.arn
  selectors              = [{ namespace = "default" }]
}

module "core_fargate_profile" {
  source                 = "./fargate"
  app_name               = var.app_name
  stage_name             = var.stage_name
  profile_name           = "fp-core"
  cluster_name           = aws_eks_cluster.main.name
  subnet_ids             = var.private_subnet_ids
  pod_execution_role_arn = aws_iam_role.fargate_pod_execution_role.arn
  selectors = [
    { namespace = "kube-system" },
    { namespace = "kubernetes-dashboard" },
    { namespace = "appmesh-system" },
    { namespace = "aws-observability" }
  ]
  # selectors            = [{ namespace = "kube-system", labels = { k8s-app = "kube-dns" } }]
}

# # codeDNS patch
# # https://docs.aws.amazon.com/eks/latest/userguide/fargate-getting-started.html#fargate-gs-coredns

# data "aws_eks_cluster_auth" "main" {
#   name = aws_eks_cluster.main.name
# }

# data "template_file" "kubeconfig" {
#   template = <<EOF
# apiVersion: v1
# kind: Config
# current-context: terraform
# clusters:
# - name: main
#   cluster:
#     certificate-authority-data: ${aws_eks_cluster.main.certificate_authority.0.data}
#     server: ${aws_eks_cluster.main.endpoint}
# contexts:
# - name: terraform
#   context:
#     cluster: main
#     user: terraform
# users:
# - name: terraform
#   user:
#     token: ${data.aws_eks_cluster_auth.main.token}
# EOF

#   depends_on = [
#     aws_eks_cluster.main,
#     data.aws_eks_cluster_auth.main
#   ]
# }

# resource "null_resource" "coredns_patch" {
#   provisioner "local-exec" {
#     interpreter = ["/bin/bash", "-c"]
#     command     = <<EOF
# kubectl --kubeconfig=<(echo '${data.template_file.kubeconfig.rendered}') \
#   patch deployment coredns \
#   -n kube-system \
#   --type=json \
#   -p='[{"op": "remove", "path": "/spec/template/metadata/annotations", "value": "eks.amazonaws.com/compute-type"}]'
# EOF
#   }
#   #   provisioner "local-exec" {
#   #     when    = destroy
#   #     command = <<EOF
#   # kubectl --kubeconfig=<(echo '${self.triggers.kubeconfig}') \
#   #   annotate deployment.apps/coredns \
#   #   -n kube-system \
#   #   eks.amazonaws.com/compute-type="ec2" 
#   # EOF
#   #   }

#   depends_on = [
#     module.core_fargate_profile.id
#   ]
# }

output "eks_cluster_id" {
  value = aws_eks_cluster.main.id
}

output "eks_cluster_status" {
  value = aws_eks_cluster.main.status
}

output "eks_fargate_pod_execution_role_name" {
  value = aws_iam_role.fargate_pod_execution_role.name
}

output "default_fargate_profile_id" {
  value = module.default_fargate_profile.id
}

output "default_fargate_profile_status" {
  value = module.default_fargate_profile.status
}

output "core_fargate_profile_id" {
  value = module.core_fargate_profile.id
}

output "core_fargate_profile_status" {
  value = module.core_fargate_profile.status
}
