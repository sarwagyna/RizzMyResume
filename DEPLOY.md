# Deployment & Testing Guide

## Environment setup

### Vercel environment

Set these in **Vercel → Project → Settings → Environment Variables** before deploying (required for `next build` to embed `NEXT_PUBLIC_*` values):

| Variable | Required |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `NEXT_PUBLIC_APP_URL` | Yes — `https://rizzmyresume.sarwagyna.com` in prod |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes |

### Supabase Edge Functions (secrets)

| Secret | Required |
|---|---|
| `ANTHROPIC_API_KEY` | Yes |
| `LATEXLITE_API_KEY` | Yes |
| `RAZORPAY_KEY_ID` | Yes |
| `RAZORPAY_KEY_SECRET` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `RESEND_API_KEY` | Yes (P1 email delivery) |

Supabase auto-injects `SUPABASE_URL` and `SUPABASE_ANON_KEY` for edge functions.

## Supabase project

| Field | Value |
|---|---|
| Project name | RizzMyResume |
| Project ref | `jjvmrfgffordqwzdzznt` |
| Dashboard | https://supabase.com/dashboard/project/jjvmrfgffordqwzdzznt |

The CLI must be logged into the **same Supabase account** that owns this project. A different org (e.g. Sarwagyna `hzvhbnohuiodjhndotpb`) will return **403 Forbidden**.

## Deploy steps

```powershell
# 0. Log in with the account that owns RizzMyResume (once per machine)
npx supabase login

# Or with a personal access token from https://supabase.com/dashboard/account/tokens
# npx supabase login --token sbp_xxxxxxxx

# 1–2. Migrations + all edge functions (validates project access first)
.\scripts\supabase-deploy.ps1
```

Manual equivalent (use `--use-api` if Docker is not running):

```bash
npx supabase link --project-ref jjvmrfgffordqwzdzznt
npx supabase db push
npx supabase functions deploy cleanup-resumes --use-api
npx supabase functions deploy preview --use-api
npx supabase functions deploy generate --use-api
npx supabase functions deploy generation-status --use-api
npx supabase functions deploy preview-pdf --use-api
npx supabase functions deploy payment --use-api
npx supabase functions deploy history --use-api
npx supabase functions deploy download --use-api
npx supabase functions deploy parse-resume --use-api

# 3. Frontend (via Vercel CLI or GitHub integration)
vercel --prod
```

### 403 "does not have the necessary privileges"

Your CLI session is on the wrong Supabase account. `npx supabase projects list` must include **RizzMyResume** (`jjvmrfgffordqwzdzznt`). If it only shows other projects (CreatorNex, Sarwagyna, etc.), run `npx supabase login` with the email used to create RizzMyResume.

### Dashboard fallback (no CLI)

**Migration 006** — SQL Editor → paste `supabase/migrations/006_resume_retention.sql` → Run.

**Migration 007** — SQL Editor → paste `supabase/migrations/007_schedule_resume_cleanup.sql` → Run. This enables hourly auto-deletion via `pg_cron` (no manual cron job needed).

**Edge function (optional backup)** — `cleanup-resumes` can still be invoked manually with `CRON_SECRET`; production cleanup is handled by migration 007.

## Production launch checklist

Complete these before pointing `rizzmyresume.sarwagyna.com` at Vercel:

### Vercel environment

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jjvmrfgffordqwzdzznt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `NEXT_PUBLIC_APP_URL` | `https://rizzmyresume.sarwagyna.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_live_…` (live key after KYC) |

### Supabase Dashboard

1. **Authentication → URL Configuration**
   - Site URL: `https://rizzmyresume.sarwagyna.com`
   - Redirect URLs: `https://rizzmyresume.sarwagyna.com/auth/callback`
2. **Edge Function secrets** — all keys from `.env.example`
3. **Set `ALLOWED_ORIGIN`** = `https://rizzmyresume.sarwagyna.com` (restricts CORS on edge functions)
4. Run migrations **006** + **007** (24h cleanup)
5. Deploy all edge functions (`.\scripts\supabase-deploy.ps1`)

### Resend

- Verify sending domain in Resend (e.g. `sarwagyna.com` or `rizzmyresume.sarwagyna.com`)
- Set `RESEND_API_KEY` in Supabase secrets

### Razorpay (OQ1 — blocking)

1. Complete KYC and switch to **live** keys in Vercel + Supabase
2. Confirm ₹50 UPI/card transactions settle
3. **Payment verification is client-side** after checkout (`payment?action=verify` with user JWT). No Razorpay webhook is required for the current flow.

### LaTeXLite (OQ2 — blocking)

1. Run 3–5 sample generations with full student profiles
2. Confirm compilation completes within 30 seconds
3. Verify PDF is single-page and under 500KB

## Pre-launch verification

| # | Flow | Expected |
|---|---|---|
| 1 | Happy path | Form → pay ₹50 → PDF in <40s → download works |
| 2 | Payment failure | Form data preserved, retry works |
| 3 | Weak input | Warnings shown, payment still allowed |
| 4 | Auth | OTP login, draft survives refresh |
| 5 | History | Last 5 shown, expired links handled |
| 6 | ATS score | Score + tips on result page |
| 7 | JD keywords | Matched/missed chips render |
| 8 | Email | PDF arrives within 1 min |
| 9 | Mobile | Razorpay modal + PDF download on mobile |

## Local verification

```bash
npm run typecheck   # TypeScript
npm run build       # Production build
npm run lint        # ESLint
```

Build verified: `npm run build` passes with all routes compiled.

## Replace V5.3 prompt

Drop prompt updates into `prompts/v5_4_prompt.txt` and sync to `supabase/functions/_shared/v5_4_prompt.txt` and `v5_4_prompt.ts` (run `python scripts/sync_prompt_ts.py`), then redeploy the generate function.
