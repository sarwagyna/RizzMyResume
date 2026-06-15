-- Allow template-003 (replaces classic-professional in the app).
-- Safe to run multiple times.

ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS template_id TEXT;

UPDATE public.resume_inputs
SET template_id = 'template-001'
WHERE template_id IS NULL OR template_id = 'harshibar';

ALTER TABLE public.resume_inputs
  DROP CONSTRAINT IF EXISTS resume_inputs_template_id_check;

ALTER TABLE public.resume_inputs
  ALTER COLUMN template_id SET DEFAULT 'template-001';

ALTER TABLE public.resume_inputs
  ADD CONSTRAINT resume_inputs_template_id_check
  CHECK (
    template_id IN (
      'template-001',
      'template-002',
      'template-003',
      'classic-professional'
    )
  );

NOTIFY pgrst, 'reload schema';
