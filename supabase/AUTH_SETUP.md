# Auth setup (Supabase Dashboard)

Magic link is the default Supabase flow. Optional one-time template tweak:

1. Go to **Authentication → Email Templates → Magic Link**
2. Ensure the template uses `{{ .ConfirmationURL }}` (the default)
3. Or paste the body from [`supabase/templates/magic_link.html`](./templates/magic_link.html)

Already configured via CLI for **local dev**:

- **Confirm email** — disabled (sign-in link only, no separate confirmation step)
- **Redirect URL** — `http://localhost:3000/auth/callback` allowed

## Production (required for magic links)

In [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/jjvmrfgffordqwzdzznt/auth/url-configuration):

| Setting | Value |
|---|---|
| **Site URL** | `https://rizzmyresume.sarwagyna.com` |
| **Redirect URLs** | `https://rizzmyresume.sarwagyna.com/auth/callback` |
| | `https://rizzmyresume.sarwagyna.com/**` |

If Site URL is still `http://localhost:3000`, magic links in emails will redirect to localhost even when users sign in from production.

Also set in **Vercel**:
`NEXT_PUBLIC_APP_URL=https://rizzmyresume.sarwagyna.com` and redeploy.
