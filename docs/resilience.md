# BuildRunner Resilience & Offline Operations

BuildRunner is designed to operate reliably under challenging network conditions, provider outages, and intermittent connectivity. This guide covers the resilience features, offline capabilities, and conflict resolution mechanisms.

## Overview

BuildRunner's resilience system provides:
- **Offline-first operations** with local caching and sync queues
- **Conflict detection and resolution** with 3-way merge capabilities
- **Circuit breaker patterns** to handle service failures gracefully
- **Health monitoring** with automatic failover strategies
- **Degraded mode operations** when full functionality is unavailable

## Offline Operations

### Local Cache Architecture

BuildRunner uses IndexedDB for persistent local storage:

```typescript
// Offline database structure
interface OfflineDatabase {
  outbox: OutboxItem[];        // Pending sync operations
  planCache: PlanCacheItem[];  // Cached project plans
  stateCache: StateCacheItem[]; // Cached project state
  conflicts: ConflictItem[];   // Unresolved conflicts
  healthSnapshots: HealthSnapshot[]; // System health data
}
```

### Sync Queue Behavior

All mutations are queued locally and synced when connectivity is restored:

1. **Write Operations**: Immediately stored in local cache
2. **Queue Management**: Operations queued with persistent IDs
3. **Background Sync**: Automatic retry with exponential backoff
4. **Conflict Detection**: Server-side validation and merge resolution

### Supported Offline Operations

**Fully Supported (No Network Required)**:
- Browse existing projects and plans
- Edit project specifications locally
- Update microstep status and notes
- Add comments and annotations
- Export project data
- View cached analytics

**Queued for Sync**:
- Plan modifications and updates
- Microstep status changes
- Comment additions
- File uploads
- Integration triggers

**Disabled in Offline Mode**:
- Real-time collaboration
- AI-powered operations
- External integrations
- Live analytics updates

## Conflict Resolution

### 3-Way Merge Process

When conflicts occur, BuildRunner uses a 3-way merge algorithm:

```
Base Version (Common Ancestor)
├── Local Changes (Your Edits)
└── Remote Changes (Server/Other Users)
    └── Merged Result (Resolution)
```

### Conflict Types

**Trivial Conflicts (Auto-Resolved)**:
- Non-overlapping field changes
- Additive operations (new comments, files)
- Status updates to different microsteps
- Metadata changes

**Manual Conflicts (Require Resolution)**:
- Overlapping text edits
- Conflicting status changes
- Structural plan modifications
- Deleted vs. modified content

### Conflict Resolution UI

When conflicts are detected, users see a resolution modal with:

1. **Side-by-side diff view** showing base, local, and remote versions
2. **Resolution options**:
   - Keep local changes
   - Accept remote changes
   - Manual merge with editor
3. **Impact assessment** showing affected acceptance criteria
4. **Preview** of the merged result

### Auto-Resolution Rules

Conflicts are automatically resolved when:
- Changes affect different sections of the plan
- One side only adds new content
- Changes are to different properties of the same object
- Timestamp-based operations (comments, logs)

## Circuit Breaker & Backoff

### Exponential Backoff Configuration

```yaml
# governance/policy.yml
sync_backoff:
  min_ms: 500        # Initial retry delay
  max_ms: 30000      # Maximum retry delay
  factor: 2          # Backoff multiplier
  jitter: true       # Add random jitter
  max_attempts: 5    # Maximum retry attempts
```

### Circuit Breaker States

**Closed (Normal Operation)**:
- All requests pass through
- Failure count tracked
- Switches to Open on threshold

**Open (Failing Fast)**:
- Requests immediately fail
- Prevents cascading failures
- Switches to Half-Open after cooldown

**Half-Open (Testing Recovery)**:
- Limited requests allowed
- Success switches to Closed
- Failure switches back to Open

### Circuit Breaker Configuration

```yaml
circuit_breaker:
  failure_threshold: 5      # Failures to open circuit
  success_threshold: 3      # Successes to close circuit
  cooldown_ms: 60000       # Time before half-open
  half_open_max_calls: 3   # Max calls in half-open
```

## Health Monitoring

### Health Probe Targets

BuildRunner monitors the health of:
- **Supabase Database**: Connection and query performance
- **Supabase Edge Functions**: Function execution and latency
- **OpenAI API**: Model availability and response times
- **GitHub API**: Repository access and webhook delivery
- **Figma API**: Design token synchronization
- **External Integrations**: Third-party service connectivity

### Health Check Implementation

```typescript
// Health probe example
async function checkSupabaseHealth(): Promise<HealthResult> {
  const startTime = Date.now();
  
  try {
    const response = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    return {
      ok: true,
      latencyMs: latency,
      target: 'supabase_db',
      metadata: { query: 'health_check' }
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - startTime,
      target: 'supabase_db',
      errorMessage: error.message
    };
  }
}
```

### Health Dashboard

Access the health dashboard at `/settings/health` to view:
- **Overall system status** (Healthy/Degraded/Unhealthy)
- **Individual service status** with latency metrics
- **Active outages** and their impact
- **Historical health trends** over time
- **Circuit breaker states** for each service

## Failover Strategies

### Read-Only Fallback

When primary services are unavailable:
1. **Cached Data**: Serve from local IndexedDB cache
2. **Read Replicas**: Use secondary database endpoints
3. **CDN Fallback**: Static assets from backup CDN
4. **Degraded Mode**: Limited functionality with clear UX

### Failover Configuration

```yaml
failover:
  enabled: true
  read_only_fallback: true
  cache_ttl_ms: 300000     # 5 minutes
  fallback_endpoints:
    supabase_db: "read_replica_url"
    static_assets: "cdn_fallback_url"
```

## Degraded Mode

### Automatic Activation

Degraded mode activates when:
- Circuit breaker opens for critical services
- Health probes fail consecutively
- Network connectivity is intermittent
- Manual activation by administrators

### Feature Availability

**Enabled in Degraded Mode**:
- Local plan editing and browsing
- Cached data viewing
- Export operations
- Offline queue management
- Basic project operations

**Disabled in Degraded Mode**:
- Real-time synchronization
- External integrations
- AI-powered features
- Live collaboration
- Analytics updates

### User Experience

When in degraded mode, users see:
- **Banner notification** explaining the situation
- **Feature indicators** showing what's available
- **Queue status** for pending operations
- **Estimated recovery time** when available

## Queue Management

### Queue Dashboard

The sync queue dashboard (`/resilience/queue`) provides:

**Queue Overview**:
- Total items in queue
- Failed items requiring attention
- Conflicts needing resolution
- Circuit breaker status

**Item Management**:
- View queued operations
- Retry failed items
- Clear completed items
- Delete problematic items

**Real-time Updates**:
- Live queue status
- Processing progress
- Error notifications
- Success confirmations

### Queue Operations

```typescript
// Add item to sync queue
await syncQueue.enqueue('plan_edit', {
  planId: 'plan_123',
  changes: { title: 'Updated Title' }
}, 'project_456');

// Retry failed items
await syncQueue.retryFailedItems();

// Clear completed items
await syncQueue.clearCompleted();

// Get queue statistics
const stats = await syncQueue.getStats();
```

## Alerts & Notifications

### Alert Triggers

Alerts are sent when:
- Queue backlog exceeds threshold (default: 100 items)
- Items remain unsynced for too long (default: 24 hours)
- Circuit breaker opens for critical services
- Health probes detect service degradation
- Conflicts require manual resolution

### Alert Channels

```yaml
alert_channels:
  - slack          # Slack webhook notifications
  - email          # Email notifications
  - webhook        # Custom webhook endpoints
```

### Alert Configuration

```yaml
queue_management:
  alert_on_backlog_size: 100
  alert_on_age_hours: 24
  alert_channels: ["slack", "email"]
```

## Chaos Engineering

### Chaos Testing Harness

BuildRunner includes a chaos testing framework for validating resilience:

```bash
# Run chaos tests
npm run chaos:test

# Inject network latency
npm run chaos:latency -- --duration=60s --latency=2000ms

# Simulate service outages
npm run chaos:outage -- --service=supabase --duration=30s

# Test circuit breaker behavior
npm run chaos:circuit-breaker -- --failures=10
```

### Failure Injection Types

**Network Failures**:
- Latency injection (slow responses)
- Packet drops (connection failures)
- Timeouts (hanging requests)

**Service Failures**:
- HTTP error responses (500, 503)
- Service unavailability
- Partial functionality loss

**Resource Failures**:
- Memory pressure
- CPU throttling
- Storage limitations

### Chaos Test Schedule

```yaml
chaos_testing:
  enabled: true
  environments: ["development", "staging"]
  schedule: "nightly"
  max_failure_duration_ms: 60000
```

## CLI Offline Support

### Local Cache

The BuildRunner CLI maintains a local cache:

```bash
# Cache location
~/.buildrunner/offline/
├── queue.jsonl          # Sync queue
├── plans/              # Cached plans
├── state/              # Cached state
└── health.json         # Health snapshots
```

### Offline Commands

```bash
# Work offline
br plan edit --offline

# View queue status
br queue status

# Sync when online
br sync

# Force sync retry
br sync --retry-failed
```

## Best Practices

### For Users

1. **Regular Sync**: Sync frequently when online to minimize conflicts
2. **Conflict Prevention**: Coordinate with team on major plan changes
3. **Queue Monitoring**: Check queue dashboard for pending operations
4. **Offline Awareness**: Understand which features work offline

### For Administrators

1. **Health Monitoring**: Regularly check system health dashboard
2. **Alert Configuration**: Set appropriate thresholds for your team
3. **Chaos Testing**: Run regular resilience tests
4. **Capacity Planning**: Monitor queue sizes and processing times

### For Developers

1. **Idempotent Operations**: Design operations to be safely retried
2. **Conflict Handling**: Implement proper conflict resolution logic
3. **Error Handling**: Provide meaningful error messages
4. **Testing**: Include offline scenarios in test suites

## Troubleshooting

### Common Issues

**Queue Not Processing**:
- Check network connectivity
- Verify circuit breaker state
- Review error logs in dashboard

**Conflicts Not Resolving**:
- Check conflict resolution UI
- Verify user permissions
- Review merge algorithm logic

**Performance Issues**:
- Monitor queue size
- Check health probe latency
- Review circuit breaker thresholds

### Debug Commands

```bash
# Check queue status
br queue status --verbose

# View health information
br health check --all

# Reset circuit breaker
br circuit-breaker reset

# Clear local cache
br cache clear --confirm
```

## API Reference

### Sync Queue API

```typescript
// Queue management
interface SyncQueue {
  enqueue(kind: string, payload: any, projectId?: string): Promise<string>;
  getStats(): Promise<QueueStats>;
  retryFailedItems(): Promise<void>;
  clearCompleted(): Promise<number>;
  resetCircuitBreaker(): void;
}
```

### Health Monitoring API

```typescript
// Health checks
interface HealthMonitor {
  checkHealth(target: string): Promise<HealthResult>;
  getSystemHealth(): Promise<SystemHealth>;
  recordOutage(target: string, severity: string): Promise<void>;
}
```

## Security Considerations

### Data Protection

- **Local Encryption**: Sensitive data encrypted in IndexedDB
- **Secure Sync**: All sync operations use HTTPS
- **Access Control**: Queue operations respect user permissions
- **Audit Logging**: All resilience events are logged

### Privacy

- **No Data Leakage**: Offline cache respects data boundaries
- **Conflict Privacy**: Conflict resolution doesn't expose unauthorized data
- **Health Data**: Health metrics don't include sensitive information

For questions about resilience features, contact support@buildrunner.com or visit the [Support Portal](https://support.buildrunner.com).
