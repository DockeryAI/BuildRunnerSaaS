# BuildRunner Integrations Guide

This guide covers setting up and managing external integrations with BuildRunner, including issue trackers, deployment platforms, and communication tools.

## Table of Contents

- [Overview](#overview)
- [Issue Tracker Integrations](#issue-tracker-integrations)
- [Deployment Platform Integrations](#deployment-platform-integrations)
- [Communication Integrations](#communication-integrations)
- [Webhook Configuration](#webhook-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

BuildRunner supports integrations with popular external tools to streamline your development workflow:

- **Issue Trackers**: Jira, Linear, GitHub Issues
- **Deployment Platforms**: Vercel, Render, Netlify
- **Communication**: Slack
- **Repository**: GitHub

All integrations maintain governance parity with BuildRunner's audit and compliance requirements.

## Issue Tracker Integrations

### Jira Integration

#### Prerequisites
- Jira Cloud instance
- User account with project access
- API token (recommended) or app password

#### Setup Steps

1. **Generate API Token**
   - Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Copy the generated token

2. **Configure in BuildRunner**
   ```bash
   # Navigate to Settings → Integrations
   # Click "Configure" on Jira card
   ```

3. **Configuration Parameters**
   ```yaml
   base_url: "https://your-company.atlassian.net"
   email: "your-email@company.com"
   api_token: "your-api-token"
   project_key: "PROJ"  # Your Jira project key
   ```

4. **Test Connection**
   - Click "Test Connection" to verify setup
   - Should return "Connection successful"

#### Issue Sync Behavior

- **Bidirectional Sync**: Changes in Jira update BuildRunner microsteps and vice versa
- **Status Mapping**:
  - Jira "To Do" → BuildRunner "todo"
  - Jira "In Progress" → BuildRunner "doing"
  - Jira "Done" → BuildRunner "done"
  - Jira "Blocked" → BuildRunner "blocked"

- **Automatic Matching**: Issues are linked to microsteps based on title similarity
- **Manual Linking**: Use the Issue Panel to manually link issues

#### Webhook Setup

1. **In Jira Admin**
   - Go to System → WebHooks
   - Create webhook with URL: `https://your-buildrunner.com/api/webhooks/jira`
   - Select events: Issue Created, Updated, Deleted

2. **Webhook Secret**
   ```bash
   # Set in your environment
   export JIRA_WEBHOOK_SECRET="your-webhook-secret"
   ```

### Linear Integration

#### Prerequisites
- Linear workspace access
- Personal API key

#### Setup Steps

1. **Generate API Key**
   - Go to Linear Settings → API
   - Create new personal API key
   - Copy the key

2. **Configure in BuildRunner**
   ```yaml
   api_key: "lin_api_your-api-key"
   team_id: "optional-team-id"  # Leave empty for all teams
   ```

3. **Test Connection**
   - Verify API key has proper permissions
   - Should list accessible teams and projects

#### Issue Sync Behavior

- **Status Mapping**:
  - Linear "Backlog" → BuildRunner "todo"
  - Linear "Todo" → BuildRunner "todo"
  - Linear "In Progress" → BuildRunner "doing"
  - Linear "Done" → BuildRunner "done"
  - Linear "Canceled" → BuildRunner "blocked"

- **Priority Mapping**:
  - Linear 0 → "No priority"
  - Linear 1 → "Urgent"
  - Linear 2 → "High"
  - Linear 3 → "Normal"
  - Linear 4 → "Low"

#### Webhook Setup

1. **In Linear Settings**
   - Go to Settings → API → Webhooks
   - Create webhook with URL: `https://your-buildrunner.com/api/webhooks/linear`
   - Select events: Issue Created, Updated, Deleted

## Deployment Platform Integrations

### Vercel Integration

#### Prerequisites
- Vercel account
- Project deployed on Vercel
- API token with deployment permissions

#### Setup Steps

1. **Generate API Token**
   - Go to Vercel Dashboard → Settings → Tokens
   - Create new token with appropriate scope
   - Copy the token

2. **Configure in BuildRunner**
   ```yaml
   token: "your-vercel-token"
   team_id: "optional-team-id"
   project_name: "your-project-name"
   ```

3. **Test Connection**
   - Verifies token and project access
   - Lists recent deployments

#### Preview Environment Behavior

- **Auto-Deploy**: Triggered on branch push or PR creation
- **Branch Mapping**: Each branch gets its own preview URL
- **Status Updates**: Build status synced to BuildRunner
- **Cleanup**: Preview environments auto-expire after 7 days

#### Webhook Setup

```bash
# Vercel automatically configures webhooks for:
# - deployment.created
# - deployment.ready
# - deployment.error
```

### Render Integration

#### Prerequisites
- Render account
- Service configured for your project
- API key

#### Setup Steps

1. **Generate API Key**
   - Go to Render Dashboard → Account Settings → API Keys
   - Create new API key
   - Copy the key

2. **Configure in BuildRunner**
   ```yaml
   api_key: "rnd_your-api-key"
   service_id: "srv-your-service-id"
   ```

#### Preview Environment Behavior

- **Manual Deploy**: Triggered via "Deploy QA Preview" button
- **Branch Deploy**: Supports branch-specific deployments
- **Build Logs**: Accessible through BuildRunner interface

### Netlify Integration

#### Prerequisites
- Netlify account
- Site configured for your project
- Access token

#### Setup Steps

1. **Generate Access Token**
   - Go to Netlify User Settings → Applications
   - Create new access token
   - Copy the token

2. **Configure in BuildRunner**
   ```yaml
   token: "your-netlify-token"
   site_id: "your-site-id"
   ```

## Communication Integrations

### Slack Integration

#### Prerequisites
- Slack workspace admin access
- Ability to install apps

#### Setup Steps

1. **Create Slack App**
   - Go to [Slack API](https://api.slack.com/apps)
   - Create new app for your workspace
   - Add bot token scopes: `chat:write`, `channels:read`

2. **Install App**
   - Install app to workspace
   - Copy bot user OAuth token

3. **Configure in BuildRunner**
   ```yaml
   bot_token: "xoxb-your-bot-token"
   channel: "#buildrunner"  # Default notification channel
   ```

#### Notification Events

- Preview environment ready
- Issue status changes
- Build failures
- Deployment completions

## Webhook Configuration

### Security

All webhooks use HMAC-SHA256 signature verification:

```bash
# Set webhook secrets in environment
export JIRA_WEBHOOK_SECRET="your-jira-secret"
export LINEAR_WEBHOOK_SECRET="your-linear-secret"
export VERCEL_WEBHOOK_SECRET="your-vercel-secret"
```

### Webhook URLs

```bash
# Issue Trackers
POST https://your-buildrunner.com/api/webhooks/jira
POST https://your-buildrunner.com/api/webhooks/linear

# Deployment Platforms
POST https://your-buildrunner.com/api/webhooks/vercel
POST https://your-buildrunner.com/api/webhooks/render
POST https://your-buildrunner.com/api/webhooks/netlify

# Communication
POST https://your-buildrunner.com/api/webhooks/slack
```

### Retry Logic

- Failed webhooks are retried up to 3 times
- Exponential backoff: 1s, 5s, 25s
- Failed webhooks logged for debugging

## Governance & Compliance

### Audit Logging

All integration activities are logged:

```sql
-- View integration events
SELECT actor, action, payload, created_at 
FROM runner_events 
WHERE action LIKE '%integration%' 
ORDER BY created_at DESC;
```

### Policy Enforcement

Configure allowed integrations in `governance/policy.yml`:

```yaml
integrations:
  integrations_allowed:
    - jira
    - linear
    - vercel
  external_sync_required: true
  require_preview_for_phase:
    - QA
    - Beta
```

### Data Security

- API tokens encrypted at rest
- Webhook signatures validated
- All external calls logged
- Rate limiting enforced

## Troubleshooting

### Common Issues

1. **Connection Test Fails**
   ```bash
   # Check API credentials
   curl -H "Authorization: Bearer your-token" \
        https://api.linear.app/graphql
   
   # Verify base URL format
   # Jira: https://company.atlassian.net (no trailing slash)
   ```

2. **Webhook Not Receiving Events**
   ```bash
   # Check webhook URL accessibility
   curl -X POST https://your-buildrunner.com/api/webhooks/jira \
        -H "Content-Type: application/json" \
        -d '{"test": true}'
   
   # Verify webhook secret matches
   ```

3. **Issues Not Syncing**
   ```bash
   # Manual sync trigger
   curl -X POST https://your-buildrunner.com/api/integrations/sync/issues \
        -H "Authorization: Bearer your-token" \
        -d '{"integration_id": "your-integration-id"}'
   ```

4. **Preview Environment Not Deploying**
   ```bash
   # Check deployment logs
   curl https://api.vercel.com/v6/deployments \
        -H "Authorization: Bearer your-token"
   
   # Verify branch name matches policy
   ```

### Debug Mode

Enable debug logging:

```bash
export DEBUG_INTEGRATIONS=true
export LOG_LEVEL=debug
```

### Support

- **Integration Issues**: Check Settings → Integrations for status
- **Webhook Problems**: View webhook logs in Analytics
- **Sync Failures**: Check integration sync history
- **API Limits**: Monitor rate limit headers

### Rate Limits

| Provider | Requests | Window | Notes |
|----------|----------|---------|-------|
| Jira | 1,000 | 1 hour | Per user |
| Linear | 1,000 | 1 hour | Per API key |
| Vercel | 100 | 1 minute | Per token |
| Render | 100 | 1 minute | Per API key |
| Netlify | 500 | 1 hour | Per token |

### Best Practices

1. **Use dedicated service accounts** for API access
2. **Rotate API tokens** regularly (monthly recommended)
3. **Monitor webhook delivery** for failures
4. **Set up alerts** for integration health
5. **Test integrations** in staging before production
6. **Document custom configurations** for team members

---

For additional help, see our [Knowledge Base](https://docs.buildrunner.com) or contact support.
