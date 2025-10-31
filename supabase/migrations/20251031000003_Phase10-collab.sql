-- Phase 10 Collaboration & Comments Integration
-- Idempotent migration for roles, comments, notifications, and external integrations

-- Organizations and membership
create table if not exists org_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  org_id uuid not null,
  role text check (role in ('owner', 'admin', 'member')) default 'member',
  invited_by uuid,
  invited_at timestamptz,
  joined_at timestamptz default now(),
  is_active boolean default true,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, org_id)
);

-- Project role bindings
create table if not exists role_bindings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  user_id uuid not null,
  role text check (role in ('PM', 'TechLead', 'QA', 'Contributor', 'Viewer')) not null,
  assigned_by uuid,
  assigned_at timestamptz default now(),
  is_active boolean default true,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, user_id, role)
);

-- Plan limits and seat management
create table if not exists plan_limits (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique,
  plan_type text check (plan_type in ('free', 'pro', 'team', 'enterprise')) default 'free',
  max_seats int not null default 3,
  max_projects int not null default 1,
  max_storage_gb int not null default 1,
  features jsonb default '{}',
  billing_cycle text check (billing_cycle in ('monthly', 'yearly')) default 'monthly',
  is_active boolean default true,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Comments system
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  entity_type text check (entity_type in ('milestone', 'step', 'microstep', 'plan', 'test', 'file')) not null,
  entity_id text not null,
  parent_id uuid references comments(id) on delete cascade, -- For threaded comments
  body text not null check (length(body) > 0 and length(body) <= 10000),
  body_html text, -- Rendered markdown
  links jsonb default '{}', -- External links (PRs, files, tests)
  author_id uuid not null,
  is_edited boolean default false,
  edited_at timestamptz,
  is_resolved boolean default false,
  resolved_by uuid,
  resolved_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mentions in comments
create table if not exists mentions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments(id) on delete cascade,
  user_id uuid not null,
  mention_type text check (mention_type in ('user', 'role', 'team')) default 'user',
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now(),
  unique(comment_id, user_id)
);

-- Comment subscriptions for notifications
create table if not exists comment_subscriptions (
  id uuid primary key default gen_random_uuid(),
  entity_type text check (entity_type in ('milestone', 'step', 'microstep', 'plan', 'test', 'file')) not null,
  entity_id text not null,
  user_id uuid not null,
  subscription_type text check (subscription_type in ('auto', 'manual', 'mentioned')) default 'manual',
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(entity_type, entity_id, user_id)
);

-- Notifications system
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text check (type in ('comment', 'mention', 'promotion', 'role_change', 'project_invite', 'system')) not null,
  title text not null,
  body text,
  link text,
  entity_type text,
  entity_id text,
  actor_id uuid, -- Who triggered the notification
  is_read boolean default false,
  read_at timestamptz,
  priority text check (priority in ('low', 'normal', 'high', 'urgent')) default 'normal',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Project integrations for webhooks
create table if not exists project_integrations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique,
  slack_webhook text,
  discord_webhook text,
  email_enabled boolean default false,
  webhook_events text[] default array['comment', 'mention', 'promotion'],
  notification_settings jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- External issues mapping (Jira/Linear stubs)
create table if not exists external_issues (
  id uuid primary key default gen_random_uuid(),
  provider text check (provider in ('jira', 'linear', 'github', 'asana')) not null,
  external_id text not null,
  external_key text, -- Issue key (e.g., PROJ-123)
  entity_type text check (entity_type in ('milestone', 'step', 'microstep', 'comment')) not null,
  entity_id text not null,
  project_id uuid not null,
  title text,
  status text,
  priority text,
  assignee text,
  link text,
  sync_status text check (sync_status in ('pending', 'synced', 'failed', 'disabled')) default 'pending',
  last_sync_at timestamptz,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider, external_id)
);

-- User presence tracking
create table if not exists user_presence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  project_id uuid not null,
  entity_type text,
  entity_id text,
  status text check (status in ('online', 'away', 'offline')) default 'online',
  last_seen_at timestamptz default now(),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, project_id)
);

-- Performance indexes
create index if not exists idx_org_members_user on org_members(user_id);
create index if not exists idx_org_members_org on org_members(org_id);
create index if not exists idx_role_bindings_project_user on role_bindings(project_id, user_id);
create index if not exists idx_role_bindings_user on role_bindings(user_id);

create index if not exists idx_comments_entity on comments(entity_type, entity_id);
create index if not exists idx_comments_project on comments(project_id);
create index if not exists idx_comments_author on comments(author_id);
create index if not exists idx_comments_created on comments(created_at desc);
create index if not exists idx_comments_parent on comments(parent_id);

create index if not exists idx_mentions_user on mentions(user_id);
create index if not exists idx_mentions_comment on mentions(comment_id);
create index if not exists idx_mentions_unread on mentions(user_id, is_read) where is_read = false;

create index if not exists idx_subscriptions_entity on comment_subscriptions(entity_type, entity_id);
create index if not exists idx_subscriptions_user on comment_subscriptions(user_id);

create index if not exists idx_notifications_user on notifications(user_id);
create index if not exists idx_notifications_unread on notifications(user_id, is_read) where is_read = false;
create index if not exists idx_notifications_created on notifications(created_at desc);

create index if not exists idx_external_issues_provider on external_issues(provider, external_id);
create index if not exists idx_external_issues_entity on external_issues(entity_type, entity_id);
create index if not exists idx_external_issues_project on external_issues(project_id);

create index if not exists idx_user_presence_project on user_presence(project_id);
create index if not exists idx_user_presence_user on user_presence(user_id);

-- RLS (Row Level Security) policies
alter table org_members enable row level security;
alter table role_bindings enable row level security;
alter table plan_limits enable row level security;
alter table comments enable row level security;
alter table mentions enable row level security;
alter table comment_subscriptions enable row level security;
alter table notifications enable row level security;
alter table project_integrations enable row level security;
alter table external_issues enable row level security;
alter table user_presence enable row level security;

-- Basic RLS policies (can be customized based on auth requirements)
create policy "org_members_read" on org_members for select using (true);
create policy "org_members_write" on org_members for all using (auth.role() = 'service_role');

create policy "role_bindings_read" on role_bindings for select using (true);
create policy "role_bindings_write" on role_bindings for all using (auth.role() = 'service_role');

create policy "comments_read" on comments for select using (true);
create policy "comments_write" on comments for all using (auth.role() = 'service_role');

create policy "mentions_read" on mentions for select using (true);
create policy "mentions_write" on mentions for all using (auth.role() = 'service_role');

create policy "notifications_read" on notifications for select using (true);
create policy "notifications_write" on notifications for all using (auth.role() = 'service_role');

create policy "external_issues_read" on external_issues for select using (true);
create policy "external_issues_write" on external_issues for all using (auth.role() = 'service_role');

-- Functions for collaboration features
create or replace function get_user_role_in_project(p_user_id uuid, p_project_id uuid)
returns text as $$
declare
  user_role text;
begin
  select role into user_role
  from role_bindings
  where user_id = p_user_id
    and project_id = p_project_id
    and is_active = true
  order by 
    case role
      when 'PM' then 1
      when 'TechLead' then 2
      when 'QA' then 3
      when 'Contributor' then 4
      when 'Viewer' then 5
    end
  limit 1;
  
  return coalesce(user_role, 'Viewer');
end;
$$ language plpgsql;

create or replace function can_user_perform_action(p_user_id uuid, p_project_id uuid, p_action text)
returns boolean as $$
declare
  user_role text;
begin
  user_role := get_user_role_in_project(p_user_id, p_project_id);
  
  case p_action
    when 'comment_create' then
      return user_role in ('PM', 'TechLead', 'QA', 'Contributor');
    when 'comment_delete' then
      return user_role in ('PM', 'TechLead');
    when 'promote_to_microstep' then
      return user_role in ('PM', 'TechLead');
    when 'manage_roles' then
      return user_role in ('PM');
    when 'view_project' then
      return user_role in ('PM', 'TechLead', 'QA', 'Contributor', 'Viewer');
    else
      return false;
  end case;
end;
$$ language plpgsql;

create or replace function extract_mentions_from_text(comment_text text)
returns text[] as $$
declare
  mentions text[];
begin
  -- Extract @username patterns from comment text
  select array_agg(substring(match from 2))
  into mentions
  from regexp_split_to_table(comment_text, '\s+') as match
  where match ~ '^@[a-zA-Z0-9_-]+$';
  
  return coalesce(mentions, array[]::text[]);
end;
$$ language plpgsql;

create or replace function notify_comment_subscribers()
returns trigger as $$
declare
  subscriber_id uuid;
  mention_username text;
  mentioned_user_id uuid;
begin
  -- Notify subscribers of the entity
  for subscriber_id in
    select user_id
    from comment_subscriptions
    where entity_type = new.entity_type
      and entity_id = new.entity_id
      and user_id != new.author_id
      and is_active = true
  loop
    insert into notifications (user_id, type, title, body, link, entity_type, entity_id, actor_id)
    values (
      subscriber_id,
      'comment',
      'New comment on ' || new.entity_type,
      substring(new.body from 1 for 200) || case when length(new.body) > 200 then '...' else '' end,
      '/project/' || new.project_id || '/' || new.entity_type || '/' || new.entity_id,
      new.entity_type,
      new.entity_id,
      new.author_id
    );
  end loop;
  
  -- Process mentions
  for mention_username in
    select unnest(extract_mentions_from_text(new.body))
  loop
    -- Find user by username (assuming we have a users table with username)
    -- For now, we'll skip this part as we don't have user management implemented
    -- This will be enhanced when user profiles are added
  end loop;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically notify subscribers when comments are created
drop trigger if exists trigger_notify_comment_subscribers on comments;
create trigger trigger_notify_comment_subscribers
  after insert on comments
  for each row
  execute function notify_comment_subscribers();

-- Function to automatically subscribe comment authors to their comments
create or replace function auto_subscribe_comment_author()
returns trigger as $$
begin
  insert into comment_subscriptions (entity_type, entity_id, user_id, subscription_type)
  values (new.entity_type, new.entity_id, new.author_id, 'auto')
  on conflict (entity_type, entity_id, user_id) do nothing;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_auto_subscribe_comment_author on comments;
create trigger trigger_auto_subscribe_comment_author
  after insert on comments
  for each row
  execute function auto_subscribe_comment_author();

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant select on all views in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
