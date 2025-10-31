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
