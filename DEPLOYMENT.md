# Deploy on Vercel

## Env vars and secrets

**Rule: do not put secrets in `NEXT_PUBLIC_*` variables.**  
In Next.js, only `NEXT_PUBLIC_*` are inlined into the client bundle and can be seen in the browser. Any token, key, or webhook URL must be set **without** the `NEXT_PUBLIC_` prefix so it stays server-only.

| Variable                    | Secret? | Where it runs                                                 |
| --------------------------- | ------- | ------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`        | Yes     | Server only                                                   |
| `TELEGRAM_CHAT_ID`          | Yes     | Server only                                                   |
| `PIPEDRIVE_API_TOKEN`       | Yes     | Server only                                                   |
| `SLACK_WEBHOOK_URL`         | Yes     | Server only                                                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes     | Server only                                                   |
| `NEXT_PUBLIC_SITE_URL`      | No      | Client + server (e.g. sitemap)                                |
| `NEXT_PUBLIC_SUPABASE_*`    | No\*    | Client + server (\*anon key is public by design for Supabase) |

Set variables in **Vercel → Project → Settings → Environment Variables**. Add them for the environments you use (Production, Preview, Development).

## Contact form: only Telegram

To test the form with **only Telegram** (no CRM, Slack, or DB):

1. In Vercel env vars set:
   - `ENABLE_LEAD_INTEGRATIONS` = `telegram`
   - `TELEGRAM_BOT_TOKEN` = your bot token
   - `TELEGRAM_CHAT_ID` = your chat ID

2. Do **not** set `PIPEDRIVE_API_TOKEN`, `SLACK_WEBHOOK_URL`, or Supabase vars (or leave them empty).

Later, to enable all integrations and DB, set `ENABLE_LEAD_INTEGRATIONS` to `all` (or remove it) and add the other keys.

## Build

The app builds without any env vars. Validation runs only when Supabase URL is set (see `src/lib/config/init.ts`).
