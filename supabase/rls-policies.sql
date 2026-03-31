-- ============================================================
-- TOPSKILLY — Row Level Security (RLS) Policies
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_unlocks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS table
-- Users can only read/update their own row
-- ============================================================
CREATE POLICY "users: self read" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: self update" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users: self insert" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES table
-- Public read, admin write only
-- ============================================================
CREATE POLICY "categories: public read" ON public.categories
  FOR SELECT USING (active = true);

-- ============================================================
-- TUTOR_PROFILES table
-- Public read for active profiles; owner can update their own
-- ============================================================
CREATE POLICY "tutor_profiles: public read" ON public.tutor_profiles
  FOR SELECT USING (true);

CREATE POLICY "tutor_profiles: owner write" ON public.tutor_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- LEADS table
-- Active leads are public read
-- Students can only write their own leads
-- ============================================================
CREATE POLICY "leads: public read active" ON public.leads
  FOR SELECT USING (active = true);

CREATE POLICY "leads: student read own" ON public.leads
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "leads: student insert" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "leads: student update own" ON public.leads
  FOR UPDATE USING (auth.uid() = student_id);

-- ============================================================
-- LEAD_UNLOCKS table
-- CRITICAL: Tutor can only see their own unlocks (privacy!)
-- Students CANNOT see who unlocked their lead (only the count)
-- ============================================================
CREATE POLICY "lead_unlocks: tutor read own" ON public.lead_unlocks
  FOR SELECT USING (auth.uid() = tutor_id);

-- Unlocks are created via the unlock_lead() function (SECURITY DEFINER)
-- No direct insert policy needed

-- ============================================================
-- WALLETS table
-- Users can only read their own wallet
-- Updates happen via functions (SECURITY DEFINER)
-- ============================================================
CREATE POLICY "wallets: owner read" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- PURCHASES table
-- Users can only see their own purchase history
-- ============================================================
CREATE POLICY "purchases: owner read" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "purchases: owner insert" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MESSAGES table
-- Only sender and receiver can read messages
-- ============================================================
CREATE POLICY "messages: participants read" ON public.messages
  FOR SELECT USING (auth.uid() = from_id OR auth.uid() = to_id);

CREATE POLICY "messages: sender insert" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = from_id);

CREATE POLICY "messages: receiver update" ON public.messages
  FOR UPDATE USING (auth.uid() = to_id);   -- for marking read_at

-- ============================================================
-- REVIEWS table
-- Public read; students write once per lead
-- ============================================================
CREATE POLICY "reviews: public read" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews: student insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = student_id);
