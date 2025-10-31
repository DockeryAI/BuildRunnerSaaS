-- Phase 21: Continuous Evaluation & Auto-Optimization
-- Idempotent migration for evaluation, telemetry, and optimization systems

-- Evaluation sets table for organizing test datasets
create table if not exists eval_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  task_type text not null,
  description text,
  notes text,
  version text default '1.0.0',
  active boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Task type validation
  constraint valid_task_type check (task_type in ('planner', 'builder', 'qa', 'explain', 'custom'))
);

-- Evaluation items table for individual test cases
create table if not exists eval_items (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null,
  input jsonb not null,
  expected jsonb,
  tags text[] default '{}',
  weight numeric default 1.0,
  difficulty text default 'medium',
  notes text,
  created_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (set_id) references eval_sets(id) on delete cascade,
  
  -- Difficulty validation
  constraint valid_difficulty check (difficulty in ('easy', 'medium', 'hard', 'expert'))
);

-- Evaluation runs table for tracking execution sessions
create table if not exists eval_runs (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null,
  task_type text not null,
  model_name text not null,
  prompt_template text,
  prompt_version text,
  params jsonb default '{}'::jsonb,
  environment text default 'production',
  triggered_by text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'running',
  total_items int default 0,
  completed_items int default 0,
  avg_score numeric,
  pass_rate numeric,
  total_cost_usd numeric,
  total_tokens int,
  avg_latency_ms int,
  error_count int default 0,
  metadata jsonb default '{}'::jsonb,
  
  -- Foreign key constraint
  foreign key (set_id) references eval_sets(id) on delete cascade,
  
  -- Status validation
  constraint valid_status check (status in ('running', 'completed', 'failed', 'cancelled')),
  constraint valid_environment check (environment in ('development', 'staging', 'production'))
);

-- Evaluation results table for individual test outcomes
create table if not exists eval_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  item_id uuid not null,
  output jsonb,
  score numeric,
  max_score numeric default 1.0,
  metrics jsonb default '{}'::jsonb,
  ok boolean,
  error_message text,
  latency_ms int,
  tokens_in int,
  tokens_out int,
  cost_usd numeric,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (run_id) references eval_runs(id) on delete cascade,
  foreign key (item_id) references eval_items(id) on delete cascade,
  
  -- Score validation
  constraint valid_score check (score >= 0 and score <= max_score)
);

-- Guardrail findings table for safety violations
create table if not exists guardrail_findings (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null,
  category text,
  description text,
  sample jsonb,
  context jsonb default '{}'::jsonb,
  resolved boolean default false,
  resolved_by uuid,
  resolved_at timestamptz,
  resolution_notes text,
  project_id uuid,
  user_id uuid,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (resolved_by) references auth.users(id) on delete set null,
  foreign key (project_id) references projects(id) on delete set null,
  foreign key (user_id) references auth.users(id) on delete set null,
  
  -- Severity validation
  constraint valid_severity check (severity in ('low', 'medium', 'high', 'critical')),
  constraint valid_type check (type in ('content_policy', 'prompt_injection', 'data_leakage', 'bias', 'toxicity', 'custom'))
);

-- Prompt telemetry table for usage analytics
create table if not exists prompt_telemetry (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  user_id uuid,
  task_type text not null,
  model_name text,
  prompt_template text,
  prompt_version text,
  tokens_in int,
  tokens_out int,
  latency_ms int,
  cost_usd numeric,
  outcome text not null,
  error_code text,
  error_category text,
  redacted_input jsonb,
  response_quality text,
  user_satisfaction int,
  session_id text,
  request_id text,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (project_id) references projects(id) on delete set null,
  foreign key (user_id) references auth.users(id) on delete set null,
  
  -- Outcome validation
  constraint valid_outcome check (outcome in ('success', 'error', 'timeout', 'blocked', 'cancelled')),
  constraint valid_quality check (response_quality in ('excellent', 'good', 'fair', 'poor') or response_quality is null),
  constraint valid_satisfaction check (user_satisfaction between 1 and 5 or user_satisfaction is null)
);

-- Prompt variants table for A/B testing
create table if not exists prompt_variants (
  id uuid primary key default gen_random_uuid(),
  task_type text not null,
  name text not null,
  template text not null,
  version text not null,
  description text,
  tags text[] default '{}',
  active boolean default true,
  weight numeric default 1.0,
  performance_score numeric,
  usage_count int default 0,
  success_rate numeric,
  avg_latency_ms int,
  avg_cost_usd numeric,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Unique constraint for task_type + name + version
  unique(task_type, name, version)
);

-- Model performance table for optimization
create table if not exists model_performance (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  task_type text not null,
  prompt_variant_id uuid,
  avg_score numeric,
  avg_latency_ms int,
  avg_cost_usd numeric,
  success_rate numeric,
  sample_count int default 0,
  last_updated timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (prompt_variant_id) references prompt_variants(id) on delete set null,
  
  -- Unique constraint for model + task + prompt combination
  unique(model_name, task_type, prompt_variant_id)
);

-- Performance indexes for eval_sets
create index if not exists idx_eval_sets_task_type on eval_sets(task_type, active);
create index if not exists idx_eval_sets_created on eval_sets(created_at desc);

-- Performance indexes for eval_items
create index if not exists idx_eval_items_set on eval_items(set_id);
create index if not exists idx_eval_items_tags on eval_items using gin(tags);
create index if not exists idx_eval_items_difficulty on eval_items(difficulty);

-- Performance indexes for eval_runs
create index if not exists idx_eval_runs_set on eval_runs(set_id, started_at desc);
create index if not exists idx_eval_runs_model on eval_runs(model_name, task_type);
create index if not exists idx_eval_runs_status on eval_runs(status, started_at desc);
create index if not exists idx_eval_runs_environment on eval_runs(environment, started_at desc);

-- Performance indexes for eval_results
create index if not exists idx_eval_results_run on eval_results(run_id);
create index if not exists idx_eval_results_item on eval_results(item_id);
create index if not exists idx_eval_results_score on eval_results(score desc, ok);
create index if not exists idx_eval_results_created on eval_results(created_at desc);

-- Performance indexes for guardrail_findings
create index if not exists idx_guardrail_findings_severity on guardrail_findings(severity, created_at desc);
create index if not exists idx_guardrail_findings_type on guardrail_findings(type, resolved);
create index if not exists idx_guardrail_findings_project on guardrail_findings(project_id, created_at desc);
create index if not exists idx_guardrail_findings_unresolved on guardrail_findings(created_at desc) where not resolved;

-- Performance indexes for prompt_telemetry
create index if not exists idx_prompt_telemetry_task on prompt_telemetry(task_type, created_at desc);
create index if not exists idx_prompt_telemetry_project on prompt_telemetry(project_id, created_at desc);
create index if not exists idx_prompt_telemetry_outcome on prompt_telemetry(outcome, created_at desc);
create index if not exists idx_prompt_telemetry_model on prompt_telemetry(model_name, task_type);
create index if not exists idx_prompt_telemetry_session on prompt_telemetry(session_id, created_at);

-- Performance indexes for prompt_variants
create index if not exists idx_prompt_variants_task on prompt_variants(task_type, active);
create index if not exists idx_prompt_variants_performance on prompt_variants(performance_score desc, active);
create index if not exists idx_prompt_variants_usage on prompt_variants(usage_count desc);

-- Performance indexes for model_performance
create index if not exists idx_model_performance_model on model_performance(model_name, task_type);
create index if not exists idx_model_performance_score on model_performance(avg_score desc, sample_count desc);
create index if not exists idx_model_performance_updated on model_performance(last_updated desc);

-- RLS policies for eval_sets
alter table eval_sets enable row level security;

create policy if not exists "Eval sets are viewable by authenticated users" on eval_sets
  for select using (auth.role() = 'authenticated');

create policy if not exists "Eval sets are manageable by admins" on eval_sets
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for eval_items
alter table eval_items enable row level security;

create policy if not exists "Eval items are viewable by authenticated users" on eval_items
  for select using (auth.role() = 'authenticated');

create policy if not exists "Eval items are manageable by admins" on eval_items
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for eval_runs
alter table eval_runs enable row level security;

create policy if not exists "Eval runs are viewable by authenticated users" on eval_runs
  for select using (auth.role() = 'authenticated');

create policy if not exists "Eval runs are insertable by service" on eval_runs
  for insert with check (true); -- Allow service account inserts

-- RLS policies for eval_results
alter table eval_results enable row level security;

create policy if not exists "Eval results are viewable by authenticated users" on eval_results
  for select using (auth.role() = 'authenticated');

create policy if not exists "Eval results are insertable by service" on eval_results
  for insert with check (true); -- Allow service account inserts

-- RLS policies for guardrail_findings
alter table guardrail_findings enable row level security;

create policy if not exists "Guardrail findings are viewable by admins" on guardrail_findings
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

create policy if not exists "Guardrail findings are insertable by service" on guardrail_findings
  for insert with check (true); -- Allow service account inserts

-- RLS policies for prompt_telemetry
alter table prompt_telemetry enable row level security;

create policy if not exists "Prompt telemetry is viewable by project members" on prompt_telemetry
  for select using (
    auth.role() = 'authenticated' and (
      project_id is null or
      exists (
        select 1 from project_members pm 
        where pm.project_id = prompt_telemetry.project_id 
        and pm.user_id = auth.uid()
      )
    )
  );

create policy if not exists "Prompt telemetry is insertable by service" on prompt_telemetry
  for insert with check (true); -- Allow service account inserts

-- RLS policies for prompt_variants
alter table prompt_variants enable row level security;

create policy if not exists "Prompt variants are viewable by authenticated users" on prompt_variants
  for select using (auth.role() = 'authenticated');

create policy if not exists "Prompt variants are manageable by admins" on prompt_variants
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for model_performance
alter table model_performance enable row level security;

create policy if not exists "Model performance is viewable by authenticated users" on model_performance
  for select using (auth.role() = 'authenticated');

create policy if not exists "Model performance is updatable by service" on model_performance
  for all with check (true); -- Allow service account updates

-- Function to update eval run statistics
create or replace function update_eval_run_stats(run_uuid uuid)
returns void as $$
begin
  update eval_runs 
  set 
    completed_items = (
      select count(*) 
      from eval_results 
      where run_id = run_uuid
    ),
    avg_score = (
      select round(avg(score)::numeric, 4) 
      from eval_results 
      where run_id = run_uuid and score is not null
    ),
    pass_rate = (
      select round((count(*) filter (where ok))::numeric / count(*)::numeric, 4)
      from eval_results 
      where run_id = run_uuid
    ),
    total_cost_usd = (
      select round(sum(cost_usd)::numeric, 6)
      from eval_results 
      where run_id = run_uuid and cost_usd is not null
    ),
    total_tokens = (
      select sum(coalesce(tokens_in, 0) + coalesce(tokens_out, 0))
      from eval_results 
      where run_id = run_uuid
    ),
    avg_latency_ms = (
      select round(avg(latency_ms)::numeric, 0)
      from eval_results 
      where run_id = run_uuid and latency_ms is not null
    ),
    error_count = (
      select count(*) 
      from eval_results 
      where run_id = run_uuid and not ok
    )
  where id = run_uuid;
end;
$$ language plpgsql;

-- Function to update model performance metrics
create or replace function update_model_performance(
  model_name_param text,
  task_type_param text,
  prompt_variant_id_param uuid default null
)
returns void as $$
begin
  insert into model_performance (
    model_name,
    task_type,
    prompt_variant_id,
    avg_score,
    avg_latency_ms,
    avg_cost_usd,
    success_rate,
    sample_count,
    last_updated
  )
  select 
    model_name_param,
    task_type_param,
    prompt_variant_id_param,
    round(avg(score)::numeric, 4),
    round(avg(latency_ms)::numeric, 0),
    round(avg(cost_usd)::numeric, 6),
    round((count(*) filter (where ok))::numeric / count(*)::numeric, 4),
    count(*),
    now()
  from eval_results er
  join eval_runs run on er.run_id = run.id
  where run.model_name = model_name_param
    and run.task_type = task_type_param
    and (prompt_variant_id_param is null or run.prompt_version = (
      select version from prompt_variants where id = prompt_variant_id_param
    ))
    and er.created_at > now() - interval '30 days'
  on conflict (model_name, task_type, prompt_variant_id)
  do update set
    avg_score = excluded.avg_score,
    avg_latency_ms = excluded.avg_latency_ms,
    avg_cost_usd = excluded.avg_cost_usd,
    success_rate = excluded.success_rate,
    sample_count = excluded.sample_count,
    last_updated = excluded.last_updated;
end;
$$ language plpgsql;

-- Trigger to update eval run stats after result changes
create or replace function trigger_update_eval_run_stats()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform update_eval_run_stats(NEW.run_id);
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform update_eval_run_stats(OLD.run_id);
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Apply eval run stats trigger
drop trigger if exists eval_results_stats_trigger on eval_results;
create trigger eval_results_stats_trigger
  after insert or update or delete on eval_results
  for each row execute function trigger_update_eval_run_stats();

-- Insert runner_events for evals migration
insert into runner_events (action, details, metadata) values
  ('evals_migration_applied', 'Phase 21 continuous evaluation and auto-optimization migration applied', jsonb_build_object(
    'tables_created', array['eval_sets', 'eval_items', 'eval_runs', 'eval_results', 'guardrail_findings', 'prompt_telemetry', 'prompt_variants', 'model_performance'],
    'indexes_created', 20,
    'functions_created', 3,
    'triggers_created', 1,
    'phase', 21
  ));

-- Grant necessary permissions
grant select on eval_sets to authenticated;
grant select on eval_items to authenticated;
grant select on eval_runs to authenticated;
grant select on eval_results to authenticated;
grant select on prompt_variants to authenticated;
grant select on model_performance to authenticated;
grant select, insert on prompt_telemetry to service_role;
grant select, insert on guardrail_findings to service_role;
grant select, insert, update on eval_runs to service_role;
grant select, insert on eval_results to service_role;
