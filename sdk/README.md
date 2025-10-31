# BuildRunner SDK

[![npm version](https://badge.fury.io/js/%40buildrunner%2Fsdk.svg)](https://badge.fury.io/js/%40buildrunner%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official TypeScript/JavaScript SDK for the BuildRunner API. Manage projects, plans, and execution workflows programmatically with full type safety.

## Features

- 🔒 **Type-safe**: Full TypeScript support with comprehensive type definitions
- 🚀 **Modern**: Built with ES modules and CommonJS support
- 📦 **Lightweight**: Minimal dependencies, tree-shakeable
- 🔄 **Promise-based**: Async/await support with proper error handling
- 🛡️ **Secure**: API key authentication with request validation
- 📖 **Well-documented**: Comprehensive JSDoc comments and examples

## Installation

```bash
npm install @buildrunner/sdk
```

```bash
yarn add @buildrunner/sdk
```

```bash
pnpm add @buildrunner/sdk
```

## Quick Start

```typescript
import { BuildRunnerSDK } from '@buildrunner/sdk';

// Initialize the SDK
const client = new BuildRunnerSDK({
  apiKey: 'your-api-key',
  projectId: 'your-project-id', // Optional: can be provided per-call
  baseUrl: 'https://api.buildrunner.com', // Optional: defaults to production
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

## Authentication

Get your API key from the [BuildRunner Dashboard](https://app.buildrunner.com/settings/api-keys).

```typescript
const client = new BuildRunnerSDK({
  apiKey: 'br_your_api_key_here',
});
```

### Environment Variables

You can also use environment variables:

```bash
export BUILDRUNNER_API_KEY="br_your_api_key_here"
export BUILDRUNNER_PROJECT_ID="proj_your_project_id"
export BUILDRUNNER_API_URL="https://api.buildrunner.com"
```

```typescript
import { BuildRunnerSDK } from '@buildrunner/sdk';

const client = new BuildRunnerSDK({
  apiKey: process.env.BUILDRUNNER_API_KEY!,
  projectId: process.env.BUILDRUNNER_PROJECT_ID,
  baseUrl: process.env.BUILDRUNNER_API_URL,
});
```

## API Reference

### Projects API

```typescript
// List projects
const projects = await client.projects.list({
  org_id: 'org_123',
  status: 'active',
  limit: 10,
});

// Get specific project
const project = await client.projects.get('proj_123');

// Create project
const newProject = await client.projects.create({
  name: 'My New Project',
  description: 'A project created via SDK',
  settings: { framework: 'react' },
});

// Update project
const updated = await client.projects.update('proj_123', {
  name: 'Updated Name',
  status: 'active',
});

// Delete project
await client.projects.delete('proj_123');
```

### Planning API

```typescript
// Get project plan
const plan = await client.planning.getPlan('proj_123');

// Update plan
const updatedPlan = await client.planning.updatePlan({
  phases: [
    {
      id: 'p1',
      title: 'Setup Phase',
      steps: [
        {
          id: 'p1.s1',
          title: 'Initialize',
          microsteps: [
            {
              id: 'p1.s1.ms1',
              title: 'Create repo',
              criteria: ['Repository created', 'Initial commit made'],
            },
          ],
        },
      ],
    },
  ],
});
```

### Execution API

```typescript
// Sync project (dry run)
const dryRun = await client.execution.sync({
  dry_run: true,
  phases: ['p1', 'p2'], // Optional: specific phases
});

// Actual sync
const syncResult = await client.execution.sync({
  dry_run: false,
});
```

## Error Handling

The SDK returns a consistent response format:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: string;
}
```

Handle errors gracefully:

```typescript
const result = await client.projects.get('proj_123');

if (result.error) {
  console.error('Error:', result.error);
  console.error('Code:', result.code);
  console.error('Details:', result.details);
} else {
  console.log('Project:', result.data);
}
```

## Configuration Options

```typescript
interface BuildRunnerConfig {
  /** API key for authentication (required) */
  apiKey: string;
  /** Base URL for the API (optional) */
  baseUrl?: string;
  /** Default project ID (optional) */
  projectId?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom headers (optional) */
  headers?: Record<string, string>;
}
```

## Examples

Check out the [examples directory](./examples/) for more comprehensive examples:

- [Basic Usage](./examples/basic-usage.ts) - Getting started with the SDK
- [Project Management](./examples/project-management.ts) - CRUD operations
- [Planning Workflows](./examples/planning.ts) - Working with plans and phases
- [Sync Operations](./examples/sync.ts) - Execution and synchronization

## TypeScript Support

The SDK is built with TypeScript and provides full type definitions:

```typescript
import type { Project, Plan, Phase, SyncResult } from '@buildrunner/sdk';

// All API responses are properly typed
const project: Project = result.data!;
const phases: Phase[] = plan.data!.phases;
```

## Browser Support

The SDK works in both Node.js and browser environments:

```html
<script type="module">
  import { BuildRunnerSDK } from 'https://unpkg.com/@buildrunner/sdk@latest/dist/index.mjs';
  
  const client = new BuildRunnerSDK({
    apiKey: 'your-api-key',
  });
</script>
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.buildrunner.com/sdk)
- 🐛 [Issue Tracker](https://github.com/buildrunner/buildrunner-sdk/issues)
- 💬 [Discord Community](https://discord.gg/buildrunner)
- 📧 [Email Support](mailto:support@buildrunner.com)

## Changelog

See [CHANGELOG.md](../docs/CHANGELOG.md) for release history and breaking changes.
