-- Phase 14 Monetization & Billing
-- Idempotent migration for billing, subscriptions, and usage tracking

-- Billing accounts for organizations
create table if not exists billing_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  stripe_customer_id text unique,
  plan text check (plan in ('free','pro','team','enterprise')) default 'free',
  status text check (status in ('active','inactive','suspended','cancelled')) default 'active',
  renewal_date timestamptz,
  trial_ends_at timestamptz,
  seats_included integer default 1 check (seats_included >= 1),
  seats_used integer default 1 check (seats_used >= 0),
  billing_email text,
  billing_address jsonb default '{}',
  tax_id text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id)
);

-- Subscription details linked to Stripe
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references billing_accounts(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text check (plan in ('free','pro','team','enterprise')) not null,
  seats integer default 1 check (seats >= 1),
  usage_limit_tokens bigint default 100000 check (usage_limit_tokens >= 0),
  usage_limit_api_calls integer default 1000 check (usage_limit_api_calls >= 0),
  usage_limit_storage_gb integer default 1 check (usage_limit_storage_gb >= 0),
  active boolean default true,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  cancelled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usage events for metering and billing
create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  org_id uuid not null,
  billing_account_id uuid references billing_accounts(id) on delete set null,
  event_type text check (event_type in ('tokens','api_calls','storage','compute','integrations')) not null,
  quantity bigint not null check (quantity >= 0),
  unit text not null, -- e.g., 'tokens', 'calls', 'gb', 'minutes'
  phase integer,
  step_id text,
  microstep_id text,
  model_name text,
  integration_provider text,
  usd_cost numeric(10,4) default 0 check (usd_cost >= 0),
  metadata jsonb default '{}',
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Invoices from Stripe
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references billing_accounts(id) on delete cascade,
  stripe_invoice_id text unique not null,
  invoice_number text,
  total_usd numeric(10,2) not null check (total_usd >= 0),
  subtotal_usd numeric(10,2) not null check (subtotal_usd >= 0),
  tax_usd numeric(10,2) default 0 check (tax_usd >= 0),
  currency text default 'usd',
  status text check (status in ('draft','open','paid','void','uncollectible')) not null,
  paid boolean default false,
  payment_intent_id text,
  hosted_invoice_url text,
  invoice_pdf text,
  due_date timestamptz,
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usage quotas and limits per billing account
create table if not exists usage_quotas (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references billing_accounts(id) on delete cascade,
  quota_type text check (quota_type in ('tokens','api_calls','storage','seats','integrations')) not null,
  limit_value bigint not null check (limit_value >= 0),
  used_value bigint default 0 check (used_value >= 0),
  reset_period text check (reset_period in ('monthly','daily','never')) default 'monthly',
  last_reset_at timestamptz default now(),
  alert_threshold numeric(3,2) default 0.9 check (alert_threshold >= 0 and alert_threshold <= 1),
  alert_sent boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(billing_account_id, quota_type)
);

-- Billing events for audit trail
create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid references billing_accounts(id) on delete set null,
  event_type text check (event_type in ('subscription_created','subscription_updated','subscription_cancelled','invoice_paid','invoice_failed','usage_limit_exceeded','plan_upgraded','plan_downgraded')) not null,
  stripe_event_id text,
  actor text, -- user_id or 'stripe' or 'system'
  description text not null,
  old_values jsonb default '{}',
  new_values jsonb default '{}',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Performance indexes
create index if not exists idx_billing_accounts_org_id on billing_accounts(org_id);
create index if not exists idx_billing_accounts_stripe_customer_id on billing_accounts(stripe_customer_id);
create index if not exists idx_billing_accounts_plan on billing_accounts(plan);
create index if not exists idx_billing_accounts_status on billing_accounts(status);

create index if not exists idx_subscriptions_billing_account_id on subscriptions(billing_account_id);
create index if not exists idx_subscriptions_stripe_subscription_id on subscriptions(stripe_subscription_id);
create index if not exists idx_subscriptions_active on subscriptions(active) where active = true;
create index if not exists idx_subscriptions_plan on subscriptions(plan);

create index if not exists idx_usage_events_project_id on usage_events(project_id);
create index if not exists idx_usage_events_org_id on usage_events(org_id);
create index if not exists idx_usage_events_billing_account_id on usage_events(billing_account_id);
create index if not exists idx_usage_events_event_type on usage_events(event_type);
create index if not exists idx_usage_events_recorded_at on usage_events(recorded_at desc);
create index if not exists idx_usage_events_phase on usage_events(phase) where phase is not null;

create index if not exists idx_invoices_billing_account_id on invoices(billing_account_id);
create index if not exists idx_invoices_stripe_invoice_id on invoices(stripe_invoice_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_paid on invoices(paid);
create index if not exists idx_invoices_created_at on invoices(created_at desc);

create index if not exists idx_usage_quotas_billing_account_id on usage_quotas(billing_account_id);
create index if not exists idx_usage_quotas_quota_type on usage_quotas(quota_type);
create index if not exists idx_usage_quotas_alert_threshold on usage_quotas(used_value::numeric / limit_value) where alert_threshold is not null;

create index if not exists idx_billing_events_billing_account_id on billing_events(billing_account_id);
create index if not exists idx_billing_events_event_type on billing_events(event_type);
create index if not exists idx_billing_events_created_at on billing_events(created_at desc);

-- RLS (Row Level Security) policies
alter table billing_accounts enable row level security;
alter table subscriptions enable row level security;
alter table usage_events enable row level security;
alter table invoices enable row level security;
alter table usage_quotas enable row level security;
alter table billing_events enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "billing_accounts_read" on billing_accounts for select using (true);
create policy "billing_accounts_write" on billing_accounts for all using (auth.role() = 'service_role');

create policy "subscriptions_read" on subscriptions for select using (true);
create policy "subscriptions_write" on subscriptions for all using (auth.role() = 'service_role');

create policy "usage_events_read" on usage_events for select using (true);
create policy "usage_events_insert" on usage_events for insert with check (true);
create policy "usage_events_update" on usage_events for update using (auth.role() = 'service_role');

create policy "invoices_read" on invoices for select using (true);
create policy "invoices_write" on invoices for all using (auth.role() = 'service_role');

create policy "usage_quotas_read" on usage_quotas for select using (true);
create policy "usage_quotas_write" on usage_quotas for all using (auth.role() = 'service_role');

create policy "billing_events_read" on billing_events for select using (true);
create policy "billing_events_insert" on billing_events for insert with check (true);

-- Helper functions for billing operations
create or replace function get_billing_account(p_org_id uuid)
returns billing_accounts as $$
declare
  account billing_accounts;
begin
  select * into account from billing_accounts where org_id = p_org_id;
  return account;
end;
$$ language plpgsql;

create or replace function get_current_usage(p_billing_account_id uuid, p_quota_type text)
returns bigint as $$
declare
  usage_sum bigint;
begin
  select coalesce(sum(quantity), 0) into usage_sum
  from usage_events
  where billing_account_id = p_billing_account_id
    and event_type = p_quota_type
    and recorded_at >= date_trunc('month', now());
  
  return usage_sum;
end;
$$ language plpgsql;

create or replace function check_usage_limit(p_billing_account_id uuid, p_quota_type text, p_additional_usage bigint default 0)
returns boolean as $$
declare
  quota_record usage_quotas;
  current_usage bigint;
begin
  -- Get quota for this type
  select * into quota_record
  from usage_quotas
  where billing_account_id = p_billing_account_id
    and quota_type = p_quota_type;
  
  if not found then
    return true; -- No limit set
  end if;
  
  -- Get current usage
  current_usage := get_current_usage(p_billing_account_id, p_quota_type);
  
  -- Check if additional usage would exceed limit
  return (current_usage + p_additional_usage) <= quota_record.limit_value;
end;
$$ language plpgsql;

create or replace function record_usage_event(
  p_project_id uuid,
  p_org_id uuid,
  p_event_type text,
  p_quantity bigint,
  p_unit text,
  p_usd_cost numeric default 0,
  p_metadata jsonb default '{}'
)
returns uuid as $$
declare
  usage_id uuid;
  account_id uuid;
begin
  -- Get billing account
  select id into account_id from billing_accounts where org_id = p_org_id;
  
  -- Insert usage event
  insert into usage_events (
    project_id, org_id, billing_account_id, event_type, quantity, unit, usd_cost, metadata
  ) values (
    p_project_id, p_org_id, account_id, p_event_type, p_quantity, p_unit, p_usd_cost, p_metadata
  ) returning id into usage_id;
  
  -- Update quota usage
  update usage_quotas
  set used_value = used_value + p_quantity,
      updated_at = now()
  where billing_account_id = account_id
    and quota_type = p_event_type;
  
  return usage_id;
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
  if not exists (select 1 from pg_trigger where tgname = 'update_billing_accounts_updated_at') then
    create trigger update_billing_accounts_updated_at
      before update on billing_accounts
      for each row execute procedure update_updated_at_column();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'update_subscriptions_updated_at') then
    create trigger update_subscriptions_updated_at
      before update on subscriptions
      for each row execute procedure update_updated_at_column();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'update_invoices_updated_at') then
    create trigger update_invoices_updated_at
      before update on invoices
      for each row execute procedure update_updated_at_column();
  end if;
  
  if not exists (select 1 from pg_trigger where tgname = 'update_usage_quotas_updated_at') then
    create trigger update_usage_quotas_updated_at
      before update on usage_quotas
      for each row execute procedure update_updated_at_column();
  end if;
end $$;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
