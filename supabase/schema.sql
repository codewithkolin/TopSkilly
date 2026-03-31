-- ============================================================
-- TOPSKILLY — Full Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor (supabase.com > your project > SQL Editor)
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  phone         TEXT UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('student', 'professional', 'admin')),
  verified      BOOLEAN DEFAULT false,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  icon        TEXT,
  slug        TEXT UNIQUE NOT NULL,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories
INSERT INTO public.categories (name, icon, slug) VALUES
  ('Tutoring', '📚', 'tutoring'),
  ('JEE/NEET Prep', '🔬', 'jee-neet'),
  ('Video Editing', '🎬', 'video-editing'),
  ('Web Development', '💻', 'web-dev'),
  ('Graphic Design', '🎨', 'design'),
  ('Freelance Writing', '✍️', 'writing'),
  ('UPSC Coaching', '🏛️', 'upsc'),
  ('Music Lessons', '🎵', 'music')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TABLE: tutor_profiles (professionals)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tutor_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id      UUID REFERENCES public.categories(id),
  subjects         TEXT[] DEFAULT '{}',
  credentials      TEXT,
  credential_url   TEXT,    -- Supabase Storage URL
  verified_badge   BOOLEAN DEFAULT false,
  badge_approved_at TIMESTAMPTZ,
  rating           NUMERIC(3,2) DEFAULT 0.00,
  review_count     INTEGER DEFAULT 0,
  bio              TEXT,
  city             TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- TABLE: leads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id),
  subject         TEXT NOT NULL,
  description     TEXT NOT NULL,
  level           TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  urgency         TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
  budget_inr      INTEGER,
  max_buyers      INTEGER NOT NULL DEFAULT 3 CHECK (max_buyers BETWEEN 1 AND 5),
  buyer_count     INTEGER DEFAULT 0,
  active          BOOLEAN DEFAULT false,   -- false until OTP verified
  otp_verified    BOOLEAN DEFAULT false,
  otp_phone       TEXT,                    -- student phone used for OTP
  city            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_active_idx ON public.leads(active);
CREATE INDEX IF NOT EXISTS leads_category_idx ON public.leads(category_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at DESC);

-- ============================================================
-- TABLE: lead_unlocks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_unlocks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id       UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  tutor_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coins_spent   INTEGER NOT NULL DEFAULT 200,
  unlocked_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, tutor_id)   -- prevent double unlock
);

CREATE INDEX IF NOT EXISTS unlocks_tutor_idx ON public.lead_unlocks(tutor_id);
CREATE INDEX IF NOT EXISTS unlocks_lead_idx ON public.lead_unlocks(lead_id);

-- ============================================================
-- TABLE: wallets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id         UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  coins_balance   INTEGER NOT NULL DEFAULT 0 CHECK (coins_balance >= 0),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: purchases
-- ============================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('coin_topup', 'subscription')),
  amount_inr      INTEGER NOT NULL,
  coins_credited  INTEGER NOT NULL,
  gateway         TEXT NOT NULL CHECK (gateway IN ('razorpay', 'stripe', 'apple_iap', 'google_play')),
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id     UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  from_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS messages_from_idx ON public.messages(from_id);
CREATE INDEX IF NOT EXISTS messages_to_idx ON public.messages(to_id);

-- ============================================================
-- TABLE: reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lead_id     UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, student_id, lead_id)   -- one review per lead
);

-- ============================================================
-- FUNCTION: create_wallet_on_signup
-- Auto-creates a wallet for every new user
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, coins_balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: unlock_lead(lead_id, tutor_id)
-- Atomic: deducts coins + creates unlock record + increments buyer_count
-- ============================================================
CREATE OR REPLACE FUNCTION public.unlock_lead(
  p_lead_id   UUID,
  p_tutor_id  UUID,
  p_coins     INTEGER DEFAULT 200
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_lead        public.leads%ROWTYPE;
  v_wallet      public.wallets%ROWTYPE;
  v_student     public.users%ROWTYPE;
BEGIN
  -- Lock the lead row to prevent race conditions
  SELECT * INTO v_lead FROM public.leads WHERE id = p_lead_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead not found');
  END IF;

  IF NOT v_lead.active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead is not active');
  END IF;

  IF v_lead.buyer_count >= v_lead.max_buyers THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead has reached maximum buyers');
  END IF;

  -- Check if already unlocked
  IF EXISTS (
    SELECT 1 FROM public.lead_unlocks
    WHERE lead_id = p_lead_id AND tutor_id = p_tutor_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already unlocked this lead');
  END IF;

  -- Check wallet balance
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_tutor_id FOR UPDATE;

  IF NOT FOUND OR v_wallet.coins_balance < p_coins THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;

  -- Deduct coins
  UPDATE public.wallets
  SET coins_balance = coins_balance - p_coins, updated_at = NOW()
  WHERE user_id = p_tutor_id;

  -- Create unlock record
  INSERT INTO public.lead_unlocks (lead_id, tutor_id, coins_spent)
  VALUES (p_lead_id, p_tutor_id, p_coins);

  -- Increment buyer count
  UPDATE public.leads
  SET buyer_count = buyer_count + 1, updated_at = NOW()
  WHERE id = p_lead_id;

  -- Get student contact details
  SELECT * INTO v_student FROM public.users WHERE id = v_lead.student_id;

  RETURN jsonb_build_object(
    'success', true,
    'contact', jsonb_build_object(
      'name', v_student.name,
      'phone', v_student.phone,
      'email', v_student.email
    ),
    'coins_remaining', v_wallet.coins_balance - p_coins
  );
END;
$$;

-- ============================================================
-- FUNCTION: add_coins(user_id, amount)
-- Credits coins to wallet after successful payment
-- ============================================================
CREATE OR REPLACE FUNCTION public.add_coins(
  p_user_id UUID,
  p_amount  INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, coins_balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    coins_balance = wallets.coins_balance + p_amount,
    updated_at = NOW();
END;
$$;

-- ============================================================
-- FUNCTION: update_tutor_rating()
-- Recalculates tutor rating after each review
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_tutor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.tutor_profiles
  SET
    rating = (SELECT AVG(rating) FROM public.reviews WHERE tutor_id = NEW.tutor_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE tutor_id = NEW.tutor_id),
    updated_at = NOW()
  WHERE user_id = NEW.tutor_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_inserted ON public.reviews;
CREATE TRIGGER on_review_inserted
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_tutor_rating();
