terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Example: RDS MySQL instance (single-AZ) - suitable for staging
resource "aws_db_instance" "arisrifas_db" {
  allocated_storage    = 20
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = var.db_instance_class
  name                 = var.db_name
  username             = var.db_username
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = false
  apply_immediately    = true
}

# Example: Elasticache Redis cluster (single node)
resource "aws_elasticache_cluster" "arisrifas_redis" {
  cluster_id           = "arisrifas-redis"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
}
