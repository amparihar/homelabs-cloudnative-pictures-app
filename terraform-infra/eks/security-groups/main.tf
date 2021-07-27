resource "aws_security_group" "envoy_proxy" {
  count  = var.create_vpc && var.private_networking ? 1 : 0
  name   = "${var.app_name}-sg-envoy-proxy-nlb-${var.stage_name}"
  vpc_id = var.vpcid

  # ingress to envoy proxy
  ingress {
    from_port   = var.envoy_proxy_container_port
    to_port     = var.envoy_proxy_container_port
    protocol    = "tcp"
    cidr_blocks = var.private_subnets
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name  = "sg-envoy-proxy-nlb-${var.app_name}"
    Stage = var.stage_name
  }
}
