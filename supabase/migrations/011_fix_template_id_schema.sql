-- Idempotent fix: ensure template_id column exists and allows all app template ids.
-- Run in Supabase SQL Editor, then: Settings → API → Reload schema cache.

ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS template_id TEXT;

UPDATE public.resume_inputs
SET template_id = 'template-001'
WHERE template_id IS NULL OR template_id = 'harshibar';

ALTER TABLE public.resume_inputs
  ALTER COLUMN template_id SET DEFAULT 'template-001';

ALTER TABLE public.resume_inputs
  ALTER COLUMN template_id SET NOT NULL;

ALTER TABLE public.resume_inputs
  DROP CONSTRAINT IF EXISTS resume_inputs_template_id_check;

ALTER TABLE public.resume_inputs
  ADD CONSTRAINT resume_inputs_template_id_check
  CHECK (template_id IN ('template-001', 'template-002', 'template-003', 'classic-professional'));

NOTIFY pgrst, 'reload schema';
