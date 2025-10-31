# White-Label/OEM, Custom Domains, and Partner API

BuildRunner provides comprehensive white-label and OEM capabilities, enabling partners to offer BuildRunner services under their own brand with custom domains, theming, and full API integration.

## Overview

The white-label and partner system provides:
- **Partner Program**: Revenue sharing, tenant management, and partner portal
- **Custom Branding**: Per-tenant theming, logos, and email templates
- **Custom Domains**: DNS verification and automated TLS certificates
- **Partner API**: Comprehensive REST API for integration and automation
- **Webhooks**: Real-time event notifications with HMAC signing
- **Revenue Sharing**: Automated calculations and payout management

## Partner Program

### Partner Registration

Partners can be registered through the admin interface or API:

```typescript
interface Partner {
  id: string;
  slug: string;
  name: string;
  contact_email: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  description?: string;
  website_url?: string;
  logo_url?: string;
  metadata: any;
}
```

**Partner Statuses:**
- `pending`: Awaiting approval
- `active`: Fully operational
- `inactive`: Temporarily disabled
- `suspended`: Blocked due to policy violations

### Partner-Tenant Relationships

Partners can be linked to tenants with different roles:

```typescript
interface PartnerTenant {
  partner_id: string;
  tenant_id: string;
  role: 'managed' | 'reseller' | 'white_label' | 'affiliate';
  permissions: any;
  provisioned_at: Date;
}
```

**Relationship Types:**
- **Managed**: Partner manages tenant on behalf of customer
- **Reseller**: Partner resells BuildRunner services
- **White Label**: Partner offers BuildRunner under their brand
- **Affiliate**: Partner refers customers for commission

## Custom Branding

### Tenant Branding Configuration

Each tenant can customize their branding independently:

```typescript
interface TenantBranding {
  tenant_id: string;
  logo_url?: string;
  favicon_url?: string;
  brand_name?: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      border: string;
    };
    typography: {
      font_family: string;
      heading_weight: string;
      body_weight: string;
    };
    radius: string;
  };
  email_templates: {
    welcome: string;
    invite: string;
    invoice: string;
    report: string;
  };
  custom_css?: string;
  enabled: boolean;
}
```

### Theme System

The theme system extends the Phase 16 design tokens with tenant-specific overrides:

```typescript
// Theme resolver
const resolveTheme = async (tenantId: string) => {
  const branding = await getTenantBranding(tenantId);
  
  if (!branding?.enabled) {
    return defaultTheme;
  }
  
  return {
    ...defaultTheme,
    ...branding.theme,
    colors: {
      ...defaultTheme.colors,
      ...branding.theme.colors,
    },
  };
};
```

**Supported Customizations:**
- Colors (primary, secondary, accent, background, foreground, muted, border)
- Typography (font family, weights)
- Border radius
- Logo and favicon
- Brand name
- Email templates
- Custom CSS (limited scope)

### Branding UI

The branding interface (`/settings/branding`) provides:
- Live preview of theme changes
- Color picker with accessibility validation
- Logo upload with format validation
- Typography selection from approved fonts
- Email template editor with variables
- Custom CSS editor with safety restrictions

## Custom Domains

### Domain Management

Tenants can add custom domains for white-label access:

```typescript
interface DomainMapping {
  id: string;
  tenant_id: string;
  domain: string;
  subdomain?: string;
  verified: boolean;
  txt_token: string;
  txt_record_name: string;
  tls_status: 'pending' | 'issued' | 'failed' | 'expired' | 'revoked';
  tls_certificate_id?: string;
  tls_issued_at?: Date;
  tls_expires_at?: Date;
  verification_attempts: number;
}
```

### Domain Verification Process

**1. Domain Addition:**
```typescript
// Add domain
POST /api/domains
{
  "domain": "app.example.com"
}

// Response includes verification token
{
  "domain": {
    "id": "domain-id",
    "domain": "app.example.com",
    "txt_token": "buildrunner-verify-abc123...",
    "txt_record_name": "_buildrunner-challenge.app.example.com",
    "verified": false
  }
}
```

**2. DNS Configuration:**
Add TXT record to DNS:
- **Type**: TXT
- **Name**: `_buildrunner-challenge.app.example.com`
- **Value**: `buildrunner-verify-abc123...`

**3. Verification:**
```typescript
// Verify domain
POST /api/domains/{id}/verify

// Automated verification also runs periodically
```

**4. TLS Certificate:**
After verification, SSL certificate is automatically provisioned via Let's Encrypt.

### Domain Routing

The application routes requests based on the Host header:

```typescript
// Middleware for domain routing
const domainMiddleware = async (request: Request) => {
  const host = request.headers.get('host');
  
  // Check for custom domain mapping
  const mapping = await getDomainMapping(host);
  
  if (mapping?.verified) {
    // Route to tenant with custom branding
    return routeToTenant(mapping.tenant_id, { customDomain: true });
  }
  
  // Default routing
  return routeDefault(request);
};
```

### Domain Limits and Policies

**Limits:**
- Maximum 3 domains per tenant (configurable)
- Domain verification timeout: 24 hours
- Maximum verification attempts: 5

**Restrictions:**
- Blocked domains: localhost, 127.0.0.1, buildrunner.cloud
- Minimum domain length: 4 characters
- No wildcard domains (security)

## Partner API

### Authentication

Partner API uses API key authentication with scoped permissions:

```typescript
interface PartnerApiKey {
  id: string;
  partner_id: string;
  name: string;
  key_hash: string;  // Hashed for security
  key_prefix: string;  // First 4 chars for identification
  scopes: string[];
  expires_at?: Date;
  enabled: boolean;
}
```

**API Key Format:**
```
pk_live_1234567890abcdef...  // Production
pk_test_1234567890abcdef...  // Testing
```

**Authentication Header:**
```
Authorization: Bearer pk_live_1234567890abcdef...
```

### Available Scopes

```typescript
const AVAILABLE_SCOPES = [
  'tenants:read',      // View tenant information
  'tenants:write',     // Create and modify tenants
  'usage:read',        // View usage metrics
  'invoices:read',     // View billing information
  'domains:read',      // View domain mappings
  'domains:write',     // Manage domains
  'branding:read',     // View branding settings
  'branding:write',    // Modify branding
  'webhooks:read',     // View webhook configurations
  'webhooks:write',    // Manage webhooks
];
```

### API Endpoints

**Tenant Management:**
```typescript
// List tenants
GET /partner/v1/tenants
Query: page, limit, status

// Get tenant details
GET /partner/v1/tenants/{id}

// Create tenant (requires approval)
POST /partner/v1/tenants
{
  "name": "Customer Corp",
  "email": "admin@customer.com",
  "plan": "professional"
}

// Update tenant
PUT /partner/v1/tenants/{id}
{
  "name": "Updated Name"
}
```

**Usage Analytics:**
```typescript
// Get usage metrics
GET /partner/v1/usage
Query: tenant_id, start_date, end_date, granularity

// Response
{
  "usage": {
    "api_calls": 15420,
    "storage_gb": 2.5,
    "bandwidth_gb": 12.3,
    "compute_hours": 45.2
  },
  "breakdown": [
    {
      "date": "2024-01-01",
      "api_calls": 520,
      "storage_gb": 2.5
    }
  ]
}
```

**Billing Information:**
```typescript
// Get invoices
GET /partner/v1/invoices
Query: tenant_id, status, start_date, end_date

// Get invoice details
GET /partner/v1/invoices/{id}

// Response
{
  "invoice": {
    "id": "inv_123",
    "tenant_id": "tenant_456",
    "amount_usd": 299.00,
    "partner_share_usd": 29.90,
    "status": "paid",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31"
  }
}
```

**Domain Management:**
```typescript
// List domains
GET /partner/v1/domains
Query: tenant_id, verified

// Add domain
POST /partner/v1/domains
{
  "tenant_id": "tenant_123",
  "domain": "app.customer.com"
}

// Verify domain
POST /partner/v1/domains/{id}/verify
```

**Branding Management:**
```typescript
// Get branding
GET /partner/v1/branding/{tenant_id}

// Update branding
PUT /partner/v1/branding/{tenant_id}
{
  "logo_url": "https://cdn.customer.com/logo.png",
  "theme": {
    "colors": {
      "primary": "#1E40AF"
    }
  }
}
```

### Rate Limiting

API requests are rate limited per partner:
- **Default**: 60 requests per minute
- **Burst**: 100 requests
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Error Handling

Standard HTTP status codes with detailed error responses:

```typescript
// Error response format
{
  "error": {
    "code": "INVALID_SCOPE",
    "message": "The requested scope is not available for this API key",
    "details": {
      "required_scope": "tenants:write",
      "available_scopes": ["tenants:read", "usage:read"]
    }
  }
}
```

## Webhooks

### Webhook Configuration

Partners can register multiple webhook endpoints:

```typescript
interface PartnerWebhook {
  id: string;
  partner_id: string;
  url: string;
  secret_hash: string;  // For HMAC signing
  events: string[];
  enabled: boolean;
  last_delivery_at?: Date;
  last_delivery_status?: 'success' | 'failed' | 'timeout';
  failure_count: number;
}
```

### Available Events

```typescript
const WEBHOOK_EVENTS = [
  'tenant.created',      // New tenant provisioned
  'tenant.updated',      // Tenant information changed
  'tenant.deleted',      // Tenant removed
  'usage.updated',       // Usage metrics updated
  'invoice.created',     // New invoice generated
  'invoice.paid',        // Invoice payment received
  'domain.verified',     // Domain verification successful
  'domain.failed',       // Domain verification failed
  'branding.updated',    // Branding configuration changed
];
```

### Webhook Payload

```typescript
// Webhook payload structure
{
  "id": "evt_1234567890",
  "type": "tenant.created",
  "created": 1640995200,
  "data": {
    "object": {
      "id": "tenant_123",
      "name": "Customer Corp",
      "email": "admin@customer.com",
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  },
  "partner_id": "partner_456"
}
```

### HMAC Signature Verification

Webhooks are signed with HMAC-SHA256:

```typescript
// Verify webhook signature
const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Header format
X-BuildRunner-Signature: sha256=abc123...
```

### Retry Logic

Failed webhook deliveries are retried with exponential backoff:
- **Attempts**: Up to 6 retries
- **Backoff**: 1s, 2s, 4s, 8s, 16s, 32s
- **Timeout**: 30 seconds per attempt
- **Success Codes**: 200-299

## Revenue Sharing

### Revenue Share Configuration

Partners can have different revenue sharing arrangements:

```typescript
interface PartnerRevShare {
  partner_id: string;
  tenant_id?: string;  // Null for global config
  percentage: number;  // 0-100
  minimum_amount_usd: number;
  maximum_amount_usd?: number;
  effective_from: Date;
  effective_until?: Date;
  active: boolean;
}
```

### Revenue Calculation

```typescript
// Calculate partner share
const calculatePartnerShare = (
  partnerId: string,
  tenantId: string,
  invoiceAmount: number
): number => {
  const config = getRevShareConfig(partnerId, tenantId);
  
  if (!config) return 0;
  
  let share = invoiceAmount * (config.percentage / 100);
  
  // Apply limits
  if (config.minimum_amount_usd) {
    share = Math.max(share, config.minimum_amount_usd);
  }
  
  if (config.maximum_amount_usd) {
    share = Math.min(share, config.maximum_amount_usd);
  }
  
  return share;
};
```

### Payout Management

**Payout Reports:**
```typescript
// Generate payout report
GET /partner/v1/payouts
Query: period_start, period_end, format

// Response
{
  "payout": {
    "partner_id": "partner_123",
    "period_start": "2024-01-01",
    "period_end": "2024-01-31",
    "total_revenue": 15000.00,
    "partner_share": 1500.00,
    "invoice_count": 50,
    "tenant_count": 25
  },
  "breakdown": [
    {
      "tenant_id": "tenant_456",
      "tenant_name": "Customer Corp",
      "revenue": 299.00,
      "share": 29.90,
      "percentage": 10.0
    }
  ]
}
```

**Stripe Connect Integration:**
For automated payouts, partners can connect Stripe accounts:

```typescript
// Connect Stripe account
POST /partner/v1/stripe/connect
{
  "return_url": "https://partner.com/stripe/return",
  "refresh_url": "https://partner.com/stripe/refresh"
}

// Initiate payout
POST /partner/v1/payouts
{
  "amount": 1500.00,
  "currency": "usd",
  "description": "January 2024 revenue share"
}
```

## Partner Portal

### Dashboard Features

The partner portal (`/partners/{slug}/dashboard`) provides:

**Key Metrics:**
- Monthly revenue and growth
- Active tenant count
- API usage statistics
- Webhook delivery status

**Analytics:**
- Usage trends over time
- Revenue breakdown by tenant
- Geographic distribution
- Performance metrics

**Management Tools:**
- Tenant provisioning and management
- API key generation and rotation
- Webhook configuration
- Branding assistance

### Tenant Management

Partners can manage their linked tenants:

```typescript
// Partner tenant management
interface PartnerTenantManagement {
  view_tenants: boolean;
  provision_tenants: boolean;  // Requires approval
  manage_branding: boolean;
  manage_domains: boolean;
  view_usage: boolean;
  view_billing: boolean;
}
```

**Tenant Provisioning Workflow:**
1. Partner submits tenant creation request
2. Request enters approval queue
3. Admin reviews and approves/rejects
4. Tenant is provisioned with partner linkage
5. Partner receives webhook notification

## Security and Compliance

### Data Protection

**Encryption:**
- API keys hashed with bcrypt
- Webhook secrets encrypted at rest
- TLS 1.3 for all communications
- Database encryption for sensitive fields

**Access Control:**
- Partner isolation enforced at database level
- Tenant data separation
- Role-based permissions
- API scope validation

**Audit Logging:**
- All partner API calls logged
- Webhook delivery tracking
- Tenant management actions
- Revenue share calculations

### Compliance Features

**GDPR Compliance:**
- Data export capabilities
- Right to deletion
- Consent management
- Data processing transparency

**SOC 2 Type II:**
- Security controls documentation
- Access logging and monitoring
- Incident response procedures
- Regular security assessments

## Configuration

### Environment Variables

```bash
# Partner API settings
PARTNER_API_ENABLED=true
PARTNER_API_RATE_LIMIT=60
PARTNER_API_BURST_LIMIT=100

# Domain settings
CUSTOM_DOMAINS_ENABLED=true
MAX_DOMAINS_PER_TENANT=3
DOMAIN_VERIFICATION_TIMEOUT_HOURS=24

# Webhook settings
WEBHOOK_TIMEOUT_SECONDS=30
WEBHOOK_MAX_RETRIES=6
WEBHOOK_BACKOFF_BASE_MS=1000

# Revenue sharing
REVENUE_SHARING_ENABLED=true
MIN_PAYOUT_USD=100
PAYOUT_FREQUENCY=monthly

# Branding
BRANDING_ENABLED=true
MAX_LOGO_SIZE_MB=5
MAX_CUSTOM_CSS_KB=100
```

### Policy Configuration

```yaml
# governance/policy.yml
oem_white_label:
  oem:
    enabled: true
    allow_white_label: true
    partner_program_enabled: true
    
  custom_domains:
    enabled: true
    max_domains_per_tenant: 3
    verification_required: true
    auto_tls: true
    
  branding:
    enabled: true
    allowed_overrides: ["colors", "typography", "radius", "logo", "email_templates"]
    
  partner_api:
    enabled: true
    rate_limit_per_min: 60
    webhook_retry: { max_attempts: 6, backoff_ms: 1000 }
```

## Best Practices

### Partner Onboarding

**1. Partner Registration:**
- Verify business credentials
- Review partnership agreement
- Set up initial revenue sharing
- Provide onboarding materials

**2. Technical Integration:**
- Generate API keys with appropriate scopes
- Configure webhook endpoints
- Test integration in sandbox
- Validate security implementation

**3. Go-Live Checklist:**
- Complete security review
- Verify compliance requirements
- Test failover scenarios
- Monitor initial usage

### Branding Guidelines

**Design Consistency:**
- Maintain accessibility standards
- Validate color contrast ratios
- Test across different devices
- Ensure brand guideline compliance

**Performance Optimization:**
- Optimize logo file sizes
- Minimize custom CSS impact
- Use CDN for static assets
- Monitor page load times

### API Integration

**Error Handling:**
- Implement exponential backoff
- Handle rate limiting gracefully
- Log errors for debugging
- Provide user-friendly messages

**Security:**
- Rotate API keys regularly
- Validate webhook signatures
- Use HTTPS for all endpoints
- Monitor for suspicious activity

## Troubleshooting

### Common Issues

**Domain Verification Failures:**
- Check DNS propagation
- Verify TXT record format
- Ensure domain ownership
- Review firewall settings

**Webhook Delivery Issues:**
- Validate endpoint URL
- Check HMAC signature verification
- Review response status codes
- Monitor delivery logs

**API Authentication Errors:**
- Verify API key format
- Check scope permissions
- Validate request headers
- Review rate limiting

### Debug Tools

```bash
# Check domain verification
br domains verify --domain example.com --debug

# Test webhook delivery
br webhooks test --url https://partner.com/webhook --event tenant.created

# Validate API key
br partners api-key validate --key pk_test_123... --scope tenants:read

# Generate revenue report
br partners revenue --partner acme-corp --period 2024-01
```

For additional support, see the [troubleshooting guide](https://docs.buildrunner.cloud/troubleshooting) or contact the BuildRunner team.
