# Rizz My Resume

AI-powered ATS resume generation for Indian college students. Built on Next.js 14, Supabase, Claude Haiku 4.5, LaTeXLite, and Razorpay.

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Zustand, React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI:** Claude Haiku 4.5 with prompt caching
- **PDF:** LaTeXLite API
- **Payments:** Razorpay (₹50/resume)
- **Email:** Resend (PDF delivery backup)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### 3. Set up Supabase

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy payment
npx supabase functions deploy generate
npx supabase functions deploy generation-status
npx supabase functions deploy history
npx supabase functions deploy download
```

Set edge function secrets in Supabase dashboard:

```
ANTHROPIC_API_KEY=
LATEXLITE_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RESEND_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Replace `prompts/v5_4_prompt.txt` with updates — keep in sync with `supabase/functions/_shared/v5_4_prompt.txt` and run `python scripts/sync_prompt_ts.py` to regenerate `v5_4_prompt.ts` (bundled by the generate edge function).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Email OTP auth |
| `/generate` | Multi-step resume form |
| `/generate/payment` | Razorpay checkout |
| `/generate/processing` | Generation progress |
| `/generate/result` | PDF download + ATS score |
| `/dashboard` | Last 5 generations |

## Deploy

1. Push to GitHub and connect to Vercel
2. Add env vars in Vercel project settings
3. Deploy Supabase edge functions
4. Point `getRizzMyResume.in` DNS to Vercel

## Test checklist

- [ ] Form validation on all steps
- [ ] Draft persists on refresh (sessionStorage + Supabase)
- [ ] Razorpay payment success → auto generation
- [ ] Payment failure → form data intact
- [ ] PDF download within 40 seconds
- [ ] ATS score and JD keywords on result page
- [ ] Email PDF delivery via Resend
- [ ] Dashboard shows last 5 generations
- [ ] Expired links show refresh option

## Pre-launch blockers

- Confirm Razorpay KYC allows ₹50 transactions
- Load-test LaTeXLite compilation against 30s timeout

## License

Copyright © 2026 Sarwagyna Private Limited. All rights reserved.

This repository and all source code are proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited. See [LICENSE](./LICENSE) for full terms.

Licensing inquiries: [contact@sarwagyna.com](mailto:contact@sarwagyna.com)
