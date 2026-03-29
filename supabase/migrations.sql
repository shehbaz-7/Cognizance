-- Cognizance Upgrade: Sub-concept Mastery & Problem Solving Schema

-- 1. Concepts & Dependency Graph
CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    prerequisites UUID[] DEFAULT '{}', -- Array of concept IDs
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Problems & Testing
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category TEXT,
    starter_code JSONB, -- { "python": "...", "javascript": "..." }
    test_cases JSONB,   -- [ { "input": "...", "output": "..." } ]
    hidden_test_cases JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Submissions & Telemetry
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    problem_id UUID REFERENCES public.problems(id),
    code TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT CHECK (status IN ('not started', 'attempted', 'solved')),
    score INTEGER DEFAULT 0,
    telemetry JSONB, -- { "time_to_solve": 0, "submissions": 1, "hints_used": 0 }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User Concept Mastery & Forgetting Prediction
CREATE TABLE IF NOT EXISTS public.user_concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    concept_id UUID REFERENCES public.concepts(id),
    mastery_score INTEGER DEFAULT 0, -- 0-100
    retention_strength FLOAT DEFAULT 1.0, -- for decay calculation
    last_practiced TIMESTAMPTZ DEFAULT now(),
    decay_risk FLOAT DEFAULT 0.0,
    next_review_at TIMESTAMPTZ,
    UNIQUE(user_id, concept_id)
);

-- 5. AI Viva Sessions
CREATE TABLE IF NOT EXISTS public.viva_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    skill_id TEXT, -- skill name or ID
    transcript JSONB DEFAULT '[]',
    evaluation JSONB, -- { "score": 0, "strengths": [], "weaknesses": [] }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Basic)
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_concept_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viva_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to concepts" ON public.concepts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to problems" ON public.problems FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to read their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to insert their own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to read their own mastery" ON public.user_concept_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow authenticated users to update their own mastery" ON public.user_concept_mastery FOR ALL USING (auth.uid() = user_id);
