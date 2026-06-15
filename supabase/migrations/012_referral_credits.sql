-- Referral program: 10 credits per referral signup, 50 credits = 1 free resume

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0);

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'razorpay'
    CHECK (source IN ('razorpay', 'credits'));

ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS referrer_credits_awarded INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS referred_credits_awarded INTEGER NOT NULL DEFAULT 10;

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('referral_reward', 'referral_signup_bonus', 'redemption', 'admin_adjustment')
  ),
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  done BOOLEAN := FALSE;
BEGIN
  WHILE NOT done LOOP
    code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    done := NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    public.generate_referral_code()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE public.profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN referral_code SET NOT NULL;

CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'add_credits amount must be positive';
  END IF;

  UPDATE public.profiles
  SET credits = credits + p_amount
  WHERE id = p_user_id
  RETURNING credits INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  INSERT INTO public.credit_transactions (
    user_id, amount, balance_after, type, reference_id, description
  )
  VALUES (p_user_id, p_amount, new_balance, p_type, p_reference_id, p_description);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  current_credits INTEGER;
  new_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'deduct_credits amount must be positive';
  END IF;

  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF current_credits IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  UPDATE public.profiles
  SET credits = credits - p_amount
  WHERE id = p_user_id
  RETURNING credits INTO new_balance;

  INSERT INTO public.credit_transactions (
    user_id, amount, balance_after, type, reference_id, description
  )
  VALUES (p_user_id, -p_amount, new_balance, p_type, p_reference_id, p_description);

  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.process_referral(
  p_referred_user_id UUID,
  p_referral_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
  v_existing_referred_by UUID;
  v_normalized_code TEXT;
BEGIN
  v_normalized_code := upper(trim(p_referral_code));

  IF v_normalized_code IS NULL OR length(v_normalized_code) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid referral code');
  END IF;

  SELECT referred_by INTO v_existing_referred_by
  FROM public.profiles
  WHERE id = p_referred_user_id;

  IF v_existing_referred_by IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already used a referral code');
  END IF;

  SELECT id INTO v_referrer_id
  FROM public.profiles
  WHERE referral_code = v_normalized_code;

  IF v_referrer_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral code not found');
  END IF;

  IF v_referrer_id = p_referred_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot refer yourself');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.referrals WHERE referred_id = p_referred_user_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Referral already recorded');
  END IF;

  UPDATE public.profiles
  SET referred_by = v_referrer_id
  WHERE id = p_referred_user_id;

  INSERT INTO public.referrals (
    referrer_id,
    referred_id,
    referrer_credits_awarded,
    referred_credits_awarded,
    free_generation_earned
  )
  VALUES (v_referrer_id, p_referred_user_id, 10, 10, false)
  RETURNING id INTO v_referral_id;

  PERFORM public.add_credits(
    v_referrer_id,
    10,
    'referral_reward',
    v_referral_id,
    'Referral bonus for inviting a new user'
  );

  PERFORM public.add_credits(
    p_referred_user_id,
    10,
    'referral_signup_bonus',
    v_referral_id,
    'Welcome bonus for signing up via referral'
  );

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'referrer_credits', 10,
    'referred_credits', 10
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.referrals
  DROP CONSTRAINT IF EXISTS referrals_referred_id_unique;

ALTER TABLE public.referrals
  ADD CONSTRAINT referrals_referred_id_unique UNIQUE (referred_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own credit transactions" ON public.credit_transactions;
CREATE POLICY "Users read own credit transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id
  ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON public.profiles(referral_code);
