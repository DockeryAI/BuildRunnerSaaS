# BuildRunner Billing & Pricing Guide

This guide covers BuildRunner's pricing plans, billing system, usage tracking, and subscription management.

## Table of Contents

- [Pricing Plans](#pricing-plans)
- [Usage-Based Billing](#usage-based-billing)
- [Subscription Management](#subscription-management)
- [Usage Monitoring](#usage-monitoring)
- [Feature Gating](#feature-gating)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

## Pricing Plans

BuildRunner offers four pricing tiers designed to scale with your team and usage needs:

### Free Plan - $0/month
Perfect for getting started with BuildRunner
- **1 seat** included
- **3 projects** maximum
- **100,000 tokens** per month
- **1,000 API calls** per month
- **1 GB storage**
- **2 integrations**
- **1 preview environment**
- **30-day audit retention**

**Features:**
- Core planning and execution
- Basic analytics
- Community support
- Templates and GitHub integration
- GPT-3.5 Turbo model access
- JSON export

### Pro Plan - $29/month
For individual developers and small teams
- **5 seats** included
- **25 projects** maximum
- **1,000,000 tokens** per month
- **10,000 API calls** per month
- **10 GB storage**
- **10 integrations**
- **5 preview environments**
- **90-day audit retention**

**Features:**
- All Free features plus:
- Real-time collaboration
- Advanced analytics
- Priority support
- Multiple AI models (GPT-4, Claude-3-Haiku)
- API access and webhooks
- PDF/CSV export
- Audit logging

### Team Plan - $99/month
For growing teams and organizations
- **25 seats** included
- **100 projects** maximum
- **5,000,000 tokens** per month
- **50,000 API calls** per month
- **50 GB storage**
- **25 integrations**
- **15 preview environments**
- **365-day audit retention**

**Features:**
- All Pro features plus:
- SSO integration
- Custom AI models
- Compliance reports
- Advanced integrations
- Claude-3-Sonnet access
- DOCX export

### Enterprise Plan - $299/month
For large organizations with advanced needs
- **100 seats** included
- **500 projects** maximum
- **25,000,000 tokens** per month
- **250,000 API calls** per month
- **250 GB storage**
- **50 integrations**
- **50 preview environments**
- **7-year audit retention**

**Features:**
- All Team features plus:
- Dedicated support manager
- Custom deployment options
- Advanced compliance (SOC2, HIPAA)
- Claude-3-Opus access
- XML export
- Custom SLA

## Usage-Based Billing

### Token Usage
- **Free Tier**: 100,000 tokens/month included
- **Overage Rate**: $0.002 per 1,000 tokens
- **Models**: Different models consume tokens at different rates
  - GPT-3.5 Turbo: 1x rate
  - GPT-4: 10x rate
  - Claude-3-Haiku: 0.8x rate
  - Claude-3-Sonnet: 3x rate
  - Claude-3-Opus: 15x rate

### API Calls
- **Free Tier**: 1,000 calls/month included
- **Overage Rate**: $0.10 per 100 calls
- **Includes**: All REST API endpoints, webhook deliveries

### Storage
- **Free Tier**: 1 GB included
- **Overage Rate**: $0.50 per GB/month
- **Includes**: Project files, artifacts, logs, exports

### Preview Environments
- **Free Tier**: 1 environment included
- **Overage Rate**: $5.00 per additional environment/month
- **Includes**: Vercel, Render, Netlify deployments

## Subscription Management

### Upgrading Plans

1. **Via Dashboard**
   ```bash
   # Navigate to Settings → Billing
   # Select desired plan
   # Click "Upgrade to [Plan]"
   # Complete Stripe Checkout
   ```

2. **Via API**
   ```bash
   curl -X POST https://api.buildrunner.com/billing/checkout \
     -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{
       "org_id": "your-org-id",
       "plan": "pro",
       "billing_cycle": "monthly"
     }'
   ```

### Downgrading Plans
- Downgrades take effect at the end of the current billing period
- Usage limits apply immediately upon downgrade
- Data retention policies adjust to new plan limits

### Cancellation
- Cancel anytime through Settings → Billing → Manage Billing
- Access continues until end of current billing period
- Account reverts to Free plan with usage limits
- 30-day grace period for data export

## Usage Monitoring

### Real-Time Dashboard
Monitor your usage in Settings → Billing:
- **Token consumption** by model and project
- **API call volume** with rate limiting status
- **Storage usage** with breakdown by project
- **Integration activity** and costs

### Usage Alerts
Automatic notifications when approaching limits:
- **75% threshold**: Warning email sent
- **90% threshold**: Urgent email + in-app notification
- **100% threshold**: Service restrictions applied

### Usage API
```bash
# Get current usage
curl https://api.buildrunner.com/billing/usage \
  -H "Authorization: Bearer your-api-key"

# Response
{
  "tokens": {
    "used": 750000,
    "limit": 1000000,
    "percentage": 75.0
  },
  "api_calls": {
    "used": 7500,
    "limit": 10000,
    "percentage": 75.0
  },
  "storage": {
    "used": 6.5,
    "limit": 10.0,
    "percentage": 65.0
  }
}
```

## Feature Gating

Features are automatically enabled/disabled based on your plan:

### Code-Level Gating
```typescript
import { checkFeatureAccess } from '@/lib/billing/features';

// Check if feature is available
const hasAdvancedAnalytics = await checkFeatureAccess(
  orgId, 
  'advanced_analytics'
);

if (!hasAdvancedAnalytics) {
  return <UpgradePrompt feature="Advanced Analytics" />;
}
```

### API-Level Gating
```bash
# API calls return 402 Payment Required for unavailable features
curl https://api.buildrunner.com/analytics/advanced \
  -H "Authorization: Bearer your-api-key"

# Response for insufficient plan
{
  "error": "Feature not available",
  "code": "FEATURE_GATED",
  "required_plans": ["pro", "team", "enterprise"],
  "current_plan": "free",
  "upgrade_url": "https://app.buildrunner.com/settings/billing"
}
```

### Feature Matrix

| Feature | Free | Pro | Team | Enterprise |
|---------|------|-----|------|------------|
| Core Planning | ✅ | ✅ | ✅ | ✅ |
| Collaboration | ❌ | ✅ | ✅ | ✅ |
| SSO | ❌ | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ | ✅ |
| Custom Models | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ | ✅ |
| Webhooks | ❌ | ✅ | ✅ | ✅ |
| Audit Logs | ❌ | ✅ | ✅ | ✅ |
| Compliance Reports | ❌ | ❌ | ✅ | ✅ |
| Dedicated Support | ❌ | ❌ | ❌ | ✅ |

## API Integration

### Billing Endpoints

```bash
# Get billing account
GET /api/billing/account?org_id={org_id}

# Create checkout session
POST /api/billing/checkout
{
  "org_id": "string",
  "plan": "pro|team|enterprise",
  "billing_cycle": "monthly|yearly"
}

# Get customer portal URL
GET /api/billing/portal?org_id={org_id}

# Record usage event
POST /api/billing/usage
{
  "project_id": "string",
  "event_type": "tokens|api_calls|storage",
  "quantity": 1000,
  "metadata": {}
}

# Get usage summary
GET /api/billing/usage?org_id={org_id}&start_date={date}&end_date={date}
```

### Webhook Events

BuildRunner sends webhooks for billing events:

```bash
# Webhook payload example
{
  "event": "subscription.updated",
  "data": {
    "org_id": "org_123",
    "old_plan": "free",
    "new_plan": "pro",
    "effective_date": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Available Events:**
- `subscription.created`
- `subscription.updated` 
- `subscription.cancelled`
- `usage.limit_exceeded`
- `invoice.paid`
- `invoice.failed`

## Governance Integration

### Policy Configuration
```yaml
# governance/policy.yml
billing:
  plan_limit_alert_threshold: 0.9
  auto_upgrade: false
  budget_alerts:
    - threshold: 100
      recipients: ["admin@company.com"]
    - threshold: 500
      recipients: ["finance@company.com"]
  
  usage_limits:
    tokens_per_project: 50000
    api_calls_per_hour: 100
    storage_per_project_gb: 5
```

### Audit Logging
All billing events are logged for compliance:

```sql
-- View billing audit trail
SELECT 
  event_type,
  actor,
  description,
  old_values,
  new_values,
  created_at
FROM billing_events 
WHERE billing_account_id = 'account_id'
ORDER BY created_at DESC;
```

## Troubleshooting

### Common Issues

1. **Payment Failed**
   ```bash
   # Check payment method
   # Update billing information in customer portal
   # Retry payment or contact support
   ```

2. **Usage Limit Exceeded**
   ```bash
   # Check current usage in dashboard
   # Upgrade plan or purchase additional quota
   # Optimize usage patterns
   ```

3. **Feature Not Available**
   ```bash
   # Verify current plan includes feature
   # Check feature gate configuration
   # Upgrade plan if necessary
   ```

4. **Billing Discrepancy**
   ```bash
   # Review usage breakdown in dashboard
   # Check invoice details
   # Contact support with specific dates/amounts
   ```

### Support Channels

- **Free Plan**: Community support, documentation
- **Pro Plan**: Email support (48h response)
- **Team Plan**: Priority email support (24h response)
- **Enterprise Plan**: Dedicated support manager, phone support

### Billing Support
- **Email**: billing@buildrunner.com
- **Phone**: +1-555-BILLING (Enterprise only)
- **Portal**: Customer portal for self-service

---

For additional help, see our [Knowledge Base](https://docs.buildrunner.com) or contact support.
