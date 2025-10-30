-- Phase 3 Baseline Schema - Idempotent DDL
-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table (build specs)
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title TEXT NOT NULL,
    version TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    spec_hash TEXT,
    UNIQUE(project_id, version)
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'plans_project_id_fkey'
    ) THEN
        ALTER TABLE plans ADD CONSTRAINT plans_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Steps table
CREATE TABLE IF NOT EXISTS steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL,
    step_id TEXT NOT NULL, -- e.g., "m1.s1"
    title TEXT NOT NULL,
    status TEXT DEFAULT 'todo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, step_id)
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'steps_plan_id_fkey'
    ) THEN
        ALTER TABLE steps ADD CONSTRAINT steps_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Microsteps table
CREATE TABLE IF NOT EXISTS microsteps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL,
    microstep_id TEXT NOT NULL, -- e.g., "m1.s1.ms1"
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    criteria JSONB,
    links JSONB,
    owner TEXT,
    effort_points INTEGER,
    impact_score INTEGER,
    priority TEXT,
    risk_level TEXT,
    risk_notes TEXT,
    demo_script JSONB,
    rollback_plan TEXT,
    post_check TEXT,
    depends_on TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(step_id, microstep_id)
);

-- Add constraints if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'microsteps_step_id_fkey'
    ) THEN
        ALTER TABLE microsteps ADD CONSTRAINT microsteps_step_id_fkey 
        FOREIGN KEY (step_id) REFERENCES steps(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'microsteps_status_check'
    ) THEN
        ALTER TABLE microsteps ADD CONSTRAINT microsteps_status_check 
        CHECK (status IN ('todo', 'doing', 'done'));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'microsteps_priority_check'
    ) THEN
        ALTER TABLE microsteps ADD CONSTRAINT microsteps_priority_check 
        CHECK (priority IN ('P1', 'P2', 'P3') OR priority IS NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'microsteps_risk_level_check'
    ) THEN
        ALTER TABLE microsteps ADD CONSTRAINT microsteps_risk_level_check 
        CHECK (risk_level IN ('low', 'medium', 'high') OR risk_level IS NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'microsteps_effort_points_check'
    ) THEN
        ALTER TABLE microsteps ADD CONSTRAINT microsteps_effort_points_check 
        CHECK (effort_points >= 1 AND effort_points <= 100 OR effort_points IS NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'microsteps_impact_score_check'
    ) THEN
        ALTER TABLE microsteps ADD CONSTRAINT microsteps_impact_score_check 
        CHECK (impact_score >= 1 AND impact_score <= 10 OR impact_score IS NULL);
    END IF;
END $$;

-- Acceptance criteria table
CREATE TABLE IF NOT EXISTS acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microstep_id UUID NOT NULL,
    text TEXT NOT NULL,
    passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'acceptance_criteria_microstep_id_fkey'
    ) THEN
        ALTER TABLE acceptance_criteria ADD CONSTRAINT acceptance_criteria_microstep_id_fkey 
        FOREIGN KEY (microstep_id) REFERENCES microsteps(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Runner events table for change tracking
CREATE TABLE IF NOT EXISTS runner_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor TEXT NOT NULL, -- 'user', 'system', 'edge_function', 'cli'
    action TEXT NOT NULL, -- 'oauth_linked', 'project_created', 'migration_applied', etc.
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes if not exists
CREATE INDEX IF NOT EXISTS idx_plans_project_id ON plans(project_id);
CREATE INDEX IF NOT EXISTS idx_steps_plan_id ON steps(plan_id);
CREATE INDEX IF NOT EXISTS idx_microsteps_step_id ON microsteps(step_id);
CREATE INDEX IF NOT EXISTS idx_acceptance_criteria_microstep_id ON acceptance_criteria(microstep_id);
CREATE INDEX IF NOT EXISTS idx_runner_events_actor ON runner_events(actor);
CREATE INDEX IF NOT EXISTS idx_runner_events_action ON runner_events(action);
CREATE INDEX IF NOT EXISTS idx_runner_events_created_at ON runner_events(created_at);

-- Create update trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plans_updated_at') THEN
        CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_steps_updated_at') THEN
        CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_microsteps_updated_at') THEN
        CREATE TRIGGER update_microsteps_updated_at BEFORE UPDATE ON microsteps
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_acceptance_criteria_updated_at') THEN
        CREATE TRIGGER update_acceptance_criteria_updated_at BEFORE UPDATE ON acceptance_criteria
            FOR EACH ROW EXECUTE FUNCTION update_acceptance_criteria_updated_at_column();
    END IF;
END $$;
