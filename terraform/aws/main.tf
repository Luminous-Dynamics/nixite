# Nixite Infrastructure on AWS
# Terraform configuration for production deployment

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }

  backend "s3" {
    bucket         = "nixite-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "nixite-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Nixite"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-${var.environment}"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment == "dev" ? true : false
  enable_dns_hostnames = true
  enable_dns_support   = true

  # VPC Flow Logs
  enable_flow_log                      = true
  create_flow_log_cloudwatch_iam_role  = true
  create_flow_log_cloudwatch_log_group = true

  tags = {
    "kubernetes.io/cluster/${var.project_name}-${var.environment}" = "shared"
  }

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster endpoint access
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true

  # Encryption
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }

  # Cluster add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  # Managed node groups
  eks_managed_node_groups = {
    general = {
      name = "${var.project_name}-general"

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"

      min_size     = var.environment == "prod" ? 3 : 1
      max_size     = var.environment == "prod" ? 10 : 3
      desired_size = var.environment == "prod" ? 3 : 1

      labels = {
        role = "general"
      }

      tags = {
        NodeGroup = "general"
      }
    }

    ai-workload = {
      name = "${var.project_name}-ai"

      # GPU instances for Ollama
      instance_types = ["g4dn.xlarge"]
      capacity_type  = "SPOT"

      min_size     = 1
      max_size     = 3
      desired_size = 1

      labels = {
        role     = "ai-workload"
        workload = "ollama"
      }

      taints = [{
        key    = "workload"
        value  = "ai"
        effect = "NO_SCHEDULE"
      }]

      tags = {
        NodeGroup = "ai-workload"
      }
    }
  }

  # Security groups
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
  }
}

# KMS Key for EKS encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "${var.project_name}-eks-encryption"
  }
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.project_name}-eks"
  target_key_id = aws_kms_key.eks.key_id
}

# RDS for persistent storage (optional)
resource "aws_db_subnet_group" "nixite" {
  name       = "${var.project_name}-${var.environment}"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_db_instance" "nixite" {
  count = var.enable_rds ? 1 : 0

  identifier = "${var.project_name}-${var.environment}"

  engine         = "postgres"
  engine_version = "15.3"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.rds[0].arn

  db_name  = "nixite"
  username = "nixite_admin"
  password = random_password.db_password[0].result

  db_subnet_group_name   = aws_db_subnet_group.nixite.name
  vpc_security_group_ids = [aws_security_group.rds[0].id]

  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  deletion_protection = var.environment == "prod" ? true : false
  skip_final_snapshot = var.environment == "dev" ? true : false

  tags = {
    Name = "${var.project_name}-db"
  }
}

resource "aws_kms_key" "rds" {
  count = var.enable_rds ? 1 : 0

  description             = "RDS Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "random_password" "db_password" {
  count = var.enable_rds ? 1 : 0

  length  = 32
  special = true
}

resource "aws_security_group" "rds" {
  count = var.enable_rds ? 1 : 0

  name_prefix = "${var.project_name}-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ElastiCache for Redis (caching)
resource "aws_elasticache_subnet_group" "nixite" {
  count = var.enable_redis ? 1 : 0

  name       = "${var.project_name}-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "nixite" {
  count = var.enable_redis ? 1 : 0

  cluster_id           = "${var.project_name}-${var.environment}"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.nixite[0].name
  security_group_ids = [aws_security_group.redis[0].id]

  snapshot_retention_limit = var.environment == "prod" ? 5 : 0
  snapshot_window          = "03:00-05:00"
}

resource "aws_security_group" "redis" {
  count = var.enable_redis ? 1 : 0

  name_prefix = "${var.project_name}-redis-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# S3 Bucket for assets/backups
resource "aws_s3_bucket" "nixite" {
  bucket = "${var.project_name}-${var.environment}-assets"

  tags = {
    Name = "${var.project_name}-assets"
  }
}

resource "aws_s3_bucket_versioning" "nixite" {
  bucket = aws_s3_bucket.nixite.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "nixite" {
  bucket = aws_s3_bucket.nixite.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "nixite" {
  bucket = aws_s3_bucket.nixite.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "nixite" {
  name              = "/aws/eks/${var.project_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7

  kms_key_id = aws_kms_key.logs.arn
}

resource "aws_kms_key" "logs" {
  description             = "CloudWatch Logs Encryption Key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

# IAM Role for service accounts
resource "aws_iam_role" "nixite_sa" {
  name = "${var.project_name}-${var.environment}-sa"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = module.eks.oidc_provider_arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${module.eks.oidc_provider}:sub" = "system:serviceaccount:nixite:nixite"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "nixite_sa" {
  name = "${var.project_name}-sa-policy"
  role = aws_iam_role.nixite_sa.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.nixite.arn,
          "${aws_s3_bucket.nixite.arn}/*"
        ]
      }
    ]
  })
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Outputs
output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = var.enable_rds ? aws_db_instance.nixite[0].endpoint : null
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = var.enable_redis ? aws_elasticache_cluster.nixite[0].cache_nodes[0].address : null
}

output "s3_bucket" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.nixite.id
}
