# BuildRunner Terraform Outputs
# Export important resource information for use by other systems

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.buildrunner.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.buildrunner.cidr_block
}

# Subnet Outputs
output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "IDs of the database subnets"
  value       = aws_subnet.database[*].id
}

# Security Group Outputs
output "web_security_group_id" {
  description = "ID of the web security group"
  value       = aws_security_group.web.id
}

output "app_security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "database_security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.database.id
}

output "redis_security_group_id" {
  description = "ID of the Redis security group"
  value       = aws_security_group.redis.id
}

# Load Balancer Outputs
output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = aws_lb.buildrunner.arn
}

output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.buildrunner.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.buildrunner.zone_id
}

# Database Outputs
output "database_subnet_group_name" {
  description = "Name of the database subnet group"
  value       = aws_db_subnet_group.buildrunner.name
}

# ElastiCache Outputs
output "elasticache_subnet_group_name" {
  description = "Name of the ElastiCache subnet group"
  value       = aws_elasticache_subnet_group.buildrunner.name
}

# NAT Gateway Outputs
output "nat_gateway_ids" {
  description = "IDs of the NAT gateways"
  value       = aws_nat_gateway.buildrunner[*].id
}

output "nat_gateway_public_ips" {
  description = "Public IPs of the NAT gateways"
  value       = aws_eip.nat[*].public_ip
}

# Internet Gateway Output
output "internet_gateway_id" {
  description = "ID of the internet gateway"
  value       = aws_internet_gateway.buildrunner.id
}

# Route Table Outputs
output "public_route_table_id" {
  description = "ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "IDs of the private route tables"
  value       = aws_route_table.private[*].id
}

output "database_route_table_id" {
  description = "ID of the database route table"
  value       = aws_route_table.database.id
}

# Availability Zones
output "availability_zones" {
  description = "List of availability zones used"
  value       = data.aws_availability_zones.available.names
}

# Environment Information
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}

# Data Residency
output "data_residency" {
  description = "Data residency configuration"
  value       = var.data_residency
}

# Compliance Framework
output "compliance_framework" {
  description = "Compliance framework configuration"
  value       = var.compliance_framework
}

# Resource Tags
output "common_tags" {
  description = "Common tags applied to all resources"
  value = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Network Configuration Summary
output "network_configuration" {
  description = "Summary of network configuration"
  value = {
    vpc_cidr             = aws_vpc.buildrunner.cidr_block
    public_subnets       = var.public_subnet_cidrs
    private_subnets      = var.private_subnet_cidrs
    database_subnets     = var.database_subnet_cidrs
    availability_zones   = data.aws_availability_zones.available.names
  }
}

# Security Configuration Summary
output "security_configuration" {
  description = "Summary of security configuration"
  value = {
    deletion_protection_enabled = var.enable_deletion_protection
    vpc_flow_logs_enabled      = var.enable_vpc_flow_logs
    config_enabled             = var.enable_config
    cloudtrail_enabled         = var.enable_cloudtrail
    guardduty_enabled          = var.enable_guardduty
    waf_enabled                = var.enable_waf
  }
}

# Deployment Instructions
output "deployment_instructions" {
  description = "Next steps for deployment"
  value = {
    message = "VPC infrastructure created successfully. Next steps:"
    steps = [
      "1. Deploy RDS instance using database subnet group: ${aws_db_subnet_group.buildrunner.name}",
      "2. Deploy ElastiCache using subnet group: ${aws_elasticache_subnet_group.buildrunner.name}",
      "3. Deploy application instances in private subnets: ${join(", ", aws_subnet.private[*].id)}",
      "4. Configure load balancer target groups for: ${aws_lb.buildrunner.dns_name}",
      "5. Update DNS records to point to load balancer",
      "6. Configure SSL certificate if not already done",
      "7. Test application connectivity and security groups"
    ]
  }
}
