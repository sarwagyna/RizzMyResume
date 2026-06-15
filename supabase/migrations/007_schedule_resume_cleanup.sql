-- Hourly purge of generations + PDFs older than 24 hours (no manual cron setup required).

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

CREATE OR REPLACE FUNCTION public.cleanup_stale_generations()
RETURNS TABLE(deleted_generations bigint, deleted_storage_objects bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  cutoff timestamptz := NOW() - INTERVAL '24 hours';
  stale_paths text[];
  removed_objects bigint := 0;
  removed_generations bigint := 0;
BEGIN
  SELECT COALESCE(array_agg(pdf_storage_path), ARRAY[]::text[])
  INTO stale_paths
  FROM public.generations
  WHERE created_at < cutoff
    AND pdf_storage_path IS NOT NULL;

  IF array_length(stale_paths, 1) IS NOT NULL THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'rizzme-resumes'
      AND name = ANY(stale_paths);

    GET DIAGNOSTICS removed_objects = ROW_COUNT;
  END IF;

  DELETE FROM public.generations
  WHERE created_at < cutoff;

  GET DIAGNOSTICS removed_generations = ROW_COUNT;

  RETURN QUERY SELECT removed_generations, removed_objects;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_stale_generations() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-stale-resumes') THEN
    PERFORM cron.unschedule('cleanup-stale-resumes');
  END IF;
END;
$$;

SELECT cron.schedule(
  'cleanup-stale-resumes',
  '0 * * * *',
  $$SELECT public.cleanup_stale_generations();$$
);
