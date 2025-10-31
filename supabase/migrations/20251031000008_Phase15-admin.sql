-- Phase 15 Admin Console & Token/Cost Tracking
-- Idempotent migration for admin operations, cost tracking, and governance

-- Tenant settings for project-level configuration
CREATE TABLE IF NOT EXISTS tenant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  project_id UUID,
  features JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cost budgets and spending limits
CREATE TABLE IF NOT EXISTS cost_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  monthly_usd NUMERIC(10,2) NOT NULL CHECK (monthly_usd >= 0),
  hard_cap BOOLEAN DEFAULT false,
  alert_threshold NUMERIC(3,2) DEFAULT 0.8 CHECK (alert_threshold >= 0 AND alert_threshold <= 1),
  enabled BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credits for adjustments and billing corrections
CREATE TABLE IF NOT EXISTS credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  type TEXT CHECK (type IN ('adjustment', 'refund', 'bonus', 'correction')) DEFAULT 'adjustment',
  applied_by UUID,
  applied_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rate limits for API throttling
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  endpoint_pattern TEXT NOT NULL,
  limit_per_minute INTEGER NOT NULL CHECK (limit_per_minute > 0),
  burst INTEGER NOT NULL CHECK (burst > 0),
  enabled BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- API keys with hashed storage
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  scopes TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Impersonation sessions for admin support
CREATE TABLE IF NOT EXISTS impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  user_id UUID NOT NULL,
  project_id UUID,
  reason TEXT NOT NULL,
  start_at TIMESTAMPTZ DEFAULT now(),
  end_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Maintenance windows for planned downtime
CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')) DEFAULT 'scheduled',
  blocks_operations TEXT[] DEFAULT '{}', -- e.g., ['deploy', 'migration', 'backup']
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_window_time CHECK (ends_at > starts_at)
);

-- Support tickets for incident management
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  category TEXT CHECK (category IN ('budget', 'reliability', 'governance', 'integrations', 'billing', 'performance')) DEFAULT 'reliability',
  assigned_to UUID,
  reporter_id UUID,
  resolution TEXT,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Admin actions audit log
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  project_id UUID,
  payload JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Cost snapshots for historical tracking
CREATE TABLE IF NOT EXISTS cost_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  month DATE NOT NULL, -- First day of month
  usd_spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  usd_forecast NUMERIC(10,2) NOT NULL DEFAULT 0,
  token_usage BIGINT NOT NULL DEFAULT 0,
  api_calls INTEGER NOT NULL DEFAULT 0,
  storage_gb NUMERIC(8,2) NOT NULL DEFAULT 0,
  snapshot_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, month)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tenant_settings_org_id ON tenant_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_tenant_settings_project_id ON tenant_settings(project_id);

CREATE INDEX IF NOT EXISTS idx_cost_budgets_project_id ON cost_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_budgets_enabled ON cost_budgets(enabled) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_credits_project_id ON credits(project_id);
CREATE INDEX IF NOT EXISTS idx_credits_applied_at ON credits(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_project_id ON rate_limits(project_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_enabled ON rate_limits(enabled) WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_enabled ON api_keys(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);

CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_admin_id ON impersonation_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_user_id ON impersonation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_active ON impersonation_sessions(start_at, end_at) WHERE end_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_maintenance_windows_project_id ON maintenance_windows(project_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_time ON maintenance_windows(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_status ON maintenance_windows(status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_project_id ON support_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_actions_actor ON admin_actions(actor);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action ON admin_actions(action);
CREATE INDEX IF NOT EXISTS idx_admin_actions_project_id ON admin_actions(project_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cost_snapshots_project_id ON cost_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_snapshots_month ON cost_snapshots(month DESC);

-- RLS (Row Level Security) policies
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_snapshots ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "admin_only_tenant_settings" ON tenant_settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_cost_budgets" ON cost_budgets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_credits" ON credits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_rate_limits" ON rate_limits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_api_keys" ON api_keys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_impersonation_sessions" ON impersonation_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_maintenance_windows" ON maintenance_windows FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_support_tickets" ON support_tickets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_admin_actions" ON admin_actions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_only_cost_snapshots" ON cost_snapshots FOR ALL USING (auth.role() = 'service_role');

-- Helper functions for admin operations
CREATE OR REPLACE FUNCTION get_project_cost_summary(p_project_id UUID, p_month DATE DEFAULT date_trunc('month', now())::date)
RETURNS TABLE(
  total_spend NUMERIC,
  budget_limit NUMERIC,
  budget_used_percent NUMERIC,
  credits_applied NUMERIC,
  forecast NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(cs.usd_spend, 0) as total_spend,
    COALESCE(cb.monthly_usd, 0) as budget_limit,
    CASE 
      WHEN cb.monthly_usd > 0 THEN (COALESCE(cs.usd_spend, 0) / cb.monthly_usd * 100)
      ELSE 0
    END as budget_used_percent,
    COALESCE(SUM(c.amount_usd), 0) as credits_applied,
    COALESCE(cs.usd_forecast, 0) as forecast
  FROM cost_snapshots cs
  LEFT JOIN cost_budgets cb ON cb.project_id = p_project_id AND cb.enabled = true
  LEFT JOIN credits c ON c.project_id = p_project_id 
    AND date_trunc('month', c.applied_at) = p_month
  WHERE cs.project_id = p_project_id 
    AND cs.month = p_month
  GROUP BY cs.usd_spend, cb.monthly_usd, cs.usd_forecast;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_maintenance_window(p_project_id UUID, p_operation TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  window_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO window_count
  FROM maintenance_windows
  WHERE project_id = p_project_id
    AND status = 'active'
    AND now() BETWEEN starts_at AND ends_at
    AND p_operation = ANY(blocks_operations);
  
  RETURN window_count = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_admin_action(
  p_actor UUID,
  p_action TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL,
  p_payload JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  action_id UUID;
BEGIN
  INSERT INTO admin_actions (
    actor, action, resource_type, resource_id, project_id, payload
  ) VALUES (
    p_actor, p_action, p_resource_type, p_resource_id, p_project_id, p_payload
  ) RETURNING id INTO action_id;
  
  RETURN action_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tenant_settings_updated_at') THEN
    CREATE TRIGGER update_tenant_settings_updated_at
      BEFORE UPDATE ON tenant_settings
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cost_budgets_updated_at') THEN
    CREATE TRIGGER update_cost_budgets_updated_at
      BEFORE UPDATE ON cost_budgets
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_rate_limits_updated_at') THEN
    CREATE TRIGGER update_rate_limits_updated_at
      BEFORE UPDATE ON rate_limits
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_api_keys_updated_at') THEN
    CREATE TRIGGER update_api_keys_updated_at
      BEFORE UPDATE ON api_keys
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_windows_updated_at') THEN
    CREATE TRIGGER update_maintenance_windows_updated_at
      BEFORE UPDATE ON maintenance_windows
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_tickets_updated_at') THEN
    CREATE TRIGGER update_support_tickets_updated_at
      BEFORE UPDATE ON support_tickets
      FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
