-- Phase 20: Public Launch & Marketplace
-- Idempotent migration for public launch features

-- Marketplace items table for templates, packs, and integrations
create table if not exists marketplace_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('template','pack','integration')),
  slug text unique not null,
  title text not null,
  description text,
  author text not null,
  author_id uuid,
  tags text[] default '{}',
  version text not null default '1.0.0',
  verified boolean default false,
  installs int default 0,
  downloads int default 0,
  rating_avg numeric(3,2) default 0,
  rating_count int default 0,
  content jsonb not null default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  published boolean default false,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (author_id) references auth.users(id) on delete set null
);

-- Marketplace reviews table for user feedback
create table if not exists marketplace_reviews (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null,
  user_id uuid not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  helpful_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (item_id) references marketplace_items(id) on delete cascade,
  foreign key (user_id) references auth.users(id) on delete cascade,
  
  -- Unique constraint to prevent duplicate reviews
  unique(item_id, user_id)
);

-- Marketplace installs table for tracking usage
create table if not exists marketplace_installs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null,
  user_id uuid not null,
  project_id uuid,
  installed_at timestamptz default now(),
  uninstalled_at timestamptz,
  
  -- Foreign key constraints
  foreign key (item_id) references marketplace_items(id) on delete cascade,
  foreign key (user_id) references auth.users(id) on delete cascade,
  foreign key (project_id) references projects(id) on delete cascade
);

-- Referral codes table for growth tracking
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  code text unique not null,
  installs int default 0,
  conversions int default 0,
  credits_earned int default 0,
  active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (user_id) references auth.users(id) on delete cascade
);

-- Feedback table for user satisfaction tracking
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  rating int check (rating between 1 and 5),
  category text,
  comment text,
  page_url text,
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (user_id) references auth.users(id) on delete set null
);

-- Onboarding progress table for tracking user journey
create table if not exists onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  step text not null,
  completed boolean default false,
  data jsonb default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (user_id) references auth.users(id) on delete cascade,
  
  -- Unique constraint for user-step combination
  unique(user_id, step)
);

-- Performance indexes for marketplace_items
create index if not exists idx_marketplace_items_type on marketplace_items(type);
create index if not exists idx_marketplace_items_published on marketplace_items(published, created_at desc);
create index if not exists idx_marketplace_items_featured on marketplace_items(featured, published);
create index if not exists idx_marketplace_items_installs on marketplace_items(installs desc);
create index if not exists idx_marketplace_items_rating on marketplace_items(rating_avg desc, rating_count desc);
create index if not exists idx_marketplace_items_author on marketplace_items(author_id);
create index if not exists idx_marketplace_items_tags on marketplace_items using gin(tags);

-- Performance indexes for marketplace_reviews
create index if not exists idx_marketplace_reviews_item on marketplace_reviews(item_id, created_at desc);
create index if not exists idx_marketplace_reviews_user on marketplace_reviews(user_id);
create index if not exists idx_marketplace_reviews_rating on marketplace_reviews(rating);

-- Performance indexes for marketplace_installs
create index if not exists idx_marketplace_installs_item on marketplace_installs(item_id, installed_at desc);
create index if not exists idx_marketplace_installs_user on marketplace_installs(user_id);
create index if not exists idx_marketplace_installs_project on marketplace_installs(project_id);
create index if not exists idx_marketplace_installs_active on marketplace_installs(item_id, user_id) where uninstalled_at is null;

-- Performance indexes for referral_codes
create index if not exists idx_referral_codes_user on referral_codes(user_id);
create index if not exists idx_referral_codes_active on referral_codes(active, created_at desc);
create index if not exists idx_referral_codes_conversions on referral_codes(conversions desc);

-- Performance indexes for feedback
create index if not exists idx_feedback_user on feedback(user_id);
create index if not exists idx_feedback_category on feedback(category, created_at desc);
create index if not exists idx_feedback_rating on feedback(rating, created_at desc);

-- Performance indexes for onboarding_progress
create index if not exists idx_onboarding_progress_user on onboarding_progress(user_id, step);
create index if not exists idx_onboarding_progress_completed on onboarding_progress(completed, step);

-- RLS policies for marketplace_items
alter table marketplace_items enable row level security;

create policy if not exists "Marketplace items are viewable by all" on marketplace_items
  for select using (published = true or auth.uid() = author_id);

create policy if not exists "Marketplace items are insertable by authenticated users" on marketplace_items
  for insert with check (auth.role() = 'authenticated' and auth.uid() = author_id);

create policy if not exists "Marketplace items are updatable by authors" on marketplace_items
  for update using (auth.role() = 'authenticated' and auth.uid() = author_id);

create policy if not exists "Marketplace items are deletable by authors" on marketplace_items
  for delete using (auth.role() = 'authenticated' and auth.uid() = author_id);

-- RLS policies for marketplace_reviews
alter table marketplace_reviews enable row level security;

create policy if not exists "Marketplace reviews are viewable by all" on marketplace_reviews
  for select using (true);

create policy if not exists "Marketplace reviews are insertable by authenticated users" on marketplace_reviews
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Marketplace reviews are updatable by authors" on marketplace_reviews
  for update using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Marketplace reviews are deletable by authors" on marketplace_reviews
  for delete using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- RLS policies for marketplace_installs
alter table marketplace_installs enable row level security;

create policy if not exists "Marketplace installs are viewable by users" on marketplace_installs
  for select using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Marketplace installs are insertable by authenticated users" on marketplace_installs
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Marketplace installs are updatable by users" on marketplace_installs
  for update using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- RLS policies for referral_codes
alter table referral_codes enable row level security;

create policy if not exists "Referral codes are viewable by owners" on referral_codes
  for select using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Referral codes are insertable by authenticated users" on referral_codes
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Referral codes are updatable by owners" on referral_codes
  for update using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- RLS policies for feedback
alter table feedback enable row level security;

create policy if not exists "Feedback is viewable by admins" on feedback
  for select using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

create policy if not exists "Feedback is insertable by authenticated users" on feedback
  for insert with check (auth.role() = 'authenticated');

-- RLS policies for onboarding_progress
alter table onboarding_progress enable row level security;

create policy if not exists "Onboarding progress is viewable by users" on onboarding_progress
  for select using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Onboarding progress is insertable by authenticated users" on onboarding_progress
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Onboarding progress is updatable by users" on onboarding_progress
  for update using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- Function to update marketplace item rating
create or replace function update_marketplace_item_rating(item_uuid uuid)
returns void as $$
begin
  update marketplace_items 
  set 
    rating_avg = (
      select round(avg(rating)::numeric, 2) 
      from marketplace_reviews 
      where item_id = item_uuid
    ),
    rating_count = (
      select count(*) 
      from marketplace_reviews 
      where item_id = item_uuid
    ),
    updated_at = now()
  where id = item_uuid;
end;
$$ language plpgsql;

-- Function to increment marketplace item installs
create or replace function increment_marketplace_installs(item_uuid uuid)
returns void as $$
begin
  update marketplace_items 
  set 
    installs = installs + 1,
    updated_at = now()
  where id = item_uuid;
end;
$$ language plpgsql;

-- Function to generate unique referral code
create or replace function generate_referral_code(user_uuid uuid)
returns text as $$
declare
  code_candidate text;
  code_exists boolean;
begin
  loop
    -- Generate 8-character alphanumeric code
    code_candidate := upper(substring(md5(random()::text || user_uuid::text) from 1 for 8));
    
    -- Check if code already exists
    select exists(select 1 from referral_codes where code = code_candidate) into code_exists;
    
    -- Exit loop if code is unique
    exit when not code_exists;
  end loop;
  
  return code_candidate;
end;
$$ language plpgsql;

-- Trigger to update marketplace item rating after review changes
create or replace function trigger_update_marketplace_rating()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform update_marketplace_item_rating(NEW.item_id);
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform update_marketplace_item_rating(OLD.item_id);
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Apply rating update trigger
drop trigger if exists marketplace_reviews_rating_trigger on marketplace_reviews;
create trigger marketplace_reviews_rating_trigger
  after insert or update or delete on marketplace_reviews
  for each row execute function trigger_update_marketplace_rating();

-- Insert sample marketplace items for launch
insert into marketplace_items (type, slug, title, description, author, author_id, tags, content, published, featured) values
  ('template', 'react-starter', 'React Starter Template', 'A comprehensive React starter template with TypeScript, Tailwind CSS, and best practices', 'BuildRunner Team', null, array['react', 'typescript', 'tailwind'], '{"files": [], "dependencies": []}', true, true),
  ('template', 'nextjs-saas', 'Next.js SaaS Template', 'Complete SaaS application template with authentication, billing, and dashboard', 'BuildRunner Team', null, array['nextjs', 'saas', 'stripe'], '{"files": [], "dependencies": []}', true, true),
  ('pack', 'auth-pack', 'Authentication Pack', 'Complete authentication system with login, signup, and password reset', 'BuildRunner Team', null, array['auth', 'security'], '{"components": [], "hooks": []}', true, false),
  ('integration', 'github-integration', 'GitHub Integration', 'Seamless GitHub repository integration for project management', 'BuildRunner Team', null, array['github', 'git', 'ci-cd'], '{"endpoints": [], "webhooks": []}', true, false)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();

-- Insert runner_events for launch migration
insert into runner_events (action, details, metadata) values
  ('launch_migration_applied', 'Phase 20 public launch and marketplace migration applied', jsonb_build_object(
    'tables_created', array['marketplace_items', 'marketplace_reviews', 'marketplace_installs', 'referral_codes', 'feedback', 'onboarding_progress'],
    'sample_items', 4,
    'indexes_created', 15,
    'functions_created', 4,
    'phase', 20
  ));

-- Grant necessary permissions
grant select on marketplace_items to anon, authenticated;
grant select on marketplace_reviews to anon, authenticated;
grant select, insert, update on marketplace_installs to authenticated;
grant select, insert, update on referral_codes to authenticated;
grant insert on feedback to authenticated;
grant select, insert, update on onboarding_progress to authenticated;
