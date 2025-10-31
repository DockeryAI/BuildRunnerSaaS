-- Phase 9 Analytics & Cost Monitoring Tables
-- Idempotent migration for analytics and cost tracking

-- Metrics runs table for tracking velocity and quality metrics
create table if not exists metrics_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  phase int not null check (phase > 0),
  microstep_id text not null check (length(microstep_id) > 0),
  velocity numeric not null check (velocity >= 0),
  quality numeric not null check (quality >= 0 and quality <= 100),
  duration_hours numeric default 0 check (duration_hours >= 0),
  ac_passed int default 0 check (ac_passed >= 0),
  ac_total int default 0 check (ac_total >= 0),
  created_by text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cost usage table for tracking provider costs and resource usage
create table if not exists cost_usage (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  provider text not null check (provider in ('openai', 'anthropic', 'supabase', 'vercel', 'github', 'other')),
  service_type text not null check (service_type in ('llm_tokens', 'compute', 'storage', 'bandwidth', 'api_calls')),
  tokens_used bigint default 0 check (tokens_used >= 0),
  compute_seconds numeric default 0 check (compute_seconds >= 0),
  storage_gb numeric default 0 check (storage_gb >= 0),
  api_calls int default 0 check (api_calls >= 0),
  usd_cost numeric not null check (usd_cost >= 0),
  phase int not null check (phase > 0),
  microstep_id text,
  usage_date date not null default current_date,
  billing_period text, -- e.g., '2025-01' for monthly billing
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Anomalies table for tracking cost spikes and quality drops
create table if not exists anomalies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  type text not null check (type in ('cost_spike', 'quality_drop', 'velocity_drop', 'usage_anomaly', 'budget_exceeded')),
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  threshold_value numeric,
  actual_value numeric,
  phase int,
  microstep_id text,
  is_resolved boolean default false,
  resolved_by text,
  resolved_at timestamptz,
  resolution_notes text,
  metadata jsonb default '{}',
  detected_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Budget tracking table for project cost limits
create table if not exists project_budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique,
  monthly_limit_usd numeric not null check (monthly_limit_usd > 0),
  current_month_spend numeric default 0 check (current_month_spend >= 0),
  alert_threshold_percent int default 80 check (alert_threshold_percent > 0 and alert_threshold_percent <= 100),
  is_active boolean default true,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analytics reports table for scheduled report tracking
create table if not exists analytics_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  report_type text not null check (report_type in ('daily', 'weekly', 'monthly', 'custom')),
  format text not null check (format in ('pdf', 'csv', 'json')),
  recipients text[] default '{}',
  file_path text,
  file_size_bytes bigint,
  generation_time_ms int,
  status text not null check (status in ('pending', 'generating', 'completed', 'failed', 'sent')),
  error_message text,
  metadata jsonb default '{}',
  generated_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Performance indexes for efficient querying
create index if not exists idx_metrics_runs_project_phase on metrics_runs(project_id, phase);
create index if not exists idx_metrics_runs_created_at on metrics_runs(created_at desc);
create index if not exists idx_metrics_runs_microstep on metrics_runs(microstep_id);
create index if not exists idx_metrics_runs_quality on metrics_runs(quality);
create index if not exists idx_metrics_runs_velocity on metrics_runs(velocity);

create index if not exists idx_cost_usage_project_phase on cost_usage(project_id, phase);
create index if not exists idx_cost_usage_provider on cost_usage(provider);
create index if not exists idx_cost_usage_date on cost_usage(usage_date desc);
create index if not exists idx_cost_usage_billing_period on cost_usage(billing_period);
create index if not exists idx_cost_usage_cost on cost_usage(usd_cost desc);

create index if not exists idx_anomalies_project on anomalies(project_id);
create index if not exists idx_anomalies_type on anomalies(type);
create index if not exists idx_anomalies_severity on anomalies(severity);
create index if not exists idx_anomalies_detected on anomalies(detected_at desc);
create index if not exists idx_anomalies_unresolved on anomalies(is_resolved) where is_resolved = false;

create index if not exists idx_project_budgets_project on project_budgets(project_id);
create index if not exists idx_project_budgets_active on project_budgets(is_active) where is_active = true;

create index if not exists idx_analytics_reports_project on analytics_reports(project_id);
create index if not exists idx_analytics_reports_status on analytics_reports(status);
create index if not exists idx_analytics_reports_created on analytics_reports(created_at desc);

-- RLS (Row Level Security) policies
alter table metrics_runs enable row level security;
alter table cost_usage enable row level security;
alter table anomalies enable row level security;
alter table project_budgets enable row level security;
alter table analytics_reports enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "metrics_runs_read" on metrics_runs for select using (true);
create policy "metrics_runs_write" on metrics_runs for all using (auth.role() = 'service_role');

create policy "cost_usage_read" on cost_usage for select using (true);
create policy "cost_usage_write" on cost_usage for all using (auth.role() = 'service_role');

create policy "anomalies_read" on anomalies for select using (true);
create policy "anomalies_write" on anomalies for all using (auth.role() = 'service_role');

create policy "project_budgets_read" on project_budgets for select using (true);
create policy "project_budgets_write" on project_budgets for all using (auth.role() = 'service_role');

create policy "analytics_reports_read" on analytics_reports for select using (true);
create policy "analytics_reports_write" on analytics_reports for all using (auth.role() = 'service_role');

-- Functions for analytics calculations
create or replace function calculate_velocity_trend(p_project_id uuid, p_days int default 30)
returns table(
  date date,
  avg_velocity numeric,
  microsteps_completed int
) as $$
begin
  return query
  select 
    date_trunc('day', created_at)::date as date,
    avg(velocity) as avg_velocity,
    count(*)::int as microsteps_completed
  from metrics_runs
  where project_id = p_project_id
    and created_at >= current_date - interval '1 day' * p_days
  group by date_trunc('day', created_at)
  order by date;
end;
$$ language plpgsql;

create or replace function calculate_cost_trend(p_project_id uuid, p_days int default 30)
returns table(
  date date,
  total_cost numeric,
  provider_breakdown jsonb
) as $$
begin
  return query
  select 
    usage_date as date,
    sum(usd_cost) as total_cost,
    jsonb_object_agg(provider, sum(usd_cost)) as provider_breakdown
  from cost_usage
  where project_id = p_project_id
    and usage_date >= current_date - interval '1 day' * p_days
  group by usage_date
  order by date;
end;
$$ language plpgsql;

create or replace function detect_cost_anomalies(p_project_id uuid)
returns void as $$
declare
  recent_avg numeric;
  current_cost numeric;
  spike_threshold numeric := 1.5; -- 50% increase
begin
  -- Calculate recent average daily cost (last 7 days)
  select avg(daily_cost) into recent_avg
  from (
    select sum(usd_cost) as daily_cost
    from cost_usage
    where project_id = p_project_id
      and usage_date >= current_date - interval '7 days'
      and usage_date < current_date
    group by usage_date
  ) recent_costs;

  -- Get today's cost
  select sum(usd_cost) into current_cost
  from cost_usage
  where project_id = p_project_id
    and usage_date = current_date;

  -- Check for cost spike
  if recent_avg > 0 and current_cost > recent_avg * spike_threshold then
    insert into anomalies (
      project_id, type, title, description, severity,
      threshold_value, actual_value, metadata
    ) values (
      p_project_id, 'cost_spike', 'Daily Cost Spike Detected',
      format('Daily cost ($%.2f) exceeded recent average ($%.2f) by %.0f%%',
        current_cost, recent_avg, ((current_cost / recent_avg - 1) * 100)),
      case 
        when current_cost > recent_avg * 2 then 'high'
        when current_cost > recent_avg * 1.8 then 'medium'
        else 'low'
      end,
      recent_avg * spike_threshold,
      current_cost,
      jsonb_build_object(
        'recent_avg', recent_avg,
        'spike_ratio', current_cost / recent_avg,
        'detection_date', current_date
      )
    );
  end if;
end;
$$ language plpgsql;

create or replace function update_project_budget_spend()
returns trigger as $$
begin
  -- Update current month spend when new cost_usage is inserted
  insert into project_budgets (project_id, monthly_limit_usd, current_month_spend)
  values (
    new.project_id,
    1000.00, -- Default monthly limit
    new.usd_cost
  )
  on conflict (project_id) do update set
    current_month_spend = case
      when date_trunc('month', now()) = date_trunc('month', project_budgets.updated_at)
      then project_budgets.current_month_spend + new.usd_cost
      else new.usd_cost -- Reset for new month
    end,
    updated_at = now();

  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update budget spend
drop trigger if exists trigger_update_budget_spend on cost_usage;
create trigger trigger_update_budget_spend
  after insert on cost_usage
  for each row
  execute function update_project_budget_spend();

-- Metrics summary view for aggregated analytics
create or replace view metrics_summary as
select
  coalesce(mr.project_id, cu.project_id) as project_id,
  coalesce(mr.phase, cu.phase) as phase,

  -- Velocity metrics
  avg(mr.velocity) as avg_velocity,
  max(mr.velocity) as max_velocity,
  min(mr.velocity) as min_velocity,
  count(mr.id) as total_microsteps,

  -- Quality metrics
  avg(mr.quality) as avg_quality,
  max(mr.quality) as max_quality,
  min(mr.quality) as min_quality,
  avg(case when mr.ac_total > 0 then (mr.ac_passed::numeric / mr.ac_total * 100) else null end) as avg_ac_pass_rate,

  -- Duration metrics
  avg(mr.duration_hours) as avg_duration_hours,
  sum(mr.duration_hours) as total_duration_hours,

  -- Cost metrics
  sum(cu.usd_cost) as total_cost,
  avg(cu.usd_cost) as avg_cost_per_entry,
  sum(cu.tokens_used) as total_tokens,
  sum(cu.compute_seconds) as total_compute_seconds,
  sum(cu.api_calls) as total_api_calls,

  -- Provider breakdown
  jsonb_object_agg(
    cu.provider,
    jsonb_build_object(
      'cost', sum(cu.usd_cost),
      'tokens', sum(cu.tokens_used),
      'compute_seconds', sum(cu.compute_seconds)
    )
  ) filter (where cu.provider is not null) as provider_breakdown,

  -- Time ranges
  min(coalesce(mr.created_at, cu.created_at)) as first_activity,
  max(coalesce(mr.created_at, cu.created_at)) as last_activity,

  -- Anomaly counts
  (select count(*) from anomalies a
   where a.project_id = coalesce(mr.project_id, cu.project_id)
   and a.phase = coalesce(mr.phase, cu.phase)
   and not a.is_resolved) as unresolved_anomalies

from metrics_runs mr
full outer join cost_usage cu on (mr.project_id = cu.project_id and mr.phase = cu.phase)
group by coalesce(mr.project_id, cu.project_id), coalesce(mr.phase, cu.phase);

-- Project summary view for high-level overview
create or replace view project_summary as
select
  project_id,
  count(distinct phase) as total_phases,
  sum(total_microsteps) as total_microsteps,
  avg(avg_velocity) as overall_avg_velocity,
  avg(avg_quality) as overall_avg_quality,
  sum(total_cost) as total_project_cost,
  sum(total_duration_hours) as total_project_hours,
  sum(unresolved_anomalies) as total_unresolved_anomalies,
  min(first_activity) as project_start,
  max(last_activity) as project_last_activity,

  -- Budget information
  pb.monthly_limit_usd,
  pb.current_month_spend,
  pb.alert_threshold_percent,
  case
    when pb.current_month_spend > pb.monthly_limit_usd then 'over_budget'
    when pb.current_month_spend > (pb.monthly_limit_usd * pb.alert_threshold_percent / 100) then 'approaching_limit'
    else 'within_budget'
  end as budget_status

from metrics_summary ms
left join project_budgets pb on ms.project_id = pb.project_id
group by project_id, pb.monthly_limit_usd, pb.current_month_spend, pb.alert_threshold_percent;

-- Daily metrics view for trend analysis
create or replace view daily_metrics as
select
  project_id,
  phase,
  date_trunc('day', created_at)::date as metric_date,
  count(*) as microsteps_completed,
  avg(velocity) as avg_velocity,
  avg(quality) as avg_quality,
  sum(duration_hours) as total_duration_hours
from metrics_runs
group by project_id, phase, date_trunc('day', created_at)
order by project_id, phase, metric_date;

-- Daily costs view for cost trend analysis
create or replace view daily_costs as
select
  project_id,
  phase,
  usage_date,
  provider,
  sum(usd_cost) as daily_cost,
  sum(tokens_used) as daily_tokens,
  sum(compute_seconds) as daily_compute_seconds,
  sum(api_calls) as daily_api_calls
from cost_usage
group by project_id, phase, usage_date, provider
order by project_id, phase, usage_date, provider;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant select on all views in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
