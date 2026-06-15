-- Resume retention: generations are deleted after 24 hours (see cleanup-resumes edge function).
-- Schedule hourly via Supabase Dashboard → Edge Functions → cleanup-resumes → Cron:
--   0 * * * *
-- Header: Authorization: Bearer <CRON_SECRET>

COMMENT ON TABLE public.generations IS
  'Generated resume records. PDFs and rows are purged after 24 hours by cleanup-resumes.';

CREATE INDEX IF NOT EXISTS idx_generations_created_at
  ON public.generations(created_at);
