-- Summary field + template-003 id (replaces classic-professional)

ALTER TABLE public.resume_inputs
  ADD COLUMN IF NOT EXISTS summary TEXT;

UPDATE public.resume_inputs
SET template_id = 'template-003'
WHERE template_id = 'classic-professional';

ALTER TABLE public.resume_inputs
  DROP CONSTRAINT IF EXISTS resume_inputs_template_id_check;

ALTER TABLE public.resume_inputs
  ADD CONSTRAINT resume_inputs_template_id_check
  CHECK (template_id IN ('template-001', 'template-002', 'template-003'));

NOTIFY pgrst, 'reload schema';
