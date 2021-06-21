# Introduction 
A terraform module to create a managed Kubernetes cluster on AWS EKS(Fargate)

# Getting Started
Download and install the latest terraform binary for your operating system from https://terrform.io

# Build and Test

1. Create EKS Cluster
Change into the src directory and create the EKS cluster infrastructure.

cd src
terraform init
terraform validate
terraform plan -out <<FILENAME>> -var=cluster_name=<<CLUSTERNAME>>
terraform apply <<FILENAME>>

2. Deleting the Cluster
First, delete the K8s resources(if any e.g load balancer) followed by the EKS Cluster

cd src
terraform destroy 

