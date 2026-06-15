ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb;
