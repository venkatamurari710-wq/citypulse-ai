-- =====================================================
-- CityPulse AI — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'department_admin', 'super_admin')),
  govt_id TEXT UNIQUE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  jurisdiction_area TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_category TEXT NOT NULL,
  issue_subcategory TEXT,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  priority_weight INTEGER NOT NULL DEFAULT 0,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  issue_category TEXT,
  issue_subcategory TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  duplicate_status TEXT NOT NULL DEFAULT 'unknown' CHECK (duplicate_status IN ('unknown', 'unique', 'likely_duplicate', 'merged')),
  duplicate_group_id UUID,
  confidence NUMERIC(5,2),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'immediate')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'needs_review', 'assigned', 'in_progress', 'resolved', 'closed')),
  review_required BOOLEAN NOT NULL DEFAULT FALSE,
  model_version TEXT,
  safety_notes TEXT[],
  localization_hint TEXT,
  ai_summary TEXT,
  ai_explanation TEXT,
  ai_recommended_actions TEXT[],
  ai_precautions TEXT[],
  ai_follow_up_questions TEXT[],
  ai_observed_signals JSONB,
  ai_raw_response JSONB,
  address_text TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  embedding vector(1536),
  urgency_flagged_by_citizen BOOLEAN NOT NULL DEFAULT FALSE,
  consent_for_followup BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  related_complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('duplicate', 'same_location', 'same_issue', 'follow_up')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(root_complaint_id, related_complaint_id, relation_type)
);

CREATE TABLE IF NOT EXISTS complaint_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  public_message TEXT,
  eta TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assignment_reason TEXT
);

CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document')),
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  ai_processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotspot_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_category TEXT NOT NULL,
  area_name TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  complaint_count INTEGER NOT NULL DEFAULT 0,
  risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'stable', 'falling')),
  prediction_window_days INTEGER,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_department_id ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint_id ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_uploads_complaint_id ON uploads(complaint_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_hotspot_insights_category ON hotspot_insights(issue_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_complaint_id ON audit_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_routing_rules_category ON routing_rules(issue_category);
-- Vector index for semantic search (requires at least 1 row to create)
-- CREATE INDEX IF NOT EXISTS idx_complaints_embedding ON complaints USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints;
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotspot_insights_updated_at ON hotspot_insights;
CREATE TRIGGER update_hotspot_insights_updated_at BEFORE UPDATE ON hotspot_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotspot_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- USERS: citizens see only themselves, admins see all
DROP POLICY IF EXISTS "users_self_access" ON users;
CREATE POLICY "users_self_access" ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "users_admin_access" ON users;
CREATE POLICY "users_admin_access" ON users FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('super_admin', 'department_admin'))
);

-- COMPLAINTS: citizens see only theirs, officers/admins see all
DROP POLICY IF EXISTS "complaints_citizen_select" ON complaints;
CREATE POLICY "complaints_citizen_select" ON complaints FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "complaints_citizen_insert" ON complaints;
CREATE POLICY "complaints_citizen_insert" ON complaints FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "complaints_citizen_update" ON complaints;
CREATE POLICY "complaints_citizen_update" ON complaints FOR UPDATE USING (user_id = auth.uid());
DROP POLICY IF EXISTS "complaints_officer_access" ON complaints;
CREATE POLICY "complaints_officer_access" ON complaints FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);

-- COMPLAINT_UPDATES: visible to complaint owner and officers
DROP POLICY IF EXISTS "updates_visible_to_owner" ON complaint_updates;
CREATE POLICY "updates_visible_to_owner" ON complaint_updates FOR SELECT USING (
  EXISTS (SELECT 1 FROM complaints c WHERE c.id = complaint_id AND c.user_id = auth.uid())
);
DROP POLICY IF EXISTS "updates_officer_access" ON complaint_updates;
CREATE POLICY "updates_officer_access" ON complaint_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);

-- UPLOADS: owner and officers
DROP POLICY IF EXISTS "uploads_owner_access" ON uploads;
CREATE POLICY "uploads_owner_access" ON uploads FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "uploads_officer_access" ON uploads;
CREATE POLICY "uploads_officer_access" ON uploads FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);

-- DEPARTMENTS: read-only public, write for admins
DROP POLICY IF EXISTS "departments_public_read" ON departments;
CREATE POLICY "departments_public_read" ON departments FOR SELECT USING (true);
DROP POLICY IF EXISTS "departments_admin_write" ON departments;
CREATE POLICY "departments_admin_write" ON departments FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('department_admin', 'super_admin'))
);

-- ROUTING_RULES: admin only
DROP POLICY IF EXISTS "routing_rules_admin" ON routing_rules;
CREATE POLICY "routing_rules_admin" ON routing_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('department_admin', 'super_admin'))
);

-- HOTSPOT_INSIGHTS: read for officers and admins, write for admins
DROP POLICY IF EXISTS "hotspots_officer_read" ON hotspot_insights;
CREATE POLICY "hotspots_officer_read" ON hotspot_insights FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);

-- AUDIT_LOGS: admin only
DROP POLICY IF EXISTS "audit_logs_admin" ON audit_logs;
CREATE POLICY "audit_logs_admin" ON audit_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('super_admin'))
);

-- COMPLAINT_RELATIONS: officers
DROP POLICY IF EXISTS "relations_officer_access" ON complaint_relations;
CREATE POLICY "relations_officer_access" ON complaint_relations FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);
DROP POLICY IF EXISTS "relations_citizen_read" ON complaint_relations;
CREATE POLICY "relations_citizen_read" ON complaint_relations FOR SELECT USING (
  EXISTS (SELECT 1 FROM complaints c WHERE c.id = root_complaint_id AND c.user_id = auth.uid())
);

-- ASSIGNMENTS: officers
DROP POLICY IF EXISTS "assignments_officer_access" ON complaint_assignments;
CREATE POLICY "assignments_officer_access" ON complaint_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);

-- =====================================================
-- DEPARTMENT OFFICERS & OFFICER ASSIGNMENTS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS department_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  officer_title TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_officer_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  officer_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  officer_title TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('automatic','manual','escalation','review')),
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assignment_reason TEXT
);

DROP TRIGGER IF EXISTS update_department_officers_updated_at ON department_officers;
CREATE TRIGGER update_department_officers_updated_at BEFORE UPDATE ON department_officers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE department_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_officer_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dept_officers_public_read" ON department_officers;
CREATE POLICY "dept_officers_public_read" ON department_officers FOR SELECT USING (true);

DROP POLICY IF EXISTS "dept_officers_admin_write" ON department_officers;
CREATE POLICY "dept_officers_admin_write" ON department_officers FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('department_admin', 'super_admin'))
);

DROP POLICY IF EXISTS "officer_assignments_officer_access" ON complaint_officer_assignments;
CREATE POLICY "officer_assignments_officer_access" ON complaint_officer_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('officer', 'department_admin', 'super_admin'))
);
