# Auth setup (Supabase Dashboard)

Magic link is the default Supabase flow. Optional one-time template tweak:

1. Go to **Authentication → Email Templates → Magic Link**
2. Ensure the template uses `{{ .ConfirmationURL }}` (the default)
3. Or paste the body from [`supabase/templates/magic_link.html`](./templates/magic_link.html)

Already configured via CLI:

- **Confirm email** — disabled (sign-in link only, no separate confirmation step)
- **Redirect URL** — `http://localhost:3000/auth/callback` allowed

## Flow

1. User enters email at `/login`
2. Supabase sends email with magic link
3. User clicks link → `/auth/callback` → redirected to `/generate`

For production, add your production URL to **Authentication → URL Configuration → Redirect URLs**, e.g. `https://getRizzMyResume.in/auth/callback`.
