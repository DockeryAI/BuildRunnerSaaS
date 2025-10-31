-- Phase 13 Integrations (Jira / Linear / Preview Environments)
-- Idempotent migration for external system integrations

-- External integrations configuration table
create table if not exists external_integrations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  provider text check (provider in ('jira','linear','vercel','render','netlify','github','slack')) not null,
  name text not null check (length(name) > 0 and length(name) <= 255),
  config jsonb not null default '{}',
  credentials_encrypted text, -- Encrypted API keys/tokens
  active boolean default true,
  last_sync_at timestamptz,
  sync_status text check (sync_status in ('pending','success','failed','disabled')) default 'pending',
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, provider, name)
);

-- Issue links between external systems and microsteps
create table if not exists issue_links (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references external_integrations(id) on delete cascade,
  provider text check (provider in ('jira','linear','github')) not null,
  external_id text not null,
  external_key text, -- e.g., PROJ-123 for Jira
  microstep_id text not null,
  project_id uuid,
  status text not null,
  summary text not null check (length(summary) > 0),
  description text,
  assignee text,
  priority text,
  labels text[],
  url text not null,
  last_synced_at timestamptz default now(),
  sync_direction text check (sync_direction in ('inbound','outbound','bidirectional')) default 'bidirectional',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, external_id)
);

-- Preview environments for branches and PRs
create table if not exists preview_envs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  integration_id uuid references external_integrations(id) on delete set null,
  branch text not null,
  pr_number integer,
  provider text check (provider in ('vercel','render','netlify','heroku','aws','gcp')) not null,
  deployment_id text, -- External deployment ID
  url text,
  status text check (status in ('pending','building','ready','error','cancelled')) default 'pending',
  build_logs_url text,
  commit_sha text,
  environment_type text check (environment_type in ('preview','staging','qa','demo')) default 'preview',
  auto_deploy boolean default true,
  expires_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, branch, provider)
);

-- Integration sync history for audit and debugging
create table if not exists integration_sync_history (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references external_integrations(id) on delete cascade,
  sync_type text check (sync_type in ('full','incremental','webhook','manual')) not null,
  direction text check (direction in ('inbound','outbound','bidirectional')) not null,
  status text check (status in ('started','completed','failed','cancelled')) not null,
  items_processed integer default 0,
  items_created integer default 0,
  items_updated integer default 0,
  items_failed integer default 0,
  error_details jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_ms integer,
  metadata jsonb default '{}'
);

-- Webhook configurations for external systems
create table if not exists integration_webhooks (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid not null references external_integrations(id) on delete cascade,
  webhook_url text not null,
  secret_hash text, -- HMAC secret hash for validation
  events text[] not null, -- e.g., ['issue.updated', 'deployment.ready']
  active boolean default true,
  last_received_at timestamptz,
  total_received integer default 0,
  total_processed integer default 0,
  total_failed integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Performance indexes
create index if not exists idx_external_integrations_project_id on external_integrations(project_id);
create index if not exists idx_external_integrations_provider on external_integrations(provider);
create index if not exists idx_external_integrations_active on external_integrations(active) where active = true;
create index if not exists idx_external_integrations_sync_status on external_integrations(sync_status);

create index if not exists idx_issue_links_integration_id on issue_links(integration_id);
create index if not exists idx_issue_links_microstep_id on issue_links(microstep_id);
create index if not exists idx_issue_links_project_id on issue_links(project_id);
create index if not exists idx_issue_links_provider_external_id on issue_links(provider, external_id);
create index if not exists idx_issue_links_status on issue_links(status);

create index if not exists idx_preview_envs_project_id on preview_envs(project_id);
create index if not exists idx_preview_envs_branch on preview_envs(branch);
create index if not exists idx_preview_envs_provider on preview_envs(provider);
create index if not exists idx_preview_envs_status on preview_envs(status);
create index if not exists idx_preview_envs_pr_number on preview_envs(pr_number) where pr_number is not null;

create index if not exists idx_integration_sync_history_integration_id on integration_sync_history(integration_id);
create index if not exists idx_integration_sync_history_started_at on integration_sync_history(started_at desc);
create index if not exists idx_integration_sync_history_status on integration_sync_history(status);

create index if not exists idx_integration_webhooks_integration_id on integration_webhooks(integration_id);
create index if not exists idx_integration_webhooks_active on integration_webhooks(active) where active = true;

-- RLS (Row Level Security) policies
alter table external_integrations enable row level security;
alter table issue_links enable row level security;
alter table preview_envs enable row level security;
alter table integration_sync_history enable row level security;
alter table integration_webhooks enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "external_integrations_read" on external_integrations for select using (true);
create policy "external_integrations_write" on external_integrations for all using (auth.role() = 'service_role');

create policy "issue_links_read" on issue_links for select using (true);
create policy "issue_links_write" on issue_links for all using (auth.role() = 'service_role');

create policy "preview_envs_read" on preview_envs for select using (true);
create policy "preview_envs_write" on preview_envs for all using (auth.role() = 'service_role');

create policy "integration_sync_history_read" on integration_sync_history for select using (true);
create policy "integration_sync_history_write" on integration_sync_history for all using (auth.role() = 'service_role');

create policy "integration_webhooks_read" on integration_webhooks for select using (true);
create policy "integration_webhooks_write" on integration_webhooks for all using (auth.role() = 'service_role');

-- Helper functions for integrations
create or replace function get_active_integrations(p_project_id uuid, p_provider text default null)
returns setof external_integrations as $$
begin
  return query
  select * from external_integrations
  where project_id = p_project_id
    and active = true
    and (p_provider is null or provider = p_provider)
  order by created_at desc;
end;
$$ language plpgsql;

create or replace function get_microstep_issues(p_microstep_id text)
returns setof issue_links as $$
begin
  return query
  select * from issue_links
  where microstep_id = p_microstep_id
  order by created_at desc;
end;
$$ language plpgsql;

create or replace function get_branch_previews(p_project_id uuid, p_branch text)
returns setof preview_envs as $$
begin
  return query
  select * from preview_envs
  where project_id = p_project_id
    and branch = p_branch
  order by created_at desc;
end;
$$ language plpgsql;

create or replace function record_sync_event(
  p_integration_id uuid,
  p_sync_type text,
  p_direction text,
  p_status text,
  p_items_processed integer default 0,
  p_items_created integer default 0,
  p_items_updated integer default 0,
  p_items_failed integer default 0,
  p_error_details jsonb default null,
  p_duration_ms integer default null
)
returns uuid as $$
declare
  sync_id uuid;
begin
  insert into integration_sync_history (
    integration_id, sync_type, direction, status,
    items_processed, items_created, items_updated, items_failed,
    error_details, duration_ms, completed_at
  ) values (
    p_integration_id, p_sync_type, p_direction, p_status,
    p_items_processed, p_items_created, p_items_updated, p_items_failed,
    p_error_details, p_duration_ms, 
    case when p_status in ('completed', 'failed', 'cancelled') then now() else null end
  ) returning id into sync_id;
  
  return sync_id;
end;
$$ language plpgsql;

-- Trigger to update updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'update_external_integrations_updated_at') then
    create trigger update_external_integrations_updated_at
      before update on external_integrations
      for each row execute procedure update_updated_at_column();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'update_issue_links_updated_at') then
    create trigger update_issue_links_updated_at
      before update on issue_links
      for each row execute procedure update_updated_at_column();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'update_preview_envs_updated_at') then
    create trigger update_preview_envs_updated_at
      before update on preview_envs
      for each row execute procedure update_updated_at_column();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'update_integration_webhooks_updated_at') then
    create trigger update_integration_webhooks_updated_at
      before update on integration_webhooks
      for each row execute procedure update_updated_at_column();
  end if;
end $$;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
