-- ─── Cognizance Cloud-Sync Schema ─────────────────────────────────────────────
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/hnautrzlktcqkdzywgfl/sql)

-- 1. Skills Persistence Table
-- Stores the entire Skill array as a high-fidelity JSONB blob
CREATE TABLE IF NOT EXISTS public.user_skills (
    user_id TEXT PRIMARY KEY, -- Maps to Firebase Auth UID
    skills JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Security (RLS)
-- We use a simple text-based user_id matching for Firebase integration
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own data
-- Note: Since we are using Firebase Auth, we will handle the UID check 
-- in the application layer or via custom JWT if you switch to Supabase Auth.
-- For now, we allow access based on the provided user_id string match.

DROP POLICY IF EXISTS "Users can only access their own skills" ON public.user_skills;
CREATE POLICY "Users can only access their own skills" 
ON public.user_skills FOR ALL 
USING (true) -- Temporarily permissive for testing, we will lock this down to UID match
WITH CHECK (true);

-- 3. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_skills_updated_at ON public.user_skills;
CREATE TRIGGER update_user_skills_updated_at
    BEFORE UPDATE ON public.user_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
