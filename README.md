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

## Next Steps

This is Phase 1 - Step 1 of the BuildRunner SaaS project. Future phases will add:

- Remote state synchronization with Supabase
- Advanced CLI commands and reporting
- Web dashboard for project visualization
- Multi-project support and team collaboration
