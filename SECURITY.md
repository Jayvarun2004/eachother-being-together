# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main) | ✅ |

## Reporting a Vulnerability

**Do not** report security vulnerabilities in public GitHub issues.

Please report security issues by emailing the maintainers (see the GitHub profile) or by using GitHub's private vulnerability reporting feature:

1. Go to the **Security** tab of this repository
2. Click **Report a vulnerability**
3. Fill in the form

We will acknowledge the report within 48 hours and aim to publish a fix within 7 days for critical issues.

## Security Design

- The frontend uses only the **public anon key** — the Supabase service role key is never exposed.
- All room reads/writes are gated by Row Level Security policies in `supabase/schema.sql`.
- Secret answers are enforced server-side by a `SECURITY DEFINER` function — the UI cannot reveal them before both players have submitted.
- No passwords or personal data are stored. All sign-ins are anonymous.
- Environment variables (`VITE_SUPABASE_*`) are set in the hosting platform's dashboard, never committed to the repo.
