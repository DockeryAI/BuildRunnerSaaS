# BuildRunnerCloud: Comprehensive Development Best Practices Guide

## Executive Summary

BuildRunnerCloud is an AI orchestration platform that enables non-technical users to build complex applications by coordinating multiple LLMs and AI code builders. This guide establishes enterprise-grade development standards to ensure the platform is secure, scalable, maintainable, and production-ready.

---

## 1. Architecture & Design Principles

### 1.1 Core Architectural Patterns

**Microservices Architecture**
- Separate services for: orchestration layer, LLM management, PRD generation, project planning, code generation coordination, user management
- Each service should be independently deployable and scalable
- Use API Gateway pattern for unified entry point
- Implement service mesh for inter-service communication (e.g., Istio, Linkerd)

**Event-Driven Architecture**
- Use message queues (RabbitMQ, Apache Kafka, AWS SQS) for asynchronous operations
- Implement event sourcing for audit trails and state reconstruction
- Publish domain events for state changes (PRD updated, project plan modified, build initiated)
- Use saga pattern for distributed transactions across AI services

**Clean Architecture / Hexagonal Architecture**
```
├── Domain Layer (Business Logic)
│   ├── Entities (PRD, ProjectPlan, BuildJob, AIProvider)
│   ├── Value Objects (UserId, ProjectId, Status)
│   └── Domain Services (OrchestrationService, ValidationService)
├── Application Layer (Use Cases)
│   ├── Commands (CreatePRD, UpdateProjectPlan, InitiateBuild)
│   ├── Queries (GetProjectStatus, ListBuilds)
│   └── DTOs (Data Transfer Objects)
├── Infrastructure Layer
│   ├── Repositories (Database access)
│   ├── External Services (LLM APIs, AI Code Builders)
│   └── Message Brokers
└── Presentation Layer
    ├── REST APIs
    ├── GraphQL (optional)
    └── WebSocket handlers (real-time updates)
```

**Design Principles (SOLID)**
- **Single Responsibility**: Each class/module has one reason to change
- **Open/Closed**: Open for extension, closed for modification (use strategy pattern for AI providers)
- **Liskov Substitution**: Subtypes must be substitutable for their base types
- **Interface Segregation**: Many client-specific interfaces over one general-purpose interface
- **Dependency Inversion**: Depend on abstractions, not concretions (use dependency injection)

### 1.2 Key Architectural Decisions

**AI Provider Abstraction**
```typescript
interface AIProvider {
  generateCode(prompt: string, context: Context): Promise<CodeResult>;
  estimateCost(request: Request): Promise<CostEstimate>;
  validateCapabilities(requirements: Requirements): boolean;
  getHealthStatus(): Promise<HealthStatus>;
}

// Implementations: OpenAIProvider, AnthropicProvider, CustomProvider
```

**State Management**
- Use state machines for build job lifecycle (Draft → InProgress → Review → Completed/Failed)
- Implement optimistic locking for concurrent PRD updates
- Store state transitions for complete audit trail
- Use Redis for distributed state management and caching

**Data Consistency**
- Implement eventual consistency where appropriate
- Use distributed transactions with 2PC or saga pattern when needed
- Maintain idempotency for all operations (use idempotency keys)
- Version all documents (PRD, project plans) with timestamps and change tracking

---

## 2. Code Quality & Standards

### 2.1 Code Style & Conventions

**General Standards**
- Use ESLint/Prettier (JavaScript/TypeScript) or Black/Flake8 (Python)
- Maximum function length: 50 lines
- Maximum file length: 300 lines
- Maximum cyclomatic complexity: 10
- Enforce consistent naming conventions (camelCase for variables, PascalCase for classes)

**TypeScript/JavaScript Standards**
```typescript
// Use strict mode and strict TypeScript config
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Prefer interfaces over types for object shapes
interface ProjectPlan {
  readonly id: string;
  name: string;
  tasks: Task[];
  metadata: Metadata;
}

// Use enums for fixed sets of values
enum BuildStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// Always use async/await over raw promises
async function generatePRD(input: UserInput): Promise<PRD> {
  try {
    const validated = await validateInput(input);
    const generated = await aiService.generate(validated);
    return await prdRepository.save(generated);
  } catch (error) {
    logger.error('PRD generation failed', { error, input });
    throw new PRDGenerationError('Failed to generate PRD', error);
  }
}
```

**Python Standards**
```python
# Use type hints everywhere
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from datetime import datetime

@dataclass
class ProjectPlan:
    id: str
    name: str
    tasks: List[Task]
    created_at: datetime
    metadata: Dict[str, Any]

# Use context managers for resources
async with aiohttp.ClientSession() as session:
    async with session.post(url, json=data) as response:
        return await response.json()

# Follow PEP 8 strictly
# Use black for formatting
# Use mypy for type checking
```

### 2.2 Error Handling

**Comprehensive Error Strategy**
```typescript
// Custom error hierarchy
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
  constructor(message: string, field: string) {
    super(message, 'VALIDATION_ERROR', 400, { field });
  }
}

class AIProviderError extends BuildRunnerError {
  constructor(message: string, provider: string, originalError?: Error) {
    super(message, 'AI_PROVIDER_ERROR', 502, { provider, originalError });
  }
}

class OrchestrationError extends BuildRunnerError {
  constructor(message: string, stage: string) {
    super(message, 'ORCHESTRATION_ERROR', 500, { stage });
  }
}

// Centralized error handler
function handleError(error: Error, context: Context): ErrorResponse {
  if (error instanceof BuildRunnerError) {
    logger.error(error.message, { 
      code: error.code, 
      metadata: error.metadata,
      context 
    });
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }
  
  // Unknown errors - never expose internals to client
  logger.error('Unexpected error', { error, context });
  return {
    error: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
    statusCode: 500
  };
}
```

**Retry Logic with Exponential Backoff**
```typescript
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
      
      if (attempt === maxRetries) break;
      if (!isRetryable(error)) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
    }
  }
  
  throw lastError!;
}

function isRetryable(error: Error): boolean {
  if (error instanceof AIProviderError) {
    return [429, 500, 502, 503, 504].includes(error.statusCode);
  }
  return false;
}
```

### 2.3 Logging & Observability

**Structured Logging**
```typescript
import { Logger } from 'winston';

class StructuredLogger {
  constructor(private logger: Logger) {}
  
  logOperation(
    operation: string,
    level: 'info' | 'warn' | 'error',
    metadata: Record<string, any>
  ) {
    this.logger.log(level, operation, {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      service: 'buildrunner-orchestration',
      traceId: metadata.traceId || generateTraceId(),
      userId: metadata.userId,
      projectId: metadata.projectId,
      ...metadata
    });
  }
  
  logAIRequest(provider: string, prompt: string, metadata: any) {
    this.logOperation('ai_request', 'info', {
      provider,
      promptLength: prompt.length,
      model: metadata.model,
      estimatedTokens: estimateTokens(prompt)
    });
  }
  
  logBuildProgress(buildId: string, stage: string, progress: number) {
    this.logOperation('build_progress', 'info', {
      buildId,
      stage,
      progress,
      duration: metadata.duration
    });
  }
}
```

**Distributed Tracing**
- Implement OpenTelemetry for distributed tracing
- Generate correlation IDs for request tracking across services
- Include trace context in all service-to-service calls
- Send traces to Jaeger or Datadog

**Metrics Collection**
```typescript
// Use Prometheus metrics
import { Counter, Histogram, Gauge } from 'prom-client';

const aiRequestCounter = new Counter({
  name: 'ai_requests_total',
  help: 'Total AI provider requests',
  labelNames: ['provider', 'status']
});

const buildDuration = new Histogram({
  name: 'build_duration_seconds',
  help: 'Build duration in seconds',
  buckets: [10, 30, 60, 120, 300, 600]
});

const activeBuildGauge = new Gauge({
  name: 'active_builds',
  help: 'Number of currently active builds'
});
```

---

## 3. Security Best Practices

### 3.1 Authentication & Authorization

**Multi-Layer Security**
```typescript
// JWT-based authentication
interface AuthToken {
  userId: string;
  email: string;
  roles: string[];
  permissions: Permission[];
  exp: number;
  iat: number;
}

// Role-Based Access Control (RBAC)
enum Role {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

enum Permission {
  CREATE_PROJECT = 'project:create',
  UPDATE_PROJECT = 'project:update',
  DELETE_PROJECT = 'project:delete',
  MANAGE_AI_PROVIDERS = 'ai:manage',
  VIEW_ANALYTICS = 'analytics:view'
}

// Authorization middleware
async function authorize(
  requiredPermissions: Permission[]
): Promise<Middleware> {
  return async (req, res, next) => {
    const token = extractToken(req);
    const user = await verifyToken(token);
    
    if (!hasPermissions(user, requiredPermissions)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    
    req.user = user;
    next();
  };
}

// Usage
router.post('/projects',
  authenticate(),
  authorize([Permission.CREATE_PROJECT]),
  createProjectHandler
);
```

**API Key Management**
- Store API keys (for LLMs) in secure vault (HashiCorp Vault, AWS Secrets Manager)
- Implement key rotation policy (rotate every 90 days)
- Use separate keys for different environments
- Never log or expose API keys
- Implement rate limiting per API key

### 3.2 Input Validation & Sanitization

**Comprehensive Validation**
```typescript
import * as z from 'zod';

// Schema-based validation
const UserInputSchema = z.object({
  projectName: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name too long')
    .regex(/^[a-zA-Z0-9-_\s]+$/, 'Invalid characters in project name'),
  
  description: z.string()
    .max(5000, 'Description too long')
    .transform(sanitizeHtml),
  
  requirements: z.array(z.string())
    .min(1, 'At least one requirement needed')
    .max(50, 'Too many requirements'),
  
  targetPlatform: z.enum(['web', 'mobile', 'desktop', 'api']),
  
  estimatedComplexity: z.number()
    .int()
    .min(1)
    .max(10)
});

// Validate user input
function validateUserInput(input: unknown): UserInput {
  try {
    return UserInputSchema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid input',
        error.errors[0].path.join('.')
      );
    }
    throw error;
  }
}

// Sanitize for LLM prompts
function sanitizeForLLM(input: string): string {
  // Remove potential prompt injection attempts
  const dangerous = [
    /ignore\s+(previous|all)\s+instructions?/gi,
    /system\s*:/gi,
    /assistant\s*:/gi,
    /<\|.*?\|>/g
  ];
  
  let sanitized = input;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, '');
  }
  
  return sanitized.trim();
}
```

**SQL Injection Prevention**
- Always use parameterized queries
- Never concatenate user input into SQL
- Use ORM with built-in protections (Prisma, TypeORM, SQLAlchemy)

**XSS Prevention**
- Sanitize all user input before storing
- Use Content Security Policy headers
- Escape output when rendering

### 3.3 Data Protection

**Encryption Standards**
```typescript
// Encrypt sensitive data at rest
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor(encryptionKey: string) {
    this.key = Buffer.from(encryptionKey, 'hex');
  }
  
  encrypt(data: string): EncryptedData {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

**Personal Data Handling (GDPR/CCPA Compliance)**
- Implement data minimization (collect only what's needed)
- Provide data export functionality
- Implement right to deletion (complete data removal)
- Maintain audit log of data access
- Implement consent management
- Anonymize analytics data

### 3.4 Rate Limiting & DDoS Protection

```typescript
import rateLimit from 'express-rate-limit';

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// AI generation endpoint (more restrictive)
const aiGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 generations per hour
  keyGenerator: (req) => req.user.id, // per user, not IP
  message: 'Generation limit exceeded'
});

// Implement token bucket algorithm for API quota
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }
  
  consume(tokens: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    
    return false;
  }
  
  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}
```

---

## 4. Testing Strategy

### 4.1 Test Pyramid

**Unit Tests (70%)**
```typescript
// Test business logic in isolation
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
    
    service = new OrchestrationService(
      mockAIProvider,
      mockRepository
    );
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
    expect(mockRepository.save).toHaveBeenCalledWith(result);
  });
  
  it('should retry on transient AI provider failures', async () => {
    // Arrange
    mockAIProvider.generateCode
      .mockRejectedValueOnce(new AIProviderError('Timeout', 'openai'))
      .mockResolvedValueOnce(createMockPRD());
    
    // Act
    const result = await service.generatePRD(createMockUserInput());
    
    // Assert
    expect(mockAIProvider.generateCode).toHaveBeenCalledTimes(2);
    expect(result).toBeDefined();
  });
  
  it('should throw ValidationError for invalid input', async () => {
    // Arrange
    const invalidInput = { projectName: '' };
    
    // Act & Assert
    await expect(
      service.generatePRD(invalidInput)
    ).rejects.toThrow(ValidationError);
  });
});
```

**Integration Tests (20%)**
```typescript
// Test interaction between components
describe('PRD Generation Flow (Integration)', () => {
  let app: Express;
  let database: Database;
  
  beforeAll(async () => {
    database = await setupTestDatabase();
    app = createApp(database);
  });
  
  afterAll(async () => {
    await database.close();
  });
  
  it('should create PRD and project plan end-to-end', async () => {
    // Arrange
    const user = await createTestUser();
    const token = generateAuthToken(user);
    
    // Act - Create PRD
    const prdResponse = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        projectName: 'Test Project',
        description: 'Build an e-commerce platform',
        requirements: ['User authentication', 'Product catalog']
      })
      .expect(201);
    
    const projectId = prdResponse.body.id;
    
    // Wait for async processing
    await waitForProjectStatus(projectId, 'PRD_COMPLETE');
    
    // Act - Generate project plan
    const planResponse = await request(app)
      .post(`/api/v1/projects/${projectId}/plan`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // Assert
    expect(planResponse.body).toMatchObject({
      projectId,
      phases: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          tasks: expect.any(Array)
        })
      ])
    });
    
    // Verify database state
    const savedPlan = await database.projectPlans.findOne({ projectId });
    expect(savedPlan).toBeDefined();
    expect(savedPlan.status).toBe('ACTIVE');
  });
});
```

**End-to-End Tests (10%)**
```typescript
// Test complete user journeys
describe('Complete Build Flow (E2E)', () => {
  it('non-technical user creates full application', async () => {
    // Use Playwright or Cypress
    await page.goto('/');
    
    // Login
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Create new project
    await page.click('[data-testid="new-project"]');
    await page.fill('[data-testid="project-name"]', 'My App');
    await page.fill('[data-testid="description"]', 
      'I want to build a task management app');
    await page.click('[data-testid="create-project"]');
    
    // Wait for PRD generation
    await page.waitForSelector('[data-testid="prd-complete"]', {
      timeout: 30000
    });
    
    // Review and approve PRD
    await page.click('[data-testid="approve-prd"]');
    
    // Generate project plan
    await page.click('[data-testid="generate-plan"]');
    await page.waitForSelector('[data-testid="plan-complete"]');
    
    // Start build
    await page.click('[data-testid="start-build"]');
    
    // Monitor build progress
    await page.waitForSelector('[data-testid="build-complete"]', {
      timeout: 300000 // 5 minutes
    });
    
    // Verify output
    const buildResult = await page.textContent('[data-testid="build-result"]');
    expect(buildResult).toContain('Build completed successfully');
  });
});
```

### 4.2 Test Data Management

```typescript
// Factory pattern for test data
class TestDataFactory {
  static createUser(overrides?: Partial<User>): User {
    return {
      id: generateId(),
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      ...overrides
    };
  }
  
  static createProject(overrides?: Partial<Project>): Project {
    return {
      id: generateId(),
      name: 'Test Project',
      description: 'Test Description',
      ownerId: generateId(),
      status: 'ACTIVE',
      createdAt: new Date(),
      ...overrides
    };
  }
  
  static createPRD(projectId: string): PRD {
    return {
      id: generateId(),
      projectId,
      content: 'Mock PRD content',
      version: 1,
      createdAt: new Date()
    };
  }
}

// Database seeding for consistent test state
async function seedTestDatabase(db: Database) {
  const users = [
    TestDataFactory.createUser({ email: 'admin@test.com', role: 'admin' }),
    TestDataFactory.createUser({ email: 'user@test.com', role: 'user' })
  ];
  
  await db.users.insertMany(users);
  
  const projects = users.map(user =>
    TestDataFactory.createProject({ ownerId: user.id })
  );
  
  await db.projects.insertMany(projects);
}
```

### 4.3 AI/LLM Testing

```typescript
// Mock AI responses for deterministic tests
class MockAIProvider implements AIProvider {
  private responses: Map<string, CodeResult>;
  
  addMockResponse(promptPattern: RegExp, response: CodeResult) {
    this.responses.set(promptPattern.source, response);
  }
  
  async generateCode(prompt: string, context: Context): Promise<CodeResult> {
    for (const [pattern, response] of this.responses) {
      if (new RegExp(pattern).test(prompt)) {
        return response;
      }
    }
    
    throw new Error(`No mock response for prompt: ${prompt}`);
  }
}

// Snapshot testing for LLM prompts
it('should generate correct PRD prompt', () => {
  const input = TestDataFactory.createUserInput();
  const prompt = generatePRDPrompt(input);
  
  expect(prompt).toMatchSnapshot();
});

// Contract testing for AI providers
describe('AI Provider Contract', () => {
  // Test against real API in staging environment
  it.skip('OpenAI provider matches contract', async () => {
    const provider = new OpenAIProvider(config);
    const result = await provider.generateCode(
      'Create a simple function',
      context
    );
    
    expect(result).toMatchObject({
      code: expect.any(String),
      language: expect.any(String),
      confidence: expect.any(Number)
    });
  });
});
```

### 4.4 Performance Testing

```typescript
// Load testing with Artillery or k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'], // Error rate under 1%
  },
};

export default function () {
  const payload = JSON.stringify({
    projectName: 'Load Test Project',
    description: 'Testing system under load'
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`
    },
  };
  
  let response = http.post(
    'http://api.buildrunnercloud.com/projects',
    payload,
    params
  );
  
  check(response, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

---

## 5. Database & Data Management

### 5.1 Database Design

**Schema Best Practices**
```sql
-- Use appropriate data types
-- Add indexes for frequently queried fields
-- Implement soft deletes
-- Include audit columns

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  
  -- Audit fields
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP, -- Soft delete
  
  -- Indexes
  INDEX idx_projects_owner (owner_id),
  INDEX idx_projects_status (status),
  INDEX idx_projects_created (created_at DESC)
);

-- Store PRD versions for complete history
CREATE TABLE prd_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  version INTEGER NOT NULL,
  content JSONB NOT NULL, -- Use JSONB for flexible structure
  changes JSONB, -- Track what changed
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  UNIQUE(project_id, version),
  INDEX idx_prd_project (project_id, version DESC)
);

-- Store AI provider interactions for debugging and cost tracking
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  provider VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 4),
  request_payload JSONB,
  response_payload JSONB,
  duration_ms INTEGER,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  INDEX idx_ai_project (project_id),
  INDEX idx_ai_provider (provider, created_at),
  INDEX idx_ai_created (created_at DESC)
);
```

### 5.2 Query Optimization

```typescript
// Use indexes effectively
// Good: Uses index on owner_id
const projects = await db.projects.find({
  owner_id: userId,
  status: 'ACTIVE'
});

// Bad: No index on description (full text search)
const projects = await db.projects.find({
  description: { $regex: /keyword/i }
});

// Better: Use full-text search index
const projects = await db.projects.find({
  $text: { $search: 'keyword' }
});

// Pagination with cursor-based approach
async function getProjects(
  userId: string,
  cursor?: string,
  limit: number = 20
): Promise<PaginatedResult<Project>> {
  const query: any = { owner_id: userId };
  
  if (cursor) {
    // Decode cursor to get last seen ID and timestamp
    const { id, createdAt } = decodeCursor(cursor);
    query.$or = [
      { created_at: { $lt: createdAt } },
      { created_at: createdAt, id: { $lt: id } }
    ];
  }
  
  const projects = await db.projects
    .find(query)
    .sort({ created_at: -1, id: -1 })
    .limit(limit + 1); // Fetch one extra to determine if there are more
  
  const hasMore = projects.length > limit;
  const items = hasMore ? projects.slice(0, -1) : projects;
  
  const nextCursor = hasMore
    ? encodeCursor(items[items.length - 1])
    : null;
  
  return { items, nextCursor, hasMore };
}

// Use database transactions for consistency
async function createProjectWithPRD(
  userId: string,
  input: ProjectInput
): Promise<Project> {
  const session = await db.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Create project
      const project = await db.projects.insertOne({
        name: input.name,
        owner_id: userId,
        status: 'DRAFT',
        created_at: new Date()
      }, { session });
      
      // Create initial PRD
      await db.prd_versions.insertOne({
        project_id: project.id,
        version: 1,
        content: {},
        created_at: new Date()
      }, { session });
      
      return project;
    });
  } finally {
    await session.endSession();
  }
}

// Connection pooling
const pool = new Pool({
  host: config.db.host,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 5.3 Caching Strategy

```typescript
// Multi-layer caching
class CacheService {
  constructor(
    private redis: Redis,
    private memoryCache: Map<string, any>
  ) {}
  
  async get<T>(key: string): Promise<T | null> {
    // L1: In-memory cache (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // L2: Redis cache
    const cached = await this.redis.get(key);
    if (cached) {
      const value = JSON.parse(cached);
      this.memoryCache.set(key, value); // Populate L1
      return value;
    }
    
    return null;
  }
  
  async set<T>(
    key: string,
    value: T,
    ttl: number = 3600
  ): Promise<void> {
    const serialized = JSON.stringify(value);
    
    // Set in both layers
    this.memoryCache.set(key, value);
    await this.redis.setex(key, ttl, serialized);
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(pattern)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear Redis cache
    const keys = await this.redis.keys(`${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Cache-aside pattern
async function getProject(projectId: string): Promise<Project> {
  const cacheKey = `project:${projectId}`;
  
  // Try cache first
  let project = await cache.get<Project>(cacheKey);
  
  if (!project) {
    // Cache miss - fetch from database
    project = await db.projects.findById(projectId);
    
    if (project) {
      // Populate cache
      await cache.set(cacheKey, project, 3600);
    }
  }
  
  return project;
}

// Invalidate cache on updates
async function updateProject(
  projectId: string,
  updates: Partial<Project>
): Promise<Project> {
  const updated = await db.projects.update(projectId, updates);
  
  // Invalidate cache
  await cache.invalidate(`project:${projectId}`);
  
  return updated;
}
```

### 5.4 Data Migration Strategy

```typescript
// Version-controlled migrations
// migrations/001_create_projects_table.ts
export async function up(db: Database): Promise<void> {
  await db.query(`
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down(db: Database): Promise<void> {
  await db.query(`DROP TABLE projects;`);
}

// Track migration state
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);

// Migration runner
class MigrationRunner {
  async runMigrations(db: Database): Promise<void> {
    const applied = await this.getAppliedMigrations(db);
    const pending = await this.getPendingMigrations(applied);
    
    for (const migration of pending) {
      console.log(`Applying migration ${migration.version}: ${migration.name}`);
      
      try {
        await migration.up(db);
        await this.recordMigration(db, migration);
        console.log(`Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }
}
```

---

## 6. API Design

### 6.1 RESTful API Best Practices

```typescript
// Versioned API
// v1/routes.ts
const router = express.Router();

// Resource-based URLs
router.get('/projects', listProjects);
router.post('/projects', createProject);
router.get('/projects/:id', getProject);
router.patch('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// Sub-resources
router.get('/projects/:id/prd', getPRD);
router.post('/projects/:id/prd/generate', generatePRD);
router.get('/projects/:id/plan', getProjectPlan);
router.post('/projects/:id/builds', startBuild);
router.get('/projects/:id/builds/:buildId', getBuildStatus);

// Use proper HTTP methods and status codes
async function createProject(req: Request, res: Response) {
  try {
    const validated = validateProjectInput(req.body);
    const project = await projectService.create(req.user.id, validated);
    
    res.status(201).json({
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details
      });
    }
    throw error;
  }
}

// Consistent response format
interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

// Pagination metadata
interface PaginationMeta {
  cursor?: string;
  hasMore: boolean;
  total?: number;
  limit: number;
}

// HATEOAS links for discoverability
interface ProjectResponse extends Project {
  _links: {
    self: { href: string };
    prd: { href: string };
    plan: { href: string };
    builds: { href: string };
  };
}
```

### 6.2 GraphQL API (Optional)

```graphql
type Query {
  project(id: ID!): Project
  projects(
    cursor: String
    limit: Int = 20
    status: ProjectStatus
  ): ProjectConnection!
  
  buildStatus(projectId: ID!, buildId: ID!): Build
}

type Mutation {
  createProject(input: CreateProjectInput!): CreateProjectPayload!
  updateProject(id: ID!, input: UpdateProjectInput!): UpdateProjectPayload!
  generatePRD(projectId: ID!): GeneratePRDPayload!
  startBuild(projectId: ID!): StartBuildPayload!
}

type Subscription {
  buildProgress(buildId: ID!): BuildProgress!
  projectUpdates(projectId: ID!): ProjectUpdate!
}

type Project {
  id: ID!
  name: String!
  description: String
  status: ProjectStatus!
  prd: PRD
  plan: ProjectPlan
  builds: [Build!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ProjectConnection {
  edges: [ProjectEdge!]!
  pageInfo: PageInfo!
}

type ProjectEdge {
  node: Project!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
}
```

### 6.3 WebSocket for Real-time Updates

```typescript
// Socket.IO implementation
import { Server as SocketServer } from 'socket.io';

class RealtimeService {
  private io: SocketServer;
  
  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: config.allowedOrigins,
        credentials: true
      }
    });
    
    this.setupMiddleware();
    this.setupHandlers();
  }
  
  private setupMiddleware() {
    // Authenticate socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await verifyToken(token);
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }
  
  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Subscribe to project updates
      socket.on('subscribe:project', async (projectId: string) => {
        // Verify user has access to project
        const hasAccess = await this.verifyProjectAccess(
          socket.data.user.id,
          projectId
        );
        
        if (hasAccess) {
          socket.join(`project:${projectId}`);
        } else {
          socket.emit('error', { message: 'Access denied' });
        }
      });
      
      // Subscribe to build updates
      socket.on('subscribe:build', async (buildId: string) => {
        const hasAccess = await this.verifyBuildAccess(
          socket.data.user.id,
          buildId
        );
        
        if (hasAccess) {
          socket.join(`build:${buildId}`);
        }
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  // Emit updates to subscribed clients
  emitBuildProgress(buildId: string, progress: BuildProgress) {
    this.io.to(`build:${buildId}`).emit('build:progress', progress);
  }
  
  emitProjectUpdate(projectId: string, update: ProjectUpdate) {
    this.io.to(`project:${projectId}`).emit('project:update', update);
  }
}
```

---

## 7. AI/LLM Integration Best Practices

### 7.1 Prompt Engineering

```typescript
// Template-based prompt construction
class PromptBuilder {
  private templates: Map<string, string> = new Map();
  
  constructor() {
    this.loadTemplates();
  }
  
  private loadTemplates() {
    this.templates.set('prd', `
You are a senior product manager creating a Product Requirements Document.

Project Context:
Name: {{projectName}}
Description: {{description}}
Target Platform: {{platform}}
User Requirements: {{requirements}}

Generate a comprehensive PRD that includes:
1. Executive Summary
2. Goals and Objectives
3. User Stories
4. Functional Requirements
5. Non-Functional Requirements
6. Technical Constraints
7. Success Metrics

Format the output as structured JSON with the following schema:
{
  "executiveSummary": "string",
  "goals": ["string"],
  "userStories": [{"as": "string", "want": "string", "so": "string"}],
  "functionalRequirements": [{"id": "string", "description": "string", "priority": "high|medium|low"}],
  "nonFunctionalRequirements": ["string"],
  "technicalConstraints": ["string"],
  "successMetrics": [{"metric": "string", "target": "string"}]
}
    `);
    
    this.templates.set('projectPlan', `
You are a senior engineering manager creating a project plan.

PRD Summary:
{{prdSummary}}

Technical Stack: {{techStack}}
Team Size: {{teamSize}}
Timeline: {{timeline}}

Generate a detailed project plan with phases, milestones, and tasks.
Include time estimates and dependencies between tasks.

Output Format: JSON with phases array, each containing tasks with estimates.
    `);
  }
  
  build(templateName: string, variables: Record<string, any>): string {
    let template = this.templates.get(templateName);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      template = template.replace(
        new RegExp(placeholder, 'g'),
        String(value)
      );
    }
    
    return template;
  }
}

// Few-shot learning for better results
const fewShotExamples = [
  {
    input: "Build a todo app with user authentication",
    output: {
      executiveSummary: "A task management application...",
      goals: ["Enable users to track tasks", "Secure user data"],
      // ... complete example
    }
  },
  {
    input: "Create an e-commerce platform",
    output: {
      // ... another complete example
    }
  }
];

function buildPromptWithExamples(
  userInput: string,
  examples: Example[]
): string {
  let prompt = "Here are examples of high-quality PRDs:\n\n";
  
  examples.forEach((example, i) => {
    prompt += `Example ${i + 1}:\n`;
    prompt += `Input: ${example.input}\n`;
    prompt += `Output: ${JSON.stringify(example.output, null, 2)}\n\n`;
  });
  
  prompt += `Now generate a PRD for this input:\n${userInput}\n`;
  
  return prompt;
}
```

### 7.2 LLM Response Validation

```typescript
// Validate and sanitize LLM outputs
class ResponseValidator {
  validatePRD(response: any): PRD {
    const schema = z.object({
      executiveSummary: z.string().min(50).max(1000),
      goals: z.array(z.string()).min(1).max(10),
      userStories: z.array(z.object({
        as: z.string(),
        want: z.string(),
        so: z.string()
      })).min(1),
      functionalRequirements: z.array(z.object({
        id: z.string(),
        description: z.string(),
        priority: z.enum(['high', 'medium', 'low'])
      })).min(1),
      nonFunctionalRequirements: z.array(z.string()),
      technicalConstraints: z.array(z.string()),
      successMetrics: z.array(z.object({
        metric: z.string(),
        target: z.string()
      }))
    });
    
    try {
      return schema.parse(response);
    } catch (error) {
      throw new ValidationError('Invalid PRD format from LLM', error);
    }
  }
  
  // Check for harmful or inappropriate content
  validateContent(text: string): void {
    const inappropriate = [
      /malware/i,
      /exploit/i,
      /vulnerability/i,
      /hack\s+into/i,
      /ddos/i
    ];
    
    for (const pattern of inappropriate) {
      if (pattern.test(text)) {
        throw new ContentValidationError(
          'Response contains inappropriate content'
        );
      }
    }
  }
  
  // Ensure JSON is properly formatted
  parseJSON(text: string): any {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;
    
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      // Try to fix common JSON issues
      const fixed = this.fixCommonJSONIssues(jsonText);
      return JSON.parse(fixed);
    }
  }
  
  private fixCommonJSONIssues(text: string): string {
    // Remove trailing commas
    let fixed = text.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix unquoted keys
    fixed = fixed.replace(/(\{|\,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, 
      '$1"$2":');
    
    return fixed;
  }
}
```

### 7.3 Cost Management & Token Optimization

```typescript
class TokenManager {
  // Estimate tokens before sending to API
  estimateTokens(text: string, model: string): number {
    // Rough estimation: ~4 characters per token for English
    const baseEstimate = Math.ceil(text.length / 4);
    
    // Adjust for model-specific encoding
    const multipliers: Record<string, number> = {
      'gpt-4': 1.0,
      'gpt-3.5-turbo': 1.0,
      'claude-3': 1.0
    };
    
    return Math.ceil(baseEstimate * (multipliers[model] || 1.0));
  }
  
  // Track and limit token usage
  async checkTokenBudget(
    userId: string,
    estimatedTokens: number
  ): Promise<boolean> {
    const usage = await this.getUserTokenUsage(userId);
    const limit = await this.getUserTokenLimit(userId);
    
    return (usage + estimatedTokens) <= limit;
  }
  
  // Implement token budget per user/project
  async recordTokenUsage(
    userId: string,
    projectId: string,
    tokens: number,
    cost: number
  ): Promise<void> {
    await db.tokenUsage.insert({
      user_id: userId,
      project_id: projectId,
      tokens,
      cost_usd: cost,
      timestamp: new Date()
    });
    
    // Update running totals in cache
    await cache.increment(`token_usage:${userId}`, tokens);
  }
  
  // Optimize prompts to reduce token usage
  optimizePrompt(prompt: string, maxTokens: number): string {
    const estimated = this.estimateTokens(prompt, 'gpt-4');
    
    if (estimated <= maxTokens) {
      return prompt;
    }
    
    // Truncate or summarize if too long
    const ratio = maxTokens / estimated;
    const targetLength = Math.floor(prompt.length * ratio * 0.9); // 90% safety
    
    return prompt.substring(0, targetLength) + '...';
  }
}

// Cost tracking per API call
class CostTracker {
  private pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'claude-3-opus': { input: 0.015, output: 0.075 }
  };
  
  calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const rates = this.pricing[model];
    if (!rates) return 0;
    
    const inputCost = (inputTokens / 1000) * rates.input;
    const outputCost = (outputTokens / 1000) * rates.output;
    
    return inputCost + outputCost;
  }
  
  async generateCostReport(
    startDate: Date,
    endDate: Date
  ): Promise<CostReport> {
    const usage = await db.aiInteractions.aggregate([
      {
        $match: {
          created_at: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$provider',
          totalCost: { $sum: '$cost_usd' },
          totalRequests: { $sum: 1 },
          totalTokens: {
            $sum: { $add: ['$prompt_tokens', '$completion_tokens'] }
          }
        }
      }
    ]);
    
    return { usage, startDate, endDate };
  }
}
```

### 7.4 Fallback & Redundancy

```typescript
// Multi-provider fallback strategy
class ResilientAIOrchestrator {
  private providers: AIProvider[];
  
  constructor(providers: AIProvider[]) {
    this.providers = providers; // Ordered by preference
  }
  
  async generateWithFallback(
    prompt: string,
    context: Context
  ): Promise<CodeResult> {
    let lastError: Error;
    
    for (const provider of this.providers) {
      try {
        // Check provider health
        const health = await provider.getHealthStatus();
        if (health.status !== 'healthy') {
          continue;
        }
        
        // Attempt generation
        const result = await provider.generateCode(prompt, context);
        
        // Validate result
        if (this.isValidResult(result)) {
          return result;
        }
      } catch (error) {
        lastError = error;
        logger.warn(`Provider ${provider.name} failed, trying next`, {
          error,
          provider: provider.name
        });
        continue;
      }
    }
    
    throw new AIProviderError(
      'All providers failed',
      'multiple',
      lastError!
    );
  }
  
  private isValidResult(result: CodeResult): boolean {
    return result.code &&
           result.code.length > 0 &&
           result.confidence > 0.5;
  }
}

// Circuit breaker pattern for failing providers
class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Check if timeout has passed
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

---

## 8. Performance Optimization

### 8.1 Async Processing & Job Queues

```typescript
// Use Bull for job queues
import Queue from 'bull';

const prdGenerationQueue = new Queue('prd-generation', {
  redis: {
    host: config.redis.host,
    port: config.redis.port
  }
});

// Producer: Add jobs to queue
async function queuePRDGeneration(
  projectId: string,
  input: UserInput
): Promise<string> {
  const job = await prdGenerationQueue.add({
    projectId,
    input
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false
  });
  
  return job.id;
}

// Consumer: Process jobs
prdGenerationQueue.process(async (job) => {
  const { projectId, input } = job.data;
  
  try {
    // Update progress
    await job.progress(10);
    
    // Generate PRD
    const prd = await aiService.generatePRD(input);
    await job.progress(60);
    
    // Save to database
    await prdRepository.save(projectId, prd);
    await job.progress(90);
    
    // Notify user via WebSocket
    realtimeService.emitProjectUpdate(projectId, {
      type: 'prd_complete',
      prd
    });
    
    await job.progress(100);
    
    return { success: true, prd };
  } catch (error) {
    logger.error('PRD generation failed', { projectId, error });
    throw error; // Will trigger retry
  }
});

// Monitor queue health
prdGenerationQueue.on('failed', (job, error) => {
  logger.error('Job failed', {
    jobId: job.id,
    error,
    attempts: job.attemptsMade
  });
  
  // Alert if too many failures
  if (job.attemptsMade >= 3) {
    alerting.sendAlert({
      severity: 'high',
      message: `Job ${job.id} failed after 3 attempts`,
      error
    });
  }
});
```

### 8.2 Caching Strategies

```typescript
// Memoization for expensive computations
import memoizee from 'memoizee';

const estimateProjectComplexity = memoizee(
  async (requirements: string[]): Promise<number> => {
    // Expensive AI call
    return await aiService.estimateComplexity(requirements);
  },
  {
    promise: true,
    maxAge: 3600000, // 1 hour
    max: 100 // Cache up to 100 results
  }
);

// Response caching with ETag
app.get('/api/projects/:id/prd', async (req, res) => {
  const projectId = req.params.id;
  const prd = await prdService.get(projectId);
  
  // Generate ETag from content hash
  const etag = generateETag(prd);
  
  // Check If-None-Match header
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'private, max-age=300');
  res.json(prd);
});

// HTTP caching headers
app.use((req, res, next) => {
  // Static assets
  if (req.path.startsWith('/static/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // API responses
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'private, no-cache, must-revalidate');
  }
  
  next();
});
```

### 8.3 Database Optimization

```typescript
// Query batching to reduce round trips
class DataLoader {
  private batches: Map<string, Promise<any[]>> = new Map();
  
  async load(id: string): Promise<any> {
    const batchKey = this.getCurrentBatchKey();
    
    if (!this.batches.has(batchKey)) {
      const promise = this.executeBatch();
      this.batches.set(batchKey, promise);
      
      // Clear batch after execution
      process.nextTick(() => {
        this.batches.delete(batchKey);
      });
    }
    
    const results = await this.batches.get(batchKey)!;
    return results.find(r => r.id === id);
  }
  
  private async executeBatch(): Promise<any[]> {
    // Collect all IDs requested in this batch
    const ids = Array.from(this.pendingIds);
    this.pendingIds.clear();
    
    // Single query for all IDs
    return await db.query('SELECT * FROM items WHERE id IN (?)', [ids]);
  }
}

// Connection pooling best practices
const poolConfig = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000
};

// Use read replicas for read-heavy operations
class DatabaseRouter {
  constructor(
    private master: Database,
    private replicas: Database[]
  ) {}
  
  async read<T>(query: string, params?: any[]): Promise<T> {
    // Round-robin load balancing
    const replica = this.selectReplica();
    return await replica.query(query, params);
  }
  
  async write<T>(query: string, params?: any[]): Promise<T> {
    return await this.master.query(query, params);
  }
  
  private selectReplica(): Database {
    const index = Math.floor(Math.random() * this.replicas.length);
    return this.replicas[index];
  }
}
```

### 8.4 Frontend Performance

```typescript
// Code splitting and lazy loading
const ProjectEditor = lazy(() => import('./components/ProjectEditor'));
const AIAssistant = lazy(() => import('./components/AIAssistant'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Router>
        <Route path="/project/:id" component={ProjectEditor} />
        <Route path="/assistant" component={AIAssistant} />
      </Router>
    </Suspense>
  );
}

// Debounce expensive operations
import { debounce } from 'lodash';

const debouncedSave = debounce(async (content: string) => {
  await api.savePRD(content);
}, 1000);

// Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={projects.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ProjectCard project={projects[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}

// Image optimization
function OptimizedImage({ src, alt }: ImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      srcSet={`
        ${src}?w=400 400w,
        ${src}?w=800 800w,
        ${src}?w=1200 1200w
      `}
      sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
    />
  );
}
```

---

## 9. Deployment & DevOps

### 9.1 Containerization

```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built app from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml for local development
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/buildrunner
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
    command: npm run dev

  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=buildrunner
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  worker:
    build: .
    command: npm run worker
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/buildrunner
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 9.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      
      - name: Build application
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t buildrunnercloud:${{ github.sha }} .

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'buildrunnercloud:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: buildrunnercloud
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster production \
            --service buildrunnercloud-api \
            --force-new-deployment
      
      - name: Run database migrations
        run: npm run migrate:prod
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          API_URL: https://api.buildrunnercloud.com
```

### 9.3 Infrastructure as Code

```terraform
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "buildrunnercloud-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "buildrunnercloud-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Environment = "production"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "buildrunnercloud-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier             = "buildrunnercloud-db"
  engine                = "postgres"
  engine_version        = "15"
  instance_class        = "db.t3.medium"
  allocated_storage     = 100
  storage_type          = "gp3"
  storage_encrypted     = true
  
  db_name  = "buildrunner"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "buildrunnercloud-final-snapshot"
  
  tags = {
    Environment = "production"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "main" {
  cluster_id           = "buildrunnercloud-redis"
  engine              = "redis"
  engine_version      = "7.0"
  node_type           = "cache.t3.medium"
  num_cache_nodes     = 1
  parameter_group_name = "default.redis7"
  port                = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  
  tags = {
    Environment = "production"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "buildrunnercloud-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = true
  
  tags = {
    Environment = "production"
  }
}

# Auto Scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy" {
  name               = "cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace
  
  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
```

### 9.4 Monitoring & Alerting

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'buildrunnercloud-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts.yml'
```

```yaml
# prometheus/alerts.yml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% over the last 5 minutes"
      
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"
      
      - alert: LowAvailability
        expr: up{job="buildrunnercloud-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "API service has been down for more than 1 minute"

  - name: database_alerts
    interval: 30s
    rules:
      - alert: HighDatabaseConnections
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection usage"
          description: "Database connections at {{ $value }}% capacity"
      
      - alert: SlowQueries
        expr: rate(pg_stat_statements_mean_time_seconds[5m]) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"
          description: "Average query time is {{ $value }}s"

  - name: cost_alerts
    interval: 1h
    rules:
      - alert: HighAICosts
        expr: sum(rate(ai_cost_usd_total[1h])) * 24 * 30 > 10000
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "High AI API costs"
          description: "Projected monthly AI costs: ${{ $value }}"
```

```typescript
// Structured logging for observability
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'buildrunnercloud-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Custom metrics
import { register, Counter, Histogram, Gauge } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware to collect metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || 'unknown'
    }, duration);
  });
  
  next();
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## 10. Documentation

### 10.1 API Documentation

```typescript
// Use OpenAPI/Swagger specification
/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project with the provided details
 *     tags:
 *       - Projects
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectInput'
 *           example:
 *             name: "My Awesome App"
 *             description: "A task management application"
 *             requirements:
 *               - "User authentication"
 *               - "Real-time notifications"
 *             targetPlatform: "web"
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/projects', authenticate(), createProject);

// Generate interactive docs
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BuildRunnerCloud API',
      version: '1.0.0',
      description: 'API for AI-powered application development'
    },
    servers: [
      {
        url: 'https://api.buildrunnercloud.com',
        description: 'Production'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 10.2 Code Documentation

```typescript
/**
 * OrchestrationService coordinates multiple AI providers to generate
 * comprehensive project requirements and plans.
 * 
 * @example
 * ```typescript
 * const service = new OrchestrationService(providers, repository);
 * const prd = await service.generatePRD({
 *   projectName: 'My App',
 *   description: 'A mobile app for tracking fitness goals',
 *   requirements: ['User registration', 'Activity tracking']
 * });
 * ```
 */
export class OrchestrationService {
  /**
   * Creates a new OrchestrationService instance
   * 
   * @param providers - Array of AI providers to use for generation
   * @param repository - Repository for persisting PRDs and plans
   * @param config - Optional configuration overrides
   */
  constructor(
    private providers: AIProvider[],
    private repository: Repository,
    private config?: OrchestrationConfig
  ) {
    this.validateProviders();
  }
  
  /**
   * Generates a Product Requirements Document from user input
   * 
   * This method orchestrates multiple AI calls to create a comprehensive PRD:
   * 1. Analyzes user requirements
   * 2. Generates functional specifications
   * 3. Identifies technical constraints
   * 4. Proposes success metrics
   * 
   * @param input - User's project description and requirements
   * @returns Promise resolving to the generated PRD
   * @throws {ValidationError} If input is invalid
   * @throws {AIProviderError} If all AI providers fail
   * @throws {OrchestrationError} If PRD generation fails
   * 
   * @example
   * ```typescript
   * const prd = await service.generatePRD({
   *   projectName: 'TaskMaster',
   *   description: 'A collaborative task management tool',
   *   requirements: ['Real-time collaboration', 'Mobile support'],
   *   targetPlatform: 'web'
   * });
   * ```
   */
  async generatePRD(input: UserInput): Promise<PRD> {
    // Implementation...
  }
}
```

### 10.3 Architecture Documentation

Create comprehensive architecture documentation using diagrams and markdown:

```markdown
# BuildRunnerCloud Architecture

## System Overview

BuildRunnerCloud is a cloud-based platform that enables non-technical users to 
create complex applications through AI-powered orchestration.

## High-Level Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│   API GW    │
│   (ALB)     │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│     API     │  │   Worker    │
│  Service    │  │   Service   │
└──────┬──────┘  └──────┬──────┘
       │                │
       ├────────────────┤
       │                │
       ▼                ▼
┌─────────────────────────┐
│     PostgreSQL DB       │
└─────────────────────────┘
       │
       │
       ▼
┌─────────────────────────┐
│     Redis Cache         │
└─────────────────────────┘
```

## Data Flow

### PRD Generation Flow

1. User submits project description
2. API validates and queues generation job
3. Worker picks up job and calls orchestration service
4. Orchestration service:
   - Selects optimal AI provider
   - Constructs prompt with templates
   - Calls AI provider with retry logic
   - Validates and structures response
   - Saves PRD to database
5. User notified via WebSocket of completion

### Security Model

- JWT-based authentication
- Role-based access control (RBAC)
- API keys stored in AWS Secrets Manager
- All data encrypted at rest and in transit
- Rate limiting per user and IP
```

---

## 11. Final Checklist

Before deploying to production, ensure all of these are implemented:

### Code Quality
- [ ] All code follows consistent style guide
- [ ] TypeScript strict mode enabled
- [ ] No console.log statements (use structured logging)
- [ ] All functions have clear single responsibility
- [ ] No magic numbers or hardcoded values
- [ ] Error handling implemented everywhere
- [ ] Input validation on all user inputs

### Testing
- [ ] Unit test coverage > 80%
- [ ] Integration tests for critical flows
- [ ] End-to-end tests for user journeys
- [ ] Load testing completed
- [ ] Security testing (penetration testing)
- [ ] All tests passing in CI/CD

### Security
- [ ] Authentication implemented
- [ ] Authorization checks on all endpoints
- [ ] API keys secured in vault
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Dependency vulnerability scanning

### Performance
- [ ] Database queries optimized
- [ ] Indexes added for frequent queries
- [ ] Caching implemented
- [ ] Async processing for long operations
- [ ] Connection pooling configured
- [ ] CDN configured for static assets
- [ ] Response times < 500ms for 95th percentile

### Monitoring
- [ ] Structured logging implemented
- [ ] Metrics collection configured
- [ ] Distributed tracing enabled
- [ ] Alerts configured for critical issues
- [ ] Dashboards created for key metrics
- [ ] On-call rotation established

### Documentation
- [ ] API documentation complete (OpenAPI/Swagger)
- [ ] Architecture documentation written
- [ ] Deployment guide created
- [ ] Runbook for common issues
- [ ] Code comments for complex logic
- [ ] README with setup instructions

### Operations
- [ ] CI/CD pipeline configured
- [ ] Infrastructure as code (Terraform)
- [ ] Database backup strategy
- [ ] Disaster recovery plan
- [ ] Rollback procedure documented
- [ ] Health checks implemented
- [ ] Graceful shutdown handling

### Compliance
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Audit logging

---

## Summary

This guide provides a comprehensive foundation for building BuildRunnerCloud with production-grade quality. Key principles to remember:

1. **Security First**: Never compromise on security. Validate inputs, encrypt data, manage secrets properly
2. **Observability**: You can't fix what you can't see. Log, monitor, and alert comprehensively
3. **Resilience**: Expect failures. Implement retries, circuit breakers, and graceful degradation
4. **Performance**: Optimize early. Use caching, async processing, and efficient queries
5. **Testing**: Test thoroughly. Unit, integration, and E2E tests prevent regressions
6. **Documentation**: Document everything. Future you (and your team) will thank you
7. **Consistency**: Follow patterns consistently across the codebase
8. **Simplicity**: Keep it simple. Complex code is hard to maintain

Good luck building BuildRunnerCloud! 🚀
