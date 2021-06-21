
# OIDC IdP
resource "aws_iam_openid_connect_provider" "oidcProvider" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.main.certificates[0].sha1_fingerprint]
  url             = local.oidc_url
}

## 1. Create k8s Service Account for load balancer controller

resource "kubernetes_service_account" "load_balancer_controller" {
  
  metadata {
    name      = "aws-load-balancer-controller"
    namespace = "kube-system"
    annotations = {
      "eks.amazonaws.com/role-arn" = aws_iam_role.load_balancer_controller_service_account_role.arn
    }
    labels = {
      "app.kubernetes.io/component" = "controller"
      "app.kubernetes.io/name"      = "aws-load-balancer-controller"
    }
  }
}

## 2. Create Cluster Role for Service Account

resource "kubernetes_cluster_role" "load_balancer_controller" {
  metadata {
    name = "aws-load-balancer-controller-cluster-role"
    labels = {
      "app.kubernetes.io/name" = "aws-load-balancer-controller"
    }
  }

  dynamic "rule" {
    iterator = each
    for_each = var.load_balancer_cluster_role_rules
    content {
      api_groups = each.value["api_groups"]
      resources  = each.value["resources"]
      verbs      = each.value["verbs"]
    }
  }
}

## 3. Create Cluster role binding
resource "kubernetes_cluster_role_binding" "load_balancer_controller" {
  metadata {
    name = "aws-load-balancer-controller-cluster-rolebinding"
    labels = {
      "app.kubernetes.io/name" = "aws-load-balancer-controller"
    }
  }
  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "aws-load-balancer-controller-cluster-role"
  }

  subject {
    kind      = "ServiceAccount"
    name      = "aws-load-balancer-controller"
    namespace = "kube-system"
  }
}

## 4. Create IAM Policy for load balancer controller Service Account that allows it to make aws api calls

# IAM Policy reference : https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json
# main branch is referred to get the latest policy

resource "aws_iam_policy" "load_balancer_controller_service_account_iam_policy" {
  #name   = "load_balancer_controller_service_account_iam_policy"
  path   = "/" # Path in which to create the policy
  policy = data.aws_iam_policy_document.load_balancer_controller_service_account_iam_policy.json
}

## 5. Create IAM assume role, attach IAM Policy and associate it with the service account, by annotating it with the k8s service account

resource "aws_iam_role" "load_balancer_controller_service_account_role" {
  #name               = "load_balancer_controller_service_account_role"
  path               = "/"
  assume_role_policy = data.aws_iam_policy_document.load_balancer_controller_service_account_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "load_balancer_controller_service_account_iam_policy" {
  role       = aws_iam_role.load_balancer_controller_service_account_role.name
  policy_arn = aws_iam_policy.load_balancer_controller_service_account_iam_policy.arn
}

## 6. Install aws load balancer controller

resource "helm_release" "load_balancer_controller" {
  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  namespace  = "kube-system"

  set {
    name  = "clusterName"
    value = var.cluster_name
  }

  set {
    name  = "serviceAccount.create"
    value = "false"
  }

  set {
    name  = "serviceAccount.name"
    value = "aws-load-balancer-controller"
  }

  # region and vpcId required for EKS Fargate 
  set {
    name  = "region"
    value = var.aws_regions[var.aws_region]
  }

  set {
    name  = "vpcId"
    value = var.vpc_id
  }

  depends_on = [
    kubernetes_cluster_role_binding.load_balancer_controller
  ]
}

## 7. Create Ingress Manifest(routing rules)
## This will be part of the app resources

## outputs
output "aws_load_balancer_controller_service_account_role_name" {
  value = aws_iam_role.load_balancer_controller_service_account_role.name
}


