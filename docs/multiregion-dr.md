# Multi-Region, Performance & Disaster Recovery

BuildRunner provides enterprise-grade multi-region deployment, performance monitoring, and disaster recovery capabilities to ensure high availability, low latency, and business continuity.

## Overview

The multi-region and DR system provides:
- **Multi-Region Routing**: Intelligent traffic routing based on geography and health
- **Performance Monitoring**: Real-time metrics, budgets, and SLO tracking
- **Disaster Recovery**: Automated backups, failover, and recovery procedures
- **Auto-Scaling**: Dynamic resource allocation based on demand
- **Observability**: Comprehensive dashboards and alerting

## Multi-Region Architecture

### Region Configuration

BuildRunner supports multiple deployment regions with different roles:

```typescript
interface Region {
  code: string;           // e.g., 'us-east-1'
  name: string;          // e.g., 'US East (Virginia)'
  role: 'primary' | 'replica' | 'standby' | 'edge';
  endpoint: string;      // Regional API endpoint
  active: boolean;       // Health status
  latency_ms: number;    // Average latency
}
```

**Region Roles:**
- **Primary**: Main production region handling writes
- **Replica**: Read-only replica for load distribution
- **Standby**: Backup region for disaster recovery
- **Edge**: CDN/cache layer for static content

### Traffic Routing

**Geographic Routing:**
```typescript
// Region detection middleware
const detectRegion = (request: Request): string => {
  // Check user preference
  const userRegion = request.cookies.get('br-region');
  if (userRegion && isValidRegion(userRegion)) {
    return userRegion;
  }
  
  // Use GeoIP detection
  const clientIP = getClientIP(request);
  const geoRegion = geoIPLookup(clientIP);
  
  // Find nearest healthy region
  return getNearestHealthyRegion(geoRegion);
};
```

**Sticky Affinity:**
- Sessions stick to a region for 30 minutes (configurable)
- Reduces latency and improves cache hit rates
- Automatic failover to healthy regions

**Health Checks:**
- Continuous monitoring of regional endpoints
- Automatic traffic rerouting on failures
- Configurable failure thresholds and timeouts

### Read Replica Routing

Read-only operations are automatically routed to the nearest replica:

```typescript
// Read replica routing
const routeReadRequest = async (request: Request) => {
  if (isReadOnlyOperation(request)) {
    const nearestReplica = await getNearestReplica(request.region);
    
    if (nearestReplica?.active) {
      return proxyToRegion(request, nearestReplica);
    }
  }
  
  // Fallback to primary
  return proxyToPrimary(request);
};
```

**Read Operations:**
- Analytics and reporting queries
- Search and filtering
- Dashboard data loading
- Public API endpoints

## Performance Monitoring

### Performance Budgets

Performance budgets define acceptable thresholds for key metrics:

```typescript
interface PerformanceBudget {
  service: 'api' | 'web' | 'edge' | 'db' | 'worker' | 'auth';
  metric_type: 'latency' | 'error_rate' | 'throughput' | 'availability';
  p50_ms?: number;
  p95_ms?: number;
  p99_ms?: number;
  error_budget_pct?: number;
  availability_pct?: number;
  alert_threshold_pct: number;
}
```

**Default Budgets:**
```yaml
performance_budgets:
  api:
    p50: 100ms
    p95: 400ms
    p99: 900ms
    error_rate: 1.0%
    availability: 99.9%
  
  web:
    lcp: 2500ms      # Largest Contentful Paint
    fid: 100ms       # First Input Delay
    cls: 0.1         # Cumulative Layout Shift
    availability: 99.5%
  
  database:
    p50: 10ms
    p95: 50ms
    p99: 200ms
    availability: 99.99%
```

### Real-Time Monitoring

**Metrics Collection:**
```typescript
// Record performance snapshot
const recordMetrics = async (service: string, region: string) => {
  const snapshot = {
    service,
    region_code: region,
    p50_ms: calculateP50(),
    p95_ms: calculateP95(),
    p99_ms: calculateP99(),
    error_rate: calculateErrorRate(),
    throughput_rps: calculateThroughput(),
    cache_hit_ratio: calculateCacheHitRatio(),
    measured_at: new Date(),
  };
  
  await recordPerfSnapshot(snapshot);
  
  // Check against budgets
  const budgetStatus = await checkPerfBudget(
    service,
    'latency',
    snapshot.p95_ms
  );
  
  if (budgetStatus.budget_exceeded) {
    await triggerAlert(service, budgetStatus);
  }
};
```

**Key Metrics:**
- **Latency**: P50, P95, P99 response times
- **Error Rate**: 4xx/5xx error percentage
- **Throughput**: Requests per second
- **Availability**: Uptime percentage
- **Cache Hit Ratio**: Cache effectiveness
- **Resource Usage**: CPU, memory, disk utilization

### Performance Gates

CI/CD pipelines include performance validation:

**Web Performance (Lighthouse):**
```yaml
# .github/workflows/web-perf.yml
- name: Run Lighthouse audit
  run: |
    lighthouse $URL \
      --chrome-flags="--headless" \
      --preset=perf \
      --budget-path=lighthouse-budget.json
```

**API Performance (k6):**
```yaml
# .github/workflows/api-perf.yml
- name: Run k6 load test
  run: |
    k6 run \
      --out json=results.json \
      tests/load/k6/api-load-test.js
```

## Disaster Recovery

### Recovery Objectives

**RPO (Recovery Point Objective):** 15 minutes
- Maximum acceptable data loss
- Achieved through frequent backups and replication

**RTO (Recovery Time Objective):** 30 minutes
- Maximum acceptable downtime
- Achieved through automated failover procedures

### Backup Strategy

**Automated Backups:**
```typescript
// Nightly backup job
const performBackup = async () => {
  const backup = {
    timestamp: new Date(),
    type: 'logical',
    encryption: true,
    compression: true,
  };
  
  // Export database
  const dbBackup = await exportDatabase();
  
  // Upload to object storage
  const backupUrl = await uploadToStorage(dbBackup, {
    encryption: 'AES-256',
    retention: '30 days',
  });
  
  // Verify backup integrity
  const verification = await verifyBackup(backupUrl);
  
  return {
    ...backup,
    url: backupUrl,
    size_bytes: dbBackup.length,
    verified: verification.success,
  };
};
```

**Backup Schedule:**
- **Full Backups**: Daily at 2 AM UTC
- **Incremental Backups**: Every 4 hours
- **Transaction Log Backups**: Every 15 minutes
- **Retention**: 30 days for full backups, 7 days for incremental

### Failover Procedures

**Automated Failover:**
```typescript
// Failover automation script
const executeFailover = async (options: {
  dryRun?: boolean;
  targetRegion: string;
  reason: string;
}) => {
  const steps = [
    'Stop traffic to primary region',
    'Promote standby to primary',
    'Update DNS records',
    'Warm caches in new region',
    'Verify application health',
    'Resume traffic',
  ];
  
  for (const step of steps) {
    console.log(`Executing: ${step}`);
    
    if (!options.dryRun) {
      await executeFailoverStep(step, options);
    }
    
    // Log progress
    await logFailoverProgress(step, options);
  }
  
  return {
    success: true,
    duration_minutes: calculateDuration(),
    rto_achieved: true,
  };
};
```

**Manual Failover Process:**
1. **Assessment**: Evaluate incident severity and impact
2. **Decision**: Determine if failover is necessary
3. **Notification**: Alert stakeholders and customers
4. **Execution**: Run failover automation script
5. **Verification**: Confirm system health and functionality
6. **Communication**: Update status and provide ETAs

### DR Drills

**Scheduled Testing:**
```typescript
// Weekly DR drill
const conductDRDrill = async () => {
  const drill = {
    id: generateId(),
    type: 'scheduled',
    started_at: new Date(),
    scenario: 'primary_region_failure',
  };
  
  try {
    // Simulate failure
    await simulateRegionFailure('us-east-1');
    
    // Measure failover time
    const startTime = Date.now();
    await executeFailover({
      dryRun: false,
      targetRegion: 'us-west-1',
      reason: 'DR drill',
    });
    const failoverTime = Date.now() - startTime;
    
    // Verify recovery
    const healthCheck = await verifySystemHealth();
    
    // Rollback
    await rollbackFailover();
    
    return {
      ...drill,
      ended_at: new Date(),
      outcome: 'success',
      rto_achieved_minutes: failoverTime / 60000,
      rpo_achieved_minutes: calculateRPO(),
      notes: 'Drill completed successfully',
    };
  } catch (error) {
    return {
      ...drill,
      ended_at: new Date(),
      outcome: 'failed',
      notes: error.message,
    };
  }
};
```

**Drill Schedule:**
- **Weekly**: Automated failover testing
- **Monthly**: Full DR scenario simulation
- **Quarterly**: Cross-region data recovery
- **Annually**: Complete disaster simulation

## Caching Strategy

### Edge Caching

**Stale-While-Revalidate (SWR):**
```typescript
// Cache middleware
const cacheMiddleware = async (request: Request) => {
  const cacheKey = generateCacheKey(request);
  const cached = await getFromCache(cacheKey);
  
  if (cached) {
    // Serve stale content immediately
    const response = new Response(cached.content, {
      headers: cached.headers,
    });
    
    // Background revalidation if stale
    if (isStale(cached)) {
      revalidateInBackground(request, cacheKey);
    }
    
    return response;
  }
  
  // Cache miss - fetch and cache
  const response = await fetchFromOrigin(request);
  await setCache(cacheKey, response, {
    ttl: getTTL(request),
    swr: getSWRWindow(request),
  });
  
  return response;
};
```

**Cache Configuration:**
- **Static Assets**: 1 year TTL with versioning
- **API Responses**: 5 minutes TTL with 5 minutes SWR
- **User Data**: No caching or short TTL
- **Public Data**: 1 hour TTL with 30 minutes SWR

### Cache Invalidation

**Event-Driven Invalidation:**
```typescript
// Cache invalidation on data changes
const invalidateCache = async (event: DataChangeEvent) => {
  const patterns = getCachePatterns(event.entity, event.id);
  
  for (const pattern of patterns) {
    await invalidateCachePattern(pattern);
  }
  
  // Warm critical caches
  if (isCriticalEntity(event.entity)) {
    await warmCache(event.entity, event.id);
  }
};
```

## Auto-Scaling

### Horizontal Scaling

**Auto-Scaling Configuration:**
```yaml
autoscaling:
  api:
    min_instances: 2
    max_instances: 20
    target_cpu: 70%
    target_memory: 80%
    scale_up_cooldown: 5m
    scale_down_cooldown: 10m
  
  workers:
    min_instances: 1
    max_instances: 10
    target_queue_depth: 100
    scale_up_cooldown: 2m
    scale_down_cooldown: 5m
```

**Scaling Triggers:**
- **CPU Utilization**: Scale up at 70%, down at 30%
- **Memory Usage**: Scale up at 80%, down at 40%
- **Request Queue**: Scale up at 100 pending requests
- **Response Time**: Scale up if P95 > budget threshold

### Load Testing

**Continuous Load Testing:**
```javascript
// k6 load test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up
    { duration: '5m', target: 50 },   // Normal load
    { duration: '2m', target: 100 },  // Peak load
    { duration: '5m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};
```

**Test Scenarios:**
- **Smoke Tests**: Basic functionality validation
- **Load Tests**: Normal traffic simulation
- **Stress Tests**: Peak capacity testing
- **Spike Tests**: Sudden traffic surge handling

## Canary Deployments

### Traffic Shifting

**Gradual Rollout:**
```typescript
// Canary deployment controller
const manageCanaryDeployment = async (deployment: CanaryDeployment) => {
  const currentTraffic = deployment.traffic_percentage;
  const targetTraffic = Math.min(
    currentTraffic + deployment.increment_percentage,
    deployment.target_percentage
  );
  
  // Update traffic split
  await updateTrafficSplit(deployment.version, targetTraffic);
  
  // Monitor metrics
  const metrics = await collectCanaryMetrics(deployment);
  
  // Check safety thresholds
  if (metrics.error_rate > deployment.error_budget_threshold_pct) {
    await rollbackCanary(deployment);
    return { action: 'rollback', reason: 'error_rate_exceeded' };
  }
  
  if (targetTraffic >= deployment.target_percentage) {
    await promoteCanary(deployment);
    return { action: 'promote', reason: 'target_reached' };
  }
  
  return { action: 'continue', next_traffic: targetTraffic };
};
```

**Safety Controls:**
- **Error Budget Monitoring**: Automatic rollback on threshold breach
- **Latency Monitoring**: Rollback if latency increases significantly
- **Manual Override**: Emergency stop and rollback capabilities
- **Gradual Progression**: 5% → 10% → 25% → 50% → 100%

## Observability

### Performance Dashboard

The performance dashboard provides real-time visibility into:

**Service Health:**
- Current status of all services and regions
- Performance metrics vs. budgets
- Error rates and availability
- Resource utilization

**Regional Distribution:**
- Traffic distribution across regions
- Regional latency and health status
- Failover events and recovery times

**Slow Query Analysis:**
- Database query performance
- Top slow queries by service
- Query optimization recommendations

### Alerting

**Alert Conditions:**
```yaml
alerts:
  high_latency:
    condition: p95_latency > budget * 1.2
    severity: warning
    channels: [slack, email]
  
  budget_burn:
    condition: error_budget_burn_rate > 10x
    severity: critical
    channels: [pagerduty, slack]
  
  region_failure:
    condition: region_health_check_failures > 3
    severity: critical
    channels: [pagerduty, phone]
```

**Notification Channels:**
- **Slack**: Real-time team notifications
- **Email**: Detailed alert information
- **PagerDuty**: Critical incident escalation
- **Webhooks**: Integration with external systems

## Runbooks

### Incident Response

**High Latency Response:**
1. Check performance dashboard for affected services
2. Identify slow queries and optimize if possible
3. Scale up affected services if resource-constrained
4. Consider traffic shifting to healthy regions
5. Implement temporary caching if appropriate

**Region Failure Response:**
1. Verify failure scope and impact
2. Activate incident response team
3. Execute failover to standby region
4. Communicate with stakeholders
5. Monitor recovery and system health
6. Conduct post-incident review

**Performance Budget Breach:**
1. Identify root cause of performance degradation
2. Implement immediate mitigation (scaling, caching)
3. Optimize code or queries causing issues
4. Update performance budgets if necessary
5. Prevent similar issues through monitoring

### Maintenance Procedures

**Planned Maintenance:**
1. Schedule during low-traffic periods
2. Notify users in advance
3. Use canary deployments for updates
4. Monitor metrics during deployment
5. Have rollback plan ready

**Emergency Maintenance:**
1. Assess urgency and impact
2. Implement immediate fixes
3. Communicate with affected users
4. Monitor system stability
5. Document lessons learned

## Configuration

### Environment Variables

```bash
# Multi-region settings
MULTIREGION_ENABLED=true
DEFAULT_REGION=us-east-1
STICKY_AFFINITY_MINUTES=30

# Performance settings
PERFORMANCE_MONITORING_ENABLED=true
PERF_BUDGET_ENFORCEMENT=true
SLOW_QUERY_THRESHOLD_MS=500

# DR settings
DR_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS=30
AUTO_FAILOVER_ENABLED=false

# Caching settings
EDGE_CACHE_ENABLED=true
CACHE_DEFAULT_TTL_SECONDS=300
SWR_WINDOW_SECONDS=300

# Auto-scaling settings
AUTOSCALING_ENABLED=true
MIN_INSTANCES=2
MAX_INSTANCES=20
TARGET_CPU_PERCENT=70
```

### Policy Configuration

```yaml
# governance/policy.yml
multiregion_performance_dr:
  multiregion:
    enabled: true
    default_region: "us-east-1"
    allowed_regions: ["us-east-1", "us-west-1", "eu-west-1", "ap-south-1"]
    sticky_affinity_minutes: 30
    
  disaster_recovery:
    rpo_minutes: 15
    rto_minutes: 30
    drill_schedule: "0 3 * * 0"  # Weekly
    
  performance:
    budgets:
      api_p95_budget_ms: 400
      api_p99_budget_ms: 900
      web_lcp_budget_ms: 2500
      error_budget_pct: 1.0
```

## Best Practices

### Performance Optimization

**Database Optimization:**
- Use read replicas for analytics queries
- Implement connection pooling
- Add appropriate indexes
- Monitor slow query logs
- Use query result caching

**API Optimization:**
- Implement response caching
- Use compression for large responses
- Optimize serialization
- Implement request batching
- Use async processing for heavy operations

**Frontend Optimization:**
- Optimize bundle sizes
- Implement code splitting
- Use CDN for static assets
- Optimize images and fonts
- Implement service workers

### Disaster Recovery

**Preparation:**
- Regularly test backup and restore procedures
- Maintain up-to-date runbooks
- Train team on DR procedures
- Monitor backup integrity
- Test failover scenarios

**During Incidents:**
- Follow established procedures
- Communicate clearly and frequently
- Document all actions taken
- Focus on restoration first, investigation second
- Escalate appropriately

**Post-Incident:**
- Conduct thorough post-mortem
- Update procedures based on learnings
- Implement preventive measures
- Share knowledge with team
- Update monitoring and alerting

### Monitoring and Alerting

**Effective Monitoring:**
- Monitor user-facing metrics
- Set meaningful alert thresholds
- Avoid alert fatigue
- Use SLIs and SLOs
- Implement proper escalation

**Alert Management:**
- Clear, actionable alert messages
- Include relevant context and links
- Proper severity classification
- Regular alert review and tuning
- Integration with incident management

## Troubleshooting

### Common Issues

**High Latency:**
- Check database query performance
- Verify cache hit rates
- Review resource utilization
- Check network connectivity
- Analyze request patterns

**Regional Failures:**
- Verify health check endpoints
- Check DNS resolution
- Review load balancer configuration
- Validate SSL certificates
- Test network connectivity

**Cache Issues:**
- Verify cache configuration
- Check invalidation logic
- Monitor hit rates
- Review TTL settings
- Test cache warming

### Debug Commands

```bash
# Check regional health
br regions health --all

# View performance metrics
br performance metrics --service api --region us-east-1

# Test failover
br dr failover --dry-run --target us-west-1

# Run load test
br load-test run --type smoke --duration 2m

# Check cache status
br cache status --region us-east-1
```

For additional support, see the [troubleshooting guide](https://docs.buildrunner.cloud/troubleshooting) or contact the BuildRunner team.
