
# add AWS managed IAM policies
resource "aws_iam_role_policy_attachment" "AWSAppMeshFullAccess" {
  role       = data.aws_iam_role.irsa.name
  policy_arn = "arn:aws:iam::aws:policy/AWSAppMeshFullAccess"
}

resource "aws_iam_role_policy_attachment" "AWSCloudMapFullAccess" {
  role       = data.aws_iam_role.irsa.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCloudMapFullAccess"
}

resource "kubernetes_service_account" "appmesh_controller" {
  metadata {
    name      = "appmesh-controller"
    namespace = "appmesh-system"
    annotations = {
      "eks.amazonaws.com/role-arn" = data.aws_iam_role.irsa.arn
    }
    labels = {
      "app.kubernetes.io/component" = "controller"
      "app.kubernetes.io/name"      = "appmesh-controller"
    }
  }
}

resource "helm_release" "app-mesh-controller" {
  count            = var.appmesh_controller_enabled ? 1 : 0
  name             = var.appmesh_controller_helm_release_name
  repository       = var.appmesh_controller_helm_repo_url
  chart            = var.appmesh_controller_helm_chart_name
  namespace        = var.appmesh_controller_namespace
  create_namespace = var.appmesh_controller_create_namespace

  set {
    name  = "region"
    value = var.region_id
  }
  set {
    name  = "serviceAccount.create"
    value = "false"
  }
  set {
    name  = "serviceAccount.name"
    value = "appmesh-controller"
  }

  set {
    name  = "image.repository"
    value = "602401143452.dkr.ecr.${var.region_id}.amazonaws.com/amazon/appmesh-controller"
  }

  set {
    name  = "sidecar.image"
    value = "840364872350.dkr.ecr.${var.region_id}.amazonaws.com/aws-appmesh-envoy"
  }

  set {
    name  = "init.image"
    value = "840364872350.dkr.ecr.${var.region_id}.amazonaws.com/aws-appmesh-proxy-route-manager"
  }
}
