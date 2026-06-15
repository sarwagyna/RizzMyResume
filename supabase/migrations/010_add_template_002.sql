-- Add template-002 to allowed resume template ids

ALTER TABLE public.resume_inputs
  DROP CONSTRAINT IF EXISTS resume_inputs_template_id_check;

ALTER TABLE public.resume_inputs
  ADD CONSTRAINT resume_inputs_template_id_check
  CHECK (template_id IN ('template-001', 'template-002', 'classic-professional'));
