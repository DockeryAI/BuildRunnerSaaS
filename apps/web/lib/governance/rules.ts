/**
 * BuildRunner Governance Rules
 *
 * Comprehensive best practices that ALL AI code builders must follow.
 * These rules ensure enterprise-grade code quality.
 */

export interface GovernanceRule {
  id: string;
  category: GovernanceCategory;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  autoFix: boolean;
  validator?: (code: string) => Promise<RuleViolation[]>;
  promptGuidance: string; // Instructions for AI to follow this rule
}

export type GovernanceCategory =
  | 'architecture'
  | 'code_quality'
  | 'security'
  | 'performance'
  | 'testing'
  | 'error_handling'
  | 'logging'
  | 'database'
  | 'api_design'
  | 'documentation';

export interface RuleViolation {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  file?: string;
  suggestion?: string;
}

// =============================================================================
// ARCHITECTURE RULES
// =============================================================================

export const ARCHITECTURE_RULES: GovernanceRule[] = [
  {
    id: 'arch-001',
    category: 'architecture',
    name: 'Clean Architecture Layers',
    description: 'Code must be organized into domain, application, infrastructure, and presentation layers',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
CRITICAL: Organize code using Clean Architecture:

**Domain Layer** (core business logic):
- Entities: Core business objects
- Value Objects: Immutable values
- Domain Services: Business logic that doesn't fit in entities
- No dependencies on external layers

**Application Layer** (use cases):
- Commands: Actions that modify state
- Queries: Actions that read data
- DTOs: Data transfer objects
- Interfaces for infrastructure

**Infrastructure Layer** (external concerns):
- Repositories: Database access
- External Services: APIs, LLMs
- Message Brokers: RabbitMQ, Kafka

**Presentation Layer** (UI/API):
- REST Controllers
- GraphQL Resolvers
- Request/Response models

Example structure:
\`\`\`
src/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── services/
├── application/
│   ├── commands/
│   ├── queries/
│   └── dtos/
├── infrastructure/
│   ├── repositories/
│   ├── external-services/
│   └── messaging/
└── presentation/
    ├── api/
    └── graphql/
\`\`\`
    `,
  },

  {
    id: 'arch-002',
    category: 'architecture',
    name: 'SOLID Principles',
    description: 'All code must follow SOLID principles',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
MANDATORY: Follow SOLID principles:

**Single Responsibility**: Each class/function has ONE reason to change
❌ Bad: class UserService { saveUser(), sendEmail(), generateReport() }
✅ Good: class UserRepository, class EmailService, class ReportGenerator

**Open/Closed**: Open for extension, closed for modification
✅ Use strategy pattern for AI providers:
\`\`\`typescript
interface AIProvider {
  generateCode(prompt: string): Promise<Code>;
}
class OpenAIProvider implements AIProvider { }
class AnthropicProvider implements AIProvider { }
\`\`\`

**Liskov Substitution**: Subtypes must be substitutable
✅ Derived classes must fulfill base class contract

**Interface Segregation**: Many specific interfaces > one general
❌ Bad: interface MegaService { read(), write(), delete(), export(), import() }
✅ Good: interface Reader, interface Writer, interface Exporter

**Dependency Inversion**: Depend on abstractions, not concretions
✅ Use dependency injection everywhere
\`\`\`typescript
class OrchestrationService {
  constructor(
    private aiProvider: AIProvider, // Interface, not concrete class
    private repository: Repository  // Interface, not concrete class
  ) {}
}
\`\`\`
    `,
  },

  {
    id: 'arch-003',
    category: 'architecture',
    name: 'Event-Driven Architecture',
    description: 'Use events for asynchronous operations and service communication',
    severity: 'warning',
    autoFix: false,
    promptGuidance: `
Use event-driven patterns for:
- Long-running operations (PRD generation, builds)
- Service-to-service communication
- Audit trails

**Publish domain events**:
\`\`\`typescript
class PRDService {
  async generate(input: UserInput): Promise<PRD> {
    const prd = await this.ai.generatePRD(input);

    // Publish event
    await this.eventBus.publish(new PRDGeneratedEvent({
      prdId: prd.id,
      projectId: input.projectId,
      timestamp: new Date()
    }));

    return prd;
  }
}
\`\`\`

**Subscribe to events**:
\`\`\`typescript
@EventHandler(PRDGeneratedEvent)
class ProjectPlanGenerator {
  async handle(event: PRDGeneratedEvent) {
    await this.generatePlan(event.prdId);
  }
}
\`\`\`
    `,
  },
];

// =============================================================================
// CODE QUALITY RULES
// =============================================================================

export const CODE_QUALITY_RULES: GovernanceRule[] = [
  {
    id: 'quality-001',
    category: 'code_quality',
    name: 'TypeScript Strict Mode',
    description: 'All TypeScript must use strict mode with no any types',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
MANDATORY TypeScript settings:
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
\`\`\`

**Never use 'any' type**:
❌ Bad: function process(data: any)
✅ Good: function process(data: UserInput)
✅ Good: function process<T extends BaseType>(data: T)

**Use proper types everywhere**:
\`\`\`typescript
interface UserInput {
  projectName: string;
  description: string;
  requirements: string[];
}

async function generatePRD(input: UserInput): Promise<PRD> {
  // Implementation
}
\`\`\`
    `,
  },

  {
    id: 'quality-002',
    category: 'code_quality',
    name: 'Function Length Limit',
    description: 'Functions must be under 50 lines',
    severity: 'warning',
    autoFix: true,
    promptGuidance: `
**Maximum function length: 50 lines**

If a function exceeds 50 lines, extract helpers:

❌ Bad (100+ lines):
\`\`\`typescript
async function processProject(input: ProjectInput) {
  // Validate (20 lines)
  // Transform (30 lines)
  // Call APIs (30 lines)
  // Save results (20 lines)
}
\`\`\`

✅ Good (each under 50 lines):
\`\`\`typescript
async function processProject(input: ProjectInput) {
  const validated = await validateInput(input);
  const transformed = await transformData(validated);
  const result = await callAIProviders(transformed);
  return await saveResults(result);
}

async function validateInput(input: ProjectInput) { }
async function transformData(data: ValidatedInput) { }
async function callAIProviders(data: TransformedData) { }
async function saveResults(result: AIResult) { }
\`\`\`
    `,
  },

  {
    id: 'quality-003',
    category: 'code_quality',
    name: 'Cyclomatic Complexity',
    description: 'Maximum cyclomatic complexity of 10',
    severity: 'error',
    autoFix: true,
    promptGuidance: `
**Maximum cyclomatic complexity: 10**

Reduce complexity by:
1. Extract conditions into functions
2. Use early returns
3. Use lookup tables instead of switch/if chains

❌ Bad (complexity > 10):
\`\`\`typescript
function getStatusMessage(status: string) {
  if (status === 'pending') {
    if (hasErrors) {
      return 'Pending with errors';
    } else {
      return 'Pending';
    }
  } else if (status === 'in_progress') {
    if (progress > 50) {
      return 'More than halfway';
    } else {
      return 'In progress';
    }
  } // ... more conditions
}
\`\`\`

✅ Good (complexity < 10):
\`\`\`typescript
const STATUS_MESSAGES: Record<string, string> = {
  'pending': 'Pending',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'failed': 'Failed'
};

function getStatusMessage(status: string): string {
  return STATUS_MESSAGES[status] || 'Unknown';
}
\`\`\`
    `,
  },

  {
    id: 'quality-004',
    category: 'code_quality',
    name: 'Naming Conventions',
    description: 'Use clear, descriptive names following conventions',
    severity: 'warning',
    autoFix: false,
    promptGuidance: `
**Naming Conventions**:
- Variables/Functions: camelCase (getUserData, isValid)
- Classes/Interfaces: PascalCase (UserService, ProjectRepository)
- Constants: UPPER_SNAKE_CASE (MAX_RETRY_COUNT, API_BASE_URL)
- Private fields: _prefixed (_internalCache, _processingQueue)

**Be descriptive**:
❌ Bad: function proc(d: any)
✅ Good: function processUserData(data: UserInput)

❌ Bad: const x = await fetch(url)
✅ Good: const userProjects = await fetch(url)

**Boolean naming**:
✅ Use is/has/should prefixes: isValid, hasPermission, shouldRetry
    `,
  },
];

// =============================================================================
// SECURITY RULES
// =============================================================================

export const SECURITY_RULES: GovernanceRule[] = [
  {
    id: 'security-001',
    category: 'security',
    name: 'Input Validation',
    description: 'All user inputs must be validated before processing',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**CRITICAL: Validate ALL user inputs**

Use schema validation (Zod):
\`\`\`typescript
import { z } from 'zod';

const UserInputSchema = z.object({
  projectName: z.string()
    .min(3, 'Too short')
    .max(100, 'Too long')
    .regex(/^[a-zA-Z0-9-_\\s]+$/, 'Invalid characters'),

  description: z.string()
    .max(5000, 'Too long')
    .transform(sanitizeHtml), // Sanitize HTML

  requirements: z.array(z.string())
    .min(1)
    .max(50),

  email: z.string().email()
});

function processInput(input: unknown): UserInput {
  try {
    return UserInputSchema.parse(input);
  } catch (error) {
    throw new ValidationError('Invalid input', error);
  }
}
\`\`\`

**Never trust user input**:
- Validate types, formats, lengths
- Sanitize HTML content
- Escape SQL (use parameterized queries)
- Validate file uploads (type, size, content)
    `,
  },

  {
    id: 'security-002',
    category: 'security',
    name: 'SQL Injection Prevention',
    description: 'Always use parameterized queries, never concatenate SQL',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**NEVER concatenate user input into SQL**

❌ DANGEROUS:
\`\`\`typescript
const query = \`SELECT * FROM users WHERE email = '\${userEmail}'\`;
db.query(query); // SQL INJECTION VULNERABILITY!
\`\`\`

✅ SAFE (parameterized):
\`\`\`typescript
const query = 'SELECT * FROM users WHERE email = $1';
db.query(query, [userEmail]);
\`\`\`

✅ SAFE (ORM):
\`\`\`typescript
await prisma.user.findMany({
  where: { email: userEmail }
});
\`\`\`
    `,
  },

  {
    id: 'security-003',
    category: 'security',
    name: 'Secrets Management',
    description: 'Never hardcode secrets, use environment variables or vault',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**NEVER hardcode API keys or secrets**

❌ DANGEROUS:
\`\`\`typescript
const apiKey = 'sk-abc123...'; // NEVER DO THIS!
\`\`\`

✅ SAFE:
\`\`\`typescript
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured');
}
\`\`\`

**For sensitive operations, use a secrets vault**:
\`\`\`typescript
import { SecretsManager } from './secrets';

const secrets = new SecretsManager();
const apiKey = await secrets.get('OPENAI_API_KEY');
\`\`\`

**Never log secrets**:
❌ logger.info('API Key:', apiKey);
✅ logger.info('API Key configured:', !!apiKey);
    `,
  },

  {
    id: 'security-004',
    category: 'security',
    name: 'Authentication & Authorization',
    description: 'Protect all endpoints with authentication and authorization',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**Every protected endpoint must check auth**

\`\`\`typescript
router.post('/projects',
  authenticate(), // Verify JWT token
  authorize([Permission.CREATE_PROJECT]), // Check permissions
  async (req, res) => {
    const user = req.user; // Verified user from middleware
    const project = await projectService.create(user.id, req.body);
    res.json(project);
  }
);
\`\`\`

**Implement proper RBAC**:
\`\`\`typescript
enum Role {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

enum Permission {
  CREATE_PROJECT = 'project:create',
  UPDATE_PROJECT = 'project:update',
  DELETE_PROJECT = 'project:delete'
}

function authorize(requiredPermissions: Permission[]) {
  return (req, res, next) => {
    if (!hasPermissions(req.user, requiredPermissions)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
\`\`\`
    `,
  },
];

// =============================================================================
// ERROR HANDLING RULES
// =============================================================================

export const ERROR_HANDLING_RULES: GovernanceRule[] = [
  {
    id: 'error-001',
    category: 'error_handling',
    name: 'Custom Error Hierarchy',
    description: 'Use custom error classes, never throw raw strings',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**Create custom error hierarchy**:

\`\`\`typescript
class BuildRunnerError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends BuildRunnerError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
  }
}

class AIProviderError extends BuildRunnerError {
  constructor(message: string, provider: string) {
    super(message, 'AI_PROVIDER_ERROR', 502, { provider });
  }
}
\`\`\`

**Usage**:
❌ Bad: throw 'Invalid input'; // Never throw strings!
❌ Bad: throw new Error('Invalid'); // Too generic

✅ Good:
\`\`\`typescript
if (!input.projectName) {
  throw new ValidationError('Project name is required', 'projectName');
}

if (aiProvider.status !== 'healthy') {
  throw new AIProviderError('Provider unavailable', provider.name);
}
\`\`\`
    `,
  },

  {
    id: 'error-002',
    category: 'error_handling',
    name: 'Comprehensive Try-Catch',
    description: 'All async operations must have try-catch with proper error handling',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**Always wrap async operations in try-catch**:

\`\`\`typescript
async function generatePRD(input: UserInput): Promise<PRD> {
  try {
    // Validate
    const validated = await validateInput(input);

    // Generate
    const prd = await aiService.generatePRD(validated);

    // Save
    await repository.save(prd);

    return prd;
  } catch (error) {
    // Log with context
    logger.error('PRD generation failed', {
      error,
      input: sanitizeForLogging(input),
      timestamp: new Date()
    });

    // Rethrow as domain error
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new PRDGenerationError(
      'Failed to generate PRD',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
\`\`\`
    `,
  },

  {
    id: 'error-003',
    category: 'error_handling',
    name: 'Retry Logic',
    description: 'Implement exponential backoff for transient failures',
    severity: 'warning',
    autoFix: false,
    promptGuidance: `
**Implement retry with exponential backoff**:

\`\`\`typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (!isRetryable(error)) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        const jitter = Math.random() * 1000;
        await sleep(delay + jitter);

        logger.info('Retrying operation', {
          attempt: attempt + 1,
          maxRetries,
          delay
        });
      }
    }
  }

  throw lastError!;
}

function isRetryable(error: Error): boolean {
  if (error instanceof AIProviderError) {
    // Retry on 429, 5xx errors
    return [429, 500, 502, 503, 504].includes(error.statusCode);
  }
  return false;
}
\`\`\`
    `,
  },
];

// =============================================================================
// PERFORMANCE RULES
// =============================================================================

export const PERFORMANCE_RULES: GovernanceRule[] = [
  {
    id: 'perf-001',
    category: 'performance',
    name: 'Async/Await Over Callbacks',
    description: 'Always use async/await, never callbacks or raw promises',
    severity: 'warning',
    autoFix: true,
    promptGuidance: `
**Use async/await consistently**:

❌ Bad (callback hell):
\`\`\`typescript
function getData(callback) {
  db.query('SELECT ...', (err, result) => {
    if (err) return callback(err);
    processData(result, (err, processed) => {
      if (err) return callback(err);
      saveData(processed, (err, saved) => {
        callback(err, saved);
      });
    });
  });
}
\`\`\`

✅ Good (async/await):
\`\`\`typescript
async function getData(): Promise<Data> {
  const result = await db.query('SELECT ...');
  const processed = await processData(result);
  const saved = await saveData(processed);
  return saved;
}
\`\`\`

**Run independent operations in parallel**:
\`\`\`typescript
// ❌ Sequential (slow)
const user = await getUser(id);
const projects = await getProjects(id);
const settings = await getSettings(id);

// ✅ Parallel (fast)
const [user, projects, settings] = await Promise.all([
  getUser(id),
  getProjects(id),
  getSettings(id)
]);
\`\`\`
    `,
  },

  {
    id: 'perf-002',
    category: 'performance',
    name: 'Database Query Optimization',
    description: 'Optimize database queries with indexes and proper use of select',
    severity: 'warning',
    autoFix: false,
    promptGuidance: `
**Query optimization best practices**:

1. **Use indexes for frequent queries**:
\`\`\`sql
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created ON projects(created_at DESC);
\`\`\`

2. **Select only needed columns**:
❌ Bad: SELECT * FROM projects
✅ Good: SELECT id, name, status FROM projects

3. **Use pagination**:
\`\`\`typescript
async function getProjects(
  userId: string,
  limit: number = 20,
  cursor?: string
): Promise<PaginatedResult<Project>> {
  const query = {
    owner_id: userId,
    ...(cursor && { id: { $gt: cursor } })
  };

  const projects = await db.projects
    .find(query)
    .limit(limit + 1)
    .sort({ created_at: -1 });

  const hasMore = projects.length > limit;
  const items = hasMore ? projects.slice(0, -1) : projects;

  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    hasMore
  };
}
\`\`\`

4. **Use database transactions for consistency**:
\`\`\`typescript
await db.transaction(async (trx) => {
  await trx.projects.create(project);
  await trx.prds.create(prd);
});
\`\`\`
    `,
  },

  {
    id: 'perf-003',
    category: 'performance',
    name: 'Caching Strategy',
    description: 'Implement multi-layer caching for frequently accessed data',
    severity: 'warning',
    autoFix: false,
    promptGuidance: `
**Implement caching for expensive operations**:

\`\`\`typescript
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // L2: Redis cache
    const cached = await this.redis.get(key);
    if (cached) {
      const value = JSON.parse(cached);
      this.memoryCache.set(key, value);
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    this.memoryCache.set(key, value);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}

// Usage
async function getProject(id: string): Promise<Project> {
  const cacheKey = \`project:\${id}\`;

  let project = await cache.get<Project>(cacheKey);

  if (!project) {
    project = await db.projects.findById(id);
    if (project) {
      await cache.set(cacheKey, project, 3600); // 1 hour TTL
    }
  }

  return project;
}
\`\`\`
    `,
  },
];

// =============================================================================
// TESTING RULES
// =============================================================================

export const TESTING_RULES: GovernanceRule[] = [
  {
    id: 'test-001',
    category: 'testing',
    name: 'Comprehensive Unit Tests',
    description: 'All business logic must have unit tests with 80%+ coverage',
    severity: 'error',
    autoFix: false,
    promptGuidance: `
**Write unit tests for all business logic**:

\`\`\`typescript
describe('OrchestrationService', () => {
  let service: OrchestrationService;
  let mockAIProvider: jest.Mocked<AIProvider>;
  let mockRepository: jest.Mocked<Repository>;

  beforeEach(() => {
    mockAIProvider = {
      generateCode: jest.fn(),
      estimateCost: jest.fn()
    } as any;

    mockRepository = {
      save: jest.fn(),
      findById: jest.fn()
    } as any;

    service = new OrchestrationService(mockAIProvider, mockRepository);
  });

  it('should generate PRD from user input', async () => {
    // Arrange
    const input = createMockUserInput();
    const expectedPRD = createMockPRD();
    mockAIProvider.generateCode.mockResolvedValue(expectedPRD);

    // Act
    const result = await service.generatePRD(input);

    // Assert
    expect(result).toEqual(expectedPRD);
    expect(mockAIProvider.generateCode).toHaveBeenCalledWith(
      expect.stringContaining(input.description),
      expect.any(Object)
    );
  });

  it('should throw ValidationError for invalid input', async () => {
    const invalidInput = { projectName: '' };

    await expect(
      service.generatePRD(invalidInput)
    ).rejects.toThrow(ValidationError);
  });

  it('should retry on transient failures', async () => {
    mockAIProvider.generateCode
      .mockRejectedValueOnce(new AIProviderError('Timeout', 'openai'))
      .mockResolvedValueOnce(createMockPRD());

    const result = await service.generatePRD(createMockUserInput());

    expect(mockAIProvider.generateCode).toHaveBeenCalledTimes(2);
    expect(result).toBeDefined();
  });
});
\`\`\`

**Test coverage target: 80%+ for business logic**
    `,
  },
];

// =============================================================================
// LOGGING RULES
// =============================================================================

export const LOGGING_RULES: GovernanceRule[] = [
  {
    id: 'log-001',
    category: 'logging',
    name: 'Structured Logging',
    description: 'Use structured logging with proper context',
    severity: 'warning',
    autoFix: false,
    promptGuidance: `
**Use structured logging**:

\`\`\`typescript
import { logger } from './logger';

// ❌ Bad
console.log('User created project');
console.log('Error:', error.message);

// ✅ Good
logger.info('User created project', {
  userId: user.id,
  projectId: project.id,
  projectName: project.name,
  timestamp: new Date().toISOString()
});

logger.error('PRD generation failed', {
  error: error.message,
  stack: error.stack,
  userId: user.id,
  input: sanitizeForLogging(input),
  provider: provider.name
});
\`\`\`

**Log levels**:
- **error**: Failures that need immediate attention
- **warn**: Degraded functionality, retries
- **info**: Important business events
- **debug**: Detailed diagnostic information

**Never log sensitive data**:
❌ logger.info('API Key:', apiKey);
❌ logger.info('Password:', password);
✅ logger.info('API Key configured:', !!apiKey);
    `,
  },
];

// =============================================================================
// EXPORT ALL RULES
// =============================================================================

export const ALL_GOVERNANCE_RULES: GovernanceRule[] = [
  ...ARCHITECTURE_RULES,
  ...CODE_QUALITY_RULES,
  ...SECURITY_RULES,
  ...ERROR_HANDLING_RULES,
  ...PERFORMANCE_RULES,
  ...TESTING_RULES,
  ...LOGGING_RULES,
];

export function getRulesByCategory(category: GovernanceCategory): GovernanceRule[] {
  return ALL_GOVERNANCE_RULES.filter(rule => rule.category === category);
}

export function getRuleBySeverity(severity: 'error' | 'warning' | 'info'): GovernanceRule[] {
  return ALL_GOVERNANCE_RULES.filter(rule => rule.severity === severity);
}

export function getRule(ruleId: string): GovernanceRule | undefined {
  return ALL_GOVERNANCE_RULES.find(rule => rule.id === ruleId);
}
