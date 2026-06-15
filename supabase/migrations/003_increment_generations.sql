-- Increment total_generations on profile
CREATE OR REPLACE FUNCTION public.increment_generations(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET total_generations = total_generations + 1
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
