# TOPSKILLY — Setup Guide
## Do these steps in order. Do not skip.

---

## STEP 1 — Accounts to create first (manual — 15 mins)

| Account | URL | What to save |
|---------|-----|--------------|
| Supabase | supabase.com | Project URL + Anon Key + Service Role Key |
| Razorpay | razorpay.com | Key ID + Key Secret |
| Twilio | twilio.com | Account SID + Auth Token + Verify Service SID |
| Resend | resend.com | API Key (verify topskilly.com domain) |
| Cloudflare | cloudflare.com | Add topskilly.com, copy nameservers to Hostinger |

---

## STEP 2 — Clone your GitHub repo and open in Cursor

```bash
git clone https://github.com/YOUR_USERNAME/topskilly.git
cd topskilly
```

Then copy these project files into the repo root.

---

## STEP 3 — Install dependencies

```bash
# Install root + web deps
npm install

# Install web app deps
cd apps/web && npm install && cd ../..

# Install mobile app deps
cd apps/mobile && npm install && cd ../..
```

---

## STEP 4 — Set up environment variables

```bash
# Copy the example file
cp apps/web/.env.local.example apps/web/.env.local

# Edit and fill in your keys from Step 1
# NEVER commit .env.local to Git
```

---

## STEP 5 — Run the Supabase schema

1. Go to supabase.com → your project → SQL Editor
2. Run `supabase/schema.sql` (copy and paste entire file)
3. Run `supabase/rls-policies.sql` (copy and paste entire file)

---

## STEP 6 — Start the web app

```bash
npm run dev:web
# Opens at http://localhost:3000
```

---

## STEP 7 — Deploy Supabase Edge Function

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy OTP verification function
supabase functions deploy verify-lead-otp

# Set environment variables for the function
supabase secrets set TWILIO_ACCOUNT_SID=xxx
supabase secrets set TWILIO_AUTH_TOKEN=xxx
supabase secrets set TWILIO_VERIFY_SERVICE_SID=xxx
```

---

## STEP 8 — Deploy to Vercel

1. Go to vercel.com → New Project → Import from GitHub
2. Set Root Directory to `apps/web`
3. Add all env variables from `.env.local`
4. Deploy
5. Add custom domain: topskilly.com

---

## STEP 9 — Build and submit mobile app

```bash
npm install -g eas-cli
eas login
eas build:configure

# iOS (no Mac needed — cloud build)
eas build --platform ios --profile production
eas submit --platform ios

# Android
eas build --platform android --profile production
eas submit --platform android
```

---

## STEP 10 — Use Cursor Prompts

Open `cursor-prompts/ALL_PROMPTS.md` and use prompts in order:
- Prompt 1–5: Phase 1 Foundation (Week 1–2)
- Prompt 6–10: Phase 2 Core Marketplace (Week 3–4)
- Prompt 11–15: Phase 3 Trust & Quality (Week 5–6)

**How to use in Cursor:** Press `Ctrl+K` (or `Cmd+K` on Mac), paste the prompt, hit Enter.

---

## Monthly Cost at Launch

| Service | Cost |
|---------|------|
| Supabase, Vercel, Cloudflare | Rs. 0 |
| Razorpay, Stripe | 2.5% per transaction |
| Twilio OTP SMS | ~Rs. 0.40/SMS |
| Apple Developer | Rs. 667/month |
| Domain | Rs. 67/month |
| **Total** | **~Rs. 750–3,000/month** |
