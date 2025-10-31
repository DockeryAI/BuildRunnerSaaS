-- Phase 7 QA & Acceptance Automation Tables
-- Idempotent migration for QA system tables

-- QA Templates table for storing reusable acceptance criteria templates
create table if not exists qa_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) > 0 and length(title) <= 200),
  description text check (length(description) <= 1000),
  category text not null check (category in (
    'ui_component', 'api_endpoint', 'authentication', 'data_validation',
    'performance', 'security', 'accessibility', 'integration', 
    'user_workflow', 'error_handling', 'mobile_responsive', 'cross_browser',
    'database_operation', 'file_upload', 'notification', 'reporting',
    'backup_recovery', 'deployment', 'monitoring', 'compliance'
  )),
  criteria jsonb not null check (jsonb_array_length(criteria) > 0),
  tags text[] default '{}',
  variables jsonb default '[]',
  usage_examples jsonb default '[]',
  created_by text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  version text not null default '1.0.0' check (version ~ '^\d+\.\d+\.\d+$'),
  is_active boolean default true
);

-- QA Runs table for storing test execution results
create table if not exists qa_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  microstep_id text,
  template_id uuid references qa_templates(id),
  criteria jsonb not null,
  result jsonb not null,
  evidence jsonb default '{}',
  status text not null check (status in ('pending', 'running', 'passed', 'failed', 'error')),
  started_at timestamptz default now(),
  completed_at timestamptz,
  duration_ms integer,
  runner_version text,
  environment text default 'development',
  triggered_by text not null,
  trigger_type text not null check (trigger_type in ('manual', 'ci', 'scheduled', 'webhook')),
  metadata jsonb default '{}'
);

-- QA Flaky Tests table for tracking unreliable tests
create table if not exists qa_flaky_tests (
  id uuid primary key default gen_random_uuid(),
  test_name text not null,
  test_id text not null,
  failure_rate numeric(5,4) not null check (failure_rate >= 0 and failure_rate <= 1),
  total_runs integer not null check (total_runs > 0),
  failed_runs integer not null check (failed_runs >= 0 and failed_runs <= total_runs),
  last_failure_at timestamptz,
  first_detected_at timestamptz default now(),
  last_analyzed_at timestamptz default now(),
  status text not null default 'active' check (status in ('active', 'investigating', 'fixed', 'ignored')),
  assigned_to text,
  notes text,
  metadata jsonb default '{}'
);

-- QA Evidence Storage table for test artifacts
create table if not exists qa_evidence (
  id uuid primary key default gen_random_uuid(),
  qa_run_id uuid not null references qa_runs(id) on delete cascade,
  criterion_id text not null,
  evidence_type text not null check (evidence_type in (
    'screenshot', 'video', 'log_file', 'network_trace', 'performance_report',
    'accessibility_report', 'security_scan', 'test_output', 'user_action_log'
  )),
  file_path text,
  file_size integer,
  mime_type text,
  storage_url text,
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Demo Scripts table for recording and replaying user interactions
create table if not exists qa_demo_scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) > 0 and length(title) <= 200),
  description text,
  microstep_id text,
  script_data jsonb not null,
  duration_ms integer,
  recorded_by text not null,
  recorded_at timestamptz default now(),
  last_played_at timestamptz,
  play_count integer default 0,
  status text not null default 'active' check (status in ('active', 'archived', 'broken')),
  tags text[] default '{}',
  metadata jsonb default '{}'
);

-- QA Metrics table for tracking overall QA health
create table if not exists qa_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  metric_date date not null default current_date,
  total_runs integer not null default 0,
  passed_runs integer not null default 0,
  failed_runs integer not null default 0,
  flaky_tests integer not null default 0,
  avg_duration_ms integer,
  coverage_percentage numeric(5,2),
  automation_percentage numeric(5,2),
  created_at timestamptz default now(),
  unique(project_id, metric_date)
);

-- Indexes for performance
create index if not exists idx_qa_templates_category on qa_templates(category);
create index if not exists idx_qa_templates_tags on qa_templates using gin(tags);
create index if not exists idx_qa_templates_active on qa_templates(is_active) where is_active = true;

create index if not exists idx_qa_runs_project_microstep on qa_runs(project_id, microstep_id);
create index if not exists idx_qa_runs_status on qa_runs(status);
create index if not exists idx_qa_runs_started_at on qa_runs(started_at desc);
create index if not exists idx_qa_runs_template on qa_runs(template_id);

create index if not exists idx_qa_flaky_tests_name on qa_flaky_tests(test_name);
create index if not exists idx_qa_flaky_tests_status on qa_flaky_tests(status);
create index if not exists idx_qa_flaky_tests_failure_rate on qa_flaky_tests(failure_rate desc);

create index if not exists idx_qa_evidence_run_id on qa_evidence(qa_run_id);
create index if not exists idx_qa_evidence_type on qa_evidence(evidence_type);

create index if not exists idx_qa_demo_scripts_microstep on qa_demo_scripts(microstep_id);
create index if not exists idx_qa_demo_scripts_status on qa_demo_scripts(status);

create index if not exists idx_qa_metrics_project_date on qa_metrics(project_id, metric_date desc);

-- RLS (Row Level Security) policies
alter table qa_templates enable row level security;
alter table qa_runs enable row level security;
alter table qa_flaky_tests enable row level security;
alter table qa_evidence enable row level security;
alter table qa_demo_scripts enable row level security;
alter table qa_metrics enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "qa_templates_read" on qa_templates for select using (true);
create policy "qa_templates_write" on qa_templates for all using (auth.role() = 'service_role' or auth.uid()::text = created_by);

create policy "qa_runs_read" on qa_runs for select using (true);
create policy "qa_runs_write" on qa_runs for all using (auth.role() = 'service_role');

create policy "qa_flaky_tests_read" on qa_flaky_tests for select using (true);
create policy "qa_flaky_tests_write" on qa_flaky_tests for all using (auth.role() = 'service_role');

create policy "qa_evidence_read" on qa_evidence for select using (true);
create policy "qa_evidence_write" on qa_evidence for all using (auth.role() = 'service_role');

create policy "qa_demo_scripts_read" on qa_demo_scripts for select using (true);
create policy "qa_demo_scripts_write" on qa_demo_scripts for all using (auth.role() = 'service_role' or auth.uid()::text = recorded_by);

create policy "qa_metrics_read" on qa_metrics for select using (true);
create policy "qa_metrics_write" on qa_metrics for all using (auth.role() = 'service_role');

-- Functions for QA operations
create or replace function update_qa_metrics()
returns trigger as $$
begin
  insert into qa_metrics (
    project_id,
    metric_date,
    total_runs,
    passed_runs,
    failed_runs
  )
  values (
    new.project_id,
    current_date,
    1,
    case when new.status = 'passed' then 1 else 0 end,
    case when new.status = 'failed' then 1 else 0 end
  )
  on conflict (project_id, metric_date)
  do update set
    total_runs = qa_metrics.total_runs + 1,
    passed_runs = qa_metrics.passed_runs + (case when new.status = 'passed' then 1 else 0 end),
    failed_runs = qa_metrics.failed_runs + (case when new.status = 'failed' then 1 else 0 end);
  
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update metrics when QA runs complete
drop trigger if exists trigger_update_qa_metrics on qa_runs;
create trigger trigger_update_qa_metrics
  after update of status on qa_runs
  for each row
  when (new.status in ('passed', 'failed') and old.status != new.status)
  execute function update_qa_metrics();

-- Function to calculate flaky test rates
create or replace function calculate_flaky_rate(test_identifier text, lookback_days integer default 30)
returns table(
  test_name text,
  total_runs bigint,
  failed_runs bigint,
  failure_rate numeric
) as $$
begin
  return query
  select 
    test_identifier as test_name,
    count(*) as total_runs,
    count(*) filter (where status = 'failed') as failed_runs,
    round(
      count(*) filter (where status = 'failed')::numeric / 
      greatest(count(*), 1)::numeric, 
      4
    ) as failure_rate
  from qa_runs
  where 
    criteria->>'test_id' = test_identifier
    and started_at >= current_date - interval '1 day' * lookback_days
  group by test_identifier;
end;
$$ language plpgsql;

-- Sample data for testing (only insert if tables are empty)
insert into qa_templates (
  id,
  title,
  description,
  category,
  criteria,
  tags,
  created_by,
  version
)
select 
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'API Endpoint Validation',
  'Standard acceptance criteria for REST API endpoints',
  'api_endpoint',
  '[
    {
      "id": "api_response_format",
      "description": "API returns valid JSON response with expected schema",
      "type": "functional",
      "priority": "P1",
      "automation_level": "fully_automated",
      "test_method": "integration_test",
      "expected_result": "Response matches OpenAPI schema definition"
    },
    {
      "id": "api_error_handling", 
      "description": "API returns appropriate HTTP status codes for error conditions",
      "type": "error_handling",
      "priority": "P1",
      "automation_level": "fully_automated",
      "test_method": "integration_test",
      "expected_result": "4xx for client errors, 5xx for server errors"
    }
  ]'::jsonb,
  array['api', 'rest', 'validation', 'json'],
  'system',
  '1.0.0'
where not exists (select 1 from qa_templates where id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
