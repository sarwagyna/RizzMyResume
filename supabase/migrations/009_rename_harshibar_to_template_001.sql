-- Rename legacy harshibar template id to template-001
-- Drop the old check constraint FIRST so template-001 values are allowed during the update.

ALTER TABLE public.resume_inputs
  DROP CONSTRAINT IF EXISTS resume_inputs_template_id_check;

UPDATE public.resume_inputs
SET template_id = 'template-001'
WHERE template_id = 'harshibar';

ALTER TABLE public.resume_inputs
  ALTER COLUMN template_id SET DEFAULT 'template-001';

ALTER TABLE public.resume_inputs
  ADD CONSTRAINT resume_inputs_template_id_check
  CHECK (template_id IN ('template-001', 'template-002', 'classic-professional'));
