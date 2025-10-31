# Enterprise AI Automation & Cross-Agent Orchestration

BuildRunner provides a comprehensive multi-agent automation platform that enables sophisticated workflows spanning multiple AI agents with human-in-the-loop controls, observability, and enterprise-grade safety measures.

## Overview

The orchestration system provides:
- **Multi-Agent Workflows**: Coordinate multiple specialized AI agents in complex workflows
- **Human-in-the-Loop Gates**: Approval and review checkpoints for critical operations
- **Observability & Monitoring**: Comprehensive tracing, logging, and metrics
- **Budget & Cost Controls**: Granular cost management and enforcement
- **Safety & Compliance**: Security controls, audit trails, and policy enforcement
- **Agent Marketplace**: Curated ecosystem of agents and tools

## Architecture

### Agent Types

BuildRunner supports several specialized agent types:

```typescript
// Core agent types
interface Agent {
  id: string;
  slug: string;
  title: string;
  type: 'planner' | 'builder' | 'qa' | 'docs' | 'governance' | 'cost' | 'integration' | 'custom';
  capabilities: string[];
  config: {
    model: string;
    temperature: number;
    max_tokens?: number;
    tools: string[];
  };
  enabled: boolean;
}
```

**Agent Capabilities:**

- **Planner Agent**: Project planning, task breakdown, estimation
- **Builder Agent**: Code generation, implementation, refactoring
- **QA Agent**: Testing, validation, bug detection
- **Docs Agent**: Documentation generation, explanation, tutorials
- **Governance Agent**: Policy compliance, audit, governance checks
- **Cost Agent**: Cost analysis, optimization, budgeting
- **Integration Agent**: Third-party integrations, API management

### Tool System

Agents access capabilities through a scoped tool system:

```typescript
interface Tool {
  id: string;
  slug: string;
  title: string;
  category: 'git' | 'deployment' | 'communication' | 'analysis' | 'testing' | 'documentation' | 'monitoring';
  config: any;
  auth_required: boolean;
  rate_limit_per_hour: number;
  cost_per_use_usd: number;
}

// Agent-tool associations with scopes
interface AgentTool {
  agent_id: string;
  tool_id: string;
  scopes: string[];  // e.g., ['read', 'write', 'admin']
  permissions: any;
}
```

**Available Tools:**
- **Git Operations**: Repository management, version control
- **GitHub/GitLab**: Issue tracking, PR management
- **Deployment**: Vercel, AWS, Docker deployments
- **Communication**: Slack, email, notifications
- **Documentation**: Notion, Confluence integration
- **Monitoring**: Analytics, logging, alerting

## Workflow Specification

### Workflow Definition

Workflows are defined using a DAG (Directed Acyclic Graph) format:

```json
{
  "metadata": {
    "name": "Full Development Cycle",
    "description": "Complete development workflow from idea to deployment",
    "version": "1.0.0",
    "sla_ms": 3600000,
    "budget_usd": 10.0
  },
  "nodes": [
    {
      "id": "plan",
      "type": "agent_task",
      "agent_type": "planner",
      "name": "Create Project Plan",
      "config": {
        "prompt_template": "plan_project",
        "output_format": "structured"
      },
      "timeout_ms": 300000,
      "dependencies": []
    },
    {
      "id": "approval_gate",
      "type": "approval_gate",
      "name": "Review Plan",
      "config": {
        "required_role": "TenantAdmin",
        "timeout_hours": 24
      },
      "dependencies": ["plan"]
    },
    {
      "id": "implement",
      "type": "agent_task",
      "agent_type": "builder",
      "name": "Implement Code",
      "config": {
        "prompt_template": "implement_features",
        "tools": ["git", "github"]
      },
      "dependencies": ["approval_gate"]
    }
  ],
  "edges": [
    {
      "from": "plan",
      "to": "approval_gate",
      "condition": "success"
    },
    {
      "from": "approval_gate",
      "to": "implement",
      "condition": "approved"
    }
  ]
}
```

### Node Types

**Agent Task:**
- Executes AI agent with specific prompt and tools
- Configurable timeout and retry policies
- Input/output data transformation

**Approval Gate:**
- Human-in-the-loop checkpoint
- Role-based approval requirements
- Timeout and escalation policies

**Condition:**
- Conditional branching based on previous outputs
- Support for complex logic expressions
- Dynamic workflow routing

**Parallel:**
- Execute multiple tasks concurrently
- Wait for all or subset completion
- Resource allocation and limits

## Orchestrator Engine

### Execution Model

The orchestrator uses a durable queue system for reliable execution:

```typescript
class WorkflowOrchestrator {
  async createRun(workflowId: string, inputData: any): Promise<string> {
    const run = await this.db.workflow_runs.insert({
      workflow_id: workflowId,
      status: 'queued',
      input_data: inputData,
      sla_ms: workflow.sla_ms
    });
    
    await this.scheduleNextTasks(run.id);
    return run.id;
  }
  
  async scheduleNextTasks(runId: string): Promise<void> {
    const readyTasks = await this.getReadyTasks(runId);
    
    for (const task of readyTasks) {
      await this.queueTask(task);
    }
  }
  
  async executeTask(taskId: string): Promise<void> {
    const task = await this.getTask(taskId);
    
    try {
      // Check budget limits
      await this.checkBudgetLimits(task);
      
      // Execute with appropriate agent
      const result = await this.executeWithAgent(task);
      
      // Update task status and output
      await this.completeTask(taskId, result);
      
      // Schedule next tasks
      await this.scheduleNextTasks(task.run_id);
      
    } catch (error) {
      await this.failTask(taskId, error);
    }
  }
}
```

### Retry and Error Handling

**Retry Policies:**
- Exponential backoff with jitter
- Maximum retry attempts per task
- Different retry strategies per error type
- Circuit breaker for external services

**Error Classification:**
```typescript
enum ErrorType {
  TRANSIENT = 'transient',      // Network, rate limits
  PERMANENT = 'permanent',      // Invalid input, auth
  BUDGET = 'budget',           // Cost limits exceeded
  TIMEOUT = 'timeout',         // SLA breach
  POLICY = 'policy'            // Governance violation
}
```

## Human-in-the-Loop Gates

### Approval Workflows

Approval gates provide human oversight for critical operations:

```typescript
interface ApprovalGate {
  task_id: string;
  required_role: string[];
  timeout_hours: number;
  escalation_policy: {
    levels: Array<{
      after_hours: number;
      assignees: string[];
      channels: string[];
    }>;
  };
  approval_criteria: {
    require_justification: boolean;
    require_two_person_rule: boolean;
    allowed_actions: string[];
  };
}
```

**Approval Process:**
1. Task reaches approval gate
2. Notification sent to required approvers
3. Approver reviews context and makes decision
4. Justification and audit trail recorded
5. Workflow continues or terminates based on decision

**Escalation Policies:**
- Automatic escalation after timeout
- Multiple escalation levels
- Integration with communication channels
- Override capabilities for emergencies

## Observability & Monitoring

### Distributed Tracing

OpenTelemetry-compatible tracing for workflow execution:

```typescript
interface ExecutionSpan {
  span_id: string;
  trace_id: string;
  parent_span_id?: string;
  operation_name: string;
  start_time: Date;
  end_time?: Date;
  duration_ms?: number;
  status: 'success' | 'error' | 'timeout';
  tags: Record<string, any>;
  logs: Array<{
    timestamp: Date;
    level: string;
    message: string;
    fields: Record<string, any>;
  }>;
}
```

**Trace Hierarchy:**
- Workflow Run (root span)
  - Task Execution (child spans)
    - Agent Invocation
    - Tool Usage
    - External API Calls

### Metrics Collection

**Performance Metrics:**
- Task execution time
- Queue depth and wait times
- Agent response times
- Tool usage patterns
- Error rates by type

**Business Metrics:**
- Workflow success rates
- Cost per execution
- SLA compliance
- User satisfaction scores
- Resource utilization

**Custom Metrics:**
```typescript
// Example custom metrics
await metrics.counter('workflow.tasks.completed', {
  agent_type: 'builder',
  workflow_id: 'deploy-app',
  status: 'success'
});

await metrics.histogram('workflow.execution.duration', duration_ms, {
  workflow_type: 'development',
  complexity: 'high'
});
```

## Budget & Cost Management

### Budget Controls

Granular cost management at multiple levels:

```typescript
interface Budget {
  id: string;
  workflow_id?: string;
  tenant_id?: string;
  name: string;
  monthly_usd: number;
  daily_usd: number;
  per_run_usd: number;
  hard_cap: boolean;
  alert_threshold_percent: number;
  current_month_spent: number;
  current_day_spent: number;
}
```

**Budget Enforcement:**
- Pre-execution budget checks
- Real-time cost tracking
- Automatic workflow suspension on limit breach
- Override capabilities with approval
- Cost attribution to teams/projects

**Cost Optimization:**
- Model selection based on cost/performance
- Intelligent tool routing
- Batch processing for efficiency
- Resource pooling and sharing

### Cost Attribution

Detailed cost tracking for transparency:

```typescript
interface CostBreakdown {
  run_id: string;
  total_cost_usd: number;
  breakdown: {
    agent_costs: Array<{
      agent_type: string;
      task_count: number;
      total_cost: number;
      avg_cost_per_task: number;
    }>;
    tool_costs: Array<{
      tool_name: string;
      usage_count: number;
      total_cost: number;
    }>;
    infrastructure_costs: {
      compute: number;
      storage: number;
      network: number;
    };
  };
}
```

## Safety & Security

### Security Controls

**Access Control:**
- Role-based agent execution
- Tenant isolation
- Data domain separation
- Audit trail for all operations

**Data Protection:**
- Encryption at rest and in transit
- PII redaction in logs
- Secure secret management
- Data retention policies

**Policy Enforcement:**
```typescript
interface SecurityPolicy {
  agent_restrictions: {
    allowed_tools: string[];
    forbidden_operations: string[];
    data_access_domains: string[];
  };
  execution_limits: {
    max_concurrent_tasks: number;
    max_execution_time_hours: number;
    max_cost_per_run_usd: number;
  };
  compliance_requirements: {
    audit_all_operations: boolean;
    require_approval_for: string[];
    data_retention_days: number;
  };
}
```

### Governance Integration

**Policy Compliance:**
- Automatic policy validation
- Governance agent oversight
- Compliance reporting
- Violation detection and response

**Audit Trail:**
- Immutable execution logs
- Decision point recording
- User action tracking
- Compliance evidence collection

## Agent Marketplace

### Agent Packaging

Agents are packaged as bundles with standardized structure:

```
agent-bundle/
├── manifest.json          # Agent metadata and requirements
├── prompts/              # Prompt templates
│   ├── main.txt
│   └── fallback.txt
├── tools.json            # Tool configurations
├── policies.json         # Security and governance policies
├── tests/               # Test cases and validation
│   ├── unit/
│   └── integration/
└── docs/                # Documentation
    ├── README.md
    └── examples/
```

**Manifest Structure:**
```json
{
  "name": "advanced-qa-agent",
  "version": "2.1.0",
  "description": "Advanced QA agent with comprehensive testing capabilities",
  "author": "BuildRunner Team",
  "license": "MIT",
  "requirements": {
    "min_buildrunner_version": "2.3.0",
    "required_tools": ["git", "github", "testing-framework"],
    "optional_tools": ["jira", "slack"],
    "min_budget_per_run_usd": 0.50
  },
  "capabilities": [
    "unit_testing",
    "integration_testing",
    "performance_testing",
    "security_scanning"
  ],
  "configuration": {
    "model": "gpt-4",
    "temperature": 0.2,
    "max_tokens": 4000
  }
}
```

### Installation & Governance

**Security Scanning:**
- Automated security analysis
- Policy compliance verification
- Dependency vulnerability scanning
- Code quality assessment

**Approval Process:**
1. Agent submitted to marketplace
2. Automated security and policy scan
3. Manual review by governance team
4. Testing in sandbox environment
5. Approval and publication
6. Installation with tenant approval

## API Reference

### Workflow Management

```typescript
// Create workflow
POST /api/workflows
{
  "slug": "deploy-app",
  "title": "Deploy Application",
  "spec": { /* workflow definition */ },
  "version": "1.0.0"
}

// Start workflow run
POST /api/workflows/{id}/runs
{
  "input_data": { /* initial data */ },
  "priority": 0
}

// Get run status
GET /api/workflows/runs/{runId}

// Control run
POST /api/workflows/runs/{runId}/abort
POST /api/workflows/runs/{runId}/retry
```

### Agent Management

```typescript
// List agents
GET /api/agents

// Create agent
POST /api/agents
{
  "slug": "custom-agent",
  "title": "Custom Agent",
  "type": "custom",
  "config": { /* agent config */ }
}

// Update agent
PUT /api/agents/{id}

// Assign tools to agent
POST /api/agents/{id}/tools
{
  "tool_id": "git-tool",
  "scopes": ["read", "write"]
}
```

### Approval Management

```typescript
// Get pending approvals
GET /api/approvals/pending

// Approve task
POST /api/approvals/{id}/approve
{
  "justification": "Reviewed and approved for production deployment"
}

// Reject task
POST /api/approvals/{id}/reject
{
  "reason": "Security concerns with proposed changes"
}
```

## Configuration

### Environment Variables

```bash
# Orchestrator settings
ORCHESTRATOR_ENABLED=true
MAX_CONCURRENT_WORKFLOWS=100
DEFAULT_SLA_MS=900000
MAX_RETRIES=3

# Budget settings
DEFAULT_BUDGET_PER_RUN_USD=2.00
BUDGET_ENFORCEMENT=hard_cap
COST_TRACKING_ENABLED=true

# Security settings
REQUIRE_APPROVAL_FOR_PROD=true
AUDIT_ALL_OPERATIONS=true
PII_REDACTION_ENABLED=true

# Agent settings
MAX_AGENTS_PER_TENANT=50
AGENT_TIMEOUT_MS=300000
TOOL_RATE_LIMITING=true
```

### Policy Configuration

```yaml
# governance/policy.yml
enterprise_automation:
  agents:
    allowed_types: ["planner", "builder", "qa", "docs", "governance", "cost", "integration"]
    default_budget_per_run_usd: 2.00
    max_retries: 3
    
  workflows:
    require_human_gates: ["prod_deploy", "db_migration"]
    run_sla_ms: 900000
    max_concurrent_runs: 100
    
  budgets:
    enforcement: "hard_cap"
    alert_at_percent: 80
    require_approval_for_overrides: true
    
  security:
    audit_trail_required: true
    pii_domains: ["customer_data", "secrets"]
    require_role_based_execution: true
```

## Best Practices

### Workflow Design

**Modularity:**
- Break complex workflows into smaller, reusable components
- Use clear naming conventions for tasks and agents
- Document dependencies and data flow

**Error Handling:**
- Design for failure with appropriate retry policies
- Include rollback mechanisms for critical operations
- Use circuit breakers for external dependencies

**Performance:**
- Optimize task granularity for efficiency
- Use parallel execution where possible
- Monitor and tune resource allocation

### Security

**Principle of Least Privilege:**
- Grant minimal necessary tool access
- Use scoped permissions for agents
- Regular access reviews and audits

**Data Protection:**
- Classify and protect sensitive data
- Use encryption for data at rest and in transit
- Implement proper data retention policies

### Cost Management

**Budget Planning:**
- Set realistic budgets based on historical data
- Monitor costs in real-time
- Implement cost optimization strategies

**Resource Optimization:**
- Use appropriate models for task complexity
- Batch similar operations
- Implement intelligent caching

## Troubleshooting

### Common Issues

**Workflow Failures:**
- Check agent configuration and tool access
- Verify budget limits and quotas
- Review error logs and traces
- Validate workflow specification

**Performance Issues:**
- Monitor queue depth and wait times
- Check resource utilization
- Optimize task dependencies
- Review timeout settings

**Cost Overruns:**
- Analyze cost breakdown by agent and tool
- Review budget allocation and limits
- Implement cost optimization measures
- Monitor usage patterns

### Debug Tools

```bash
# View workflow run details
br workflows runs show <run-id> --verbose

# Check agent status
br agents status --all

# Monitor budget usage
br budgets status --workflow <workflow-id>

# View execution traces
br traces show <trace-id> --format json
```

For additional support, see the [troubleshooting guide](https://docs.buildrunner.cloud/troubleshooting) or contact the BuildRunner team.
