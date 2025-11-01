# Supabase Management API Setup

BuildRunner can automatically create and manage Supabase projects for each user project. This guide shows you how to set up the Supabase Management API.

## Why Do I Need This?

- **Automatic Project Creation**: BuildRunner creates a new Supabase project for each of your projects
- **Database Setup**: Automatically creates tables, RLS policies, and functions
- **No Manual Setup**: Users never need to leave BuildRunner to set up their database
- **Per-Project Isolation**: Each project gets its own Supabase instance with isolated credentials

## Setup Instructions

### Step 1: Get Your Supabase Access Token

1. Go to https://app.supabase.com/account/tokens
2. Log in to your Supabase account
3. Click **"Generate New Token"**
4. Give it a name like "BuildRunner Management API"
5. Select the scopes:
   - ✅ All (or at minimum: `all` access)
6. Copy the generated token (you'll only see it once!)

### Step 2: Add to Environment Variables

Add the token to your `.env.local` file:

```bash
# Supabase Management API
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important Notes:**
- This token is for **BuildRunner's** use to create projects
- It's different from your project-specific Supabase keys
- Keep it secret and never commit it to git
- The token is only used server-side (never exposed to browser)

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

## How It Works

### BuildRunner Infrastructure vs. User Projects

```
┌─────────────────────────────────────┐
│   BuildRunner (Your App)            │
│   - Owns SUPABASE_ACCESS_TOKEN      │
│   - Creates projects via API        │
└─────────────────────────────────────┘
                 │
                 │ creates
                 ▼
┌─────────────────────────────────────┐
│   User Project 1                    │
│   - Has its own Supabase project    │
│   - Own URL, anon key, service key  │
│   - Isolated database               │
└─────────────────────────────────────┘
                 │
                 │ creates
                 ▼
┌─────────────────────────────────────┐
│   User Project 2                    │
│   - Has its own Supabase project    │
│   - Different credentials           │
│   - Separate database               │
└─────────────────────────────────────┘
```

### User Experience

When a user creates a new project in BuildRunner:

1. **Enter Product Idea** → User types their project name
2. **Setup Wizard Opens** → Automatic Supabase configuration
3. **Choose Organization** → Select which Supabase org to use
4. **Select Region** → Pick closest region (US West, EU, etc.)
5. **Create Project** → BuildRunner calls Management API
6. **Project Created** → New Supabase project is provisioned (2-3 minutes)
7. **Credentials Saved** → Project config stored with URL and keys
8. **Continue to PRD** → User can now build their app

### What Gets Created

For each user project, BuildRunner creates:

- ✅ New Supabase project (Free tier by default)
- ✅ PostgreSQL database
- ✅ Authentication system
- ✅ Row Level Security enabled
- ✅ API keys (anon + service role)
- ✅ Automatic connection string
- ✅ Real-time subscriptions
- ✅ Storage buckets

## API Endpoints

BuildRunner provides these API endpoints for Supabase management:

### Create Project
```typescript
POST /api/supabase
{
  action: 'create_project',
  projectName: 'my-awesome-app',
  organizationId: 'org-id',
  region: 'us-west-1',
  dbPassword: 'secure-password',
  plan: 'free'
}
```

### Execute SQL
```typescript
POST /api/supabase
{
  action: 'execute_sql',
  projectRef: 'abc123',
  sql: 'CREATE TABLE users (...);'
}
```

### Create Table
```typescript
POST /api/supabase
{
  action: 'create_table',
  projectRef: 'abc123',
  table: {
    name: 'users',
    schema: 'CREATE TABLE users (...)',
    enableRLS: true
  }
}
```

## Troubleshooting

### Error: "SUPABASE_ACCESS_TOKEN not found"

**Solution**: Make sure you added the token to `.env.local` and restarted your dev server.

### Error: "Failed to create Supabase project"

**Possible causes:**
1. Invalid access token (regenerate from Supabase dashboard)
2. Insufficient permissions (make sure token has `all` scope)
3. Organization ID is incorrect
4. Rate limit hit (wait a minute and try again)

### Error: "Failed to load organizations"

**Solution**:
1. Check that your access token is valid
2. Make sure you have at least one organization in Supabase
3. Verify the token has the correct scopes

### Project Creation Takes Too Long

- **Normal**: Supabase project creation takes 2-3 minutes
- **Timeout**: If it takes longer than 5 minutes, check Supabase dashboard
- The project may have been created but BuildRunner couldn't detect it

## Security Best Practices

### DO ✅

- Store `SUPABASE_ACCESS_TOKEN` in `.env.local`
- Add `.env.local` to `.gitignore`
- Use server-side API routes for all Supabase Management API calls
- Rotate tokens periodically
- Use different tokens for development vs. production

### DON'T ❌

- Never expose `SUPABASE_ACCESS_TOKEN` to the browser
- Don't commit tokens to git
- Don't use the same token across multiple apps
- Don't share tokens in chat/email

## Advanced Configuration

### Custom Regions

Available regions:
- `us-west-1` - US West (California)
- `us-east-1` - US East (Virginia)
- `eu-west-1` - EU West (Ireland)
- `eu-central-1` - EU Central (Frankfurt)
- `ap-southeast-1` - Asia Pacific (Singapore)
- `ap-northeast-1` - Asia Pacific (Tokyo)

### Plans

- `free` - Free tier (2 projects per org)
- `pro` - Pro plan ($25/month per project)
- `team` - Team plan ($599/month per org)

### Database Passwords

BuildRunner auto-generates secure passwords using:
- 32 characters
- Letters, numbers, and special characters
- Stored encrypted in project config

## Next Steps

Once you've set up the Supabase Management API:

1. ✅ Create a new project in BuildRunner
2. ✅ Test the automatic setup wizard
3. ✅ Verify the Supabase project was created
4. ✅ Check project settings to see credentials
5. ✅ Start building with automatic database creation!

## Support

- **Supabase Docs**: https://supabase.com/docs/guides/platform/access-tokens
- **Supabase API Reference**: https://supabase.com/docs/reference/api
- **BuildRunner Issues**: Check the project's GitHub issues

---

**Remember**: The `SUPABASE_ACCESS_TOKEN` is for BuildRunner to manage projects. Each created project gets its own separate credentials that are used by the end users.
