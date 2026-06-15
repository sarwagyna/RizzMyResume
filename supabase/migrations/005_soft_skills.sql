ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS soft_skills JSONB DEFAULT '[]'::jsonb;
