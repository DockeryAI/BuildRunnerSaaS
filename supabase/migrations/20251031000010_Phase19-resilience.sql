-- Phase 19: Offline & Resilience
-- Idempotent migration for offline sync, conflict resolution, and health monitoring

-- Sync events table for offline queue management
create table if not exists sync_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  kind text not null,        -- 'plan_edit', 'microstep_update', 'spec_sync', etc.
  payload jsonb not null,
  status text default 'queued',  -- 'queued', 'processing', 'completed', 'failed', 'conflict'
  attempts int default 0,
  max_attempts int default 5,
  next_run_at timestamptz default now(),
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (project_id) references projects(id) on delete cascade,
  
  -- Status validation
  constraint valid_status check (status in ('queued', 'processing', 'completed', 'failed', 'conflict')),
  constraint valid_kind check (kind in ('plan_edit', 'microstep_update', 'spec_sync', 'state_update', 'comment_add', 'file_upload'))
);

-- Conflict logs table for merge resolution tracking
create table if not exists conflict_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  entity text not null,      -- 'plan', 'state', 'spec', etc.
  entity_id text,            -- specific entity identifier
  base jsonb,                -- common ancestor version
  local jsonb,               -- local changes
  remote jsonb,              -- remote changes
  resolution jsonb,          -- final resolved version
  resolution_strategy text,  -- 'auto', 'manual_local', 'manual_remote', 'manual_merge'
  resolved_by uuid,          -- user who resolved the conflict
  auto_resolved boolean default false,
  created_at timestamptz default now(),
  resolved_at timestamptz,
  
  -- Foreign key constraints
  foreign key (project_id) references projects(id) on delete cascade,
  foreign key (resolved_by) references auth.users(id),
  
  -- Strategy validation
  constraint valid_resolution_strategy check (resolution_strategy in ('auto', 'manual_local', 'manual_remote', 'manual_merge'))
);

-- Outages table for tracking service disruptions
create table if not exists outages (
  id uuid primary key default gen_random_uuid(),
  target text not null,      -- 'supabase_db', 'supabase_edge', 'openai_api', 'github_api', etc.
  started_at timestamptz not null,
  ended_at timestamptz,
  severity text not null,    -- 'low', 'medium', 'high', 'critical'
  notes text,
  impact_description text,
  affected_projects uuid[],
  detected_by text,          -- 'health_probe', 'user_report', 'external_monitor'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Severity validation
  constraint valid_severity check (severity in ('low', 'medium', 'high', 'critical')),
  constraint valid_detected_by check (detected_by in ('health_probe', 'user_report', 'external_monitor'))
);

-- Health snapshots table for monitoring system health
create table if not exists health_snapshots (
  id uuid primary key default gen_random_uuid(),
  target text not null,      -- 'supabase_db', 'supabase_edge', 'openai_api', etc.
  ok boolean not null,
  latency_ms int,
  response_code int,
  error_message text,
  metadata jsonb default '{}'::jsonb,
  taken_at timestamptz default now(),
  
  -- Latency validation
  constraint valid_latency check (latency_ms >= 0)
);

-- Performance indexes for sync_events
create index if not exists idx_sync_events_status on sync_events(status, next_run_at);
create index if not exists idx_sync_events_project on sync_events(project_id, created_at);
create index if not exists idx_sync_events_kind on sync_events(kind, status);
create index if not exists idx_sync_events_attempts on sync_events(attempts, status) where status = 'failed';

-- Performance indexes for conflict_logs
create index if not exists idx_conflict_logs_created on conflict_logs(created_at desc);
create index if not exists idx_conflict_logs_project on conflict_logs(project_id, created_at);
create index if not exists idx_conflict_logs_entity on conflict_logs(entity, entity_id);
create index if not exists idx_conflict_logs_unresolved on conflict_logs(created_at) where resolved_at is null;

-- Performance indexes for outages
create index if not exists idx_outages_target on outages(target, started_at desc);
create index if not exists idx_outages_active on outages(started_at, ended_at) where ended_at is null;
create index if not exists idx_outages_severity on outages(severity, started_at desc);

-- Performance indexes for health_snapshots
create index if not exists idx_health_snapshots_target on health_snapshots(target, taken_at desc);
create index if not exists idx_health_snapshots_recent on health_snapshots(taken_at desc) where taken_at > now() - interval '24 hours';
create index if not exists idx_health_snapshots_status on health_snapshots(ok, target, taken_at desc);

-- RLS policies for sync_events
alter table sync_events enable row level security;

create policy if not exists "Sync events are viewable by project members" on sync_events
  for select using (
    auth.role() = 'authenticated' and (
      project_id is null or
      exists (
        select 1 from project_members pm 
        where pm.project_id = sync_events.project_id 
        and pm.user_id = auth.uid()
      )
    )
  );

create policy if not exists "Sync events are insertable by authenticated users" on sync_events
  for insert with check (auth.role() = 'authenticated');

create policy if not exists "Sync events are updatable by project members" on sync_events
  for update using (
    auth.role() = 'authenticated' and (
      project_id is null or
      exists (
        select 1 from project_members pm 
        where pm.project_id = sync_events.project_id 
        and pm.user_id = auth.uid()
      )
    )
  );

-- RLS policies for conflict_logs
alter table conflict_logs enable row level security;

create policy if not exists "Conflict logs are viewable by project members" on conflict_logs
  for select using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from project_members pm 
      where pm.project_id = conflict_logs.project_id 
      and pm.user_id = auth.uid()
    )
  );

create policy if not exists "Conflict logs are insertable by project members" on conflict_logs
  for insert with check (
    auth.role() = 'authenticated' and
    exists (
      select 1 from project_members pm 
      where pm.project_id = conflict_logs.project_id 
      and pm.user_id = auth.uid()
    )
  );

create policy if not exists "Conflict logs are updatable by project members" on conflict_logs
  for update using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from project_members pm 
      where pm.project_id = conflict_logs.project_id 
      and pm.user_id = auth.uid()
    )
  );

-- RLS policies for outages (admin only)
alter table outages enable row level security;

create policy if not exists "Outages are viewable by authenticated users" on outages
  for select using (auth.role() = 'authenticated');

create policy if not exists "Outages are manageable by admins" on outages
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for health_snapshots (read-only for users)
alter table health_snapshots enable row level security;

create policy if not exists "Health snapshots are viewable by authenticated users" on health_snapshots
  for select using (auth.role() = 'authenticated');

create policy if not exists "Health snapshots are insertable by service" on health_snapshots
  for insert with check (true); -- Allow service account inserts

-- Function to update sync_events updated_at timestamp
create or replace function update_sync_events_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for sync_events updates
drop trigger if exists update_sync_events_updated_at on sync_events;
create trigger update_sync_events_updated_at
  before update on sync_events
  for each row
  execute function update_sync_events_updated_at();

-- Function to update outages updated_at timestamp
create or replace function update_outages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for outages updates
drop trigger if exists update_outages_updated_at on outages;
create trigger update_outages_updated_at
  before update on outages
  for each row
  execute function update_outages_updated_at();

-- Function to automatically set resolved_at when resolution is provided
create or replace function set_conflict_resolved_at()
returns trigger as $$
begin
  if new.resolution is not null and old.resolution is null then
    new.resolved_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger for conflict resolution
drop trigger if exists set_conflict_resolved_at on conflict_logs;
create trigger set_conflict_resolved_at
  before update on conflict_logs
  for each row
  execute function set_conflict_resolved_at();

-- Function to clean up old health snapshots (keep last 7 days)
create or replace function cleanup_old_health_snapshots()
returns void as $$
begin
  delete from health_snapshots 
  where taken_at < now() - interval '7 days';
end;
$$ language plpgsql;

-- Function to get current system health summary
create or replace function get_system_health_summary()
returns jsonb as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'overall_status', case 
      when count(*) filter (where not ok) = 0 then 'healthy'
      when count(*) filter (where not ok) < count(*) / 2 then 'degraded'
      else 'unhealthy'
    end,
    'targets', jsonb_agg(
      jsonb_build_object(
        'target', target,
        'status', case when ok then 'healthy' else 'unhealthy' end,
        'latency_ms', latency_ms,
        'last_check', taken_at
      )
    ),
    'active_outages', (
      select count(*) from outages where ended_at is null
    ),
    'last_updated', now()
  ) into result
  from (
    select distinct on (target) 
      target, ok, latency_ms, taken_at
    from health_snapshots 
    order by target, taken_at desc
  ) latest_health;
  
  return coalesce(result, '{"overall_status": "unknown", "targets": [], "active_outages": 0}'::jsonb);
end;
$$ language plpgsql;

-- Insert runner_events for resilience migration
insert into runner_events (action, details, metadata) values
  ('resilience_migration_applied', 'Phase 19 resilience and offline sync migration applied', jsonb_build_object(
    'tables_created', array['sync_events', 'conflict_logs', 'outages', 'health_snapshots'],
    'indexes_created', 12,
    'functions_created', 5,
    'phase', 19
  ));

-- Grant necessary permissions
grant select, insert, update on sync_events to authenticated;
grant select, insert, update on conflict_logs to authenticated;
grant select on outages to authenticated;
grant select on health_snapshots to authenticated;
grant insert on health_snapshots to service_role;
