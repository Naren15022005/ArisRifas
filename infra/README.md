Infra skeleton for ArisRifas

This folder contains example Terraform configurations to provision managed infrastructure (example AWS RDS + ElastiCache).

WARNING: These are example skeletons for reference only. Do NOT run them in production without reviewing network, security groups, backups, and IAM policies.

Quick usage (AWS example):

1. Install Terraform (>=1.5)
2. Export AWS credentials in env or use an AWS profile:

   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_DEFAULT_REGION=us-east-1

3. Init/Plan/Apply:

   cd infra/terraform
   terraform init
   terraform plan -out plan.tf
   terraform apply plan.tf

Files:
- `main.tf` — example provider + resources (RDS MySQL + ElastiCache Redis)
- `variables.tf` — variables for the module
- `outputs.tf` — useful outputs (endpoints)

If you want, I can adapt this skeleton to another cloud provider (GCP/Azure) or wire it with GitHub Actions for automated deploys.
