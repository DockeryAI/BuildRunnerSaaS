-- Phase 24: White-Label/OEM, Custom Domains, and Partner API
-- Idempotent migration for partner program, branding, custom domains, and OEM capabilities

-- Partners table for OEM/partner program
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  contact_email text,
  status text not null default 'active',
  description text,
  website_url text,
  logo_url text,
  metadata jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Status validation
  constraint valid_partner_status check (status in ('active', 'inactive', 'suspended', 'pending'))
);

-- Partner API keys for authentication
create table if not exists partner_api_keys (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null,
  name text not null,
  key_hash text not null,
  key_prefix text not null,
  scopes text[] not null default '{}',
  last_used_at timestamptz,
  expires_at timestamptz,
  enabled boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (partner_id) references partners(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Unique constraint for key hash
  unique(key_hash)
);

-- Partner tenant relationships
create table if not exists partner_tenants (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null,
  tenant_id uuid not null,
  role text not null default 'managed',
  permissions jsonb default '{}'::jsonb,
  provisioned_at timestamptz default now(),
  created_by uuid,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (partner_id) references partners(id) on delete cascade,
  foreign key (tenant_id) references tenants(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Role validation
  constraint valid_partner_tenant_role check (role in ('managed', 'reseller', 'white_label', 'affiliate')),
  
  -- Unique constraint for partner-tenant relationship
  unique(partner_id, tenant_id)
);

-- Partner revenue sharing configuration
create table if not exists partner_revshare (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null,
  tenant_id uuid,
  percentage numeric not null,
  minimum_amount_usd numeric default 0,
  maximum_amount_usd numeric,
  active boolean default true,
  effective_from timestamptz default now(),
  effective_until timestamptz,
  created_by uuid,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (partner_id) references partners(id) on delete cascade,
  foreign key (tenant_id) references tenants(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Percentage validation
  constraint valid_revshare_percentage check (percentage >= 0 and percentage <= 100)
);

-- Partner webhooks for event notifications
create table if not exists partner_webhooks (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null,
  url text not null,
  secret_hash text not null,
  events text[] not null default '{}',
  enabled boolean default true,
  last_delivery_at timestamptz,
  last_delivery_status text,
  failure_count int default 0,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (partner_id) references partners(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Delivery status validation
  constraint valid_delivery_status check (last_delivery_status in ('success', 'failed', 'timeout') or last_delivery_status is null)
);

-- Webhook delivery logs
create table if not exists webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  response_status int,
  response_body text,
  delivery_duration_ms int,
  attempt_number int default 1,
  delivered_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (webhook_id) references partner_webhooks(id) on delete cascade
);

-- Tenant branding customization
create table if not exists tenant_branding (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique,
  logo_url text,
  favicon_url text,
  brand_name text,
  theme jsonb default '{}'::jsonb,
  email_templates jsonb default '{}'::jsonb,
  custom_css text,
  enabled boolean default true,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (tenant_id) references tenants(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null
);

-- Custom domain mappings
create table if not exists domain_mappings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  domain text unique not null,
  subdomain text,
  verified boolean default false,
  txt_token text not null,
  txt_record_name text,
  tls_status text default 'pending',
  tls_certificate_id text,
  tls_issued_at timestamptz,
  tls_expires_at timestamptz,
  last_verification_at timestamptz,
  verification_attempts int default 0,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (tenant_id) references tenants(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- TLS status validation
  constraint valid_tls_status check (tls_status in ('pending', 'issued', 'failed', 'expired', 'revoked'))
);

-- Partner API usage tracking
create table if not exists partner_api_usage (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null,
  api_key_id uuid not null,
  endpoint text not null,
  method text not null,
  status_code int not null,
  response_time_ms int,
  request_size_bytes int,
  response_size_bytes int,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (partner_id) references partners(id) on delete cascade,
  foreign key (api_key_id) references partner_api_keys(id) on delete cascade
);

-- Performance indexes for partners
create index if not exists idx_partners_slug on partners(slug);
create index if not exists idx_partners_status on partners(status, created_at desc);

-- Performance indexes for partner_api_keys
create index if not exists idx_partner_api_keys_partner on partner_api_keys(partner_id, enabled);
create index if not exists idx_partner_api_keys_hash on partner_api_keys(key_hash) where enabled = true;
create index if not exists idx_partner_api_keys_prefix on partner_api_keys(key_prefix);

-- Performance indexes for partner_tenants
create index if not exists idx_partner_tenants_partner on partner_tenants(partner_id, created_at desc);
create index if not exists idx_partner_tenants_tenant on partner_tenants(tenant_id);
create index if not exists idx_partner_tenants_role on partner_tenants(role, partner_id);

-- Performance indexes for partner_revshare
create index if not exists idx_partner_revshare_partner on partner_revshare(partner_id, active);
create index if not exists idx_partner_revshare_tenant on partner_revshare(tenant_id, active);
create index if not exists idx_partner_revshare_effective on partner_revshare(effective_from, effective_until) where active = true;

-- Performance indexes for partner_webhooks
create index if not exists idx_partner_webhooks_partner on partner_webhooks(partner_id, enabled);
create index if not exists idx_partner_webhooks_events on partner_webhooks using gin(events);

-- Performance indexes for webhook_deliveries
create index if not exists idx_webhook_deliveries_webhook on webhook_deliveries(webhook_id, delivered_at desc);
create index if not exists idx_webhook_deliveries_event on webhook_deliveries(event_type, delivered_at desc);
create index if not exists idx_webhook_deliveries_status on webhook_deliveries(response_status, delivered_at desc);

-- Performance indexes for tenant_branding
create index if not exists idx_tenant_branding_tenant on tenant_branding(tenant_id) where enabled = true;
create index if not exists idx_tenant_branding_updated on tenant_branding(updated_at desc);

-- Performance indexes for domain_mappings
create index if not exists idx_domain_mappings_tenant on domain_mappings(tenant_id);
create index if not exists idx_domain_mappings_domain on domain_mappings(domain);
create index if not exists idx_domain_mappings_verified on domain_mappings(verified, created_at desc);
create index if not exists idx_domain_mappings_tls on domain_mappings(tls_status, tls_expires_at);

-- Performance indexes for partner_api_usage
create index if not exists idx_partner_api_usage_partner on partner_api_usage(partner_id, created_at desc);
create index if not exists idx_partner_api_usage_key on partner_api_usage(api_key_id, created_at desc);
create index if not exists idx_partner_api_usage_endpoint on partner_api_usage(endpoint, created_at desc);

-- RLS policies for partners
alter table partners enable row level security;

create policy if not exists "Partners are viewable by authenticated users" on partners
  for select using (auth.role() = 'authenticated');

create policy if not exists "Partners are manageable by admins" on partners
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for partner_api_keys
alter table partner_api_keys enable row level security;

create policy if not exists "Partner API keys are viewable by partner admins" on partner_api_keys
  for select using (
    auth.role() = 'authenticated' and (
      exists (
        select 1 from user_roles ur 
        where ur.user_id = auth.uid() 
        and ur.role in ('GlobalAdmin', 'TenantAdmin')
      ) or
      exists (
        select 1 from partner_tenants pt
        join partners p on p.id = pt.partner_id
        where p.id = partner_api_keys.partner_id
        and pt.tenant_id in (
          select tm.tenant_id from tenant_members tm where tm.user_id = auth.uid()
        )
      )
    )
  );

create policy if not exists "Partner API keys are manageable by admins" on partner_api_keys
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for partner_tenants
alter table partner_tenants enable row level security;

create policy if not exists "Partner tenants are viewable by related users" on partner_tenants
  for select using (
    auth.role() = 'authenticated' and (
      exists (
        select 1 from user_roles ur 
        where ur.user_id = auth.uid() 
        and ur.role in ('GlobalAdmin', 'TenantAdmin')
      ) or
      exists (
        select 1 from tenant_members tm 
        where tm.tenant_id = partner_tenants.tenant_id 
        and tm.user_id = auth.uid()
      )
    )
  );

-- RLS policies for tenant_branding
alter table tenant_branding enable row level security;

create policy if not exists "Tenant branding is viewable by tenant members" on tenant_branding
  for select using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from tenant_members tm 
      where tm.tenant_id = tenant_branding.tenant_id 
      and tm.user_id = auth.uid()
    )
  );

create policy if not exists "Tenant branding is manageable by tenant admins" on tenant_branding
  for all using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from tenant_members tm 
      where tm.tenant_id = tenant_branding.tenant_id 
      and tm.user_id = auth.uid()
      and tm.role in ('admin', 'owner')
    )
  );

-- RLS policies for domain_mappings
alter table domain_mappings enable row level security;

create policy if not exists "Domain mappings are viewable by tenant members" on domain_mappings
  for select using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from tenant_members tm 
      where tm.tenant_id = domain_mappings.tenant_id 
      and tm.user_id = auth.uid()
    )
  );

create policy if not exists "Domain mappings are manageable by tenant admins" on domain_mappings
  for all using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from tenant_members tm 
      where tm.tenant_id = domain_mappings.tenant_id 
      and tm.user_id = auth.uid()
      and tm.role in ('admin', 'owner')
    )
  );

-- Function to generate domain verification token
create or replace function generate_domain_verification_token()
returns text as $$
begin
  return 'buildrunner-verify-' || encode(gen_random_bytes(16), 'hex');
end;
$$ language plpgsql;

-- Function to calculate partner revenue share
create or replace function calculate_partner_revenue_share(
  partner_uuid uuid,
  tenant_uuid uuid,
  invoice_amount_usd numeric
)
returns numeric as $$
declare
  revshare_config partner_revshare%rowtype;
  calculated_amount numeric;
begin
  -- Get active revenue share configuration
  select * into revshare_config
  from partner_revshare
  where partner_id = partner_uuid
    and (tenant_id = tenant_uuid or tenant_id is null)
    and active = true
    and effective_from <= now()
    and (effective_until is null or effective_until > now())
  order by tenant_id nulls last, effective_from desc
  limit 1;
  
  -- If no configuration found, return 0
  if revshare_config.id is null then
    return 0;
  end if;
  
  -- Calculate revenue share amount
  calculated_amount := invoice_amount_usd * (revshare_config.percentage / 100.0);
  
  -- Apply minimum and maximum limits
  if revshare_config.minimum_amount_usd is not null then
    calculated_amount := greatest(calculated_amount, revshare_config.minimum_amount_usd);
  end if;
  
  if revshare_config.maximum_amount_usd is not null then
    calculated_amount := least(calculated_amount, revshare_config.maximum_amount_usd);
  end if;
  
  return calculated_amount;
end;
$$ language plpgsql;

-- Function to validate partner API key
create or replace function validate_partner_api_key(
  key_hash_input text,
  required_scopes text[] default '{}'
)
returns table(
  partner_id uuid,
  api_key_id uuid,
  scopes text[]
) as $$
begin
  return query
  select 
    pak.partner_id,
    pak.id as api_key_id,
    pak.scopes
  from partner_api_keys pak
  join partners p on p.id = pak.partner_id
  where pak.key_hash = key_hash_input
    and pak.enabled = true
    and p.status = 'active'
    and (pak.expires_at is null or pak.expires_at > now())
    and (array_length(required_scopes, 1) is null or pak.scopes @> required_scopes);
end;
$$ language plpgsql;

-- Insert sample partners for testing
insert into partners (slug, name, contact_email, status, description) values
  ('acme-corp', 'ACME Corporation', 'partners@acme.com', 'active', 'Enterprise software solutions provider'),
  ('tech-solutions', 'Tech Solutions Inc', 'contact@techsolutions.com', 'active', 'Technology consulting and implementation'),
  ('digital-agency', 'Digital Agency Pro', 'hello@digitalagency.com', 'active', 'Full-service digital marketing agency')
on conflict (slug) do update set
  name = excluded.name,
  contact_email = excluded.contact_email,
  description = excluded.description,
  updated_at = now();

-- Insert runner_events for OEM migration
insert into runner_events (action, details, metadata) values
  ('oem_migration_applied', 'Phase 24 white-label/OEM, custom domains, and partner API migration applied', jsonb_build_object(
    'tables_created', array['partners', 'partner_api_keys', 'partner_tenants', 'partner_revshare', 'partner_webhooks', 'webhook_deliveries', 'tenant_branding', 'domain_mappings', 'partner_api_usage'],
    'indexes_created', 20,
    'functions_created', 3,
    'sample_partners', 3,
    'phase', 24
  ));

-- Grant necessary permissions
grant select on partners to authenticated;
grant select on partner_tenants to authenticated;
grant select on tenant_branding to authenticated;
grant select on domain_mappings to authenticated;
grant select, insert, update on partner_api_usage to service_role;
grant select, insert, update on webhook_deliveries to service_role;
grant execute on function generate_domain_verification_token to authenticated;
grant execute on function calculate_partner_revenue_share to service_role;
grant execute on function validate_partner_api_key to service_role;
