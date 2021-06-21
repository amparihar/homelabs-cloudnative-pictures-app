# Introduction 
A terraform module to deploy aws-load-balancer-controller on AWS EKS(Fargate)

# Getting Started
Download and install the latest terraform binary for your operating system from https://terrform.io

# Build and Test

1. Create AWS Load Balancer Controller Resource
Change into the aws-load-balancer-controller directory and create the resources.

cd aws-load-balancer-controller
terraform init
terraform validate
terraform plan -out <<FILENAME>> -var=cluster_name=<<CLUSTERNAME>> -var=vpc_id=<<VPCID>>
terraform apply <<FILENAME>>

2. Deleting the Cluster

terraform destroy -out <<FILENAME>> -var=cluster_name=<<CLUSTERNAME>> -var=vpc_id=<<VPCID>>


