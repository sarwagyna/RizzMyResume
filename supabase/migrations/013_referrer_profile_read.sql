-- Allow referrers to read basic profile info for users they referred

DROP POLICY IF EXISTS "Referrers read referred profiles" ON public.profiles;
CREATE POLICY "Referrers read referred profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.referrals
      WHERE referrer_id = auth.uid()
        AND referred_id = profiles.id
    )
  );
