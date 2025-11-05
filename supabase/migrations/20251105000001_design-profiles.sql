-- Design Profiles Schema - Intelligent Design System
-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Design Profiles table
-- Stores multi-dimensional design profiles for intelligent design generation
CREATE TABLE IF NOT EXISTS design_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., "kids-education-playful"

    -- Full profile JSON (matches DesignProfile interface)
    profile JSONB NOT NULL,

    -- Learning metrics
    success_score DECIMAL(3,2) DEFAULT 0.5 CHECK (success_score >= 0 AND success_score <= 1),
    usage_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) CHECK (avg_rating >= 0 AND avg_rating <= 10),

    -- Confidence scores (0-1)
    color_confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (color_confidence >= 0 AND color_confidence <= 1),
    typography_confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (typography_confidence >= 0 AND typography_confidence <= 1),
    layout_confidence DECIMAL(3,2) DEFAULT 0.5 CHECK (layout_confidence >= 0 AND layout_confidence <= 1),

    -- Metadata
    is_new_type BOOLEAN DEFAULT false,
    needs_review BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_refined_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,

    -- Vector embedding for similarity search (1536 dimensions for OpenAI text-embedding-3-small)
    embedding vector(1536)
);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_design_profiles_category ON design_profiles(category);

-- Create index on success_score for ranking
CREATE INDEX IF NOT EXISTS idx_design_profiles_success_score ON design_profiles(success_score DESC);

-- Create index on usage_count for popularity ranking
CREATE INDEX IF NOT EXISTS idx_design_profiles_usage_count ON design_profiles(usage_count DESC);

-- Create index on is_new_type for admin review
CREATE INDEX IF NOT EXISTS idx_design_profiles_new_type ON design_profiles(is_new_type) WHERE is_new_type = true;

-- Create index on embedding for vector similarity search
CREATE INDEX IF NOT EXISTS idx_design_profiles_embedding ON design_profiles
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Design Feedback table
-- Tracks user feedback and modifications for learning
CREATE TABLE IF NOT EXISTS design_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    build_id UUID, -- Reference to build (may not exist yet)
    profile_id UUID NOT NULL,
    project_id UUID, -- Reference to project

    -- Feedback data
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 10),

    -- What did user modify?
    modifications JSONB DEFAULT '[]'::jsonb,
    -- What did user keep?
    kept_elements JSONB DEFAULT '[]'::jsonb,

    -- Behavior metrics
    time_to_first_edit INTEGER, -- Seconds
    total_edits INTEGER DEFAULT 0,

    -- Generated vs final comparison
    original_colors JSONB,
    final_colors JSONB,
    original_typography JSONB,
    final_typography JSONB,
    original_layout JSONB,
    final_layout JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'design_feedback_profile_id_fkey'
    ) THEN
        ALTER TABLE design_feedback ADD CONSTRAINT design_feedback_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES design_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on profile_id for querying feedback by profile
CREATE INDEX IF NOT EXISTS idx_design_feedback_profile_id ON design_feedback(profile_id);

-- Create index on user_rating for analyzing high/low rated builds
CREATE INDEX IF NOT EXISTS idx_design_feedback_rating ON design_feedback(user_rating);

-- Create index on created_at for time-series analysis
CREATE INDEX IF NOT EXISTS idx_design_feedback_created_at ON design_feedback(created_at DESC);

-- Design Experiments table
-- Tracks A/B tests and experiments
CREATE TABLE IF NOT EXISTS design_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Experiment metadata
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),

    -- Original and variant profiles
    original_profile_id UUID NOT NULL,
    variant_profile_id UUID NOT NULL,

    -- Experiment type
    experiment_type TEXT NOT NULL CHECK (experiment_type IN ('color', 'typography', 'layout', 'full')),

    -- Allocation
    variant_allocation DECIMAL(3,2) DEFAULT 0.5 CHECK (variant_allocation >= 0 AND variant_allocation <= 1),

    -- Results
    original_avg_rating DECIMAL(3,2),
    variant_avg_rating DECIMAL(3,2),
    original_sample_size INTEGER DEFAULT 0,
    variant_sample_size INTEGER DEFAULT 0,

    -- Winner
    winner TEXT CHECK (winner IN ('original', 'variant', 'inconclusive')),
    confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0 AND confidence_level <= 1),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Add foreign key constraints if not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'design_experiments_original_profile_id_fkey'
    ) THEN
        ALTER TABLE design_experiments ADD CONSTRAINT design_experiments_original_profile_id_fkey
        FOREIGN KEY (original_profile_id) REFERENCES design_profiles(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'design_experiments_variant_profile_id_fkey'
    ) THEN
        ALTER TABLE design_experiments ADD CONSTRAINT design_experiments_variant_profile_id_fkey
        FOREIGN KEY (variant_profile_id) REFERENCES design_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on status for filtering active experiments
CREATE INDEX IF NOT EXISTS idx_design_experiments_status ON design_experiments(status);

-- Design Profile History table
-- Audit trail of profile changes
CREATE TABLE IF NOT EXISTS design_profile_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    version INTEGER NOT NULL,

    -- Snapshot of profile at this version
    profile_snapshot JSONB NOT NULL,

    -- What changed
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'manual_edit', 'auto_refinement', 'experiment_result')),
    changes_summary TEXT,

    -- Metrics at this version
    success_score DECIMAL(3,2),
    usage_count INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT -- User ID or 'system'
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'design_profile_history_profile_id_fkey'
    ) THEN
        ALTER TABLE design_profile_history ADD CONSTRAINT design_profile_history_profile_id_fkey
        FOREIGN KEY (profile_id) REFERENCES design_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index on profile_id for querying history
CREATE INDEX IF NOT EXISTS idx_design_profile_history_profile_id ON design_profile_history(profile_id);

-- Create index on version for ordering
CREATE INDEX IF NOT EXISTS idx_design_profile_history_version ON design_profile_history(profile_id, version DESC);

-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION find_similar_profiles(
    query_embedding vector(1536),
    match_threshold DECIMAL DEFAULT 0.7,
    match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    profile_id UUID,
    name TEXT,
    category TEXT,
    profile JSONB,
    confidence DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dp.id,
        dp.name,
        dp.category,
        dp.profile,
        (1 - (dp.embedding <=> query_embedding))::DECIMAL as confidence
    FROM design_profiles dp
    WHERE (1 - (dp.embedding <=> query_embedding)) > match_threshold
    ORDER BY dp.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create function to update profile usage
CREATE OR REPLACE FUNCTION update_profile_usage(profile_id_param UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE design_profiles
    SET
        usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = profile_id_param;
END;
$$;

-- Create function to record feedback
CREATE OR REPLACE FUNCTION record_design_feedback(
    profile_id_param UUID,
    build_id_param UUID,
    rating INTEGER,
    modifications JSONB,
    kept_elements JSONB,
    time_to_edit INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    feedback_id UUID;
BEGIN
    -- Insert feedback
    INSERT INTO design_feedback (
        profile_id,
        build_id,
        user_rating,
        modifications,
        kept_elements,
        time_to_first_edit,
        total_edits
    ) VALUES (
        profile_id_param,
        build_id_param,
        rating,
        modifications,
        kept_elements,
        time_to_edit,
        jsonb_array_length(modifications)
    ) RETURNING id INTO feedback_id;

    -- Update profile avg_rating
    UPDATE design_profiles
    SET avg_rating = (
        SELECT AVG(user_rating)::DECIMAL(3,2)
        FROM design_feedback
        WHERE profile_id = profile_id_param
    )
    WHERE id = profile_id_param;

    RETURN feedback_id;
END;
$$;

-- Create view for profile analytics
CREATE OR REPLACE VIEW design_profile_analytics AS
SELECT
    dp.id,
    dp.name,
    dp.category,
    dp.success_score,
    dp.usage_count,
    dp.avg_rating,
    dp.color_confidence,
    dp.typography_confidence,
    dp.layout_confidence,
    dp.is_new_type,
    dp.created_at,
    dp.last_used_at,
    COUNT(DISTINCT df.id) as feedback_count,
    AVG(df.user_rating)::DECIMAL(3,2) as recent_avg_rating,
    COUNT(DISTINCT de.id) as experiment_count
FROM design_profiles dp
LEFT JOIN design_feedback df ON dp.id = df.profile_id AND df.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN design_experiments de ON (dp.id = de.original_profile_id OR dp.id = de.variant_profile_id)
GROUP BY dp.id;

-- Insert some sample profiles for testing
-- (These would be replaced by actual learned profiles in production)
INSERT INTO design_profiles (name, category, profile, is_new_type) VALUES
('Kids Educational Game', 'kids-education-playful', '{
    "primaryPurpose": "education",
    "audience": {
        "demographic": "children",
        "techLevel": "beginner",
        "economicLevel": "mid-market"
    },
    "usagePattern": {
        "frequency": "daily",
        "duration": "quick-tasks",
        "context": "mobile-first"
    },
    "emotionalTone": {
        "energy": "energetic",
        "formality": "casual",
        "personality": "playful"
    },
    "industry": {
        "primary": "education",
        "vertical": "k-12"
    },
    "visualStyle": {
        "aesthetic": "playful",
        "modernity": "contemporary",
        "density": "spacious"
    },
    "referenceApps": ["Duolingo", "Khan Academy Kids", "PBS Kids"],
    "colorScheme": {
        "primary": "#FF6B6B",
        "primaryReasoning": "Vibrant red creates energy and excitement for learning",
        "secondary": "#4ECDC4",
        "secondaryReasoning": "Fun teal complements red and feels friendly",
        "accent": "#FFE66D",
        "accentReasoning": "Bright yellow adds playful energy",
        "background": "#FFFFFF",
        "foreground": "#2D3748"
    },
    "typography": {
        "personality": "playful",
        "fontRecommendations": {
            "sans": "Fredoka"
        },
        "scaleApproach": "Large, friendly sizing for easy reading"
    },
    "componentPatterns": {
        "cardStyle": "detailed",
        "buttonStyle": "bold",
        "navigation": "bottom-tabs",
        "contentDensity": "spacious"
    }
}'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON design_profiles TO authenticated;
-- GRANT SELECT, INSERT ON design_feedback TO authenticated;
-- GRANT SELECT ON design_profile_analytics TO authenticated;
