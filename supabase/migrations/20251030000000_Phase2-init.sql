-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table (build specs)
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    version TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ,
    spec_hash TEXT,
    UNIQUE(project_id, version)
);

-- Steps table
CREATE TABLE steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL, -- e.g., "m1.s1"
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, step_id)
);

-- Microsteps table
CREATE TABLE microsteps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    microstep_id TEXT NOT NULL, -- e.g., "m1.s1.ms1"
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('todo', 'doing', 'done')),
    depends_on TEXT[],
    owner TEXT,
    effort_points INTEGER CHECK (effort_points >= 1 AND effort_points <= 100),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
    priority TEXT CHECK (priority IN ('P1', 'P2', 'P3')),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_notes TEXT,
    demo_script JSONB,
    rollback_plan TEXT,
    post_check TEXT,
    links JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(step_id, microstep_id)
);

-- Acceptance criteria table
CREATE TABLE acceptance_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    microstep_id UUID NOT NULL REFERENCES microsteps(id) ON DELETE CASCADE,
    criterion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Runner events table for change tracking
CREATE TABLE runner_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'sync_push', 'sync_pull', 'status_change', etc.
    actor TEXT NOT NULL, -- 'edge_function', 'cli', 'user'
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_plans_project_id ON plans(project_id);
CREATE INDEX idx_steps_plan_id ON steps(plan_id);
CREATE INDEX idx_microsteps_step_id ON microsteps(step_id);
CREATE INDEX idx_acceptance_criteria_microstep_id ON acceptance_criteria(microstep_id);
CREATE INDEX idx_runner_events_plan_id ON runner_events(plan_id);
CREATE INDEX idx_runner_events_created_at ON runner_events(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_microsteps_updated_at BEFORE UPDATE ON microsteps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acceptance_criteria_updated_at BEFORE UPDATE ON acceptance_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for logging events on microstep status changes
CREATE OR REPLACE FUNCTION log_microstep_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO runner_events (plan_id, event_type, actor, details)
        SELECT 
            s.plan_id,
            'status_change',
            'system',
            jsonb_build_object(
                'microstep_id', NEW.microstep_id,
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        FROM steps s
        WHERE s.id = NEW.step_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_microstep_status_change_trigger 
    AFTER UPDATE ON microsteps
    FOR EACH ROW EXECUTE FUNCTION log_microstep_status_change();
