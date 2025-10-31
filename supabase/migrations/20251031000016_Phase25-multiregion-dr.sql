-- Phase 25: Multi-Region, Performance & Disaster Recovery (DR)
-- Idempotent migration for multi-region routing, disaster recovery, and performance monitoring

-- Regions table for multi-region deployment
create table if not exists regions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  role text not null,
  endpoint text not null,
  active boolean default true,
  health_check_url text,
  latency_ms int default 0,
  last_health_check timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Role validation
  constraint valid_region_role check (role in ('primary', 'replica', 'standby', 'edge'))
);

-- DR policies for disaster recovery configuration
create table if not exists dr_policies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rpo_minutes int not null,
  rto_minutes int not null,
  backup_schedule text not null,
  backup_retention_days int default 30,
  failover_strategy text not null,
  auto_failover boolean default false,
  notification_channels text[] default '{}',
  enabled boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Strategy validation
  constraint valid_failover_strategy check (failover_strategy in ('manual', 'automatic', 'hybrid'))
);

-- DR runs for disaster recovery drill tracking
create table if not exists dr_runs (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null,
  run_type text not null default 'drill',
  started_at timestamptz default now(),
  ended_at timestamptz,
  outcome text,
  rpo_achieved_minutes int,
  rto_achieved_minutes int,
  data_loss_bytes bigint default 0,
  downtime_seconds int,
  notes text,
  checklist jsonb default '{}'::jsonb,
  artifacts jsonb default '{}'::jsonb,
  created_by uuid,
  
  -- Foreign key constraints
  foreign key (policy_id) references dr_policies(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Run type validation
  constraint valid_dr_run_type check (run_type in ('drill', 'actual', 'test')),
  constraint valid_dr_outcome check (outcome in ('success', 'partial', 'failed', 'aborted') or outcome is null)
);

-- Performance budgets for SLO/SLA tracking
create table if not exists perf_budgets (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  metric_type text not null,
  p50_ms int,
  p95_ms int,
  p99_ms int,
  error_budget_pct numeric,
  availability_pct numeric default 99.9,
  throughput_rps int,
  enabled boolean default true,
  alert_threshold_pct numeric default 80,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Service validation
  constraint valid_perf_service check (service in ('api', 'web', 'edge', 'db', 'worker', 'auth')),
  constraint valid_metric_type check (metric_type in ('latency', 'error_rate', 'throughput', 'availability'))
);

-- Performance snapshots for historical tracking
create table if not exists perf_snapshots (
  id uuid primary key default gen_random_uuid(),
  service text not null,
  region_code text,
  metric_type text not null,
  p50_ms int,
  p95_ms int,
  p99_ms int,
  error_rate numeric,
  throughput_rps int,
  cache_hit_ratio numeric,
  cpu_usage_pct numeric,
  memory_usage_pct numeric,
  disk_usage_pct numeric,
  active_connections int,
  queue_depth int,
  metadata jsonb default '{}'::jsonb,
  measured_at timestamptz default now(),
  created_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (region_code) references regions(code) on delete set null,
  
  -- Service validation
  constraint valid_snapshot_service check (service in ('api', 'web', 'edge', 'db', 'worker', 'auth'))
);

-- Cache entries for edge caching
create table if not exists cache_entries (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null,
  content_hash text not null,
  content_type text,
  content_encoding text,
  content_length int,
  etag text,
  expires_at timestamptz not null,
  stale_while_revalidate_seconds int default 300,
  region_code text,
  hit_count int default 0,
  last_hit_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (region_code) references regions(code) on delete set null,
  
  -- Unique constraint for cache key per region
  unique(cache_key, region_code)
);

-- Load test runs for performance testing
create table if not exists load_test_runs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  test_type text not null,
  target_rps int not null,
  duration_seconds int not null,
  region_code text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  status text default 'running',
  results jsonb default '{}'::jsonb,
  artifacts_url text,
  created_by uuid,
  
  -- Foreign key constraints
  foreign key (region_code) references regions(code) on delete set null,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Test type validation
  constraint valid_load_test_type check (test_type in ('smoke', 'load', 'stress', 'spike', 'volume')),
  constraint valid_load_test_status check (status in ('running', 'completed', 'failed', 'aborted'))
);

-- Canary deployments for traffic shifting
create table if not exists canary_deployments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  traffic_percentage int default 0,
  target_percentage int not null,
  increment_percentage int default 10,
  increment_interval_minutes int default 15,
  error_budget_threshold_pct numeric default 1.0,
  auto_promote boolean default false,
  auto_rollback boolean default true,
  status text default 'pending',
  started_at timestamptz,
  promoted_at timestamptz,
  rolled_back_at timestamptz,
  metrics jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Status validation
  constraint valid_canary_status check (status in ('pending', 'active', 'promoting', 'promoted', 'rolling_back', 'rolled_back', 'failed')),
  constraint valid_traffic_percentage check (traffic_percentage >= 0 and traffic_percentage <= 100),
  constraint valid_target_percentage check (target_percentage >= 0 and target_percentage <= 100)
);

-- Performance indexes for regions
create index if not exists idx_regions_code on regions(code);
create index if not exists idx_regions_role_active on regions(role, active);
create index if not exists idx_regions_health_check on regions(last_health_check desc) where active = true;

-- Performance indexes for dr_policies
create index if not exists idx_dr_policies_enabled on dr_policies(enabled, created_at desc);

-- Performance indexes for dr_runs
create index if not exists idx_dr_runs_policy on dr_runs(policy_id, started_at desc);
create index if not exists idx_dr_runs_type_outcome on dr_runs(run_type, outcome, started_at desc);

-- Performance indexes for perf_budgets
create index if not exists idx_perf_budgets_service on perf_budgets(service, enabled);
create index if not exists idx_perf_budgets_metric_type on perf_budgets(metric_type, service);

-- Performance indexes for perf_snapshots
create index if not exists idx_perf_snapshots_service_time on perf_snapshots(service, measured_at desc);
create index if not exists idx_perf_snapshots_region_time on perf_snapshots(region_code, measured_at desc);
create index if not exists idx_perf_snapshots_metric_type on perf_snapshots(metric_type, service, measured_at desc);

-- Performance indexes for cache_entries
create index if not exists idx_cache_entries_key_region on cache_entries(cache_key, region_code);
create index if not exists idx_cache_entries_expires on cache_entries(expires_at);
create index if not exists idx_cache_entries_region_hit on cache_entries(region_code, last_hit_at desc);

-- Performance indexes for load_test_runs
create index if not exists idx_load_test_runs_status on load_test_runs(status, started_at desc);
create index if not exists idx_load_test_runs_region on load_test_runs(region_code, started_at desc);
create index if not exists idx_load_test_runs_type on load_test_runs(test_type, started_at desc);

-- Performance indexes for canary_deployments
create index if not exists idx_canary_deployments_status on canary_deployments(status, created_at desc);
create index if not exists idx_canary_deployments_active on canary_deployments(created_at desc) where status = 'active';

-- RLS policies for regions
alter table regions enable row level security;

create policy if not exists "Regions are viewable by authenticated users" on regions
  for select using (auth.role() = 'authenticated');

create policy if not exists "Regions are manageable by admins" on regions
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for dr_policies
alter table dr_policies enable row level security;

create policy if not exists "DR policies are viewable by authenticated users" on dr_policies
  for select using (auth.role() = 'authenticated');

create policy if not exists "DR policies are manageable by admins" on dr_policies
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for perf_budgets
alter table perf_budgets enable row level security;

create policy if not exists "Performance budgets are viewable by authenticated users" on perf_budgets
  for select using (auth.role() = 'authenticated');

create policy if not exists "Performance budgets are manageable by admins" on perf_budgets
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for perf_snapshots
alter table perf_snapshots enable row level security;

create policy if not exists "Performance snapshots are viewable by authenticated users" on perf_snapshots
  for select using (auth.role() = 'authenticated');

create policy if not exists "Performance snapshots are insertable by service" on perf_snapshots
  for insert with check (true); -- Allow service account inserts

-- RLS policies for cache_entries
alter table cache_entries enable row level security;

create policy if not exists "Cache entries are manageable by service" on cache_entries
  for all with check (true); -- Allow service account management

-- Function to get nearest healthy region
create or replace function get_nearest_region(
  user_region text default null,
  required_role text default 'replica'
)
returns table(
  region_code text,
  region_name text,
  endpoint text,
  latency_ms int
) as $$
begin
  return query
  select 
    r.code,
    r.name,
    r.endpoint,
    r.latency_ms
  from regions r
  where r.active = true
    and r.role = required_role
    and (user_region is null or r.code = user_region or r.code like user_region || '%')
  order by 
    case when r.code = user_region then 0 else 1 end,
    r.latency_ms asc,
    r.last_health_check desc nulls last
  limit 1;
end;
$$ language plpgsql;

-- Function to record performance snapshot
create or replace function record_perf_snapshot(
  service_name text,
  region_code_input text,
  metric_type_input text,
  p50_ms_input int default null,
  p95_ms_input int default null,
  p99_ms_input int default null,
  error_rate_input numeric default null,
  throughput_rps_input int default null,
  cache_hit_ratio_input numeric default null,
  metadata_input jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  snapshot_id uuid;
begin
  insert into perf_snapshots (
    service,
    region_code,
    metric_type,
    p50_ms,
    p95_ms,
    p99_ms,
    error_rate,
    throughput_rps,
    cache_hit_ratio,
    metadata
  ) values (
    service_name,
    region_code_input,
    metric_type_input,
    p50_ms_input,
    p95_ms_input,
    p99_ms_input,
    error_rate_input,
    throughput_rps_input,
    cache_hit_ratio_input,
    metadata_input
  ) returning id into snapshot_id;
  
  return snapshot_id;
end;
$$ language plpgsql;

-- Function to check performance budget
create or replace function check_perf_budget(
  service_name text,
  metric_type_input text,
  measured_value numeric
)
returns table(
  budget_exceeded boolean,
  budget_value numeric,
  measured_value_out numeric,
  threshold_pct numeric
) as $$
declare
  budget_record perf_budgets%rowtype;
  budget_val numeric;
begin
  -- Get budget for service and metric type
  select * into budget_record
  from perf_budgets
  where service = service_name
    and metric_type = metric_type_input
    and enabled = true
  limit 1;
  
  -- If no budget defined, return not exceeded
  if budget_record.id is null then
    return query select false, null::numeric, measured_value, null::numeric;
    return;
  end if;
  
  -- Determine budget value based on metric type
  budget_val := case metric_type_input
    when 'latency' then 
      case 
        when measured_value <= budget_record.p50_ms then budget_record.p50_ms
        when measured_value <= budget_record.p95_ms then budget_record.p95_ms
        else budget_record.p99_ms
      end
    when 'error_rate' then budget_record.error_budget_pct
    when 'availability' then budget_record.availability_pct
    else null
  end;
  
  -- Check if budget is exceeded
  return query select 
    measured_value > budget_val,
    budget_val,
    measured_value,
    budget_record.alert_threshold_pct;
end;
$$ language plpgsql;

-- Insert default regions
insert into regions (code, name, role, endpoint, health_check_url) values
  ('us-east-1', 'US East (Virginia)', 'primary', 'https://api-us-east.buildrunner.cloud', 'https://api-us-east.buildrunner.cloud/health'),
  ('us-west-1', 'US West (California)', 'replica', 'https://api-us-west.buildrunner.cloud', 'https://api-us-west.buildrunner.cloud/health'),
  ('eu-west-1', 'Europe (Ireland)', 'replica', 'https://api-eu-west.buildrunner.cloud', 'https://api-eu-west.buildrunner.cloud/health'),
  ('ap-south-1', 'Asia Pacific (Mumbai)', 'replica', 'https://api-ap-south.buildrunner.cloud', 'https://api-ap-south.buildrunner.cloud/health'),
  ('us-east-1-standby', 'US East Standby', 'standby', 'https://api-standby.buildrunner.cloud', 'https://api-standby.buildrunner.cloud/health')
on conflict (code) do update set
  name = excluded.name,
  endpoint = excluded.endpoint,
  health_check_url = excluded.health_check_url,
  updated_at = now();

-- Insert default DR policy
insert into dr_policies (name, rpo_minutes, rto_minutes, backup_schedule, failover_strategy) values
  ('Default DR Policy', 15, 30, '0 2 * * *', 'hybrid')
on conflict do nothing;

-- Insert default performance budgets
insert into perf_budgets (service, metric_type, p50_ms, p95_ms, p99_ms, error_budget_pct, availability_pct) values
  ('api', 'latency', 100, 400, 900, 1.0, 99.9),
  ('web', 'latency', 800, 2500, 5000, 5.0, 99.5),
  ('edge', 'latency', 50, 200, 500, 0.5, 99.95),
  ('db', 'latency', 10, 50, 200, 0.1, 99.99),
  ('worker', 'latency', 1000, 5000, 15000, 2.0, 99.0),
  ('auth', 'latency', 200, 800, 2000, 0.5, 99.9)
on conflict do nothing;

-- Insert runner_events for multi-region DR migration
insert into runner_events (action, details, metadata) values
  ('multiregion_dr_migration_applied', 'Phase 25 multi-region, performance and disaster recovery migration applied', jsonb_build_object(
    'tables_created', array['regions', 'dr_policies', 'dr_runs', 'perf_budgets', 'perf_snapshots', 'cache_entries', 'load_test_runs', 'canary_deployments'],
    'indexes_created', 15,
    'functions_created', 3,
    'default_regions', 5,
    'default_budgets', 6,
    'phase', 25
  ));

-- Grant necessary permissions
grant select on regions to authenticated;
grant select on dr_policies to authenticated;
grant select on dr_runs to authenticated;
grant select on perf_budgets to authenticated;
grant select on perf_snapshots to authenticated;
grant select, insert, update, delete on cache_entries to service_role;
grant select, insert, update on load_test_runs to authenticated;
grant select on canary_deployments to authenticated;
grant execute on function get_nearest_region to authenticated;
grant execute on function record_perf_snapshot to service_role;
grant execute on function check_perf_budget to service_role;
