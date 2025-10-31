# BuildRunner Admin Console Guide

This guide covers the BuildRunner Admin Console for operators and enterprise administrators to monitor, control, and manage BuildRunner operations.

## Table of Contents

- [Overview](#overview)
- [Access & Roles](#access--roles)
- [Dashboard](#dashboard)
- [Cost & Budget Management](#cost--budget-management)
- [Token Tracking](#token-tracking)
- [Governance Operations](#governance-operations)
- [API Key Management](#api-key-management)
- [Support Tools](#support-tools)
- [Incident Center](#incident-center)
- [Maintenance Windows](#maintenance-windows)
- [Audit & Logging](#audit--logging)
- [Troubleshooting](#troubleshooting)

## Overview

The Admin Console provides enterprise administrators with comprehensive tools to:

- **Monitor**: Real-time visibility into project health, costs, and usage
- **Control**: Budget enforcement, rate limiting, and governance operations
- **Manage**: API keys, maintenance windows, and support incidents
- **Audit**: Complete audit trails and compliance reporting

## Access & Roles

### Role Requirements

Access to the Admin Console requires one of the following roles:

- **GlobalAdmin**: Full access to all admin functions across all organizations
- **TenantAdmin**: Access to admin functions within their organization
- **SupportAgent**: Limited access to support tools and incident management

### Authentication

```bash
# Access the Admin Console
https://app.buildrunner.com/admin

# Role verification
curl -H "Authorization: Bearer your-token" \
  https://api.buildrunner.com/admin/auth/verify
```

### Permission Matrix

| Feature | GlobalAdmin | TenantAdmin | SupportAgent |
|---------|-------------|-------------|--------------|
| Dashboard | ✅ | ✅ (org-scoped) | ✅ (read-only) |
| Cost Management | ✅ | ✅ (org-scoped) | ❌ |
| Impersonation | ✅ | ✅ (org-scoped) | ❌ |
| API Keys | ✅ | ✅ (org-scoped) | ❌ |
| Maintenance Windows | ✅ | ✅ (org-scoped) | ❌ |
| Support Tickets | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ✅ (org-scoped) | ✅ (read-only) |

## Dashboard

### Overview Cards

The admin dashboard provides real-time metrics:

- **Projects**: Total and active project counts
- **Monthly Spend**: Current month spending across all projects
- **Monthly Tokens**: Token consumption aggregated
- **Quality Score**: Platform-wide quality metrics
- **Active Issues**: Critical issues requiring attention
- **Open Tickets**: Support tickets needing resolution

### Project Overview

Each project displays:
- Current monthly spend vs. budget
- Budget utilization percentage with color coding
- Token usage and API call counts
- Quality score and trend
- Last activity timestamp
- Active issue count

## Cost & Budget Management

### Setting Budgets

```bash
# Create/update project budget
curl -X POST https://api.buildrunner.com/admin/budgets \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "monthly_usd": 1000.00,
    "hard_cap": true,
    "alert_threshold": 0.8
  }'
```

### Budget Enforcement

- **Soft Limits**: Warnings at 80% and 90% of budget
- **Hard Caps**: API calls blocked when budget exceeded
- **Alerts**: Automatic notifications to administrators
- **Overrides**: Emergency budget increases with dual approval

### Cost Reconciliation

The cost reconciler runs automatically to:
- Aggregate usage events from all sources
- Apply credits and adjustments
- Calculate monthly forecasts
- Generate budget alerts
- Update cost snapshots

## Token Tracking

### Real-Time Monitoring

Track token consumption across:
- **Models**: Different AI models with varying costs
- **Projects**: Per-project token usage
- **Time Periods**: Daily, weekly, monthly views
- **Forecasting**: Projected usage based on current trends

### Token Costs by Model

| Model | Cost per 1K Tokens | Relative Rate |
|-------|-------------------|---------------|
| GPT-3.5 Turbo | $0.002 | 1x |
| GPT-4 | $0.020 | 10x |
| Claude-3-Haiku | $0.0016 | 0.8x |
| Claude-3-Sonnet | $0.006 | 3x |
| Claude-3-Opus | $0.030 | 15x |

### Usage Analytics

```bash
# Get token usage summary
curl https://api.buildrunner.com/admin/usage/tokens \
  -H "Authorization: Bearer your-token" \
  -G -d "project_id=proj_123" \
     -d "start_date=2024-01-01" \
     -d "end_date=2024-01-31"
```

## Governance Operations

### Impersonation

Safely impersonate users for support purposes:

```bash
# Start impersonation session
curl -X POST https://api.buildrunner.com/admin/impersonation \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "project_id": "proj_123",
    "reason": "Support ticket #456 - debugging user issue",
    "duration_minutes": 60
  }'
```

**Audit Requirements:**
- All impersonation sessions logged with reason
- Maximum duration limits enforced
- Automatic session termination
- Banner displayed during impersonation
- Hash chain entries for compliance

### Rate Limiting

Configure API rate limits per project:

```bash
# Set rate limits
curl -X POST https://api.buildrunner.com/admin/rate-limits \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "endpoint_pattern": "/api/builder/*",
    "limit_per_minute": 100,
    "burst": 150
  }'
```

**Rate Limit Scopes:**
- `/api/planner/*` - Planning operations
- `/api/builder/*` - Build execution
- `/api/qa/*` - QA automation
- `/api/analytics/*` - Analytics queries

## API Key Management

### Key Lifecycle

1. **Creation**: Generate new API key with scopes
2. **Storage**: Hash stored, plain key shown once
3. **Usage**: Track last used timestamp
4. **Rotation**: Automated or manual rotation
5. **Revocation**: Immediate key disabling

### Creating API Keys

```bash
# Create scoped API key
curl -X POST https://api.buildrunner.com/admin/api-keys \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "name": "CI/CD Pipeline Key",
    "scopes": ["planner.read", "builder.run", "qa.run"],
    "expires_at": "2024-12-31T23:59:59Z"
  }'
```

### Available Scopes

- **planner.read**: Read planning data and templates
- **planner.write**: Create and modify plans
- **builder.run**: Execute build operations
- **qa.run**: Run QA automation
- **analytics.read**: Access analytics data
- **analytics.write**: Modify analytics configuration

### Key Rotation

```bash
# Rotate API key
curl -X POST https://api.buildrunner.com/admin/api-keys/{key_id}/rotate \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "grace_period_hours": 24
  }'
```

## Support Tools

### Credits Adjustment

Apply billing credits or adjustments:

```bash
# Add credits to project
curl -X POST https://api.buildrunner.com/admin/credits \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "amount_usd": 100.00,
    "reason": "Service outage compensation",
    "type": "adjustment"
  }'
```

### Log Viewer

Access comprehensive logging:

```bash
# Export audit logs
curl https://api.buildrunner.com/admin/logs/export \
  -H "Authorization: Bearer your-token" \
  -G -d "start_date=2024-01-01" \
     -d "end_date=2024-01-31" \
     -d "format=csv" \
     -d "include_pii=false"
```

## Incident Center

### Ticket Management

The incident center provides:
- **Ticket Creation**: Automatic and manual ticket creation
- **Assignment**: Route tickets to appropriate teams
- **Status Tracking**: Open → In Progress → Resolved → Closed
- **Priority Levels**: Low, Medium, High, Critical
- **Categories**: Budget, Reliability, Governance, Integrations, Billing, Performance

### Ticket Workflow

```bash
# Create support ticket
curl -X POST https://api.buildrunner.com/admin/tickets \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "title": "Budget exceeded - requires review",
    "description": "Project has exceeded monthly budget by 15%",
    "priority": "high",
    "category": "budget"
  }'
```

### Automated Ticket Creation

Tickets are automatically created for:
- Budget threshold violations (80%, 90%, 100%)
- Quality score drops below thresholds
- Rate limit violations
- Integration failures
- Compliance violations

## Maintenance Windows

### Scheduling Maintenance

```bash
# Schedule maintenance window
curl -X POST https://api.buildrunner.com/admin/maintenance \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "title": "Database Migration",
    "description": "Upgrading to PostgreSQL 15",
    "starts_at": "2024-02-01T02:00:00Z",
    "ends_at": "2024-02-01T06:00:00Z",
    "blocks_operations": ["deploy", "migration", "backup"]
  }'
```

### Blocked Operations

During maintenance windows, the following operations can be blocked:
- **deploy**: Application deployments
- **migration**: Database migrations
- **backup**: Backup operations
- **scaling**: Infrastructure scaling
- **integration**: External integrations

### Override Process

Emergency overrides require:
1. GlobalAdmin approval
2. TenantAdmin confirmation
3. Documented business justification
4. Audit trail entry

## Audit & Logging

### Audit Trail

All admin actions are logged with:
- **Actor**: User performing the action
- **Action**: Type of operation
- **Resource**: Target resource and ID
- **Payload**: Action parameters
- **Timestamp**: UTC timestamp
- **IP Address**: Source IP
- **User Agent**: Client information

### Compliance Reporting

```bash
# Generate compliance report
curl https://api.buildrunner.com/admin/compliance/report \
  -H "Authorization: Bearer your-token" \
  -G -d "start_date=2024-01-01" \
     -d "end_date=2024-01-31" \
     -d "format=pdf" \
     -d "include_sections=audit,budget,governance"
```

### Log Retention

- **Admin Actions**: 7 years
- **Audit Ledger**: 7 years (immutable)
- **Usage Events**: 2 years
- **Support Tickets**: 3 years
- **Impersonation Sessions**: 7 years

## Troubleshooting

### Common Issues

1. **Budget Alerts Not Triggering**
   ```bash
   # Check reconciler status
   curl https://api.buildrunner.com/admin/reconciler/status \
     -H "Authorization: Bearer your-token"
   ```

2. **API Key Authentication Failures**
   ```bash
   # Verify key status
   curl https://api.buildrunner.com/admin/api-keys/{key_id}/verify \
     -H "Authorization: Bearer your-token"
   ```

3. **Impersonation Session Stuck**
   ```bash
   # Force end impersonation
   curl -X DELETE https://api.buildrunner.com/admin/impersonation/{session_id} \
     -H "Authorization: Bearer your-token"
   ```

### Support Escalation

- **Level 1**: Self-service through Admin Console
- **Level 2**: Support ticket creation
- **Level 3**: Emergency escalation to GlobalAdmin
- **Level 4**: Vendor support engagement

### Emergency Procedures

For critical issues:
1. Create high-priority support ticket
2. Engage emergency response team
3. Document all actions taken
4. Post-incident review and documentation

---

For additional help, contact the BuildRunner support team or refer to the [API Documentation](https://docs.buildrunner.com/api).
