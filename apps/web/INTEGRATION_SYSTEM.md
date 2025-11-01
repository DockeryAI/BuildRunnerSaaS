# OAuth-Based Integration System

## Overview

BuildRunner now uses an **intelligent, OAuth-based integration system** where users are prompted to connect services as needed—no more `.env` file configuration! The system:

1. **Analyzes project requirements** - Detects which services are needed
2. **Prompts users at the right time** - In-app connection prompts
3. **Uses OAuth when possible** - GitHub, Vercel, etc.
4. **Collects API keys securely** - For services without OAuth
5. **Offers flexible billing** - Use your own keys OR BuildRunner's keys with markup

---

## Architecture

### Smart Detection Flow

```
User creates project
    ↓
System analyzes features/PRD
    ↓
Detects requirements:
  - GitHub ✅ (always required)
  - Supabase 🤔 (if database features detected)
  - OpenRouter 🤔 (if AI features detected)
  - Vercel 🤔 (if deployment requested)
    ↓
Generates prompts for missing connections
    ↓
Shows prompts at optimal timing:
  - GitHub: Immediately after PRD
  - OpenRouter: Before feature extraction
  - Supabase: When creating tables
  - Vercel: Before deployment
    ↓
User connects services (OAuth or API key)
    ↓
Credentials stored securely
    ↓
Build proceeds automatically!
```

### Integration Types

| Service | Connection Method | When Needed | Required? |
|---------|------------------|-------------|-----------|
| **GitHub** | OAuth | Code storage, version control | ✅ Yes |
| **OpenRouter** | API Key OR BuildRunner's | AI code generation | ✅ Yes |
| **Supabase** | API Access Token | Database, auth, storage | Optional |
| **Vercel** | OAuth | Deployment, hosting | Optional |
| **Stripe** | API Keys | Payments | Optional |

---

## GitHub OAuth Integration

### How It Works

1. **User clicks "Connect GitHub"**
2. **OAuth flow initiated** - Redirects to github.com
3. **User authorizes BuildRunner** - Grants permissions:
   - Create/manage repositories
   - Read user email
   - Read org membership
4. **Callback handled** - Access token received
5. **Token stored** - Securely in user's session/database
6. **Ready to use!** - Can create repos automatically

### Capabilities

With GitHub connected, BuildRunner can:
- ✅ Create new repositories
- ✅ Push code to repos
- ✅ Create branches
- ✅ Commit files
- ✅ Create pull requests
- ✅ Initialize project structure (.gitignore, README, etc.)

### Example: Auto-Create Repo

```typescript
// User starts building a feature
// System detects code is ready to push
// Automatically creates repo and pushes code

await githubOAuth.createRepository(accessToken, {
  name: 'my-awesome-app',
  description: 'Built with BuildRunner',
  private: true,
  autoInit: true,
  gitignoreTemplate: 'Node'
});

// Push all generated code
await githubOAuth.createMultipleFiles(
  accessToken,
  'username',
  'my-awesome-app',
  generatedFiles,
  'Initial commit from BuildRunner'
);
```

---

## OpenRouter Configuration

### Two Options

#### Option 1: Use Your Own Key (Free Plan)
- No markup
- Bring your own OpenRouter API key
- Full control over spending
- Pay OpenRouter directly

#### Option 2: Use BuildRunner's Key (Pro Plan)
- 20% markup on token costs
- No need for your own key
- Usage tracked and billed monthly
- Convenient for non-technical users

### Configuration UI

```
┌────────────────────────────────────────┐
│ OpenRouter Configuration               │
├────────────────────────────────────────┤
│                                        │
│ ○ Use my own API key                   │
│   [Enter API key: sk-or-...]           │
│   No markup, pay OpenRouter directly   │
│                                        │
│ ● Use BuildRunner's key (20% markup)   │
│   Convenient, no setup required        │
│   Current usage: $12.50 this month     │
│                                        │
│         [Save Configuration]           │
└────────────────────────────────────────┘
```

---

## Supabase Connection

### How It Works

Unlike GitHub, Supabase doesn't have OAuth for project creation. Instead:

1. **User clicks "Connect Supabase"**
2. **Prompt shows instructions**:
   - Go to supabase.com/account/tokens
   - Generate access token
   - Copy and paste into BuildRunner
3. **Token validated** - Check org access
4. **Organizations loaded** - Show available orgs
5. **Ready to create projects!**

### Alternative: Hosted Database Option

For users who don't want to manage Supabase:

```
┌────────────────────────────────────────┐
│ Database Setup                         │
├────────────────────────────────────────┤
│                                        │
│ ○ Use my Supabase account              │
│   [Enter access token...]              │
│   Free tier: 2 projects                │
│                                        │
│ ● Use BuildRunner Database ($10/mo)    │
│   Hosted PostgreSQL                    │
│   Managed backups                      │
│   No Supabase account needed           │
│                                        │
│         [Continue]                     │
└────────────────────────────────────────┘
```

---

## Smart Integration Detection

The `IntegrationDetector` analyzes your project and automatically determines what's needed.

### Detection Rules

```typescript
// Detects database needs
if (features mention "database", "auth", "users", "data storage") {
  → Prompt for Supabase
}

// Detects AI needs
if (features mention "AI", "ML", "chatbot", "recommendations") {
  → Ensure OpenRouter is configured
}

// Detects deployment needs
if (user clicks "Deploy") {
  → Prompt for Vercel
}
```

### Example Detection

**Project**: "Build a task management app with user accounts"

**Detected Requirements**:
1. ✅ GitHub - Required for code storage
2. ✅ Supabase - Detected: "user accounts" → needs database + auth
3. ✅ OpenRouter - Required for AI code generation
4. ⏭️ Vercel - Optional, prompt when deploying

---

## Integration Timing

### Immediate Prompts

Shown right after PRD creation:
- **GitHub** - "Let's set up your repository"
- **OpenRouter** - "Choose AI configuration"

### On-Demand Prompts

Shown when feature is used:
- **Supabase** - When user tries to create database tables
- **Stripe** - When implementing payment features
- **SendGrid** - When implementing email features

### Before-Build Prompts

Shown before major actions:
- **Vercel** - Before deploying
- **AWS** - Before setting up infrastructure

---

## User Experience

### Scenario 1: New User, First Project

```
1. User: "Build a todo app with user accounts"
   ↓
2. PRD generated
   ↓
3. System: "This app needs:"
   - Database (for todos, user data)
   - Authentication (for user accounts)
   - Code storage (GitHub)

   Modal appears:

   ┌─────────────────────────────────────┐
   │  🚀 Connect Required Services       │
   ├─────────────────────────────────────┤
   │                                     │
   │  ✓ OpenRouter (AI)                  │
   │    [✓] Using BuildRunner key        │
   │                                     │
   │  ○ GitHub (Code Storage) REQUIRED   │
   │    [Connect with GitHub →]          │
   │                                     │
   │  ○ Supabase (Database)              │
   │    [Setup Database →]               │
   │    or [Skip, add later]             │
   │                                     │
   └─────────────────────────────────────┘

4. User clicks "Connect with GitHub"
   ↓
5. OAuth flow completes
   ↓
6. User clicks "Setup Database"
   ↓
7. Enters Supabase token OR chooses BuildRunner hosting
   ↓
8. All set! Building begins automatically
```

### Scenario 2: Existing User Adding Payment Feature

```
1. User adds "Payment processing with Stripe"
   ↓
2. AI starts implementing feature
   ↓
3. System detects: needs Stripe API keys
   ↓
4. Prompt appears:

   ┌─────────────────────────────────────┐
   │  💳 Stripe Connection Required      │
   ├─────────────────────────────────────┤
   │                                     │
   │  This feature needs Stripe API keys │
   │  to process payments.               │
   │                                     │
   │  [Enter API Keys →]                 │
   │  [Skip for now]                     │
   │                                     │
   │  ℹ️ You can test with test keys     │
   │                                     │
   └─────────────────────────────────────┘

5. User enters keys
   ↓
6. Feature implementation continues
   ↓
7. Payment code generated with user's keys
```

---

## Security

### OAuth Tokens

- ✅ Stored encrypted in database
- ✅ Never exposed to client
- ✅ Automatic expiry handling
- ✅ Refresh tokens when available
- ✅ Scoped to minimum permissions

### API Keys

- ✅ Encrypted at rest
- ✅ Preview shown (e.g., "sbp_abc...xyz")
- ✅ Can be rotated anytime
- ✅ Never logged
- ✅ Server-side usage only

### Token Storage

```typescript
// User connections stored per-user
{
  id: "conn-abc123",
  userId: "user-xyz",
  integrationType: "github",
  status: "connected",
  oauth: {
    accessToken: "gho_...", // ENCRYPTED
    tokenType: "bearer",
    scope: "repo user:email"
  },
  metadata: {
    username: "johndoe",
    avatarUrl: "https://..."
  }
}
```

---

## Business Model

### Free Plan
- ✅ Unlimited projects
- ✅ Bring your own API keys
- ✅ GitHub integration
- ✅ All features
- ✅ Community support

### Pro Plan ($29/month)
- ✅ Use BuildRunner's API keys
- ✅ 20% markup on token costs
- ✅ Monthly token limit: 1M tokens
- ✅ Priority support
- ✅ Advanced analytics
- ✅ Team collaboration

### Enterprise
- ✅ Custom pricing
- ✅ Dedicated infrastructure
- ✅ SLA guarantees
- ✅ White-label option

---

## GitHub OAuth Setup (For BuildRunner)

As the BuildRunner developer, you need to create a GitHub OAuth App:

### Steps:

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **App name**: BuildRunner
   - **Homepage URL**: https://buildrunner.ai (or your domain)
   - **Callback URL**: `https://your-domain.com/api/auth/github/callback`
4. Get Client ID and Client Secret
5. Add to `.env` (BuildRunner's .env, not user-facing):

```bash
# GitHub OAuth (BuildRunner's App)
GITHUB_CLIENT_ID=Iv1.abc123...
GITHUB_CLIENT_SECRET=1234567890abcdef...
NEXT_PUBLIC_GITHUB_CLIENT_ID=Iv1.abc123...
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

6. Done! Users can now connect their GitHub

---

## Implementation Status

### ✅ Completed

- Integration type system
- GitHub OAuth client
- OAuth callback handler
- Smart integration detector
- Connection store
- Token storage architecture

### 🚧 In Progress

- Integration prompt UI components
- Integrations management page
- Token usage tracking
- Pricing/billing system

### 📝 TODO

- Vercel OAuth integration
- Stripe API key flow
- Hosted database option
- Usage analytics dashboard
- Team collaboration features

---

## Next Steps

1. **Create GitHub OAuth App** - Follow setup guide above
2. **Add credentials to .env** - BuildRunner's credentials only
3. **Test OAuth flow** - Create a test project
4. **Build UI components** - Integration prompts and management page
5. **Add usage tracking** - For Pro plan billing

---

## Benefits of This Approach

### For Users

- ✅ No technical setup required
- ✅ Never touch .env files
- ✅ Guided through connections
- ✅ Flexible: own keys OR BuildRunner's
- ✅ Seamless OAuth flows
- ✅ Automatic repo creation
- ✅ Works entirely in-browser

### For BuildRunner

- ✅ Revenue opportunity (markup on tokens)
- ✅ Better user experience
- ✅ Easier support (fewer setup issues)
- ✅ Professional SaaS architecture
- ✅ Scalable billing model
- ✅ Usage analytics

### vs. Old Approach

| Old (.env files) | New (OAuth + Prompts) |
|-----------------|----------------------|
| Users edit .env | No files to edit |
| Technical knowledge needed | Guided UI |
| One-time setup | Connect as needed |
| No revenue model | Pro plan with markup |
| Hard to support | Easy troubleshooting |
| Not user-friendly | Professional UX |

---

## GitHub OAuth: Yes, It Can Create Repos!

**You asked:** "Does github have a way that we can let the user create new accounts and repos without leaving our app?"

**Answer:** Yes! With GitHub OAuth:

✅ **Create repos**: `POST /user/repos`
✅ **Push code**: Tree API for batch commits
✅ **Manage branches**: Create, delete, protect
✅ **Create PRs**: Open pull requests
✅ **Add collaborators**: Invite team members
✅ **Webhooks**: Listen to events
✅ **Deploy keys**: Setup CI/CD

Users **never leave your app**. They click "Connect GitHub", authorize once, and BuildRunner can manage repos on their behalf!

---

## Summary

BuildRunner's new integration system is:

- **Smart**: Detects what you need automatically
- **Seamless**: OAuth flows stay in-app
- **Flexible**: Use your keys OR ours
- **Professional**: SaaS-ready billing model
- **Secure**: Encrypted, scoped permissions
- **User-Friendly**: No technical setup

**Next**: Create the UI components to bring this to life!
