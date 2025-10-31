# BuildRunner Enterprise Deployment Guide

This guide covers enterprise deployment, SSO configuration, audit compliance, and security hardening for BuildRunner SaaS.

## Table of Contents

- [Prerequisites](#prerequisites)
- [VPC Deployment](#vpc-deployment)
- [SSO Configuration](#sso-configuration)
- [Audit & Compliance](#audit--compliance)
- [Security Hardening](#security-hardening)
- [Key Rotation](#key-rotation)
- [Monitoring & Alerting](#monitoring--alerting)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Terraform**: Version 1.0 or later (for infrastructure)
- **Node.js**: Version 18 or later (for scripts)
- **PostgreSQL**: Version 15 or later
- **Redis**: Version 7 or later

### Network Requirements

- **Inbound**: HTTPS (443), HTTP (80) for load balancer
- **Outbound**: HTTPS (443) for external API calls
- **Internal**: PostgreSQL (5432), Redis (6379)

### Compliance Requirements

- **SOC 2**: Audit logging, access controls, encryption
- **HIPAA**: Data encryption, access logging, retention policies
- **PCI DSS**: Network segmentation, key management, monitoring

## VPC Deployment

### Quick Start with Docker Compose

1. **Clone and Configure**
   ```bash
   git clone https://github.com/your-org/BuildRunnerSaaS.git
   cd BuildRunnerSaaS/deploy/docker
   cp .env.example .env
   ```

2. **Configure Environment**
   ```bash
   # Edit .env with your values
   nano .env
   
   # Required variables:
   POSTGRES_PASSWORD=your_secure_password
   NEXTAUTH_SECRET=your_32_char_secret
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   ```

3. **Deploy Services**
   ```bash
   # Start all services
   docker compose up -d
   
   # Check health
   curl http://localhost:3000/api/health
   ```

4. **Verify Deployment**
   ```bash
   # Check service status
   docker compose ps
   
   # View logs
   docker compose logs web
   ```

### Infrastructure as Code (Terraform)

1. **Initialize Terraform**
   ```bash
   cd deploy/terraform
   terraform init
   ```

2. **Configure Variables**
   ```bash
   # Create terraform.tfvars
   cat > terraform.tfvars << EOF
   aws_region = "us-east-1"
   environment = "production"
   vpc_cidr = "10.0.0.0/16"
   data_residency = "us"
   compliance_framework = "soc2"
   EOF
   ```

3. **Deploy Infrastructure**
   ```bash
   # Plan deployment
   terraform plan
   
   # Apply changes
   terraform apply
   ```

4. **Configure DNS**
   ```bash
   # Get load balancer DNS
   terraform output load_balancer_dns_name
   
   # Update your DNS records
   # CNAME: buildrunner.yourcompany.com -> alb-dns-name
   ```

## SSO Configuration

### OIDC Setup

1. **Configure Identity Provider**
   - Navigate to Settings → Security
   - Click "Add Provider"
   - Select "OIDC/OAuth2"

2. **Provider Configuration**
   ```json
   {
     "name": "Corporate SSO",
     "issuer": "https://your-idp.com/.well-known/openid_configuration",
     "client_id": "buildrunner-client-id",
     "client_secret": "your-client-secret",
     "scopes": ["openid", "email", "profile", "groups"],
     "attribute_mapping": {
       "email": "email",
       "name": "name",
       "groups": "groups"
     }
   }
   ```

3. **Test Connection**
   ```bash
   # Test OIDC configuration
   curl -X POST http://localhost:3000/api/settings/identity-providers/test \
     -H "Content-Type: application/json" \
     -d '{"provider_id": "your-provider-id"}'
   ```

### SAML Setup

1. **Configure SAML Provider**
   ```xml
   <!-- SAML Metadata Example -->
   <EntityDescriptor entityID="https://buildrunner.yourcompany.com">
     <SPSSODescriptor>
       <AssertionConsumerService 
         Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
         Location="https://buildrunner.yourcompany.com/api/sso/saml/acs"
         index="0" />
     </SPSSODescriptor>
   </EntityDescriptor>
   ```

2. **Certificate Configuration**
   ```bash
   # Generate SAML certificate
   openssl req -x509 -newkey rsa:2048 -keyout saml.key -out saml.crt -days 365 -nodes
   
   # Add to environment
   export SAML_CERT="$(cat saml.crt)"
   export SAML_PRIVATE_KEY="$(cat saml.key)"
   ```

### Enforce SSO

1. **Enable SSO Requirement**
   - Go to Settings → Security
   - Check "Require SSO for all users"
   - Save settings

2. **Verify Enforcement**
   ```bash
   # Test password login (should fail)
   curl -X POST http://localhost:3000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email": "user@company.com", "password": "password"}'
   
   # Expected response: 403 Forbidden
   ```

## Audit & Compliance

### Audit Log Configuration

1. **Configure Retention**
   ```yaml
   # In Settings → Security
   audit_retention_days: 365  # 1 year minimum for SOC 2
   data_residency: "us"       # or "eu" for GDPR
   compliance_framework: "soc2"
   ```

2. **Export Configuration**
   ```bash
   # Configure S3-compatible storage
   export AUDIT_EXPORT_BUCKET="your-audit-bucket"
   export AUDIT_EXPORT_ACCESS_KEY="your-access-key"
   export AUDIT_EXPORT_SECRET_KEY="your-secret-key"
   ```

3. **Verify Audit Logging**
   ```sql
   -- Check audit entries
   SELECT actor, action, created_at 
   FROM audit_ledger 
   ORDER BY created_at DESC 
   LIMIT 10;
   
   -- Verify hash chain integrity
   SELECT id, hash, prev_hash 
   FROM audit_ledger 
   WHERE hash != compute_audit_hash(id, actor, action, payload, prev_hash, created_at);
   ```

### SIEM Integration

1. **Configure Webhook**
   ```bash
   export SIEM_WEBHOOK_URL="https://your-siem.com/webhook/buildrunner"
   export SIEM_WEBHOOK_SECRET="your-webhook-secret"
   ```

2. **Test Integration**
   ```bash
   # Trigger test event
   curl -X POST http://localhost:3000/api/audit/test-webhook \
     -H "Authorization: Bearer your-admin-token"
   ```

### Access Reviews

1. **Schedule Reviews**
   ```bash
   # Configure quarterly reviews
   export ACCESS_REVIEW_FREQUENCY="quarterly"
   export ACCESS_REVIEW_ADMIN_EMAIL="admin@yourcompany.com"
   ```

2. **Generate Review Report**
   ```bash
   # Manual review generation
   curl -X POST http://localhost:3000/api/compliance/access-review \
     -H "Authorization: Bearer your-admin-token"
   ```

## Security Hardening

### Environment Security

1. **Secrets Management**
   ```bash
   # Use environment variables (never commit secrets)
   export OPENAI_API_KEY="sk-your-key-here"
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"
   
   # Or use AWS Secrets Manager
   aws secretsmanager create-secret \
     --name "buildrunner/openai-key" \
     --secret-string "sk-your-key-here"
   ```

2. **Network Security**
   ```yaml
   # docker-compose.yml security settings
   services:
     web:
       security_opt:
         - no-new-privileges:true
       read_only: true
       tmpfs:
         - /tmp
         - /var/cache
   ```

3. **SSL/TLS Configuration**
   ```nginx
   # nginx.conf
   server {
     listen 443 ssl http2;
     ssl_certificate /etc/nginx/ssl/cert.pem;
     ssl_certificate_key /etc/nginx/ssl/key.pem;
     ssl_protocols TLSv1.2 TLSv1.3;
     ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
   }
   ```

### Data Protection

1. **Encryption at Rest**
   ```bash
   # PostgreSQL encryption
   export POSTGRES_INITDB_ARGS="--auth-host=scram-sha-256"
   
   # Volume encryption (AWS EBS)
   terraform apply -var="enable_encryption=true"
   ```

2. **Encryption in Transit**
   ```bash
   # Force HTTPS redirects
   export FORCE_HTTPS="true"
   
   # Database SSL
   export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

## Key Rotation

### Automated Rotation

1. **Schedule Rotation**
   ```bash
   # Add to crontab
   0 2 1 * * /usr/local/bin/tsx /app/scripts/rotate-keys.ts
   ```

2. **Manual Rotation**
   ```bash
   # Dry run first
   tsx scripts/rotate-keys.ts --dry-run
   
   # Rotate all keys
   tsx scripts/rotate-keys.ts
   
   # Rotate specific key
   tsx scripts/rotate-keys.ts --key=openai_api_key
   ```

3. **Verify Rotation**
   ```sql
   -- Check rotation history
   SELECT key_type, rotation_status, completed_at 
   FROM key_rotations 
   ORDER BY completed_at DESC;
   ```

### Emergency Rotation

1. **Compromised Key Response**
   ```bash
   # Immediate rotation
   tsx scripts/rotate-keys.ts --key=compromised_key_type
   
   # Audit compromised access
   SELECT * FROM audit_ledger 
   WHERE created_at > 'compromise_timestamp' 
   AND actor = 'compromised_user';
   ```

## Monitoring & Alerting

### Health Checks

1. **Application Health**
   ```bash
   # Health endpoint
   curl http://localhost:3000/api/health
   
   # Database connectivity
   curl http://localhost:3000/api/health/database
   
   # External services
   curl http://localhost:3000/api/health/external
   ```

2. **Prometheus Metrics**
   ```yaml
   # prometheus.yml
   scrape_configs:
     - job_name: 'buildrunner'
       static_configs:
         - targets: ['web:3000']
       metrics_path: '/api/metrics'
   ```

### Alerting Rules

1. **Critical Alerts**
   ```yaml
   # alerts.yml
   groups:
     - name: buildrunner
       rules:
         - alert: HighErrorRate
           expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
         - alert: DatabaseDown
           expr: up{job="postgres"} == 0
         - alert: SSLCertExpiring
           expr: ssl_cert_expiry_days < 30
   ```

## Troubleshooting

### Common Issues

1. **SSO Login Failures**
   ```bash
   # Check IdP configuration
   curl -s "https://your-idp.com/.well-known/openid_configuration" | jq .
   
   # Verify certificates
   openssl x509 -in saml.crt -text -noout
   
   # Check audit logs
   SELECT * FROM audit_ledger WHERE action LIKE 'sso_%' ORDER BY created_at DESC;
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   psql "postgresql://user:pass@host:5432/db" -c "SELECT version();"
   
   # Check connection pool
   docker compose exec web cat /proc/net/tcp | grep :1538
   ```

3. **Performance Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Database performance
   SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC;
   ```

### Log Analysis

1. **Application Logs**
   ```bash
   # View recent logs
   docker compose logs --tail=100 web
   
   # Search for errors
   docker compose logs web | grep ERROR
   
   # Follow logs
   docker compose logs -f web
   ```

2. **Audit Log Analysis**
   ```sql
   -- Failed login attempts
   SELECT actor, ip_address, created_at 
   FROM audit_ledger 
   WHERE action = 'sso_login_failed' 
   AND created_at > NOW() - INTERVAL '1 hour';
   
   -- Privilege escalations
   SELECT * FROM audit_ledger 
   WHERE action = 'role_changed' 
   ORDER BY created_at DESC;
   ```

### Support Contacts

- **Technical Support**: support@buildrunner.com
- **Security Issues**: security@buildrunner.com
- **Emergency**: +1-555-BUILDRUNNER

---

For additional help, see our [Knowledge Base](https://docs.buildrunner.com) or contact support.
