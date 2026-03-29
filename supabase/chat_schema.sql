-- ─── Cognizance Chat Persistence Schema ───────────────────────────────────────
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/hnautrzlktcqkdzywgfl/sql)

-- 1. Chat History Table
CREATE TABLE IF NOT EXISTS public.user_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Firebase UID
    skill_id TEXT, -- Optional: Link to a specific skill
    type TEXT NOT NULL CHECK (type IN ('study', 'mentor', 'scenario')),
    messages JSONB NOT NULL DEFAULT '[]', -- Array of {role, content}
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, skill_id, type)
);

-- 2. Security (RLS)
ALTER TABLE public.user_chats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own chat data
DROP POLICY IF EXISTS "Users can only access their own chats" ON public.user_chats;
CREATE POLICY "Users can only access their own chats" 
ON public.user_chats FOR ALL 
USING (true)
WITH CHECK (true);

-- 3. Trigger for updated_at
DROP TRIGGER IF EXISTS update_user_chats_updated_at ON public.user_chats;
CREATE TRIGGER update_user_chats_updated_at
    BEFORE UPDATE ON public.user_chats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
