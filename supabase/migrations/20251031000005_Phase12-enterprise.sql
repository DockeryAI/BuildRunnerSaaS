-- Phase 12 Enterprise & Compliance
-- Idempotent migration for SSO, audit, and compliance features

-- Organizations table for enterprise multi-tenancy
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) > 0 and length(name) <= 255),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$' and length(slug) >= 2 and length(slug) <= 63),
  sso_required boolean default false,
  data_residency text check (data_residency in ('us','eu','custom')) default 'us',
  compliance_framework text check (compliance_framework in ('soc2','hipaa','pci','none')) default 'soc2',
  audit_retention_days integer default 365 check (audit_retention_days >= 30 and audit_retention_days <= 2555), -- 7 years max
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Identity Provider configurations for SSO
create table if not exists org_idp (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null check (length(name) > 0 and length(name) <= 255),
  type text check (type in ('saml','oidc','oauth2')) not null,
  enabled boolean default true,
  metadata jsonb not null default '{}',
  -- SAML specific fields
  saml_entity_id text,
  saml_sso_url text,
  saml_certificate text,
  saml_signature_algorithm text default 'RSA-SHA256',
  -- OIDC specific fields
  oidc_issuer text,
  oidc_client_id text,
  oidc_client_secret_encrypted text, -- Encrypted client secret
  oidc_scopes text[] default array['openid', 'email', 'profile'],
  -- Common fields
  attribute_mapping jsonb default '{"email": "email", "name": "name", "groups": "groups"}',
  auto_provision boolean default true,
  default_role text default 'Viewer',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(org_id, name)
);

-- Append-only audit ledger with hash chain for tamper-evidence
create table if not exists audit_ledger (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  project_id uuid,
  actor text not null, -- user ID or system identifier
  action text not null check (length(action) > 0),
  resource_type text, -- e.g., 'project', 'user', 'policy'
  resource_id text,
  payload jsonb not null default '{}',
  metadata jsonb default '{}',
  -- Hash chain for tamper evidence
  prev_hash text,
  hash text not null,
  -- IP and user agent for security
  ip_address inet,
  user_agent text,
  -- Compliance fields
  data_classification text check (data_classification in ('public','internal','confidential','restricted')) default 'internal',
  retention_until timestamptz,
  created_at timestamptz default now()
);

-- Block updates/deletes on audit ledger (enforce append-only)
create or replace function audit_immutable_guard() returns trigger as $$
begin
  raise exception 'audit_ledger is append-only - updates and deletes are not allowed';
end;
$$ language plpgsql;

-- Create triggers to enforce immutability
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'audit_immutable_block_update') then
    create trigger audit_immutable_block_update
      before update on audit_ledger
      for each row execute procedure audit_immutable_guard();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'audit_immutable_block_delete') then
    create trigger audit_immutable_block_delete
      before delete on audit_ledger
      for each row execute procedure audit_immutable_guard();
  end if;
end $$;

-- Function to compute hash for audit entries
create or replace function compute_audit_hash(
  p_id uuid,
  p_actor text,
  p_action text,
  p_payload jsonb,
  p_prev_hash text,
  p_created_at timestamptz
) returns text as $$
begin
  return encode(
    digest(
      p_id::text || '|' || 
      p_actor || '|' || 
      p_action || '|' || 
      p_payload::text || '|' || 
      coalesce(p_prev_hash, '') || '|' || 
      extract(epoch from p_created_at)::text,
      'sha256'
    ),
    'hex'
  );
end;
$$ language plpgsql;

-- Trigger to automatically set hash on audit entries
create or replace function set_audit_hash() returns trigger as $$
declare
  prev_hash_val text;
begin
  -- Get the previous hash from the most recent entry
  select hash into prev_hash_val
  from audit_ledger
  where org_id = new.org_id or (org_id is null and new.org_id is null)
  order by created_at desc, id desc
  limit 1;
  
  -- Set the previous hash and compute new hash
  new.prev_hash := prev_hash_val;
  new.hash := compute_audit_hash(
    new.id,
    new.actor,
    new.action,
    new.payload,
    new.prev_hash,
    new.created_at
  );
  
  return new;
end;
$$ language plpgsql;

-- Create trigger for hash computation
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'audit_set_hash_trigger') then
    create trigger audit_set_hash_trigger
      before insert on audit_ledger
      for each row execute procedure set_audit_hash();
  end if;
end $$;

-- SSO sessions for tracking active SSO logins
create table if not exists sso_sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  idp_id uuid not null references org_idp(id) on delete cascade,
  user_id uuid not null,
  session_id text not null,
  saml_session_index text, -- For SAML logout
  oidc_id_token_hash text, -- For OIDC logout
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  unique(session_id)
);

-- Access reviews for compliance
create table if not exists access_reviews (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  review_period text not null, -- e.g., '2024-Q1'
  status text check (status in ('pending','in_progress','completed','overdue')) default 'pending',
  reviewer_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  due_date timestamptz not null,
  findings jsonb default '{}',
  actions_taken jsonb default '{}',
  created_at timestamptz default now(),
  unique(org_id, review_period)
);

-- Access review items (individual user/role reviews)
create table if not exists access_review_items (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references access_reviews(id) on delete cascade,
  user_id uuid not null,
  project_id uuid,
  current_role text not null,
  recommended_action text check (recommended_action in ('keep','modify','remove','escalate')) default 'keep',
  justification text,
  approved boolean,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz default now()
);

-- Key rotation tracking
create table if not exists key_rotations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  key_type text not null, -- e.g., 'openai_api_key', 'webhook_secret'
  key_identifier text not null, -- masked or hashed identifier
  rotation_reason text check (rotation_reason in ('scheduled','compromised','compliance','manual')) default 'scheduled',
  rotated_by uuid,
  old_key_hash text, -- Hash of old key for verification
  new_key_hash text, -- Hash of new key for verification
  rotation_status text check (rotation_status in ('pending','completed','failed','rolled_back')) default 'pending',
  scheduled_for timestamptz,
  completed_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Performance indexes
create index if not exists idx_orgs_slug on orgs(slug);
create index if not exists idx_orgs_sso_required on orgs(sso_required) where sso_required = true;

create index if not exists idx_org_idp_org_id on org_idp(org_id);
create index if not exists idx_org_idp_type on org_idp(type);
create index if not exists idx_org_idp_enabled on org_idp(enabled) where enabled = true;

create index if not exists idx_audit_ledger_org_id on audit_ledger(org_id);
create index if not exists idx_audit_ledger_actor on audit_ledger(actor);
create index if not exists idx_audit_ledger_action on audit_ledger(action);
create index if not exists idx_audit_ledger_created_at on audit_ledger(created_at desc);
create index if not exists idx_audit_ledger_resource on audit_ledger(resource_type, resource_id);
create index if not exists idx_audit_ledger_retention on audit_ledger(retention_until) where retention_until is not null;

create index if not exists idx_sso_sessions_org_id on sso_sessions(org_id);
create index if not exists idx_sso_sessions_user_id on sso_sessions(user_id);
create index if not exists idx_sso_sessions_expires_at on sso_sessions(expires_at);
create index if not exists idx_sso_sessions_session_id on sso_sessions(session_id);

create index if not exists idx_access_reviews_org_id on access_reviews(org_id);
create index if not exists idx_access_reviews_status on access_reviews(status);
create index if not exists idx_access_reviews_due_date on access_reviews(due_date);

create index if not exists idx_access_review_items_review_id on access_review_items(review_id);
create index if not exists idx_access_review_items_user_id on access_review_items(user_id);

create index if not exists idx_key_rotations_org_id on key_rotations(org_id);
create index if not exists idx_key_rotations_key_type on key_rotations(key_type);
create index if not exists idx_key_rotations_status on key_rotations(rotation_status);
create index if not exists idx_key_rotations_scheduled on key_rotations(scheduled_for);

-- RLS (Row Level Security) policies
alter table orgs enable row level security;
alter table org_idp enable row level security;
alter table audit_ledger enable row level security;
alter table sso_sessions enable row level security;
alter table access_reviews enable row level security;
alter table access_review_items enable row level security;
alter table key_rotations enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "orgs_read" on orgs for select using (true);
create policy "orgs_write" on orgs for all using (auth.role() = 'service_role');

create policy "org_idp_read" on org_idp for select using (true);
create policy "org_idp_write" on org_idp for all using (auth.role() = 'service_role');

create policy "audit_ledger_read" on audit_ledger for select using (true);
create policy "audit_ledger_insert" on audit_ledger for insert with check (true);

create policy "sso_sessions_read" on sso_sessions for select using (true);
create policy "sso_sessions_write" on sso_sessions for all using (auth.role() = 'service_role');

create policy "access_reviews_read" on access_reviews for select using (true);
create policy "access_reviews_write" on access_reviews for all using (auth.role() = 'service_role');

create policy "access_review_items_read" on access_review_items for select using (true);
create policy "access_review_items_write" on access_review_items for all using (auth.role() = 'service_role');

create policy "key_rotations_read" on key_rotations for select using (true);
create policy "key_rotations_write" on key_rotations for all using (auth.role() = 'service_role');

-- Helper functions for enterprise features
create or replace function get_org_by_slug(p_slug text)
returns orgs as $$
declare
  org_record orgs;
begin
  select * into org_record from orgs where slug = p_slug;
  return org_record;
end;
$$ language plpgsql;

create or replace function is_sso_required(p_org_id uuid)
returns boolean as $$
declare
  sso_req boolean;
begin
  select sso_required into sso_req from orgs where id = p_org_id;
  return coalesce(sso_req, false);
end;
$$ language plpgsql;

create or replace function log_audit_event(
  p_org_id uuid,
  p_project_id uuid,
  p_actor text,
  p_action text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_payload jsonb default '{}',
  p_metadata jsonb default '{}',
  p_ip_address inet default null,
  p_user_agent text default null
)
returns uuid as $$
declare
  audit_id uuid;
begin
  insert into audit_ledger (
    org_id, project_id, actor, action, resource_type, resource_id,
    payload, metadata, ip_address, user_agent
  ) values (
    p_org_id, p_project_id, p_actor, p_action, p_resource_type, p_resource_id,
    p_payload, p_metadata, p_ip_address, p_user_agent
  ) returning id into audit_id;
  
  return audit_id;
end;
$$ language plpgsql;

-- Insert default organization for existing installations
insert into orgs (name, slug, sso_required, data_residency, compliance_framework)
values ('Default Organization', 'default', false, 'us', 'soc2')
on conflict (slug) do nothing;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
