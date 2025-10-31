-- Phase 18: Localization & Accessibility (i18n + a11y)
-- Idempotent migration for internationalization and accessibility features

-- Translations table for storing localized strings
create table if not exists translations (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  locale text not null,
  value text,
  namespace text default 'common',
  description text,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure unique key-locale combinations
  unique(key, locale, namespace)
);

-- Languages table for supported locales
create table if not exists languages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  native_name text not null,
  enabled boolean default true,
  rtl boolean default false,
  completion_percentage numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Accessibility reports table for audit results
create table if not exists a11y_reports (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  url text not null,
  score numeric check (score >= 0 and score <= 100),
  issues jsonb default '[]'::jsonb,
  violations jsonb default '[]'::jsonb,
  passes jsonb default '[]'::jsonb,
  incomplete jsonb default '[]'::jsonb,
  audit_type text default 'axe-core',
  user_agent text,
  viewport jsonb,
  created_at timestamptz default now(),
  
  -- Index for querying recent reports by page
  constraint valid_audit_type check (audit_type in ('axe-core', 'lighthouse', 'manual'))
);

-- Indexes for performance
create index if not exists idx_translations_locale on translations(locale);
create index if not exists idx_translations_key on translations(key);
create index if not exists idx_translations_namespace on translations(namespace);
create index if not exists idx_translations_verified on translations(verified);
create index if not exists idx_translations_updated_at on translations(updated_at);

create index if not exists idx_languages_code on languages(code);
create index if not exists idx_languages_enabled on languages(enabled);

create index if not exists idx_a11y_reports_page on a11y_reports(page);
create index if not exists idx_a11y_reports_score on a11y_reports(score);
create index if not exists idx_a11y_reports_created_at on a11y_reports(created_at);
create index if not exists idx_a11y_reports_audit_type on a11y_reports(audit_type);

-- RLS policies for translations
alter table translations enable row level security;

create policy if not exists "Translations are viewable by authenticated users" on translations
  for select using (auth.role() = 'authenticated');

create policy if not exists "Translations are editable by admins" on translations
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for languages
alter table languages enable row level security;

create policy if not exists "Languages are viewable by all" on languages
  for select using (true);

create policy if not exists "Languages are editable by admins" on languages
  for all using (
    auth.role() = 'authenticated' and 
    exists (
      select 1 from user_roles ur 
      where ur.user_id = auth.uid() 
      and ur.role in ('GlobalAdmin', 'TenantAdmin')
    )
  );

-- RLS policies for a11y_reports
alter table a11y_reports enable row level security;

create policy if not exists "A11y reports are viewable by authenticated users" on a11y_reports
  for select using (auth.role() = 'authenticated');

create policy if not exists "A11y reports are insertable by authenticated users" on a11y_reports
  for insert with check (auth.role() = 'authenticated');

-- Function to update translation updated_at timestamp
create or replace function update_translation_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for translation updates
drop trigger if exists update_translations_updated_at on translations;
create trigger update_translations_updated_at
  before update on translations
  for each row
  execute function update_translation_updated_at();

-- Function to calculate language completion percentage
create or replace function calculate_language_completion(locale_code text)
returns numeric as $$
declare
  total_keys integer;
  translated_keys integer;
  completion numeric;
begin
  -- Count total unique keys in default locale (en)
  select count(distinct key) into total_keys
  from translations
  where locale = 'en' and value is not null and value != '';
  
  -- Count translated keys for the given locale
  select count(distinct key) into translated_keys
  from translations
  where locale = locale_code and value is not null and value != '';
  
  -- Calculate completion percentage
  if total_keys > 0 then
    completion := (translated_keys::numeric / total_keys::numeric) * 100;
  else
    completion := 0;
  end if;
  
  return round(completion, 2);
end;
$$ language plpgsql;

-- Function to update language completion percentages
create or replace function update_language_completions()
returns void as $$
declare
  lang_record record;
begin
  for lang_record in select code from languages where enabled = true loop
    update languages 
    set completion_percentage = calculate_language_completion(lang_record.code),
        updated_at = now()
    where code = lang_record.code;
  end loop;
end;
$$ language plpgsql;

-- Insert default languages
insert into languages (code, name, native_name, enabled) values
  ('en', 'English', 'English', true),
  ('es', 'Spanish', 'Español', true),
  ('fr', 'French', 'Français', true),
  ('de', 'German', 'Deutsch', true),
  ('pt', 'Portuguese', 'Português', false),
  ('it', 'Italian', 'Italiano', false),
  ('ja', 'Japanese', '日本語', false),
  ('ko', 'Korean', '한국어', false),
  ('zh', 'Chinese', '中文', false),
  ('ar', 'Arabic', 'العربية', false)
on conflict (code) do update set
  name = excluded.name,
  native_name = excluded.native_name,
  updated_at = now();

-- Insert base English translations for common UI elements
insert into translations (key, locale, value, namespace, description, verified) values
  ('nav.dashboard', 'en', 'Dashboard', 'common', 'Navigation item for dashboard', true),
  ('nav.projects', 'en', 'Projects', 'common', 'Navigation item for projects', true),
  ('nav.analytics', 'en', 'Analytics', 'common', 'Navigation item for analytics', true),
  ('nav.settings', 'en', 'Settings', 'common', 'Navigation item for settings', true),
  ('nav.admin', 'en', 'Admin', 'common', 'Navigation item for admin panel', true),
  ('nav.help', 'en', 'Help', 'common', 'Navigation item for help', true),
  
  ('button.save', 'en', 'Save', 'common', 'Save button text', true),
  ('button.cancel', 'en', 'Cancel', 'common', 'Cancel button text', true),
  ('button.delete', 'en', 'Delete', 'common', 'Delete button text', true),
  ('button.edit', 'en', 'Edit', 'common', 'Edit button text', true),
  ('button.create', 'en', 'Create', 'common', 'Create button text', true),
  ('button.update', 'en', 'Update', 'common', 'Update button text', true),
  
  ('form.name', 'en', 'Name', 'common', 'Form field label for name', true),
  ('form.description', 'en', 'Description', 'common', 'Form field label for description', true),
  ('form.email', 'en', 'Email', 'common', 'Form field label for email', true),
  ('form.password', 'en', 'Password', 'common', 'Form field label for password', true),
  
  ('status.loading', 'en', 'Loading...', 'common', 'Loading status message', true),
  ('status.error', 'en', 'Error', 'common', 'Error status message', true),
  ('status.success', 'en', 'Success', 'common', 'Success status message', true),
  ('status.warning', 'en', 'Warning', 'common', 'Warning status message', true),
  
  ('accessibility.skip_to_content', 'en', 'Skip to main content', 'a11y', 'Skip link for screen readers', true),
  ('accessibility.menu_toggle', 'en', 'Toggle navigation menu', 'a11y', 'Menu toggle button aria-label', true),
  ('accessibility.close_dialog', 'en', 'Close dialog', 'a11y', 'Close dialog button aria-label', true),
  ('accessibility.loading', 'en', 'Loading content, please wait', 'a11y', 'Loading aria-live message', true)
on conflict (key, locale, namespace) do update set
  value = excluded.value,
  description = excluded.description,
  verified = excluded.verified,
  updated_at = now();

-- Update language completion percentages
select update_language_completions();

-- Create runner_events for i18n and a11y activities
insert into runner_events (action, details, metadata) values
  ('i18n_migration_applied', 'Phase 18 i18n and a11y migration applied', jsonb_build_object(
    'tables_created', array['translations', 'languages', 'a11y_reports'],
    'default_languages', 4,
    'base_translations', 24,
    'phase', 18
  ));

-- Grant necessary permissions
grant select on translations to authenticated;
grant select on languages to authenticated;
grant select, insert on a11y_reports to authenticated;
