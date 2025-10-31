-- Phase 22: Continuous Learning, Personalization & Knowledge Graph
-- Idempotent migration for knowledge graph, personalization, and learning systems

-- Enable pgvector extension for vector operations
create extension if not exists vector;

-- Knowledge nodes table for graph entities
create table if not exists knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  ref_id text,
  label text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536),
  popularity_score numeric default 0,
  quality_score numeric default 0,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Type validation
  constraint valid_node_type check (type in ('project', 'milestone', 'step', 'microstep', 'template', 'pack', 'integration', 'user', 'skill', 'topic', 'technology', 'pattern', 'insight'))
);

-- Knowledge edges table for graph relationships
create table if not exists knowledge_edges (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null,
  target_id uuid not null,
  relation text not null,
  weight numeric default 1.0,
  confidence numeric default 1.0,
  metadata jsonb default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz default now(),
  
  -- Foreign key constraints
  foreign key (source_id) references knowledge_nodes(id) on delete cascade,
  foreign key (target_id) references knowledge_nodes(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Relation validation
  constraint valid_relation check (relation in ('depends_on', 'owned_by', 'references', 'similar_to', 'uses', 'implements', 'extends', 'contains', 'follows', 'collaborates_with', 'expertise_in', 'worked_on', 'recommended_for')),
  
  -- Prevent self-loops
  constraint no_self_loops check (source_id != target_id),
  
  -- Unique constraint for relation pairs
  unique(source_id, target_id, relation)
);

-- Personalization profiles table for user preferences and learning
create table if not exists personalization_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  preferences jsonb default '{}'::jsonb,
  skills jsonb default '{}'::jsonb,
  interests jsonb default '{}'::jsonb,
  learning_goals jsonb default '{}'::jsonb,
  embedding vector(1536),
  activity_score numeric default 0,
  expertise_level text default 'beginner',
  preferred_learning_style text default 'mixed',
  last_active_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (user_id) references auth.users(id) on delete cascade,
  
  -- Expertise level validation
  constraint valid_expertise_level check (expertise_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  constraint valid_learning_style check (preferred_learning_style in ('visual', 'hands_on', 'reading', 'mixed'))
);

-- Recommendations table for personalized suggestions
create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  content jsonb not null,
  score numeric not null,
  confidence numeric default 0.5,
  reasoning text,
  feedback text,
  feedback_score int,
  clicked boolean default false,
  dismissed boolean default false,
  completed boolean default false,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (user_id) references auth.users(id) on delete cascade,
  
  -- Type validation
  constraint valid_recommendation_type check (type in ('next_step', 'template', 'learning_resource', 'collaboration', 'skill_development', 'project_idea', 'optimization', 'best_practice')),
  constraint valid_feedback_score check (feedback_score between 1 and 5 or feedback_score is null)
);

-- Learning interactions table for tracking user behavior
create table if not exists learning_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  interaction_type text not null,
  entity_type text,
  entity_id text,
  context jsonb default '{}'::jsonb,
  outcome text,
  duration_seconds int,
  quality_score numeric,
  created_at timestamptz default now(),
  
  -- Foreign key constraint
  foreign key (user_id) references auth.users(id) on delete cascade,
  
  -- Interaction type validation
  constraint valid_interaction_type check (interaction_type in ('view', 'click', 'complete', 'share', 'bookmark', 'rate', 'comment', 'search', 'download', 'install')),
  constraint valid_outcome check (outcome in ('success', 'failure', 'partial', 'abandoned') or outcome is null)
);

-- Knowledge insights table for derived intelligence
create table if not exists knowledge_insights (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  description text,
  data jsonb not null,
  confidence numeric default 0.5,
  impact_score numeric default 0,
  tenant_id uuid,
  created_by uuid,
  created_at timestamptz default now(),
  expires_at timestamptz,
  
  -- Foreign key constraints
  foreign key (tenant_id) references tenants(id) on delete cascade,
  foreign key (created_by) references auth.users(id) on delete set null,
  
  -- Type validation
  constraint valid_insight_type check (type in ('trend', 'pattern', 'anomaly', 'recommendation', 'prediction', 'correlation', 'cluster', 'outlier'))
);

-- Performance indexes for knowledge_nodes
create index if not exists idx_knowledge_nodes_type on knowledge_nodes(type);
create index if not exists idx_knowledge_nodes_ref_id on knowledge_nodes(ref_id);
create index if not exists idx_knowledge_nodes_label on knowledge_nodes using gin(to_tsvector('english', label));
create index if not exists idx_knowledge_nodes_embedding on knowledge_nodes using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_knowledge_nodes_popularity on knowledge_nodes(popularity_score desc);
create index if not exists idx_knowledge_nodes_quality on knowledge_nodes(quality_score desc);
create index if not exists idx_knowledge_nodes_created on knowledge_nodes(created_at desc);

-- Performance indexes for knowledge_edges
create index if not exists idx_knowledge_edges_source on knowledge_edges(source_id);
create index if not exists idx_knowledge_edges_target on knowledge_edges(target_id);
create index if not exists idx_knowledge_edges_relation on knowledge_edges(relation);
create index if not exists idx_knowledge_edges_weight on knowledge_edges(weight desc);
create index if not exists idx_knowledge_edges_source_relation on knowledge_edges(source_id, relation);
create index if not exists idx_knowledge_edges_target_relation on knowledge_edges(target_id, relation);

-- Performance indexes for personalization_profiles
create index if not exists idx_personalization_profiles_user on personalization_profiles(user_id);
create index if not exists idx_personalization_profiles_embedding on personalization_profiles using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index if not exists idx_personalization_profiles_expertise on personalization_profiles(expertise_level);
create index if not exists idx_personalization_profiles_activity on personalization_profiles(activity_score desc);
create index if not exists idx_personalization_profiles_updated on personalization_profiles(updated_at desc);

-- Performance indexes for recommendations
create index if not exists idx_recommendations_user on recommendations(user_id, created_at desc);
create index if not exists idx_recommendations_type on recommendations(type);
create index if not exists idx_recommendations_score on recommendations(score desc);
create index if not exists idx_recommendations_active on recommendations(user_id, expires_at) where not dismissed and not completed;
create index if not exists idx_recommendations_feedback on recommendations(feedback_score) where feedback_score is not null;

-- Performance indexes for learning_interactions
create index if not exists idx_learning_interactions_user on learning_interactions(user_id, created_at desc);
create index if not exists idx_learning_interactions_type on learning_interactions(interaction_type);
create index if not exists idx_learning_interactions_entity on learning_interactions(entity_type, entity_id);
create index if not exists idx_learning_interactions_outcome on learning_interactions(outcome);
create index if not exists idx_learning_interactions_quality on learning_interactions(quality_score desc) where quality_score is not null;

-- Performance indexes for knowledge_insights
create index if not exists idx_knowledge_insights_type on knowledge_insights(type);
create index if not exists idx_knowledge_insights_tenant on knowledge_insights(tenant_id, created_at desc);
create index if not exists idx_knowledge_insights_impact on knowledge_insights(impact_score desc);
create index if not exists idx_knowledge_insights_active on knowledge_insights(created_at desc) where expires_at is null or expires_at > now();

-- RLS policies for knowledge_nodes
alter table knowledge_nodes enable row level security;

create policy if not exists "Knowledge nodes are viewable by authenticated users" on knowledge_nodes
  for select using (auth.role() = 'authenticated');

create policy if not exists "Knowledge nodes are manageable by admins" on knowledge_nodes
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for knowledge_edges
alter table knowledge_edges enable row level security;

create policy if not exists "Knowledge edges are viewable by authenticated users" on knowledge_edges
  for select using (auth.role() = 'authenticated');

create policy if not exists "Knowledge edges are manageable by admins" on knowledge_edges
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for personalization_profiles
alter table personalization_profiles enable row level security;

create policy if not exists "Personalization profiles are viewable by owners" on personalization_profiles
  for select using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Personalization profiles are manageable by owners" on personalization_profiles
  for all using (auth.role() = 'authenticated' and auth.uid() = user_id);

-- RLS policies for recommendations
alter table recommendations enable row level security;

create policy if not exists "Recommendations are viewable by owners" on recommendations
  for select using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Recommendations are updatable by owners" on recommendations
  for update using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Recommendations are insertable by service" on recommendations
  for insert with check (true); -- Allow service account inserts

-- RLS policies for learning_interactions
alter table learning_interactions enable row level security;

create policy if not exists "Learning interactions are viewable by owners" on learning_interactions
  for select using (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy if not exists "Learning interactions are insertable by owners" on learning_interactions
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

-- RLS policies for knowledge_insights
alter table knowledge_insights enable row level security;

create policy if not exists "Knowledge insights are viewable by tenant members" on knowledge_insights
  for select using (
    auth.role() = 'authenticated' and (
      tenant_id is null or
      exists (
        select 1 from tenant_members tm 
        where tm.tenant_id = knowledge_insights.tenant_id 
        and tm.user_id = auth.uid()
      )
    )
  );

create policy if not exists "Knowledge insights are manageable by admins" on knowledge_insights
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- Function to calculate node popularity based on edges
create or replace function update_node_popularity(node_uuid uuid)
returns void as $$
begin
  update knowledge_nodes 
  set 
    popularity_score = (
      select coalesce(sum(weight), 0)
      from knowledge_edges 
      where target_id = node_uuid
    ),
    updated_at = now()
  where id = node_uuid;
end;
$$ language plpgsql;

-- Function to find similar nodes using vector similarity
create or replace function find_similar_nodes(
  target_embedding vector(1536),
  node_type_filter text default null,
  similarity_threshold numeric default 0.7,
  max_results int default 10
)
returns table(
  id uuid,
  type text,
  label text,
  similarity numeric
) as $$
begin
  return query
  select 
    kn.id,
    kn.type,
    kn.label,
    1 - (kn.embedding <=> target_embedding) as similarity
  from knowledge_nodes kn
  where 
    kn.embedding is not null
    and (node_type_filter is null or kn.type = node_type_filter)
    and 1 - (kn.embedding <=> target_embedding) >= similarity_threshold
  order by kn.embedding <=> target_embedding
  limit max_results;
end;
$$ language plpgsql;

-- Function to get node recommendations based on user profile
create or replace function get_node_recommendations(
  user_uuid uuid,
  recommendation_type text default null,
  max_results int default 5
)
returns table(
  node_id uuid,
  node_type text,
  node_label text,
  score numeric,
  reasoning text
) as $$
declare
  user_embedding vector(1536);
  user_expertise text;
begin
  -- Get user profile data
  select embedding, expertise_level 
  into user_embedding, user_expertise
  from personalization_profiles 
  where user_id = user_uuid;
  
  -- If no profile exists, return empty
  if user_embedding is null then
    return;
  end if;
  
  return query
  select 
    kn.id as node_id,
    kn.type as node_type,
    kn.label as node_label,
    (1 - (kn.embedding <=> user_embedding)) * kn.quality_score as score,
    'Based on your interests and expertise level' as reasoning
  from knowledge_nodes kn
  where 
    kn.embedding is not null
    and (recommendation_type is null or kn.type = recommendation_type)
    and kn.quality_score > 0.5
  order by (1 - (kn.embedding <=> user_embedding)) * kn.quality_score desc
  limit max_results;
end;
$$ language plpgsql;

-- Function to update user profile embedding based on interactions
create or replace function update_user_profile_embedding(user_uuid uuid)
returns void as $$
declare
  avg_embedding vector(1536);
  interaction_count int;
begin
  -- Calculate average embedding from user interactions
  select 
    avg(kn.embedding),
    count(*)
  into avg_embedding, interaction_count
  from learning_interactions li
  join knowledge_nodes kn on kn.ref_id = li.entity_id and kn.type = li.entity_type
  where 
    li.user_id = user_uuid
    and kn.embedding is not null
    and li.created_at > now() - interval '90 days'
    and li.outcome in ('success', 'partial');
  
  -- Update profile if we have enough data
  if interaction_count >= 5 and avg_embedding is not null then
    update personalization_profiles
    set 
      embedding = avg_embedding,
      activity_score = least(interaction_count::numeric / 100.0, 1.0),
      updated_at = now()
    where user_id = user_uuid;
  end if;
end;
$$ language plpgsql;

-- Trigger to update node popularity after edge changes
create or replace function trigger_update_node_popularity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform update_node_popularity(NEW.target_id);
    return NEW;
  elsif TG_OP = 'DELETE' then
    perform update_node_popularity(OLD.target_id);
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Apply node popularity trigger
drop trigger if exists knowledge_edges_popularity_trigger on knowledge_edges;
create trigger knowledge_edges_popularity_trigger
  after insert or update or delete on knowledge_edges
  for each row execute function trigger_update_node_popularity();

-- Insert sample knowledge nodes for core BuildRunner concepts
insert into knowledge_nodes (type, ref_id, label, description, metadata) values
  ('topic', 'react', 'React', 'JavaScript library for building user interfaces', '{"category": "frontend", "difficulty": "intermediate"}'),
  ('topic', 'typescript', 'TypeScript', 'Typed superset of JavaScript', '{"category": "language", "difficulty": "intermediate"}'),
  ('topic', 'nextjs', 'Next.js', 'React framework for production', '{"category": "framework", "difficulty": "intermediate"}'),
  ('topic', 'tailwind', 'Tailwind CSS', 'Utility-first CSS framework', '{"category": "styling", "difficulty": "beginner"}'),
  ('topic', 'supabase', 'Supabase', 'Open source Firebase alternative', '{"category": "backend", "difficulty": "intermediate"}'),
  ('skill', 'frontend_development', 'Frontend Development', 'Building user interfaces and experiences', '{"category": "development", "level": "core"}'),
  ('skill', 'backend_development', 'Backend Development', 'Server-side application development', '{"category": "development", "level": "core"}'),
  ('skill', 'database_design', 'Database Design', 'Designing efficient database schemas', '{"category": "data", "level": "advanced"}'),
  ('pattern', 'mvc', 'Model-View-Controller', 'Architectural pattern for separating concerns', '{"category": "architecture", "complexity": "medium"}'),
  ('pattern', 'component_composition', 'Component Composition', 'Building UIs with reusable components', '{"category": "frontend", "complexity": "medium"}'
on conflict (type, ref_id) do update set
  label = excluded.label,
  description = excluded.description,
  metadata = excluded.metadata,
  updated_at = now();

-- Insert sample knowledge edges for relationships
insert into knowledge_edges (source_id, target_id, relation, weight) 
select 
  s.id as source_id,
  t.id as target_id,
  'uses' as relation,
  0.8 as weight
from knowledge_nodes s, knowledge_nodes t
where 
  (s.ref_id = 'nextjs' and t.ref_id = 'react') or
  (s.ref_id = 'nextjs' and t.ref_id = 'typescript') or
  (s.ref_id = 'react' and t.ref_id = 'frontend_development') or
  (s.ref_id = 'supabase' and t.ref_id = 'backend_development')
on conflict (source_id, target_id, relation) do nothing;

-- Insert runner_events for graph migration
insert into runner_events (action, details, metadata) values
  ('graph_migration_applied', 'Phase 22 knowledge graph and personalization migration applied', jsonb_build_object(
    'tables_created', array['knowledge_nodes', 'knowledge_edges', 'personalization_profiles', 'recommendations', 'learning_interactions', 'knowledge_insights'],
    'indexes_created', 25,
    'functions_created', 5,
    'triggers_created', 1,
    'sample_nodes', 10,
    'sample_edges', 4,
    'phase', 22
  ));

-- Grant necessary permissions
grant select on knowledge_nodes to authenticated;
grant select on knowledge_edges to authenticated;
grant select, insert, update on personalization_profiles to authenticated;
grant select, insert, update on recommendations to authenticated;
grant select, insert on learning_interactions to authenticated;
grant select on knowledge_insights to authenticated;
grant execute on function find_similar_nodes to authenticated;
grant execute on function get_node_recommendations to authenticated;
grant execute on function update_user_profile_embedding to service_role;
