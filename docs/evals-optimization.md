# Continuous Evaluation & Auto-Optimization

BuildRunner includes a comprehensive evaluation and optimization system that continuously monitors model performance, ensures safety, and automatically optimizes prompt and model selection for better results.

## Overview

The evaluation system provides:
- **Continuous Quality Monitoring**: Automated evaluation of model outputs against golden datasets
- **Safety Guardrails**: Real-time detection and prevention of harmful or inappropriate outputs
- **Auto-Optimization**: Intelligent routing between models and prompts based on performance metrics
- **Regression Detection**: Automatic detection of performance degradations
- **Telemetry & Analytics**: Comprehensive monitoring of usage patterns and performance trends

## Golden Datasets

### Dataset Structure

Golden datasets are collections of input-output pairs used to evaluate model performance:

```jsonl
{"input": {"task": "plan", "requirements": "Build a React app"}, "expected": {"steps": [...], "acceptance_criteria": [...]}, "tags": ["react", "frontend"]}
{"input": {"task": "explain", "code": "function add(a, b) { return a + b; }"}, "expected": {"explanation": "This function..."}, "tags": ["javascript", "basic"]}
```

### Available Datasets

**Core Datasets:**
- `planner_golden`: Planning and project structure tasks (50+ items)
- `builder_golden`: Code generation and implementation tasks (75+ items)
- `qa_golden`: Quality assurance and testing tasks (40+ items)
- `explain_golden`: Code explanation and documentation tasks (60+ items)

### Managing Datasets

**Import/Export:**
```bash
# Export existing dataset
br evals export --set planner_golden --output planner_golden.jsonl

# Import new dataset
br evals import --file new_dataset.jsonl --set custom_dataset

# Validate dataset format
br evals validate --file dataset.jsonl
```

**Dataset Requirements:**
- Minimum 30 items per dataset
- Maximum 1000 items per dataset
- Each item must have `input` and `expected` fields
- Tags are optional but recommended for filtering
- Difficulty levels: `easy`, `medium`, `hard`, `expert`

## Evaluation Pipeline

### Automated Evaluation

Evaluations run automatically in several scenarios:

**Pull Request Gates:**
- Triggered when prompts, models, or AI logic changes
- Must pass quality gates before merge
- Regression detection against baseline

**Nightly Runs:**
- Full evaluation suite runs daily at 2 AM UTC
- Comprehensive performance monitoring
- Trend analysis and alerting

**Manual Triggers:**
```bash
# Run specific evaluation set
br evals run --set planner_golden

# Run all evaluations
br evals run --all

# Run with specific model
br evals run --set qa_golden --model gpt-4
```

### Scoring Methods

**Exact Match:**
- Binary scoring (0 or 1)
- Useful for structured outputs
- Case-sensitive by default

**BLEU/ROUGE:**
- Text similarity scoring (0-1)
- Good for natural language outputs
- Handles paraphrasing and synonyms

**Rubric Scoring:**
- Multi-criteria evaluation
- Criteria: correctness, completeness, clarity, efficiency
- Weighted scoring with detailed feedback

**Pass@K:**
- Success rate over multiple attempts
- Useful for code generation tasks
- Configurable K value (default: 3)

### Quality Gates

**Minimum Requirements:**
```yaml
# governance/policy.yml
evals:
  min_quality_score: 0.85    # 85% average score
  min_pass_rate: 0.90        # 90% of tests must pass
  regression_threshold: 0.05  # Max 5% score drop
```

**Gate Enforcement:**
- PR merges blocked if gates fail
- Automatic rollback on production regressions
- Alert notifications for quality drops

## Safety & Guardrails

### Guardrail Types

**Content Policy:**
- Inappropriate content detection
- Violence, hate speech, adult content
- Configurable severity thresholds

**Prompt Injection:**
- Attempts to manipulate system behavior
- Jailbreak detection
- Context boundary violations

**Data Leakage:**
- Exposure of sensitive information
- PII detection and redaction
- API key and credential scanning

**Bias Detection:**
- Demographic bias analysis
- Fairness metrics across groups
- Stereotype reinforcement detection

**Toxicity Detection:**
- Harmful language identification
- Harassment and bullying detection
- Professional communication standards

### Red Team Testing

**Automated Adversarial Testing:**
```bash
# Run red team evaluation
br evals redteam --min-attempts 100

# Include specific attack types
br evals redteam --include-jailbreak --include-bias

# Generate adversarial prompts
br evals redteam --generate-prompts --count 50
```

**Attack Categories:**
- **Jailbreak Attempts**: Trying to bypass safety measures
- **Prompt Injection**: Malicious prompt manipulation
- **Bias Probes**: Testing for unfair treatment
- **Data Extraction**: Attempting to extract training data
- **Harmful Instructions**: Requests for dangerous information

### Safety Scoring

**Safety Score Calculation:**
```
Safety Score = 1 - (Σ(severity_weight × finding_count) / total_attempts)

Severity Weights:
- Critical: 2.0
- High: 1.0
- Medium: 0.5
- Low: 0.1
```

**Response Policies:**
- **Critical**: Automatic blocking and escalation
- **High**: Automatic escalation to security team
- **Medium**: Requires manual review
- **Low**: Logged for monitoring

## Auto-Optimization

### Multi-Armed Bandit

The optimization system uses Thompson Sampling to balance exploration and exploitation:

**Algorithm:**
```typescript
// Simplified bandit logic
function selectModelPromptCombo(taskType: string, budget: Budget): Selection {
  const candidates = getCandidates(taskType, budget);
  
  // Thompson Sampling
  const scores = candidates.map(candidate => {
    const alpha = candidate.successes + 1;
    const beta = candidate.failures + 1;
    return betaDistribution.sample(alpha, beta);
  });
  
  return candidates[argmax(scores)];
}
```

**Budget Constraints:**
```yaml
# governance/policy.yml
optimization:
  budget:
    max_cost_per_request_usd: 0.10
    max_latency_ms: 5000
    max_tokens_per_request: 4000
```

### Prompt Variants

**Automatic Variant Generation:**
- Paraphrasing existing prompts
- Simplifying complex instructions
- Adding examples and context
- Format modifications (JSON, XML, etc.)

**A/B Testing:**
```bash
# Create prompt variant
br prompts create-variant --task planner --method paraphrase

# View variant performance
br prompts performance --task planner --period 7d

# Promote best performing variant
br prompts promote --variant-id abc123
```

**Variant Management:**
- Maximum 5 variants per task type
- Minimum 100 samples before promotion
- Automatic retirement of poor performers

### Model Selection

**Performance Tracking:**
- Quality scores per model per task
- Latency and cost metrics
- Success rates and error patterns
- User satisfaction ratings

**Routing Logic:**
```typescript
interface ModelSelection {
  primary: string;    // Best performing model
  fallback: string;   // Backup for failures
  canary?: string;    // Testing new model (5% traffic)
}

// Example routing decision
const routing = {
  planner: {
    primary: "gpt-4",
    fallback: "gpt-3.5-turbo",
    canary: "claude-3-opus"
  }
};
```

## Telemetry & Analytics

### Data Collection

**Captured Metrics:**
- Request/response pairs (redacted)
- Performance metrics (latency, tokens, cost)
- Quality scores and user feedback
- Error rates and failure modes
- Model and prompt usage patterns

**PII Redaction:**
```typescript
// Automatic redaction rules
const redactionRules = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b\d{3}-\d{3}-\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  apiKey: /\b[A-Za-z0-9]{32,}\b/g
};
```

**Sampling Strategy:**
- 100% of errors and slow requests
- 10% of successful requests
- 100% of safety violations
- Configurable per environment

### Analytics Dashboard

**Key Metrics:**
- Average quality scores over time
- Model performance comparisons
- Cost and latency trends
- Error rate analysis
- Safety violation tracking

**Filtering Options:**
- Time period (1d, 7d, 30d, 90d)
- Task type (planner, builder, qa, explain)
- Model (gpt-4, gpt-3.5-turbo, claude-3)
- Environment (development, staging, production)

**Alerts:**
- Quality score drops below threshold
- Error rate exceeds limits
- Safety violations detected
- Cost budget overruns

## Configuration

### Policy Configuration

```yaml
# governance/policy.yml
evals_optimization:
  evals:
    required: true
    min_quality_score: 0.85
    schedule_cron: "0 2 * * *"
    
  safety:
    enabled: true
    max_severity_allowed: "medium"
    redteam_required: true
    
  optimization:
    enabled: true
    algorithm: "thompson_sampling"
    rollout:
      strategy: "canary"
      canary_percentage: 5
      
  telemetry:
    enabled: true
    pii_redaction: true
    retention_days: 90
```

### Environment Variables

```bash
# Evaluation settings
EVALS_ENABLED=true
EVALS_MIN_SCORE=0.85
EVALS_SCHEDULE="0 2 * * *"

# Safety settings
SAFETY_ENABLED=true
REDTEAM_ENABLED=true
MAX_SEVERITY=medium

# Optimization settings
OPTIMIZATION_ENABLED=true
BANDIT_ALGORITHM=thompson_sampling
CANARY_PERCENTAGE=5

# Telemetry settings
TELEMETRY_ENABLED=true
PII_REDACTION=true
RETENTION_DAYS=90
```

## API Reference

### Evaluation API

```typescript
// Run evaluation
POST /api/evals/run
{
  "setName": "planner_golden",
  "model": "gpt-4",
  "promptVersion": "v1.2"
}

// Get evaluation results
GET /api/evals/results/{runId}

// List evaluation sets
GET /api/evals/sets

// Import evaluation set
POST /api/evals/import
{
  "setName": "custom_set",
  "items": [...]
}
```

### Analytics API

```typescript
// Get performance metrics
GET /api/analytics/evals?period=7d&taskType=planner

// Get model comparison
GET /api/analytics/models?period=30d

// Get safety metrics
GET /api/analytics/safety?period=7d
```

### Optimization API

```typescript
// Get current routing
GET /api/optimization/routing

// Update prompt variant
POST /api/optimization/prompts/{taskType}/variants
{
  "template": "...",
  "description": "...",
  "weight": 0.1
}

// Get optimization status
GET /api/optimization/status
```

## CLI Commands

### Evaluation Commands

```bash
# Run evaluations
br evals run --set planner_golden
br evals run --all --model gpt-4

# Manage datasets
br evals import --file dataset.jsonl --set custom
br evals export --set planner_golden --output backup.jsonl
br evals validate --file dataset.jsonl

# View results
br evals results --run-id abc123
br evals history --set planner_golden --limit 10
```

### Safety Commands

```bash
# Run red team tests
br safety redteam --min-attempts 100
br safety redteam --include-jailbreak --include-bias

# View safety metrics
br safety metrics --period 7d
br safety findings --severity high --unresolved

# Configure guardrails
br safety configure --type content_policy --enabled true
```

### Optimization Commands

```bash
# View current routing
br optimize routing --task-type planner

# Manage prompt variants
br optimize prompts list --task-type builder
br optimize prompts create --task-type qa --method paraphrase
br optimize prompts promote --variant-id abc123

# View performance
br optimize performance --period 30d
br optimize models --comparison
```

## Best Practices

### Dataset Management

**Quality Guidelines:**
- Include diverse, representative examples
- Cover edge cases and error conditions
- Regular review and updates
- Clear, unambiguous expected outputs

**Maintenance:**
- Monthly dataset reviews
- Add new examples for failing cases
- Remove outdated or irrelevant items
- Version control for dataset changes

### Safety Configuration

**Guardrail Tuning:**
- Start with conservative settings
- Monitor false positive rates
- Adjust thresholds based on use case
- Regular red team testing

**Incident Response:**
- Immediate blocking for critical violations
- Escalation procedures for high severity
- Post-incident analysis and improvements
- Documentation of lessons learned

### Optimization Strategy

**Rollout Planning:**
- Start with small canary percentages
- Monitor key metrics closely
- Gradual ramp-up over time
- Quick rollback procedures

**Performance Monitoring:**
- Set up comprehensive alerting
- Regular performance reviews
- Cost optimization analysis
- User satisfaction tracking

## Troubleshooting

### Common Issues

**Evaluation Failures:**
- Check dataset format and validation
- Verify model availability and quotas
- Review prompt template syntax
- Check network connectivity

**Safety False Positives:**
- Review guardrail configuration
- Adjust sensitivity thresholds
- Add context-specific rules
- Whitelist known safe patterns

**Optimization Problems:**
- Verify sufficient sample sizes
- Check budget constraints
- Review bandit algorithm settings
- Monitor for data quality issues

### Debug Commands

```bash
# Debug evaluation run
br evals debug --run-id abc123 --verbose

# Test safety guardrails
br safety test --input "test prompt" --all-guardrails

# Check optimization status
br optimize debug --task-type planner --verbose

# View telemetry data
br telemetry query --period 1h --errors-only
```

For additional support, contact the BuildRunner team or check the [troubleshooting guide](https://docs.buildrunner.cloud/troubleshooting).
