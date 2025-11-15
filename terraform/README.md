# Nixite Infrastructure as Code

Terraform configurations for deploying Nixite on cloud platforms.

## 📋 Contents

- **aws/** - AWS deployment with EKS, RDS, ElastiCache
- More cloud providers coming soon (GCP, Azure, DigitalOcean)

## 🚀 Quick Start

### Prerequisites

1. **Install Terraform**:
   ```bash
   # Using tfenv (recommended)
   tfenv install 1.5.0
   tfenv use 1.5.0

   # Or download from terraform.io
   wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
   unzip terraform_1.5.0_linux_amd64.zip
   sudo mv terraform /usr/local/bin/
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   # Or use environment variables
   export AWS_ACCESS_KEY_ID="your-key"
   export AWS_SECRET_ACCESS_KEY="your-secret"
   export AWS_DEFAULT_REGION="us-east-1"
   ```

3. **Install kubectl**:
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   ```

4. **Install AWS CLI**:
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

### AWS Deployment

1. **Navigate to AWS directory**:
   ```bash
   cd terraform/aws
   ```

2. **Create terraform.tfvars**:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   nano terraform.tfvars
   ```

3. **Initialize Terraform**:
   ```bash
   terraform init
   ```

4. **Create S3 backend** (first time only):
   ```bash
   # Create S3 bucket for state
   aws s3 mb s3://nixite-terraform-state --region us-east-1
   aws s3api put-bucket-versioning --bucket nixite-terraform-state \
     --versioning-configuration Status=Enabled

   # Create DynamoDB table for locking
   aws dynamodb create-table \
     --table-name nixite-terraform-locks \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

5. **Review plan**:
   ```bash
   terraform plan
   ```

6. **Apply configuration**:
   ```bash
   terraform apply
   ```

7. **Configure kubectl**:
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name nixite-prod
   ```

8. **Deploy Nixite to EKS**:
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f ../../k8s/manifests/nixite.yaml

   # Wait for pods to be ready
   kubectl wait --for=condition=ready pod -l app=nixite-web -n nixite --timeout=300s

   # Get the load balancer URL
   kubectl get ingress -n nixite
   ```

## 📁 AWS Infrastructure Components

The AWS Terraform configuration creates:

### Networking
- **VPC** with public and private subnets across 3 AZs
- **NAT Gateways** for outbound internet access
- **VPC Flow Logs** for network monitoring
- **Security Groups** with least-privilege access

### Kubernetes (EKS)
- **EKS Cluster** with managed control plane
- **Two node groups**:
  - General purpose (t3.medium, auto-scaling 1-10 nodes)
  - AI workload (g4dn.xlarge with GPU, for Ollama)
- **Cluster add-ons**: CoreDNS, kube-proxy, VPC CNI, EBS CSI driver
- **Encryption** with KMS for secrets

### Database (Optional)
- **RDS PostgreSQL** for persistent data
- **Automated backups** with 7-day retention (prod)
- **Encryption at rest** with KMS
- **Multi-AZ** deployment option

### Caching (Optional)
- **ElastiCache Redis** for caching and sessions
- **Snapshot backups** for disaster recovery

### Storage
- **S3 bucket** for assets and backups
- **Versioning enabled**
- **Encryption at rest**
- **Public access blocked**

### Security
- **KMS keys** for encryption (EKS, RDS, CloudWatch)
- **IAM roles** with IRSA (IAM Roles for Service Accounts)
- **Security groups** with minimal required access
- **Private subnets** for workloads

### Monitoring
- **CloudWatch Log Groups** with retention policies
- **VPC Flow Logs** for network analysis
- **RDS Performance Insights** (optional)

## 💰 Cost Estimation

### Minimal Development Setup
```
EKS Control Plane:     $73/month
t3.medium nodes (1):   $30/month
NAT Gateway:           $32/month
Total:                 ~$135/month
```

### Production Setup
```
EKS Control Plane:     $73/month
t3.medium nodes (3):   $90/month
g4dn.xlarge (1):       $390/month
NAT Gateways (2):      $64/month
RDS db.t3.small:       $25/month
ElastiCache t3.micro:  $12/month
S3 + CloudWatch:       $20/month
Total:                 ~$674/month
```

### Cost Optimization Tips

1. **Use Spot Instances** for AI workload:
   ```hcl
   capacity_type = "SPOT"  # Already configured for g4dn.xlarge
   ```

2. **Single NAT Gateway** for dev:
   ```hcl
   single_nat_gateway = true
   ```

3. **Stop unused environments**:
   ```bash
   # Scale down to 0 nodes
   kubectl scale deployment --all --replicas=0 -n nixite
   ```

4. **Use Savings Plans** for long-term deployments

5. **Enable autoscaling** and set appropriate limits

## 🔧 Configuration Options

### Environment-Specific Variables

Create separate tfvars files for each environment:

**dev.tfvars**:
```hcl
environment        = "dev"
enable_rds         = false
enable_redis       = false
single_nat_gateway = true
```

**staging.tfvars**:
```hcl
environment  = "staging"
enable_rds   = true
enable_redis = true
```

**prod.tfvars**:
```hcl
environment        = "prod"
enable_rds         = true
enable_redis       = true
db_instance_class  = "db.t3.small"
redis_node_type    = "cache.t3.small"
```

Apply with:
```bash
terraform apply -var-file=prod.tfvars
```

### Workspaces

Use Terraform workspaces for environment isolation:

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch between environments
terraform workspace select prod

# List workspaces
terraform workspace list
```

## 🔒 Security Best Practices

1. **Never commit credentials**:
   ```bash
   # Add to .gitignore
   echo "*.tfvars" >> .gitignore
   echo "*.tfstate*" >> .gitignore
   echo ".terraform/" >> .gitignore
   ```

2. **Use remote state**:
   - S3 backend with encryption
   - DynamoDB for state locking
   - Versioning enabled

3. **Enable encryption**:
   - All KMS keys have rotation enabled
   - S3, RDS, EBS volumes encrypted
   - Secrets encrypted in EKS

4. **Least privilege IAM**:
   - Service accounts with minimal permissions
   - No hardcoded credentials
   - IRSA for pod-level permissions

5. **Network isolation**:
   - Private subnets for workloads
   - Security groups with specific rules
   - Network policies in Kubernetes

## 📊 Monitoring and Operations

### View Infrastructure

```bash
# Show current state
terraform show

# List all resources
terraform state list

# Show specific resource
terraform state show aws_eks_cluster.nixite
```

### Access Cluster

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name nixite-prod

# Verify access
kubectl get nodes
kubectl get pods -A

# View cluster info
kubectl cluster-info
```

### Database Access

```bash
# Get RDS endpoint
terraform output rds_endpoint

# Connect via bastion or kubectl port-forward
kubectl run postgres-client --rm -it --image=postgres:15 -- \
  psql -h <rds-endpoint> -U nixite_admin -d nixite
```

### Monitoring

```bash
# CloudWatch Logs
aws logs tail /aws/eks/nixite-prod --follow

# EKS cluster status
aws eks describe-cluster --name nixite-prod --region us-east-1
```

## 🔄 Updates and Maintenance

### Update Infrastructure

```bash
# Pull latest changes
git pull

# Review changes
terraform plan

# Apply updates
terraform apply

# Rollback if needed
terraform apply -target=module.eks  # Target specific resource
```

### Update Kubernetes Version

```bash
# Edit variables.tf
kubernetes_version = "1.29"

# Plan upgrade
terraform plan

# Apply upgrade (control plane first, then nodes)
terraform apply -target=module.eks.aws_eks_cluster
terraform apply -target=module.eks.aws_eks_node_group
```

### Rotate Credentials

```bash
# Generate new DB password
terraform taint random_password.db_password[0]
terraform apply

# Update in Kubernetes secrets
kubectl create secret generic db-credentials \
  --from-literal=password=$(terraform output -raw db_password) \
  -n nixite --dry-run=client -o yaml | kubectl apply -f -
```

## 🗑️ Cleanup

### Destroy Resources

```bash
# Review what will be destroyed
terraform plan -destroy

# Destroy all resources
terraform destroy

# Destroy specific resources
terraform destroy -target=module.rds
```

### Clean Up AWS Manually

If Terraform destroy fails:

```bash
# Delete EKS cluster
aws eks delete-cluster --name nixite-prod --region us-east-1

# Delete node groups first
aws eks delete-nodegroup --cluster-name nixite-prod --nodegroup-name nixite-general

# Delete VPC (after all resources are gone)
aws ec2 delete-vpc --vpc-id vpc-xxxxx
```

## 🐛 Troubleshooting

### Common Issues

1. **State lock error**:
   ```bash
   # Force unlock (use with caution)
   terraform force-unlock <lock-id>
   ```

2. **EKS cluster not accessible**:
   ```bash
   # Update kubeconfig
   aws eks update-kubeconfig --region us-east-1 --name nixite-prod

   # Check IAM permissions
   aws sts get-caller-identity
   ```

3. **Node group creation fails**:
   - Check subnet availability zones match
   - Verify instance type availability in region
   - Check service quotas

4. **RDS connection timeout**:
   - Verify security group rules
   - Check VPC routing
   - Ensure pods are in correct subnets

### Debug Mode

```bash
# Enable detailed logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log

# Run terraform commands
terraform plan

# Review logs
tail -f terraform.log
```

## 📚 Additional Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

## 🤝 Contributing

To add support for additional cloud providers:

1. Create new directory (e.g., `terraform/gcp/`)
2. Follow similar structure to AWS
3. Document provider-specific requirements
4. Test thoroughly before submitting PR

---

**📌 Note**: Always review the Terraform plan before applying changes to production. Infrastructure changes can have significant impact on availability and costs.
