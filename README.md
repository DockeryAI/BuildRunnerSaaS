# BuildRunner SaaS

A TypeScript-based CLI tool for managing build specifications and execution state across distributed development workflows.

## What This Is

BuildRunner SaaS is a project management and build orchestration system that uses structured Build Specifications to track milestones, steps, and microsteps. It provides:

- **Build Spec Management**: JSON-based specifications that define project structure and progress
- **State Synchronization**: Local and remote state management with Supabase backend
- **CLI Interface**: Command-line tools for initialization, synchronization, and status reporting
- **TypeScript Foundation**: Strongly-typed interfaces and utilities for reliable operation

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd BuildRunnerSaaS

# Install dependencies
npm install

# Build the project
npm run build

# Verify environment setup (optional - requires .env file)
npm run verify:env
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Verify environment variables
npm run verify:env
```

### CLI Usage

```bash
# Show available commands
node dist/index.js --help

# Initialize local runner state
node dist/index.js init

# Sync with remote state
node dist/index.js sync

# Show current status (includes Supabase health check)
node dist/index.js status

# Validate build spec against schema
node dist/index.js lint

# Sync with remote Supabase
node dist/index.js sync --push  # Push local to remote
node dist/index.js sync --pull  # Pull remote to local
```

## Project Structure

```
BuildRunnerSaaS/
├── buildrunner/           # BuildRunner core files
│   ├── specs/            # Build specifications
│   │   └── plan.json     # Main build spec (canonical source of truth)
│   ├── state/            # Local state management
│   │   └── runner_state.json  # Local mirror of build state
│   └── scripts/          # Utility scripts
│       └── verify-env.ts # Environment validation
├── src/                  # TypeScript source code
│   ├── schema/           # Type definitions
│   │   └── buildSpec.ts  # Build spec interfaces
│   ├── utils/            # Utility functions
│   │   └── stateManager.ts  # State load/save helpers
│   └── index.ts          # CLI entry point
├── dist/                 # Compiled JavaScript (generated)
├── .env.example          # Environment variable template
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Test configuration
```

## Build Spec System

The Build Spec (`buildrunner/specs/plan.json`) is the canonical source of truth for project structure. It defines:

- **Milestones**: High-level project phases
- **Steps**: Major work units within milestones
- **Microsteps**: Granular tasks with specific acceptance criteria

The local state (`buildrunner/state/runner_state.json`) mirrors this structure and tracks synchronization metadata.

## Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Anonymous key for read operations
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for backend access
- `SUPABASE_PROJECT_REF`: Project reference ID for CLI linking

## Development Workflow

1. **Make Changes**: Edit source files in `src/`
2. **Build**: Run `npm run build` to compile TypeScript
3. **Test**: Run `npm run test` to execute test suite
4. **Verify**: Run `npm run verify:env` to check environment setup

## One-Click Backend Setup

Phase 3 introduces fully automated Supabase backend provisioning:

1. **Navigate to Settings**: Go to `/settings/backend` in the web app
2. **Connect Supabase**: Provide your Personal Access Token and Organization ID
3. **Automated Setup**: The system will:
   - Create a new Supabase project
   - Apply database schema migrations
   - Deploy edge functions
   - Configure your local environment
   - Run health checks

### Environment Variables (Phase 3)

For the provisioning service, add these server-side variables:

```bash
# Server-side only (never expose to client)
SUPABASE_MGMT_BASE=https://api.supabase.com
VAULT_ENCRYPTION_KEY=your-32-character-encryption-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Phase 9 — Analytics & Cost Monitoring ✅

Comprehensive analytics and cost visibility with anomaly detection and automated reporting.

### Features
- **Metrics Tracking**: Velocity, quality, and duration metrics with trend analysis
- **Cost Monitoring**: Multi-provider cost tracking with budget management and alerts
- **Anomaly Detection**: Automated detection of cost spikes, quality drops, and velocity issues
- **Interactive Dashboard**: Rich visualizations with drilldown capabilities and filtering
- **Automated Reports**: Scheduled PDF/CSV reports with email delivery
- **Governance Integration**: Budget enforcement and policy compliance with approval workflows

### Analytics Dashboard
- **Velocity Metrics**: Development speed tracking (microsteps/week) with phase breakdown
- **Quality Scores**: Test pass rates and acceptance criteria compliance
- **Cost Analysis**: Provider-wise cost breakdown with budget usage visualization
- **Anomaly Management**: Real-time alerts with severity classification and resolution tracking

### Cost Providers Supported
- **OpenAI**: LLM API usage and token consumption
- **Supabase**: Database operations and storage costs
- **Vercel**: Hosting, compute, and function invocations
- **GitHub**: Actions minutes and storage usage
- **Custom**: Configurable for additional providers

### Automated Reporting
- **Daily Reports**: Summary of metrics, costs, and anomalies
- **Weekly Reports**: Trend analysis and performance insights
- **Monthly Reports**: Comprehensive project health and budget analysis
- **Custom Exports**: PDF, CSV, and JSON formats with API access

### Usage
```bash
# View analytics dashboard
http://localhost:3001/analytics

# Export analytics data
GET /api/analytics/export?format=csv&project_id=123

# Trigger usage collection
POST /api/analytics/collect

# Generate scheduled reports
POST /api/analytics/reports/schedule
```

### Governance Policy
Analytics operations are governed by policy rules defined in `buildrunner/governance/policy.yml`:

```yaml
analytics:
  budget_alert_threshold: 500.00    # Monthly budget limit
  cost_spike_threshold: 50          # Alert on 50%+ cost increase
  quality_drop_threshold: 20        # Alert on 20%+ quality decrease
  require_anomaly_review: true      # Require review for anomalies
  max_daily_cost: 50.00            # Block operations above daily limit
```

## Phase 10 — Collaboration & Comments Integration ✅

Native team collaboration with inline comments, mentions, realtime presence, and external issue sync.

### Features
- **Role-Based Access Control**: PM, TechLead, QA, Contributor, Viewer roles with granular permissions
- **Inline Comments**: Threaded comments on milestones, steps, microsteps with markdown support
- **@Mentions & Subscriptions**: User, role, and team mentions with automatic notifications
- **Comment → Microstep Promotion**: Convert comments into trackable microsteps with acceptance criteria
- **Realtime Presence**: Live user presence and activity tracking with Supabase Realtime
- **Notification Center**: In-app notifications with email and webhook integration
- **External Issue Sync**: Jira, Linear, GitHub, Asana integration stubs for Phase 13

### Role System
- **PM (Project Manager)**: Full project control, role management, comment promotion
- **TechLead**: Technical leadership, comment promotion, analytics access
- **QA**: Quality assurance focus, commenting, testing oversight
- **Contributor**: Development work, commenting, limited project access
- **Viewer**: Read-only access to project content

### Comment Features
- **Threaded Discussions**: Nested replies with conversation threading
- **Rich Mentions**: @username, @role:PM, @team:frontend with autocomplete
- **Link Attachments**: PR links, file references, test results
- **Markdown Support**: Basic formatting with live preview
- **Resolution Tracking**: Mark comments as resolved with audit trail

### Realtime Collaboration
- **Live Presence**: See who's online and what they're working on
- **Instant Updates**: Comments appear immediately across all clients
- **Activity Indicators**: Real-time typing indicators and cursor positions
- **Optimistic UI**: Immediate feedback with server reconciliation

### Notification System
- **In-App Notifications**: Bell icon with unread count and flyout
- **Email Notifications**: Configurable email alerts for mentions and comments
- **Webhook Integration**: Slack and Discord notifications with rich formatting
- **Priority Levels**: Low, normal, high, urgent with appropriate styling

### External Issue Integration
- **Provider Support**: Jira, Linear, GitHub Issues, Asana (stubs for Phase 13)
- **Bidirectional Sync**: Comments and microsteps can create external issues
- **Status Tracking**: Sync status and external links with audit trail
- **Mapping Tables**: Robust data model for multi-provider integration

### Usage
```bash
# View comments on any entity
GET /api/comments?project_id=123&entity_type=microstep&entity_id=p1.s1.ms1

# Create comment with mentions
POST /api/comments
{
  "project_id": "123",
  "entity_type": "microstep",
  "entity_id": "p1.s1.ms1",
  "body": "Great work @johndoe! @role:QA please review."
}

# Promote comment to microstep
POST /api/comments/456/promote
{
  "step_id": "p1.s2",
  "title": "Implement user authentication",
  "criteria": ["Login form works", "JWT tokens generated"]
}

# Create external issue
POST /api/issues
{
  "provider": "jira",
  "project_id": "123",
  "entity_type": "microstep",
  "entity_id": "p1.s1.ms1",
  "title": "Fix authentication bug"
}
```

### Plan Limits by Tier
```yaml
free:
  max_seats: 3
  features: [comments, basic_notifications]

pro:
  max_seats: 10
  features: [comments, mentions, notifications, webhooks]

team:
  max_seats: 50
  features: [all_collaboration, external_issues, realtime]

enterprise:
  max_seats: 1000
  features: [all_features, sso, audit_logs]
```

## Phase 11 — Explainability & Multi-Model ✅

AI-powered explanations and intelligent model routing with dual-run arbitration for optimal performance.

### Features
- **Explain Mode**: Generate AI narratives for any project component (milestone, step, microstep)
- **Teach-Me Walkthrough**: Guided tour of project architecture with interactive explanations
- **Model Router**: Task-type aware model selection with performance optimization
- **Dual-Run Arbitration**: Optional side-by-side model comparison with judge selection
- **Performance Analytics**: Comprehensive model performance tracking and comparison
- **Project Model Settings**: Per-project model preferences with cost and quality controls

### Explain Mode
- **AI Narratives**: Generate plain-English explanations for complex technical components
- **Multiple Audiences**: Technical, business, or general audience targeting
- **Export to HRPO**: Human-Readable Project Overview integration
- **Context-Aware**: Explanations consider project scope, dependencies, and current state
- **Multi-Language**: Support for different languages and technical levels

### Model Router
- **Task-Type Mapping**: Automatic model selection based on task requirements
  - **Planner**: High-quality models for architecture and planning (GPT-4, Claude-3-Sonnet)
  - **Builder**: Fast models for code generation (GPT-3.5-Turbo, Claude-3-Haiku)
  - **QA**: Efficient models for testing and validation
  - **Explain**: High-quality models for documentation and explanations
  - **Rescope**: Balanced models for plan modifications
  - **Arbitrate**: Premium models for comparison and decision-making

### Dual-Run Arbitration
- **Side-by-Side Execution**: Run two models simultaneously for critical tasks
- **AI Judge**: Automated comparison with confidence scoring and rationale
- **Cost Controls**: Budget guards and multiplier limits to prevent runaway costs
- **Quality Thresholds**: Minimum quality requirements for task acceptance
- **Audit Trail**: Complete logging of arbitration decisions and reasoning

### Performance Analytics
- **Model Comparison**: Success rates, latency, quality scores, and cost analysis
- **Win Rate Tracking**: Arbitration results and model performance rankings
- **Cost Optimization**: Token usage and cost per task type analysis
- **Quality Metrics**: Automated scoring and performance grading (A-F scale)
- **Trend Analysis**: Performance changes over time with recommendations

### Usage
```bash
# Generate explanation for any component
POST /api/explain
{
  "scope": "milestone",
  "entity_id": "p1.m1",
  "audience": "business",
  "language": "en"
}

# Get model recommendations for task type
GET /api/models/recommend?task_type=planner

# Configure project model settings
POST /api/models/settings
{
  "project_id": "123",
  "task_type": "builder",
  "preferred_model": "gpt-3.5-turbo",
  "dual_run_enabled": true,
  "max_cost_multiplier": 2.0
}

# Compare model performance
GET /api/models/compare?task_type=explain&period=30d
```

### Model Profiles
```yaml
gpt-4:
  provider: openai
  task_types: [planner, explain, arbitrate]
  quality_rating: 9.5/10
  speed_rating: 6.0/10
  cost_per_token: $0.00003

claude-3-sonnet:
  provider: anthropic
  task_types: [planner, explain, arbitrate]
  quality_rating: 9.0/10
  speed_rating: 7.5/10
  cost_per_token: $0.000003

gpt-3.5-turbo:
  provider: openai
  task_types: [builder, qa, rescope]
  quality_rating: 7.5/10
  speed_rating: 9.0/10
  cost_per_token: $0.0000015
```

### Arbitration Example
```yaml
task_type: planner
candidates:
  - model: gpt-4
    response: "Detailed architecture plan..."
    quality_score: 92
  - model: claude-3-sonnet
    response: "Alternative architecture..."
    quality_score: 89

winner: gpt-4
rationale: "Higher quality score and more comprehensive coverage of requirements"
confidence: 85%
cost_multiplier: 1.8x
```

## Phase 12 — Enterprise & Compliance ✅

Enterprise-ready deployment with VPC infrastructure, SSO integration, and comprehensive audit compliance.

### Features
- **VPC Deployment**: Docker Compose and Terraform infrastructure for private cloud deployment
- **SSO Integration**: OIDC and SAML support with organization-level enforcement
- **Audit & Compliance**: Append-only audit ledger with hash chain tamper-evidence
- **Data Residency**: Geographic data controls for US, EU, and custom regions
- **Key Rotation**: Automated secret rotation with dry-run capabilities
- **Security Hardening**: Enterprise-grade security controls and monitoring

### VPC Deployment
- **Docker Compose**: Complete multi-service deployment with health checks
- **Terraform Infrastructure**: VPC, subnets, security groups, load balancers
- **Environment Templates**: Comprehensive configuration with security best practices
- **Monitoring Stack**: Prometheus, Grafana, and log aggregation
- **SSL/TLS**: Automated certificate management and HTTPS enforcement

### SSO Integration
- **OIDC Support**: OpenID Connect with PKCE and automatic user provisioning
- **SAML Support**: SAML 2.0 with signature validation and attribute mapping
- **Organization Enforcement**: Require SSO for all users in organization
- **Multi-Provider**: Support multiple identity providers per organization
- **Session Management**: Secure session handling with logout support

### Audit & Compliance
- **Append-Only Ledger**: Tamper-evident audit trail with cryptographic hash chain
- **Automated Export**: Nightly export to S3-compatible object storage
- **SIEM Integration**: Real-time webhook integration with retry/backoff
- **Retention Policies**: Configurable retention periods (30 days to 7 years)
- **Compliance Frameworks**: SOC 2, HIPAA, PCI DSS support

### Security Features
- **Data Residency**: Enforce geographic data storage requirements
- **Secret Scanning**: CI/CD integration to prevent secret leakage
- **Access Reviews**: Quarterly user access reviews with approval workflows
- **Key Rotation**: Automated rotation of API keys and secrets
- **Environment Hardening**: Secure defaults and policy enforcement

### Usage
```bash
# Quick deployment with Docker Compose
cd deploy/docker
cp .env.example .env
# Edit .env with your configuration
docker compose up -d

# Infrastructure deployment with Terraform
cd deploy/terraform
terraform init
terraform plan
terraform apply

# Configure SSO
curl -X POST /api/settings/identity-providers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corporate SSO",
    "type": "oidc",
    "issuer": "https://your-idp.com/.well-known/openid_configuration",
    "client_id": "your-client-id",
    "client_secret": "your-client-secret"
  }'

# Rotate keys
tsx scripts/rotate-keys.ts --dry-run  # Test first
tsx scripts/rotate-keys.ts            # Live rotation
```

### Enterprise Configuration
```yaml
# Organization settings
organization:
  sso_required: true
  data_residency: "us"
  compliance_framework: "soc2"
  audit_retention_days: 365

# Identity provider
identity_provider:
  type: "oidc"
  issuer: "https://your-idp.com"
  client_id: "buildrunner-client"
  auto_provision: true
  default_role: "Viewer"

# Security policies
security:
  enforce_https: true
  session_timeout: 3600
  max_login_attempts: 5
  require_mfa: true
```

### Compliance Features
```sql
-- Audit trail verification
SELECT
  actor, action, created_at,
  hash = compute_audit_hash(id, actor, action, payload, prev_hash, created_at) as valid
FROM audit_ledger
ORDER BY created_at DESC;

-- Access review status
SELECT
  review_period, status, due_date,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE approved = true) as approved_items
FROM access_reviews ar
JOIN access_review_items ari ON ar.id = ari.review_id
GROUP BY review_period, status, due_date;
```

### Deployment Architecture
```
Internet Gateway
       |
   Load Balancer (ALB)
       |
   ┌─────────────────┐
   │  Public Subnet  │
   └─────────────────┘
           |
   ┌─────────────────┐
   │ Private Subnet  │  ← Web/API Servers
   └─────────────────┘
           |
   ┌─────────────────┐
   │Database Subnet  │  ← PostgreSQL/Redis
   └─────────────────┘
```

### Security Controls
- **Network Segmentation**: Multi-tier VPC with security groups
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Access Control**: RBAC with SSO integration
- **Monitoring**: Real-time security event monitoring
- **Backup**: Automated encrypted backups with cross-region replication

## Phase 13 — Integrations (Jira / Linear / Preview Environments) ✅

Deep external system integrations for project tracking and deployment automation.

### Features
- **Issue Tracker Integration**: Bidirectional sync with Jira and Linear
- **Preview Environments**: Auto-deploy with Vercel, Render, Netlify
- **Webhook Support**: Real-time updates with HMAC validation
- **Governance Integration**: Policy enforcement for external systems
- **Analytics Integration**: Cost and usage tracking per integration

### Issue Tracker Integrations
- **Jira Integration**: OAuth/API key authentication with project-specific configuration
- **Linear Integration**: GraphQL API integration with team-based access
- **Bidirectional Sync**: Issues sync to microsteps and status updates flow both ways
- **Smart Matching**: Automatic linking based on title similarity and keywords
- **Manual Linking**: UI for explicit issue-to-microstep associations

### Preview Environments
- **Auto-Deploy**: Triggered on PR creation or branch push
- **Multi-Provider**: Support for Vercel, Render, Netlify, and custom providers
- **Status Tracking**: Real-time build and deployment status updates
- **Governance Enforcement**: Required previews for QA and Beta phases
- **Cleanup**: Automatic expiration and resource management

### Integration Framework
- **Provider Registry**: Extensible system for adding new integrations
- **Encrypted Storage**: Secure credential management with vault encryption
- **Rate Limiting**: Built-in rate limiting and retry logic
- **Audit Logging**: All integration activities logged for compliance
- **Health Monitoring**: Connection testing and status monitoring

### Usage
```bash
# Configure Jira integration
curl -X POST /api/integrations \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "jira",
    "name": "Company Jira",
    "config": {
      "baseUrl": "https://company.atlassian.net",
      "email": "user@company.com",
      "projectKey": "PROJ"
    },
    "credentials": {
      "apiToken": "your-api-token"
    }
  }'

# Sync issues manually
curl -X POST /api/integrations/sync/issues?integration_id=123

# Configure preview environment
curl -X POST /api/integrations \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "vercel",
    "name": "Production Vercel",
    "config": {
      "projectName": "buildrunner-app"
    },
    "credentials": {
      "token": "your-vercel-token"
    }
  }'
```

### Integration Configuration
```yaml
# governance/policy.yml
integrations:
  integrations_allowed:
    - jira
    - linear
    - vercel
    - render
    - netlify
  external_sync_required: true
  require_preview_for_phase:
    - QA
    - Beta
  max_integrations_per_project: 10

  preview_environments:
    required_for_phases:
      - QA
      - Beta
    providers_allowed:
      - vercel
      - render
      - netlify
    auto_deploy_branches:
      - main
      - develop
      - "feature/*"
    retention_days: 7
```

### Webhook Integration
```javascript
// Jira webhook payload
{
  "webhookEvent": "jira:issue_updated",
  "issue": {
    "id": "10001",
    "key": "PROJ-123",
    "fields": {
      "summary": "Implement user authentication",
      "status": { "name": "In Progress" },
      "assignee": { "displayName": "John Doe" }
    }
  }
}

// Linear webhook payload
{
  "action": "update",
  "data": {
    "id": "linear-issue-id",
    "identifier": "BR-45",
    "title": "Setup webhook endpoints",
    "state": { "name": "In Progress" }
  }
}
```

### Database Schema
```sql
-- External integrations configuration
CREATE TABLE external_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  provider TEXT CHECK (provider IN ('jira','linear','vercel','render','netlify')),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT,
  active BOOLEAN DEFAULT true,
  sync_status TEXT CHECK (sync_status IN ('pending','success','failed','disabled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Issue links between external systems and microsteps
CREATE TABLE issue_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES external_integrations(id),
  provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_key TEXT,
  microstep_id TEXT NOT NULL,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  url TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ DEFAULT now()
);

-- Preview environments for branches and PRs
CREATE TABLE preview_envs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  integration_id UUID REFERENCES external_integrations(id),
  branch TEXT NOT NULL,
  provider TEXT NOT NULL,
  url TEXT,
  status TEXT CHECK (status IN ('pending','building','ready','error','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Integration Management UI
- **Settings → Integrations**: Central hub for all external integrations
- **Provider Cards**: Visual status and configuration for each integration type
- **Test Connections**: One-click validation of integration health
- **Issue Panel**: Inline view of linked external issues within Plan Editor
- **Preview Status**: Real-time deployment status in Workbench

### Governance & Compliance
- **Policy Enforcement**: Required previews block QA/Beta phase progression
- **Audit Trail**: All integration activities logged to runner_events
- **Rate Limiting**: Automatic throttling to respect external API limits
- **Secure Storage**: Encrypted credential storage with vault encryption
- **Access Control**: Role-based permissions for integration management

### Analytics Integration
- **Cost Tracking**: API call costs and deployment minutes per integration
- **Usage Metrics**: Sync frequency, success rates, and error patterns
- **Performance Monitoring**: Response times and availability tracking
- **Trend Analysis**: Historical usage patterns and optimization opportunities

## Phase 14 — Monetization & Billing ✅

Complete billing system with Stripe integration, usage-based metering, and governance limits.

### Features
- **Pricing Plans**: Four tiers (Free/Pro/Team/Enterprise) with clear feature differentiation
- **Usage-Based Billing**: Token consumption, API calls, storage, and integration metering
- **Stripe Integration**: Secure payment processing with customer portal
- **Feature Gating**: Plan-based access control with upgrade prompts
- **Real-Time Monitoring**: Usage dashboards with alerts and limits

### Pricing Tiers
- **Free ($0/month)**: 1 seat, 100K tokens, basic features
- **Pro ($29/month)**: 5 seats, 1M tokens, collaboration, advanced analytics
- **Team ($99/month)**: 25 seats, 5M tokens, SSO, compliance reports
- **Enterprise ($299/month)**: 100 seats, 25M tokens, dedicated support, custom deployment

### Billing System
- **Subscription Management**: Automated billing cycles with Stripe webhooks
- **Usage Tracking**: Real-time metering with governance integration
- **Invoice Management**: Automated invoice generation and payment processing
- **Customer Portal**: Self-service billing management through Stripe
- **Audit Compliance**: All billing events logged for financial compliance

### Usage Metering
- **Token Tracking**: Per-model consumption with different rates
- **API Monitoring**: Request counting with rate limiting
- **Storage Metering**: Project file and artifact storage tracking
- **Integration Costs**: External service usage and deployment minutes
- **Overage Billing**: Automatic charges for usage beyond plan limits

### Usage
```bash
# Create checkout session
curl -X POST /api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "org_123",
    "plan": "pro",
    "billing_cycle": "monthly"
  }'

# Get usage summary
curl /api/billing/usage?org_id=org_123 \
  -H "Authorization: Bearer your-token"

# Record usage event
curl -X POST /api/billing/usage \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_123",
    "event_type": "tokens",
    "quantity": 1000,
    "model_name": "gpt-4"
  }'
```

### Billing Configuration
```json
{
  "plans": {
    "pro": {
      "price": { "monthly": 29, "yearly": 290 },
      "limits": {
        "seats": 5,
        "tokens_per_month": 1000000,
        "api_calls_per_month": 10000,
        "storage_gb": 10
      },
      "features": {
        "collaboration": true,
        "advanced_analytics": true,
        "api_access": true,
        "priority_support": true
      }
    }
  }
}
```

### Database Schema
```sql
-- Billing accounts for organizations
CREATE TABLE billing_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  plan TEXT CHECK (plan IN ('free','pro','team','enterprise')) DEFAULT 'free',
  status TEXT CHECK (status IN ('active','inactive','suspended','cancelled')) DEFAULT 'active',
  seats_included INTEGER DEFAULT 1,
  seats_used INTEGER DEFAULT 1,
  renewal_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Usage events for metering
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  org_id UUID NOT NULL,
  billing_account_id UUID REFERENCES billing_accounts(id),
  event_type TEXT CHECK (event_type IN ('tokens','api_calls','storage','compute','integrations')) NOT NULL,
  quantity BIGINT NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL,
  usd_cost NUMERIC(10,4) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions linked to Stripe
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_account_id UUID NOT NULL REFERENCES billing_accounts(id),
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL,
  seats INTEGER DEFAULT 1,
  usage_limit_tokens BIGINT DEFAULT 100000,
  usage_limit_api_calls INTEGER DEFAULT 1000,
  active BOOLEAN DEFAULT true,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ
);
```

### Feature Gating
- **Plan-Based Access**: Features automatically enabled/disabled based on subscription
- **Usage Limits**: API calls blocked when quotas exceeded
- **Upgrade Prompts**: Contextual upgrade suggestions for gated features
- **Graceful Degradation**: Soft limits with warnings before hard enforcement

### Governance Integration
- **Policy Enforcement**: Billing limits integrated with governance rules
- **Budget Alerts**: Automated notifications for spending thresholds
- **Audit Logging**: All billing events tracked for compliance
- **Cost Allocation**: Usage attribution by project and team

### Stripe Integration
- **Secure Payments**: PCI-compliant payment processing
- **Webhook Handling**: Real-time subscription and payment updates
- **Customer Portal**: Self-service billing management
- **Invoice Management**: Automated invoice generation and delivery
- **Tax Handling**: Automatic tax calculation and compliance

### Usage Monitoring
- **Real-Time Dashboard**: Live usage tracking with visual indicators
- **Alert System**: Proactive notifications for approaching limits
- **Historical Analysis**: Usage trends and optimization recommendations
- **Cost Breakdown**: Detailed cost attribution by service and project

## Phase 15 — Admin Console & Token/Cost Tracking ✅

Comprehensive admin operations platform for monitoring, controlling, and managing BuildRunner.

### Features
- **Admin Dashboard**: Real-time visibility into projects, costs, usage, and quality metrics
- **Cost Reconciliation**: Automated cost tracking with budget enforcement and alerts
- **Governance Operations**: Impersonation, rate limiting, and maintenance windows
- **API Key Management**: Hashed storage, scoped permissions, and automated rotation
- **Support Tools**: Credits adjustments, incident center, and audit logging

### Admin Dashboard
- **Overview Cards**: Projects, monthly spend, tokens, quality score, active issues, open tickets
- **Project Monitoring**: Real-time budget utilization, token usage, and quality tracking
- **Alert Management**: Critical issues requiring immediate attention
- **Quick Actions**: Common admin operations accessible from dashboard

### Cost & Budget Management
- **Budget Enforcement**: Soft limits with warnings and hard caps with API blocking
- **Cost Reconciliation**: Automated aggregation of usage events and billing data
- **Forecasting**: Predictive spending based on current usage patterns
- **Credits System**: Billing adjustments and compensation tracking

### Usage
```bash
# Access Admin Console
https://app.buildrunner.com/admin

# Set project budget
curl -X POST /api/admin/budgets \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "project_id": "proj_123",
    "monthly_usd": 1000.00,
    "hard_cap": true,
    "alert_threshold": 0.8
  }'

# Start impersonation session
curl -X POST /api/admin/impersonation \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "user_id": "user_123",
    "reason": "Support ticket debugging",
    "duration_minutes": 60
  }'

# Create API key with scopes
curl -X POST /api/admin/api-keys \
  -H "Authorization: Bearer admin-token" \
  -d '{
    "project_id": "proj_123",
    "name": "CI/CD Pipeline",
    "scopes": ["planner.read", "builder.run", "qa.run"]
  }'
```

### Database Schema
```sql
-- Cost budgets and spending limits
CREATE TABLE cost_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  monthly_usd NUMERIC(10,2) NOT NULL,
  hard_cap BOOLEAN DEFAULT false,
  alert_threshold NUMERIC(3,2) DEFAULT 0.8,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- API keys with hashed storage
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Impersonation sessions for admin support
CREATE TABLE impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  user_id UUID NOT NULL,
  project_id UUID,
  reason TEXT NOT NULL,
  start_at TIMESTAMPTZ DEFAULT now(),
  end_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Support tickets for incident management
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low','medium','high','critical')) DEFAULT 'medium',
  category TEXT CHECK (category IN ('budget','reliability','governance','integrations','billing','performance')),
  assigned_to UUID,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Role-Based Access Control
- **GlobalAdmin**: Full access to all admin functions across organizations
- **TenantAdmin**: Admin functions scoped to their organization
- **SupportAgent**: Limited access to support tools and incident management

### Governance Operations
- **Impersonation**: Secure user impersonation with full audit trails and automatic session termination
- **Rate Limiting**: Per-project API throttling with immediate enforcement
- **Maintenance Windows**: Scheduled operation blocking with override capabilities
- **Audit Logging**: Complete audit trails for all admin actions

### API Key Management
- **Secure Storage**: Keys hashed with bcrypt, only prefix stored for identification
- **Scoped Permissions**: Fine-grained access control with scope enforcement
- **Automated Rotation**: One-click key rotation with grace periods
- **Usage Tracking**: Last used timestamps and expiration management

### Cost Reconciliation
- **Automated Processing**: Background worker aggregates usage events and billing data
- **Real-Time Updates**: Cost snapshots updated with current spend and forecasts
- **Budget Alerts**: Automatic notifications at 80%, 90%, and 100% thresholds
- **Credit Integration**: Billing adjustments and compensation tracking

### Support & Incident Management
- **Incident Center**: Centralized ticket management with assignment and status tracking
- **Automated Tickets**: System-generated tickets for budget violations and quality issues
- **Credits Adjustment**: Billing corrections with full audit trails
- **Log Export**: Comprehensive audit log export with PII redaction

## Phase 16 — Figma Parity & Design System Sync ✅

Pixel-perfect design system integration with automated Figma synchronization and visual regression testing.

### Features
- **Design Token Sync**: Automated extraction and normalization of design tokens from Figma
- **Component Registry**: Mapping and drift detection between Figma components and React components
- **Visual Regression**: Automated screenshot testing with similarity thresholds
- **CLI Workflow**: Complete design sync workflow with idempotent operations
- **CI/CD Integration**: Automated design parity checks in pull requests

### Design Token Synchronization
- **Automated Extraction**: Fetch colors, typography, spacing, radius, and shadows from Figma
- **Token Normalization**: Convert Figma tokens to CSS-compatible values
- **Tailwind Integration**: Generate Tailwind theme configuration from design tokens
- **CSS Variables**: Auto-generated CSS custom properties for design tokens

### Usage
```bash
# Fetch design tokens from Figma
npm run design:fetch

# Generate Tailwind theme from tokens
npm run design:generate

# Complete sync workflow
npm run design:sync

# Sync with options
npm run design:sync --force --verbose
```

### Environment Setup
```bash
# Figma Integration (Server-Only)
FIGMA_PROJECT_ID=your-figma-project-id
FIGMA_FILE_ID=your-figma-file-id
FIGMA_TOKEN=your-figma-access-token
```

### Design Token Structure
```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-31T09:00:00.000Z",
  "checksum": "abc123def456",
  "tokens": {
    "colors": {
      "primary": {
        "name": "primary",
        "value": "#3b82f6",
        "type": "color",
        "category": "colors",
        "description": "Primary brand color"
      }
    },
    "spacing": {
      "md": {
        "name": "md",
        "value": "1rem",
        "type": "spacing",
        "category": "spacing",
        "description": "Medium spacing"
      }
    }
  }
}
```

### Component Parity System
- **Component Mapping**: JSON mapping between Figma components and React components
- **Drift Detection**: Automated detection of mismatches between design and code
- **Patch Generation**: Suggested code changes for design parity issues
- **Variant Validation**: Ensure React component variants match Figma designs

### Visual Regression Testing
- **Playwright Integration**: Automated screenshot capture of UI components
- **Similarity Thresholds**: Configurable pixel difference and similarity thresholds
- **Baseline Management**: Version-controlled screenshot baselines
- **CI/CD Integration**: Automated visual regression checks in pull requests

### Governance Integration
```yaml
# governance/policy.yml
design_system:
  design_parity_required: true
  design_token_threshold: 95

  visual_regression:
    similarity_threshold: 0.95
    pixel_diff_threshold: 100

  component_parity:
    enforce_figma_mapping: true
    allowed_drift_percentage: 5

  token_sync:
    auto_sync_enabled: false
    require_manual_approval: true
```

### CLI Commands
- **`npm run design:fetch`**: Fetch design tokens from Figma
- **`npm run design:generate`**: Generate Tailwind theme from tokens
- **`npm run design:sync`**: Complete sync workflow (fetch → generate → build)
- **`npm run verify:env`**: Verify environment variables with masked output

### CI/CD Workflow
```yaml
# .github/workflows/design-parity.yml
name: Design Parity Check

on:
  pull_request:
    paths:
      - 'design/**'
      - 'apps/web/components/ui/**'
      - 'apps/web/styles/**'

jobs:
  design-token-parity:
    - Fetch design tokens from Figma
    - Generate theme files
    - Check component parity
    - Run visual regression tests
    - Comment PR with results
```

### Design System Documentation
- **Live Documentation**: Auto-generated design system page at `/design-system`
- **Token Visualization**: Interactive display of colors, spacing, and other tokens
- **Component Gallery**: Visual component library with variants
- **Usage Examples**: Code examples and CSS variable references

### Security & Privacy
- **Server-Side Only**: Figma tokens never exposed to client-side code
- **Masked Logging**: Environment variables masked in logs and CI output
- **Token Validation**: Figma token format validation and error handling
- **Access Control**: Figma file permissions respected

## Phase 17 — Documentation & Developer Experience (CLI + SDK) ✅

Comprehensive developer experience layer with typed SDK, interactive documentation, and quality gates.

### Features
- **OpenAPI 3.1 Specification**: Complete API documentation with interactive Try-It functionality
- **Typed SDK**: Full TypeScript/JavaScript SDK with comprehensive API coverage
- **Enhanced CLI**: Shell completion and UI parity for all operations
- **Interactive Documentation**: Next.js documentation site with search and examples
- **Code Generation**: Automated snippet generation for curl, JavaScript, and TypeScript
- **Quality Gates**: Link checking, spell checking, and example verification in CI

### OpenAPI Specification
- **Complete Coverage**: All BuildRunner APIs documented with OpenAPI 3.1
- **Interactive Examples**: Try-It functionality with mock responses
- **Type Definitions**: Comprehensive schemas for all request/response types
- **Authentication**: Bearer token authentication with security schemes

### TypeScript/JavaScript SDK

```bash
npm install @buildrunner/sdk
```

```typescript
import { BuildRunnerSDK } from '@buildrunner/sdk';

// Initialize the SDK
const client = new BuildRunnerSDK({
  apiKey: 'your-api-key',
  projectId: 'your-project-id',
  baseUrl: 'https://api.buildrunner.com',
});

// List projects
const projects = await client.projects.list();
console.log('Projects:', projects.data?.projects);

// Get project plan
const plan = await client.planning.getPlan();
console.log('Plan phases:', plan.data?.phases.length);

// Sync project
const syncResult = await client.execution.sync({ dry_run: true });
console.log('Sync result:', syncResult.data?.summary);
```

### SDK Features
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Modern**: ES modules and CommonJS support with tree-shaking
- **Lightweight**: Minimal dependencies with cross-fetch polyfill
- **Error Handling**: Consistent error responses with detailed information
- **Authentication**: Secure API key handling with validation
- **Documentation**: Complete JSDoc comments and usage examples

### Enhanced CLI

```bash
# Install shell completion
br completion bash > /etc/bash_completion.d/br
br completion zsh > ~/.zsh/completions/_br

# CLI commands with UI parity
br init                    # Initialize new project
br plan add               # Add plan phases
br sync                   # Synchronize project
br qa run                 # Run quality assurance
br analytics              # View analytics
br governance validate   # Validate governance
br design:sync           # Sync design tokens
br models:settings       # Configure AI models
br integrations          # Manage integrations
br billing               # View billing
br admin                 # Admin operations (role-gated)

# Examples and scaffolding
br examples              # Scaffold sample projects
br examples react        # Create React project example
br examples nextjs       # Create Next.js project example
```

### Interactive Documentation

**Documentation Site**: `/apps/docs` (Next.js)
- **Quickstart Guide**: Get started in minutes
- **API Reference**: Interactive OpenAPI documentation
- **CLI Guide**: Complete command reference with examples
- **SDK Documentation**: TypeScript/JavaScript usage guide
- **Governance**: Security and compliance documentation
- **Guides & Recipes**: Task-based tutorials

**Key Sections**:
- Quickstart: Project creation and deployment
- API Reference: Interactive Try-It with code examples
- CLI Guide: Command reference and automation
- SDK: Type-safe API client usage
- Governance: Security and compliance features
- Analytics: Monitoring and reporting
- Billing: Subscription and usage management

### Code Snippet Generation

```bash
# Generate snippets from OpenAPI spec
npm run docs:snippets

# Automatically generates:
# - curl commands
# - JavaScript/TypeScript examples
# - Request/response examples
# - Authentication examples
```

**Generated Examples**:
```bash
# curl example
curl -X GET "https://api.buildrunner.com/projects" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"

# JavaScript example
const response = await fetch('https://api.buildrunner.com/projects', {
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  }
});
const projects = await response.json();

# TypeScript SDK example
const projects = await client.projects.list();
```

### Quality Gates & CI Integration

```yaml
# .github/workflows/docs-verify.yml
name: Documentation Verification

jobs:
  link-checker:
    - Check internal and external links
    - Validate documentation site links
    - Report broken links with details

  spell-check:
    - Check spelling in documentation
    - Validate code comments
    - Custom dictionary for technical terms

  example-verification:
    - Compile TypeScript examples
    - Validate OpenAPI specification
    - Test SDK examples with mock data

  typedoc-coverage:
    - Generate TypeDoc documentation
    - Check documentation coverage (80% threshold)
    - Upload generated documentation
```

### Documentation Structure

```
docs/
├── CHANGELOG.md              # Release history and breaking changes
├── guides/                   # Task-based tutorials
│   ├── sync-plan-open-pr.md
│   ├── detect-drift-reconcile.md
│   ├── enforce-governance-ci.md
│   └── design-system-sync.md
└── api/                      # API documentation

apps/docs/                    # Documentation site
├── app/
│   ├── page.tsx             # Homepage
│   ├── quickstart/          # Getting started
│   ├── api-reference/       # Interactive API docs
│   ├── cli/                 # CLI documentation
│   ├── sdk/                 # SDK documentation
│   ├── governance/          # Security & compliance
│   └── guides/              # Task-based guides
└── components/              # Documentation components

sdk/
├── src/index.ts             # Main SDK export
├── examples/                # Usage examples
│   ├── basic-usage.ts
│   ├── project-management.ts
│   ├── planning.ts
│   └── sync.ts
├── docs/                    # Generated TypeDoc
└── README.md                # SDK documentation
```

### API Coverage

**Complete API Coverage**:
- **Projects**: CRUD operations, listing, filtering
- **Planning**: Plan management, phase operations
- **Execution**: Sync operations, dry runs
- **QA**: Quality assurance and testing
- **Analytics**: Metrics and reporting
- **Governance**: Policy validation and compliance
- **Billing**: Subscription and usage management
- **Admin**: Administrative operations (role-gated)
- **Integrations**: External service connections
- **Design**: Design system synchronization

### Developer Experience Features

**SDK Benefits**:
- Type-safe API interactions
- Comprehensive error handling
- Automatic request/response validation
- Built-in retry logic and timeout handling
- Environment-based configuration
- Mock data support for testing

**CLI Enhancements**:
- Shell completion for all commands
- Interactive TUI for plan browsing
- Example project scaffolding
- Consistent output formatting
- Progress indicators and status updates
- Configuration management

**Documentation Quality**:
- Interactive API exploration
- Copy-paste code examples
- Real-time validation
- Search functionality
- Dark/light theme support
- Mobile-responsive design

### Usage Analytics

Track developer experience metrics:
- API endpoint usage patterns
- SDK method popularity
- Documentation page views
- Example usage frequency
- Error rates and common issues
- Developer onboarding funnel

### Security & Best Practices

**API Security**:
- Bearer token authentication
- Rate limiting by subscription tier
- Request validation and sanitization
- Audit logging for all operations
- Secure credential storage

**SDK Security**:
- API keys never logged or exposed
- Secure token validation
- HTTPS-only communication
- Input sanitization and validation
- Error message sanitization

## Architecture

- **Phase 1**: Repository scaffolding and CLI foundation
- **Phase 2**: Schema expansion and Supabase integration
- **Phase 3**: Automated backend provisioning with UI
- **Phase 4**: UI MVP and team collaboration
- **Phase 5**: Flow Inspector + Timeline with visual analytics
- **Phase 6**: Complete Governance & Safety Layer with policy DSL
- **Phase 7**: QA & Acceptance Automation with CI/CD integration
- **Phase 8**: Templates & Marketplace with composable packs
- **Phase 9**: Analytics & Cost Monitoring with anomaly detection ✅
- **Phase 10**: Collaboration & Comments Integration with realtime presence ✅
- **Phase 11**: Explainability & Multi-Model with AI narratives and model router ✅
- **Phase 12**: Enterprise & Compliance with VPC deployment, SSO, and audit ✅
- **Phase 13**: Integrations with Jira, Linear, and Preview Environments ✅
- **Phase 14**: Monetization & Billing with Stripe, usage metering, and governance ✅
- **Phase 15**: Admin Console & Token/Cost Tracking with governance operations ✅
- **Phase 16**: Figma Parity & Design System Sync with visual regression testing ✅
- **Phase 17**: Documentation & Developer Experience (CLI + SDK) with interactive API docs ✅
