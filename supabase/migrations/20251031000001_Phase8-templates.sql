-- Phase 8 Templates & Marketplace Tables
-- Idempotent migration for template system

-- Template definitions table for storing template metadata and specs
create table if not exists template_defs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (length(slug) > 0 and length(slug) <= 100),
  title text not null check (length(title) > 0 and length(title) <= 200),
  description text check (length(description) <= 2000),
  json_spec jsonb not null,
  version text not null check (version ~ '^\d+\.\d+\.\d+$'),
  tags text[] default '{}',
  installs_count int default 0 check (installs_count >= 0),
  author_id text,
  is_public boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Template versions table for version history
create table if not exists template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references template_defs(id) on delete cascade,
  version text not null check (version ~ '^\d+\.\d+\.\d+$'),
  json_spec jsonb not null,
  notes text check (length(notes) <= 1000),
  created_by text,
  created_at timestamptz default now(),
  unique(template_id, version)
);

-- Template packs table for composable functionality packs
create table if not exists template_packs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (length(slug) > 0 and length(slug) <= 100),
  title text not null check (length(title) > 0 and length(title) <= 200),
  description text check (length(description) <= 2000),
  json_patch jsonb not null,
  tags text[] default '{}',
  installs_count int default 0 check (installs_count >= 0),
  author_id text,
  is_public boolean default true,
  is_featured boolean default false,
  dependencies text[] default '{}', -- Other pack slugs this depends on
  conflicts text[] default '{}', -- Pack slugs this conflicts with
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Template audit table for tracking all template operations
create table if not exists template_audit (
  id uuid primary key default gen_random_uuid(),
  actor text not null,
  action text not null check (action in (
    'template_created', 'template_updated', 'template_deleted', 'template_published',
    'template_installed', 'template_dry_run', 'pack_created', 'pack_updated', 
    'pack_installed', 'pack_dry_run', 'version_created', 'merge_applied',
    'conflict_resolved', 'template_rated'
  )),
  resource_type text not null check (resource_type in ('template', 'pack', 'version', 'merge')),
  resource_id uuid,
  payload jsonb default '{}',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Template ratings table for user feedback
create table if not exists template_ratings (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references template_defs(id) on delete cascade,
  pack_id uuid references template_packs(id) on delete cascade,
  user_id text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  review text check (length(review) <= 1000),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check ((template_id is not null and pack_id is null) or (template_id is null and pack_id is not null))
);

-- Template collections table for curated template groups
create table if not exists template_collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (length(slug) > 0 and length(slug) <= 100),
  title text not null check (length(title) > 0 and length(title) <= 200),
  description text check (length(description) <= 2000),
  template_ids uuid[] default '{}',
  pack_ids uuid[] default '{}',
  is_public boolean default true,
  is_featured boolean default false,
  created_by text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_template_defs_slug on template_defs(slug);
create index if not exists idx_template_defs_tags on template_defs using gin(tags);
create index if not exists idx_template_defs_public on template_defs(is_public) where is_public = true;
create index if not exists idx_template_defs_featured on template_defs(is_featured) where is_featured = true;
create index if not exists idx_template_defs_installs on template_defs(installs_count desc);
create index if not exists idx_template_defs_created on template_defs(created_at desc);

create index if not exists idx_template_versions_template_id on template_versions(template_id);
create index if not exists idx_template_versions_version on template_versions(template_id, version);
create index if not exists idx_template_versions_created on template_versions(created_at desc);

create index if not exists idx_template_packs_slug on template_packs(slug);
create index if not exists idx_template_packs_tags on template_packs using gin(tags);
create index if not exists idx_template_packs_public on template_packs(is_public) where is_public = true;
create index if not exists idx_template_packs_featured on template_packs(is_featured) where is_featured = true;
create index if not exists idx_template_packs_installs on template_packs(installs_count desc);

create index if not exists idx_template_audit_actor on template_audit(actor);
create index if not exists idx_template_audit_action on template_audit(action);
create index if not exists idx_template_audit_resource on template_audit(resource_type, resource_id);
create index if not exists idx_template_audit_created on template_audit(created_at desc);

create index if not exists idx_template_ratings_template on template_ratings(template_id);
create index if not exists idx_template_ratings_pack on template_ratings(pack_id);
create index if not exists idx_template_ratings_user on template_ratings(user_id);

create index if not exists idx_template_collections_slug on template_collections(slug);
create index if not exists idx_template_collections_public on template_collections(is_public) where is_public = true;

-- RLS (Row Level Security) policies
alter table template_defs enable row level security;
alter table template_versions enable row level security;
alter table template_packs enable row level security;
alter table template_audit enable row level security;
alter table template_ratings enable row level security;
alter table template_collections enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "template_defs_read" on template_defs for select using (is_public = true or auth.uid()::text = author_id);
create policy "template_defs_write" on template_defs for all using (auth.role() = 'service_role' or auth.uid()::text = author_id);

create policy "template_versions_read" on template_versions for select using (
  exists (select 1 from template_defs where id = template_versions.template_id and (is_public = true or auth.uid()::text = author_id))
);
create policy "template_versions_write" on template_versions for all using (auth.role() = 'service_role');

create policy "template_packs_read" on template_packs for select using (is_public = true or auth.uid()::text = author_id);
create policy "template_packs_write" on template_packs for all using (auth.role() = 'service_role' or auth.uid()::text = author_id);

create policy "template_audit_read" on template_audit for select using (true);
create policy "template_audit_write" on template_audit for all using (auth.role() = 'service_role');

create policy "template_ratings_read" on template_ratings for select using (true);
create policy "template_ratings_write" on template_ratings for all using (auth.uid()::text = user_id or auth.role() = 'service_role');

create policy "template_collections_read" on template_collections for select using (is_public = true or auth.uid()::text = created_by);
create policy "template_collections_write" on template_collections for all using (auth.role() = 'service_role' or auth.uid()::text = created_by);

-- Functions for template operations
create or replace function update_template_installs()
returns trigger as $$
begin
  if new.action = 'template_installed' and new.resource_type = 'template' then
    update template_defs 
    set installs_count = installs_count + 1, updated_at = now()
    where id = new.resource_id;
  elsif new.action = 'pack_installed' and new.resource_type = 'pack' then
    update template_packs 
    set installs_count = installs_count + 1, updated_at = now()
    where id = new.resource_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update install counts
drop trigger if exists trigger_update_template_installs on template_audit;
create trigger trigger_update_template_installs
  after insert on template_audit
  for each row
  execute function update_template_installs();

-- Function to calculate average ratings
create or replace function calculate_template_rating(template_uuid uuid)
returns table(
  avg_rating numeric,
  total_ratings bigint
) as $$
begin
  return query
  select 
    round(avg(rating)::numeric, 2) as avg_rating,
    count(*) as total_ratings
  from template_ratings
  where template_id = template_uuid;
end;
$$ language plpgsql;

-- Function to calculate pack ratings
create or replace function calculate_pack_rating(pack_uuid uuid)
returns table(
  avg_rating numeric,
  total_ratings bigint
) as $$
begin
  return query
  select 
    round(avg(rating)::numeric, 2) as avg_rating,
    count(*) as total_ratings
  from template_ratings
  where pack_id = pack_uuid;
end;
$$ language plpgsql;

-- Function to get popular templates
create or replace function get_popular_templates(limit_count int default 10)
returns table(
  id uuid,
  slug text,
  title text,
  description text,
  installs_count int,
  avg_rating numeric,
  total_ratings bigint
) as $$
begin
  return query
  select 
    td.id,
    td.slug,
    td.title,
    td.description,
    td.installs_count,
    coalesce(r.avg_rating, 0) as avg_rating,
    coalesce(r.total_ratings, 0) as total_ratings
  from template_defs td
  left join lateral calculate_template_rating(td.id) r on true
  where td.is_public = true
  order by td.installs_count desc, r.avg_rating desc nulls last
  limit limit_count;
end;
$$ language plpgsql;

-- Sample data for testing (only insert if tables are empty)
insert into template_defs (
  slug, title, description, json_spec, version, tags, author_id, is_featured
)
select 
  'nextjs-starter',
  'Next.js Starter Template',
  'A complete Next.js starter template with TypeScript, Tailwind CSS, and basic project structure',
  '{
    "title": "Next.js Starter Project",
    "milestones": [
      {
        "id": "p1",
        "title": "Project Setup",
        "steps": [
          {
            "id": "p1.s1",
            "title": "Initialize Next.js",
            "microsteps": [
              {
                "id": "p1.s1.ms1",
                "title": "Create Next.js app with TypeScript",
                "status": "todo",
                "criteria": ["Next.js app created", "TypeScript configured", "Basic folder structure in place"]
              }
            ]
          }
        ]
      }
    ]
  }'::jsonb,
  '1.0.0',
  array['nextjs', 'typescript', 'starter'],
  'system',
  true
where not exists (select 1 from template_defs where slug = 'nextjs-starter');

insert into template_packs (
  slug, title, description, json_patch, tags, author_id, is_featured
)
select 
  'supabase-auth',
  'Supabase Authentication Pack',
  'Adds Supabase authentication with login, signup, and user management',
  '[
    {
      "op": "add",
      "path": "/milestones/-",
      "value": {
        "id": "tpl(supabase-auth):p1",
        "title": "Authentication Setup",
        "steps": [
          {
            "id": "tpl(supabase-auth):p1.s1",
            "title": "Supabase Auth Integration",
            "microsteps": [
              {
                "id": "tpl(supabase-auth):p1.s1.ms1",
                "title": "Configure Supabase client",
                "status": "todo",
                "criteria": ["Supabase client configured", "Auth helpers created", "Environment variables set"]
              },
              {
                "id": "tpl(supabase-auth):p1.s1.ms2",
                "title": "Create auth components",
                "status": "todo",
                "criteria": ["Login component created", "Signup component created", "Auth state management implemented"]
              }
            ]
          }
        ]
      }
    }
  ]'::jsonb,
  array['supabase', 'auth', 'authentication'],
  'system',
  true
where not exists (select 1 from template_packs where slug = 'supabase-auth');

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
