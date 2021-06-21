resource "aws_eks_cluster" "main" {
  name = var.cluster_name
  # control plane logging to enable
  enabled_cluster_log_types = var.enabled_cluster_log_types

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
  source       = "./fargate"
  profile_name = "fp-default"
  cluster_name = aws_eks_cluster.main.name
  subnet_ids   = var.private_subnet_ids
  selectors    = [{ namespace = "default", labels = {} }, { namespace = "kube-system", labels = { k8s-app = "kube-dns" } }, { namespace = "production", labels = {} }]
}

# codeDNS patch
# https://docs.aws.amazon.com/eks/latest/userguide/fargate-getting-started.html#fargate-gs-coredns

data "aws_eks_cluster_auth" "main" {
  name = aws_eks_cluster.main.name
}

data "template_file" "kubeconfig" {
  template = <<EOF
apiVersion: v1
kind: Config
current-context: terraform
clusters:
- name: main
  cluster:
    certificate-authority-data: ${aws_eks_cluster.main.certificate_authority.0.data}
    server: ${aws_eks_cluster.main.endpoint}
contexts:
- name: terraform
  context:
    cluster: main
    user: terraform
users:
- name: terraform
  user:
    token: ${data.aws_eks_cluster_auth.main.token}
EOF

  depends_on = [
    data.aws_eks_cluster_auth.main
  ]
}

resource "null_resource" "coredns_patch" {
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = <<EOF
kubectl --kubeconfig=<(echo '${data.template_file.kubeconfig.rendered}') \
  patch deployment coredns \
  --namespace kube-system \
  --type=json \
  -p='[{"op": "remove", "path": "/spec/template/metadata/annotations", "value": "eks.amazonaws.com/compute-type"}]'
EOF
  }
  depends_on = [
    aws_eks_cluster.main,
    module.default_fargate_profile.id
  ]
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
