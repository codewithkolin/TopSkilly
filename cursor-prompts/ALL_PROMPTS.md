# TOPSKILLY — All 15 Cursor Prompts
# Open Cursor → press Ctrl+K (or Cmd+K on Mac) → paste prompt → Enter

---

## PHASE 1 — FOUNDATION (Week 1–2)

---

### PROMPT 1 — Supabase Schema
```
Create the full Supabase PostgreSQL schema for Topskilly marketplace.
Include tables: users, tutor_profiles, leads, lead_unlocks, purchases, wallets, messages, reviews, categories.
Add RLS policies so users can only see their own data.
Add a PostgreSQL function called unlock_lead(p_lead_id UUID, p_tutor_id UUID, p_coins INTEGER DEFAULT 200)
that atomically: checks the lead is active, checks buyer_count < max_buyers, checks tutor hasn't already unlocked,
checks wallet has enough coins, deducts coins, creates lead_unlock record, increments buyer_count,
and returns the student contact details as JSON.
Use uuid_generate_v4() for IDs. Enable pg_cron extension.
```

---

### PROMPT 2 — Next.js Auth
```
Create Supabase auth for Next.js 14 App Router for Topskilly.
Include:
- Email magic link login at /login
- Phone OTP login at /login (toggle between email/phone)
- Google OAuth at /api/auth/callback
- middleware.ts that protects /dashboard/* and /admin/* routes, redirects unauthenticated users to /login
- After login, read users.role from Supabase and redirect:
  - role='professional' → /dashboard/pro
  - role='student' → /dashboard/student
  - no role → /onboarding
Use @supabase/ssr with createServerClient in server components and createBrowserClient in client components.
Use TypeScript. Use tailwind + shadcn/ui for the login UI.
Brand colour is #1A56DB.
```

---

### PROMPT 3 — Expo Auth
```
Create the Supabase auth flow in Expo Router (React Native) for Topskilly.
Screens:
- /auth/login — phone number input with +91 country code prefix
- /auth/otp-verify — 6-digit OTP input with auto-submit on 6th digit
- /auth/role-select — two large cards: "I need a tutor / professional" (student) and "I am a professional" (tutor)
After role selection, save role to users table in Supabase.
Use expo-secure-store for token storage via ExpoSecureStoreAdapter.
Use NativeWind for styling. Brand colour #1A56DB.
Use Zustand to store user, userRole, and coinBalance globally.
After auth, navigate to /(tabs) using expo-router.
```

---

### PROMPT 4 — User Onboarding
```
Create a multi-step onboarding flow for Topskilly web app (Next.js).
Steps:
1. Role selection — "I need a professional" (student) or "I am a professional"
2. Profile setup — name, city, profile photo upload to Supabase Storage
3. For professionals: subject/skill selection (multi-select from categories table), bio text area
4. Phone verification — OTP via Supabase phone auth
5. Completion screen with CTA to their dashboard

Use shadcn/ui Progress component for the step indicator.
Save profile to users table and tutor_profiles table on completion.
Use react-hook-form + zod for form validation.
Brand colour #1A56DB.
```

---

### PROMPT 5 — Lead Posting with OTP
```
Create a lead posting form for students in Topskilly (Next.js).
Fields: category (dropdown from categories table), subject (text), description (textarea),
level (beginner/intermediate/advanced radio), urgency (low/medium/high/urgent radio),
budget_inr (optional number input), city (text).
On submit:
1. Save lead to Supabase leads table with active=false and otp_verified=false
2. Send OTP to student's phone via Supabase phone auth
3. Show OTP input modal
4. On OTP verify, call the Supabase Edge Function verify-lead-otp with lead_id and otp_code
5. Edge Function sets leads.otp_verified=true and leads.active=true via Twilio Verify API
6. Redirect to /dashboard/student on success
Use react-hook-form + zod. Brand colour #1A56DB.
```

---

## PHASE 2 — CORE MARKETPLACE (Week 3–4)

---

### PROMPT 6 — Lead Feed
```
Create a paginated lead feed page at /leads for Topskilly (Next.js).
Fetch active leads from Supabase ordered by created_at DESC.
Show category filter tabs at the top (fetch from categories table).
Each lead card shows: category icon, subject, urgency badge (colour coded), level,
buyer_count vs max_buyers, coin price (200 coins), and an Unlock button.
Add infinite scroll (use Supabase range queries with from/to for pagination, 20 per page).
Show the current user's coin balance in the navbar.
If lead buyer_count >= max_buyers, show "Sold out" instead of Unlock button.
If user already unlocked the lead (check lead_unlocks), show "View contact" instead.
Use React Server Components for the initial load; client component for filters.
```

---

### PROMPT 7 — Coin Wallet
```
Create a wallet system for Topskilly (Next.js).
Wallet page at /wallet:
- Show current coins_balance from wallets table
- Show purchase history from purchases table
- Three coin packages: 200 coins (Rs. 200), 500 coins (Rs. 450), 1000 coins (Rs. 800)
- Razorpay integration: on buy click, create Razorpay order via API route /api/razorpay/order
  (use RAZORPAY_KEY_SECRET server-side), open Razorpay checkout modal client-side
- On payment success, call /api/razorpay/verify to verify signature, then call
  Supabase function add_coins(user_id, amount) and insert into purchases table
- Show success toast and updated balance
Also show coin balance in the main navbar on all pages.
```

---

### PROMPT 8 — Lead Unlock
```
Create the lead unlock flow for Topskilly (Next.js).
Lead detail page at /leads/[id]:
- Show full lead info: subject, description, level, urgency, category, city
- Show Unlock button with coin cost (200 coins) and current user's balance
- On Unlock click, call Supabase RPC function unlock_lead(p_lead_id, p_tutor_id)
- The function atomically: checks balance, checks not already unlocked, checks not full,
  deducts coins, creates lead_unlock, increments buyer_count, returns student contact JSON
- On success: reveal student name, phone, and email on the page
- Send notification email to student via Resend API route: "A professional unlocked your lead"
- Update coin balance in navbar
- Show error toast if insufficient coins or lead is full
Handle loading state during unlock.
```

---

### PROMPT 9 — Contact Reveal + Email Notification
```
Create the contact reveal and email notification system for Topskilly.
After a successful lead unlock:
1. Show student contact details (name, phone, email) in a highlighted card on the lead page
2. Create API route /api/notify/lead-unlocked that:
   - Takes lead_id and tutor_id
   - Fetches student contact and tutor name from Supabase (using service role key)
   - Sends email to student via Resend with subject "A professional is interested in your lead"
   - Email body: professional's name, subjects, rating, link to their profile
   - Sends email to professional with subject "Lead contact details"
   - Email body: student's name, phone, email, lead details
3. Log the unlock in lead_unlocks table (already done by the RPC)
Use Resend's React email templates. From address: noreply@topskilly.com.
```

---

### PROMPT 10 — Subscription (Razorpay)
```
Create a Razorpay subscription plan for Topskilly professionals.
Plan: Rs. 2,000/month = 2,000 coins (equivalent to 10 lead unlocks).
Subscription page at /subscribe:
- Show plan card: Rs. 2,000/month, 2,000 coins, 10+ leads per month
- Show current subscription status if active
- Subscribe button: create Razorpay subscription via /api/razorpay/subscription route
- Use Razorpay Subscription API (not one-time order) with plan_id
- On subscription activation webhook (/api/webhooks/razorpay):
  - Verify Razorpay signature
  - Credit 2,000 coins via add_coins() Supabase function
  - Insert into purchases table with type='subscription'
  - Send confirmation email via Resend
- Show "Active subscription — renews on [date]" when subscribed
```

---

## PHASE 3 — TRUST & QUALITY (Week 5–6)

---

### PROMPT 11 — Verified Badge
```
Create the verified badge system for Topskilly professionals.
Upload flow (professional profile page):
- File upload input (PDF or image) for credential document
- Upload to Supabase Storage at credentials/{user_id}/document.pdf
- Save URL to tutor_profiles.credential_url
- Set a pending_verification status

Admin panel at /admin/verifications:
- List all tutor_profiles where credential_url is set and verified_badge is false
- Show professional name, credential document preview/link, subjects
- Approve button: sets tutor_profiles.verified_badge=true and badge_approved_at=NOW()
- Reject button: clears credential_url and sends rejection email via Resend
- Send approval email to professional via Resend

Show verified badge (checkmark icon, blue) on:
- Lead feed cards (if tutor is verified)
- Tutor profile page
- Lead unlock contact reveal
```

---

### PROMPT 12 — Reviews
```
Create a review system for Topskilly.
After a lead unlock, the student can rate the professional 1-5 stars.
Review form (student dashboard, after each unlock):
- Star rating selector (1-5)
- Comment textarea (optional, max 500 chars)
- Submit once per lead per professional (enforce with UNIQUE constraint)

Reviews display:
- Show on tutor profile page (/pro/[id]): average rating, total count, individual reviews
- Show star rating on lead feed cards
- Show rating on lead unlock contact card

Database trigger: after INSERT on reviews, update tutor_profiles.rating (AVG) and review_count (COUNT).
Use shadcn/ui for star rating component. Use zod + react-hook-form for validation.
```

---

### PROMPT 13 — Admin Panel
```
Create a protected admin panel at /admin for Topskilly.
Protect with middleware: check users.role='admin', redirect to /login if not.
Pages:

/admin — Dashboard with stats:
- Total users (students vs professionals)
- Total leads posted today / this week
- Total unlocks today / revenue estimate
- DAU (approximate from updated_at)
Use Supabase aggregate queries.

/admin/users — User management table:
- Columns: name, email, phone, role, verified, created_at
- Actions: Ban user (set verified=false), Grant admin role

/admin/leads — Lead moderation queue:
- Show all leads (active and inactive)
- Actions: Deactivate lead (set active=false), Delete lead

/admin/verifications — Credential review (see Prompt 11)

/admin/transactions — Transaction log:
- purchases table with user name, type, amount, coins, gateway, status, date
- Export to CSV button (client-side CSV generation from fetched data)

Use shadcn/ui Table, Badge, Button components. Minimal, clean design.
```

---

### PROMPT 14 — Push Notifications (Expo)
```
Add Expo push notifications to Topskilly mobile app.
When a new lead is posted that matches a professional's subjects, send a push notification.

Setup:
1. On app launch, request notification permission and get Expo push token
2. Save push token to users table (add push_token column)
3. Use Expo Notifications SDK

Supabase webhook trigger:
- Create a Supabase Database Webhook on leads table (INSERT event)
- Webhook calls a Supabase Edge Function send-lead-notification
- Edge Function: finds all professionals whose tutor_profiles.subjects overlap with the new lead's subject
  (use PostgreSQL array overlap operator &&)
- For each matching professional, send push via Expo Push Notifications API:
  https://exp.host/--/api/v2/push/send
- Notification: title "New lead: {subject}", body "{urgency} urgency · 200 coins to unlock"

Handle permission denied gracefully. Store token in SecureStore.
```

---

### PROMPT 15 — Re-engagement Email (pg_cron)
```
Create a Supabase scheduled function using pg_cron for Topskilly.
Task: Find students who have not posted a lead in 30 days and send re-engagement emails.

Steps:
1. Enable pg_cron extension in Supabase (already done in schema)
2. Create a Supabase Edge Function called send-reengagement-emails:
   - Queries: SELECT * FROM users WHERE role='student'
     AND id NOT IN (SELECT student_id FROM leads WHERE created_at > NOW() - INTERVAL '30 days')
   - For each inactive student, send email via Resend:
     Subject: "Your next client is waiting on Topskilly"
     Body: Personalised message, link to /post-lead, show count of new leads in their category
3. Schedule with pg_cron to run daily at 9am IST (UTC+5:30 = 3:30 UTC):
   SELECT cron.schedule('reengagement-daily', '30 3 * * *', $$
     SELECT net.http_post(
       url := 'https://your-project.supabase.co/functions/v1/send-reengagement-emails',
       headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
     )
   $$);
Use TypeScript + Deno for the Edge Function.
```

---

## BONUS — App Store Setup

### EAS Build Commands
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure builds
eas build:configure

# Build for iOS (cloud build — no Mac needed)
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to App Store (auto-uploads to TestFlight)
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### Apple IAP Products to create in App Store Connect:
- Product ID: com.topskilly.coins200 — Rs. 199 — "200 Coins"
- Product ID: com.topskilly.coins500 — Rs. 449 — "500 Coins"
- Product ID: com.topskilly.sub_monthly — Rs. 1,999/month — "Topskilly Pro Monthly"
