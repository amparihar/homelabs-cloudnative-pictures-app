# Introduction 
A terraform module to create a managed Kubernetes cluster on AWS EKS(Fargate)

# Getting Started
Download and install the latest terraform binary for your operating system from https://terrform.io

# Build and Test

1. Create EKS Cluster
Change into the eks directory and create the EKS cluster infrastructure.

cd eks
terraform init
terraform validate
terraform plan -out <FILENAME1> -var=cluster_name=<CLUSTERNAME>
terraform apply <FILENAME1>

2. Create eks addon resource
Change into the eks-addons directory and create the resources after EKS Cluster is created successfully as above.

cd eks-addons
terraform init
terraform validate
terraform plan -out <FILENAME2> -var=cluster_name=<CLUSTERNAME> -var=vpc_id=<VPCID> --var=eks_fargate_pod_execution_role_name=<FARGATE_POD_EXECUTION_ROLE_NAME>
terraform apply <FILENAME2>

3. Deleting the Cluster
First, delete the K8s resources followed by the EKS Cluster

cd eks-addons
terraform destroy -var=cluster_name=<CLUSTERNAME> -var=vpc_id=<VPCID> --var=eks_fargate_pod_execution_role_name=<FARGATE_POD_EXECUTION_ROLE_NAME>

cd eks
terraform destroy -var=cluster_name=<CLUSTERNAME>