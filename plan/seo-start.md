# SEO Start Plan

## Goal

Add baseline technical SEO and enable SSR for the homepage, without changing H1/H2 content copy.

## Scope

- Enable SSR for `/` route.
- Add production-ready metadata defaults.
- Add `robots.txt` and `sitemap.xml`.
- Add Open Graph and Twitter image routes.
- Add JSON-LD structured data.

## Implementation Steps

1. SSR on homepage (✅ Done)

- Update `src/app/page.tsx`:
  - Keep page as Server Component (no `"use client"`).
  - Add `export const dynamic = "force-dynamic"` to force SSR.
  - Move interactive logic (toast trigger) to a client-only component.

- Add `src/components/home-client.tsx`:
  - `"use client"` component with Sonner toast button and any client-only behavior.
  - Keep existing behavior equivalent.

2. Metadata and technical SEO (✅ Done)

- Update `src/app/layout.tsx` metadata:
  - `metadataBase`
  - `title` template + default
  - `description`
  - `alternates.canonical`
  - `openGraph` defaults
  - `twitter` defaults
  - `robots`
  - `applicationName`, `category`

3. Structured data (✅ Done)

- Add JSON-LD script in `src/app/layout.tsx`:
  - `WebApplication` (calculator intent)

4. Indexing artifacts (✅ Done)

- Add `src/app/robots.ts`.
- Add `src/app/sitemap.ts`.

5. Validation (✅ Done)

- `yarn lint` passed.
- `yarn build` passed.
  - Confirmed `/robots.txt` and `/sitemap.xml` are static outputs.
  - Confirmed `/` route is dynamic (ƒ).

## Notes

- No H1/H2 or long-form content edits.
- Visual structure intact.
- **Action Required for User:** Replace `NEXT_PUBLIC_SITE_URL` environment variable or hardcoded `https://example.com` when the production URL is known.
