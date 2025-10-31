-- Phase 23: Enterprise AI Automation & Cross-Agent Orchestration
-- Idempotent migration for multi-agent workflows, orchestration, and automation systems

-- Agents table for AI agent definitions
create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  type text not null,
  config jsonb default '{}'::jsonb,
  capabilities text[] default '{}',
  enabled boolean default true,
  version text default '1.0.0',
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Agent type validation
  constraint valid_agent_type check (type in ('planner', 'builder', 'qa', 'docs', 'governance', 'cost', 'integration', 'custom'))
);

-- Tools table for agent capabilities and integrations
create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  category text,
  config jsonb default '{}'::jsonb,
  auth_required boolean default false,
  rate_limit_per_hour int default 100,
  cost_per_use_usd numeric default 0,
  enabled boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Category validation
  constraint valid_tool_category check (category in ('git', 'deployment', 'communication', 'analysis', 'testing', 'documentation', 'monitoring', 'custom'))
);

-- Agent tools junction table for tool assignments and scopes
create table if not exists agent_tools (
  agent_id uuid not null,
  tool_id uuid not null,
  scopes text[] not null default '{}',
  permissions jsonb default '{}'::jsonb,
  enabled boolean default true,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (agent_id) references agents(id) on delete cascade,
  foreign key (tool_id) references tools(id) on delete cascade,
  
  -- Primary key
  primary key (agent_id, tool_id)
);

-- Workflows table for workflow definitions
create table if not exists workflows (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  spec jsonb not null,
  version text not null default '1.0.0',
  enabled boolean default true,
  tags text[] default '{}',
  category text,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Category validation
  constraint valid_workflow_category check (category in ('development', 'deployment', 'testing', 'documentation', 'maintenance', 'custom'))
);

-- Workflow runs table for execution instances
create table if not exists workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null,
  status text not null default 'queued',
  trigger_type text default 'manual',
  trigger_data jsonb default '{}'::jsonb,
  input_data jsonb default '{}'::jsonb,
  output_data jsonb default '{}'::jsonb,
  started_at timestamptz,
  finished_at timestamptz,
  sla_ms int,
  attempts int default 0,
  max_attempts int default 3,
  priority int default 0,
  cost_usd numeric default 0,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (workflow_id) references workflows(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Status validation
  constraint valid_run_status check (status in ('queued', 'running', 'waiting_approval', 'failed', 'succeeded', 'aborted', 'timeout')),
  constraint valid_trigger_type check (trigger_type in ('manual', 'scheduled', 'webhook', 'event'))
);

-- Workflow tasks table for individual task executions
create table if not exists workflow_tasks (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  agent_id uuid,
  name text not null,
  type text not null default 'agent_task',
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  status text not null default 'queued',
  try_count int default 0,
  max_retries int default 3,
  timeout_ms int default 300000,
  cost_usd numeric default 0,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  dependencies text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (run_id) references workflow_runs(id) on delete cascade,
  foreign key (agent_id) references agents(id) on delete set null,
  
  -- Status validation
  constraint valid_task_status check (status in ('queued', 'running', 'waiting_approval', 'failed', 'succeeded', 'skipped', 'timeout')),
  constraint valid_task_type check (type in ('agent_task', 'approval_gate', 'condition', 'parallel', 'custom'))
);

-- Run events table for execution logs and traces
create table if not exists run_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  task_id uuid,
  level text not null default 'info',
  event_type text not null,
  message text not null,
  payload jsonb default '{}'::jsonb,
  span_id text,
  trace_id text,
  duration_ms int,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (run_id) references workflow_runs(id) on delete cascade,
  foreign key (task_id) references workflow_tasks(id) on delete cascade,
  
  -- Level validation
  constraint valid_event_level check (level in ('debug', 'info', 'warn', 'error', 'fatal')),
  constraint valid_event_type check (event_type in ('task_started', 'task_completed', 'task_failed', 'approval_requested', 'approval_granted', 'escalation_created', 'budget_exceeded', 'timeout', 'custom'))
);

-- Escalations table for SLA breaches and manual interventions
create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  task_id uuid,
  reason text not null,
  severity text default 'medium',
  assignee uuid,
  resolved boolean default false,
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (run_id) references workflow_runs(id) on delete cascade,
  foreign key (task_id) references workflow_tasks(id) on delete cascade,
  foreign key (assignee) references auth.users(id) on delete set null,
  foreign key (resolved_by) references auth.users(id) on delete set null,
  
  -- Severity validation
  constraint valid_escalation_severity check (severity in ('low', 'medium', 'high', 'critical'))
);

-- Budgets table for cost control and limits
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid,
  tenant_id uuid,
  name text not null,
  monthly_usd numeric default 0,
  per_run_usd numeric default 0,
  daily_usd numeric default 0,
  hard_cap boolean default false,
  current_month_spent numeric default 0,
  current_day_spent numeric default 0,
  alert_threshold_percent numeric default 80,
  enabled boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (workflow_id) references workflows(id) on delete cascade,
  foreign key (tenant_id) references tenants(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null
);

-- Approvals table for human-in-the-loop gates
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  run_id uuid not null,
  status text default 'pending',
  requested_by uuid,
  approved_by uuid,
  approval_data jsonb default '{}'::jsonb,
  justification text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (task_id) references workflow_tasks(id) on delete cascade,
  foreign key (run_id) references workflow_runs(id) on delete cascade,
  foreign key (requested_by) references auth.users(id) on delete set null,
  foreign key (approved_by) references auth.users(id) on delete set null,
  
  -- Status validation
  constraint valid_approval_status check (status in ('pending', 'approved', 'rejected', 'expired'))
);

-- Performance indexes for agents
create index if not exists idx_agents_type on agents(type, enabled);
create index if not exists idx_agents_slug on agents(slug);
create index if not exists idx_agents_enabled on agents(enabled, created_at desc);

-- Performance indexes for tools
create index if not exists idx_tools_category on tools(category, enabled);
create index if not exists idx_tools_slug on tools(slug);
create index if not exists idx_tools_enabled on tools(enabled);

-- Performance indexes for agent_tools
create index if not exists idx_agent_tools_agent on agent_tools(agent_id, enabled);
create index if not exists idx_agent_tools_tool on agent_tools(tool_id, enabled);

-- Performance indexes for workflows
create index if not exists idx_workflows_slug on workflows(slug);
create index if not exists idx_workflows_enabled on workflows(enabled, created_at desc);
create index if not exists idx_workflows_category on workflows(category, enabled);
create index if not exists idx_workflows_tags on workflows using gin(tags);

-- Performance indexes for workflow_runs
create index if not exists idx_workflow_runs_workflow on workflow_runs(workflow_id, created_at desc);
create index if not exists idx_workflow_runs_status on workflow_runs(status, created_at desc);
create index if not exists idx_workflow_runs_created_by on workflow_runs(created_by, created_at desc);
create index if not exists idx_workflow_runs_priority on workflow_runs(priority desc, created_at);

-- Performance indexes for workflow_tasks
create index if not exists idx_workflow_tasks_run on workflow_tasks(run_id, created_at);
create index if not exists idx_workflow_tasks_status on workflow_tasks(status, created_at);
create index if not exists idx_workflow_tasks_agent on workflow_tasks(agent_id, status);
create index if not exists idx_workflow_tasks_dependencies on workflow_tasks using gin(dependencies);

-- Performance indexes for run_events
create index if not exists idx_run_events_run on run_events(run_id, created_at desc);
create index if not exists idx_run_events_task on run_events(task_id, created_at desc);
create index if not exists idx_run_events_level on run_events(level, created_at desc);
create index if not exists idx_run_events_trace on run_events(trace_id, span_id);

-- Performance indexes for escalations
create index if not exists idx_escalations_run on escalations(run_id, created_at desc);
create index if not exists idx_escalations_assignee on escalations(assignee, resolved, created_at desc);
create index if not exists idx_escalations_severity on escalations(severity, resolved, created_at desc);

-- Performance indexes for budgets
create index if not exists idx_budgets_workflow on budgets(workflow_id, enabled);
create index if not exists idx_budgets_tenant on budgets(tenant_id, enabled);

-- Performance indexes for approvals
create index if not exists idx_approvals_task on approvals(task_id);
create index if not exists idx_approvals_run on approvals(run_id, status);
create index if not exists idx_approvals_status on approvals(status, created_at desc);
create index if not exists idx_approvals_pending on approvals(created_at desc) where status = 'pending';

-- RLS policies for agents
alter table agents enable row level security;

create policy if not exists "Agents are viewable by authenticated users" on agents
  for select using (auth.role() = 'authenticated');

create policy if not exists "Agents are manageable by admins" on agents
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for tools
alter table tools enable row level security;

create policy if not exists "Tools are viewable by authenticated users" on tools
  for select using (auth.role() = 'authenticated');

create policy if not exists "Tools are manageable by admins" on tools
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for workflows
alter table workflows enable row level security;

create policy if not exists "Workflows are viewable by authenticated users" on workflows
  for select using (auth.role() = 'authenticated');

create policy if not exists "Workflows are manageable by creators and admins" on workflows
  for all using (
    auth.role() = 'authenticated' and (
      auth.uid() = created_by or
      exists (
        select 1 from user_roles ur 
        where ur.user_id = auth.uid() 
        and ur.role in ('GlobalAdmin', 'TenantAdmin')
      )
    )
  );

-- RLS policies for workflow_runs
alter table workflow_runs enable row level security;

create policy if not exists "Workflow runs are viewable by authenticated users" on workflow_runs
  for select using (auth.role() = 'authenticated');

create policy if not exists "Workflow runs are insertable by authenticated users" on workflow_runs
  for insert with check (auth.role() = 'authenticated');

create policy if not exists "Workflow runs are updatable by service" on workflow_runs
  for update with check (true); -- Allow service account updates

-- RLS policies for workflow_tasks
alter table workflow_tasks enable row level security;

create policy if not exists "Workflow tasks are viewable by authenticated users" on workflow_tasks
  for select using (auth.role() = 'authenticated');

create policy if not exists "Workflow tasks are manageable by service" on workflow_tasks
  for all with check (true); -- Allow service account management

-- RLS policies for run_events
alter table run_events enable row level security;

create policy if not exists "Run events are viewable by authenticated users" on run_events
  for select using (auth.role() = 'authenticated');

create policy if not exists "Run events are insertable by service" on run_events
  for insert with check (true); -- Allow service account inserts

-- RLS policies for escalations
alter table escalations enable row level security;

create policy if not exists "Escalations are viewable by assignees and admins" on escalations
  for select using (
    auth.role() = 'authenticated' and (
      auth.uid() = assignee or
      exists (
        select 1 from user_roles ur 
        where ur.user_id = auth.uid() 
        and ur.role in ('GlobalAdmin', 'TenantAdmin')
      )
    )
  );

create policy if not exists "Escalations are manageable by assignees and admins" on escalations
  for all using (
    auth.role() = 'authenticated' and (
      auth.uid() = assignee or
      exists (
        select 1 from user_roles ur 
        where ur.user_id = auth.uid() 
        and ur.role in ('GlobalAdmin', 'TenantAdmin')
      )
    )
  );

-- RLS policies for budgets
alter table budgets enable row level security;

create policy if not exists "Budgets are viewable by authenticated users" on budgets
  for select using (auth.role() = 'authenticated');

create policy if not exists "Budgets are manageable by admins" on budgets
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for approvals
alter table approvals enable row level security;

create policy if not exists "Approvals are viewable by authenticated users" on approvals
  for select using (auth.role() = 'authenticated');

create policy if not exists "Approvals are updatable by authorized users" on approvals
  for update using (
    auth.role() = 'authenticated' and (
      exists (
        select 1 from user_roles ur 
        where ur.user_id = auth.uid() 
        and ur.role in ('GlobalAdmin', 'TenantAdmin', 'Developer')
      )
    )
  );

-- Function to update workflow run status
create or replace function update_workflow_run_status(run_uuid uuid)
returns void as $$
declare
  task_statuses text[];
  all_succeeded boolean;
  any_failed boolean;
  any_running boolean;
  any_waiting boolean;
begin
  -- Get all task statuses for this run
  select array_agg(status) into task_statuses
  from workflow_tasks 
  where run_id = run_uuid;
  
  -- Determine overall run status
  all_succeeded := not exists(select 1 from unnest(task_statuses) as status where status != 'succeeded');
  any_failed := exists(select 1 from unnest(task_statuses) as status where status = 'failed');
  any_running := exists(select 1 from unnest(task_statuses) as status where status = 'running');
  any_waiting := exists(select 1 from unnest(task_statuses) as status where status = 'waiting_approval');
  
  -- Update run status
  if any_failed then
    update workflow_runs set status = 'failed', finished_at = now() where id = run_uuid;
  elsif any_waiting then
    update workflow_runs set status = 'waiting_approval' where id = run_uuid;
  elsif any_running then
    update workflow_runs set status = 'running' where id = run_uuid;
  elsif all_succeeded then
    update workflow_runs set status = 'succeeded', finished_at = now() where id = run_uuid;
  end if;
end;
$$ language plpgsql;

-- Function to check budget limits
create or replace function check_budget_limits(
  workflow_uuid uuid,
  estimated_cost_usd numeric
)
returns boolean as $$
declare
  budget_record budgets%rowtype;
  current_month_start date;
  current_day_start date;
begin
  -- Get budget for workflow
  select * into budget_record
  from budgets 
  where workflow_id = workflow_uuid and enabled = true
  limit 1;
  
  -- If no budget defined, allow execution
  if budget_record.id is null then
    return true;
  end if;
  
  current_month_start := date_trunc('month', current_date);
  current_day_start := current_date;
  
  -- Check monthly limit
  if budget_record.monthly_usd > 0 then
    if budget_record.current_month_spent + estimated_cost_usd > budget_record.monthly_usd then
      return false;
    end if;
  end if;
  
  -- Check daily limit
  if budget_record.daily_usd > 0 then
    if budget_record.current_day_spent + estimated_cost_usd > budget_record.daily_usd then
      return false;
    end if;
  end if;
  
  -- Check per-run limit
  if budget_record.per_run_usd > 0 then
    if estimated_cost_usd > budget_record.per_run_usd then
      return false;
    end if;
  end if;
  
  return true;
end;
$$ language plpgsql;

-- Function to update budget spending
create or replace function update_budget_spending(
  workflow_uuid uuid,
  actual_cost_usd numeric
)
returns void as $$
declare
  budget_uuid uuid;
begin
  -- Get budget ID for workflow
  select id into budget_uuid
  from budgets 
  where workflow_id = workflow_uuid and enabled = true
  limit 1;
  
  -- Update spending if budget exists
  if budget_uuid is not null then
    update budgets
    set 
      current_month_spent = current_month_spent + actual_cost_usd,
      current_day_spent = current_day_spent + actual_cost_usd,
      updated_at = now()
    where id = budget_uuid;
  end if;
end;
$$ language plpgsql;

-- Trigger to update run status when tasks change
create or replace function trigger_update_run_status()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform update_workflow_run_status(NEW.run_id);
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform update_workflow_run_status(OLD.run_id);
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Apply run status trigger
drop trigger if exists workflow_tasks_status_trigger on workflow_tasks;
create trigger workflow_tasks_status_trigger
  after insert or update or delete on workflow_tasks
  for each row execute function trigger_update_run_status();

-- Insert sample agents
insert into agents (slug, title, description, type, config, capabilities) values
  ('planner-agent', 'Project Planner', 'AI agent for project planning and task breakdown', 'planner', '{"model": "gpt-4", "temperature": 0.3}', array['planning', 'task_breakdown', 'estimation']),
  ('builder-agent', 'Code Builder', 'AI agent for code generation and implementation', 'builder', '{"model": "gpt-4", "temperature": 0.1}', array['code_generation', 'implementation', 'refactoring']),
  ('qa-agent', 'Quality Assurance', 'AI agent for testing and quality validation', 'qa', '{"model": "gpt-4", "temperature": 0.2}', array['testing', 'validation', 'bug_detection']),
  ('docs-agent', 'Documentation', 'AI agent for documentation generation and maintenance', 'docs', '{"model": "gpt-4", "temperature": 0.4}', array['documentation', 'explanation', 'tutorials']),
  ('governance-agent', 'Governance', 'AI agent for policy compliance and governance', 'governance', '{"model": "gpt-4", "temperature": 0.1}', array['compliance', 'policy_check', 'audit']),
  ('cost-agent', 'Cost Optimizer', 'AI agent for cost analysis and optimization', 'cost', '{"model": "gpt-3.5-turbo", "temperature": 0.2}', array['cost_analysis', 'optimization', 'budgeting']),
  ('integration-agent', 'Integration Manager', 'AI agent for third-party integrations', 'integration', '{"model": "gpt-4", "temperature": 0.3}', array['api_integration', 'webhooks', 'data_sync'])
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  config = excluded.config,
  capabilities = excluded.capabilities,
  updated_at = now();

-- Insert sample tools
insert into tools (slug, title, description, category, config) values
  ('git-tool', 'Git Operations', 'Git repository operations and version control', 'git', '{"supported_operations": ["clone", "commit", "push", "pull", "branch", "merge"]}'),
  ('github-tool', 'GitHub API', 'GitHub repository and issue management', 'git', '{"api_version": "v4", "rate_limit": 5000}'),
  ('vercel-tool', 'Vercel Deployment', 'Deploy applications to Vercel platform', 'deployment', '{"regions": ["us-east-1", "eu-west-1"]}'),
  ('jira-tool', 'Jira Integration', 'Jira issue tracking and project management', 'communication', '{"api_version": "3", "webhook_support": true}'),
  ('linear-tool', 'Linear Integration', 'Linear issue tracking and project management', 'communication', '{"api_version": "1", "real_time": true}'),
  ('notion-tool', 'Notion Integration', 'Notion documentation and knowledge management', 'documentation', '{"api_version": "1", "block_types": ["text", "code", "image"]}'),
  ('slack-tool', 'Slack Integration', 'Slack messaging and notifications', 'communication', '{"api_version": "1", "bot_support": true}'),
  ('email-tool', 'Email Notifications', 'Send email notifications and updates', 'communication', '{"providers": ["sendgrid", "ses"]}')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  config = excluded.config,
  updated_at = now();

-- Insert runner_events for orchestration migration
insert into runner_events (action, details, metadata) values
  ('orchestration_migration_applied', 'Phase 23 enterprise AI automation and cross-agent orchestration migration applied', jsonb_build_object(
    'tables_created', array['agents', 'tools', 'agent_tools', 'workflows', 'workflow_runs', 'workflow_tasks', 'run_events', 'escalations', 'budgets', 'approvals'],
    'indexes_created', 30,
    'functions_created', 4,
    'triggers_created', 1,
    'sample_agents', 7,
    'sample_tools', 8,
    'phase', 23
  ));

-- Grant necessary permissions
grant select on agents to authenticated;
grant select on tools to authenticated;
grant select on agent_tools to authenticated;
grant select on workflows to authenticated;
grant select, insert on workflow_runs to authenticated;
grant select on workflow_tasks to authenticated;
grant select on run_events to authenticated;
grant select on escalations to authenticated;
grant select on budgets to authenticated;
grant select, update on approvals to authenticated;
grant execute on function check_budget_limits to service_role;
grant execute on function update_budget_spending to service_role;
grant execute on function update_workflow_run_status to service_role;
