-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'writer' CHECK (role IN ('writer', 'editor', 'reader', 'admin')),
    genres TEXT[] DEFAULT '{}',
    trust_score DECIMAL(7,2) DEFAULT 50.00,
    streak_days INTEGER DEFAULT 0,
    streak_last DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(20),
    oauth_id VARCHAR(255),
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_trust_score ON users(trust_score DESC);

-- DRAFTS TABLE
CREATE TABLE IF NOT EXISTS drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    content_text TEXT DEFAULT '',
    genre VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'shared', 'under_review', 'accepted', 'published')),
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'editors_only', 'public')),
    ai_critique JSONB,
    word_count INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drafts_author ON drafts(author_id);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_drafts_visibility ON drafts(visibility);
CREATE INDEX idx_drafts_genre ON drafts(genre);
CREATE INDEX idx_drafts_created_at ON drafts(created_at DESC);

-- DRAFT VERSIONS TABLE (auto-save snapshots)
CREATE TABLE IF NOT EXISTS draft_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    content_text TEXT,
    word_count INTEGER DEFAULT 0,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_draft_versions_draft ON draft_versions(draft_id, version_number DESC);

-- FEEDBACK TABLE (structured reviews)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scores JSONB DEFAULT '{}',
    written_feedback TEXT,
    helpfulness_score DECIMAL(3,2) DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_draft ON feedback(draft_id);
CREATE INDEX idx_feedback_reviewer ON feedback(reviewer_id);

-- INLINE COMMENTS TABLE (anchored annotations)
CREATE TABLE IF NOT EXISTS inline_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    anchor_from INTEGER NOT NULL,
    anchor_to INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    parent_id UUID REFERENCES inline_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inline_comments_draft ON inline_comments(draft_id);

-- OPPORTUNITIES TABLE (marketplace listings)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    genres TEXT[] DEFAULT '{}',
    deadline TIMESTAMPTZ,
    word_limit_max INTEGER,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_details VARCHAR(500),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_opportunities_active ON opportunities(is_active, deadline);
CREATE INDEX idx_opportunities_publisher ON opportunities(publisher_id);
CREATE INDEX idx_opportunities_featured ON opportunities(is_featured) WHERE is_featured = TRUE;

-- SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    submitter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected')),
    editor_feedback TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(draft_id, opportunity_id)
);

CREATE INDEX idx_submissions_submitter ON submissions(submitter_id);
CREATE INDEX idx_submissions_opportunity ON submissions(opportunity_id);
CREATE INDEX idx_submissions_status ON submissions(status);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('feedback_received', 'submission_update', 'ai_ready', 'achievement_unlocked', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL DEFAULT 1
);

-- USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    earned BOOLEAN DEFAULT FALSE,
    earned_at TIMESTAMPTZ,
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);

-- WRITING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS writing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES drafts(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    words_written INTEGER DEFAULT 0
);

CREATE INDEX idx_writing_sessions_user ON writing_sessions(user_id, started_at DESC);

-- AI EMBEDDINGS TABLE (pgvector)
-- Note: CREATE EXTENSION vector; must be run by superuser if not already available
-- We wrap in a DO block to handle gracefully if pgvector is not installed
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pgvector extension not available — AI similarity features will be disabled';
END
$$;

CREATE TABLE IF NOT EXISTS ai_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('draft', 'user_preference', 'opportunity')),
    entity_id UUID NOT NULL,
    embedding vector(768),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_embeddings_entity ON ai_embeddings(entity_type, entity_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drafts_updated_at
    BEFORE UPDATE ON drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
