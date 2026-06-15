-- Storage bucket for resume PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rizzme-resumes',
  'rizzme-resumes',
  false,
  524288,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Service role uploads via edge functions; users download via signed URLs
CREATE POLICY "Service role full access to resumes"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'rizzme-resumes')
  WITH CHECK (bucket_id = 'rizzme-resumes');
