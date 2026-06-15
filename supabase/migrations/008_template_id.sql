-- Resume template selection (template-001 | classic-professional)

ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS template_id TEXT NOT NULL DEFAULT 'template-001'
  CHECK (template_id IN ('template-001', 'template-002', 'classic-professional'));
