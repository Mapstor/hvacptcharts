# SEO fixes log

Chronological log of the SEO remediation pass. One entry per fix.

---

## 2026-09-25 — Fix 1/18: allow `/_next/` in robots.txt so Googlebot can render pages

**Problem.** `src/app/robots.ts` disallowed `/_next/`, which blocks Googlebot from
fetching the Next.js JS, CSS and `/_next/image` assets required to render pages.
Result: Google renders pages unstyled and never sees client-drawn content, while
Bing (which crawled those assets) ranks the site far higher. Google's robots.txt
guidance: don't block resources that make a page harder to understand.

**Decision on `/api/`.** Kept disallowed. There is **no `/api/` route** in this app
(route handlers live under `/data/refrigerant/*`, `/llms.txt`, `/llms-full.txt`,
`/feed.xml`) and **zero client-side `fetch`/`axios`/`useSWR`/`useQuery`** anywhere in
`src` — the site is fully server-rendered, so nothing render-critical lives behind
`/api/`. The rule is a harmless guard against a future runtime endpoint. `/dev/`
kept (SVG component gallery, also `noindex`'d).

**Files changed.**
- `src/app/robots.ts` — removed `/_next/` from `disallow` (now `["/api/", "/dev/"]`);
  rewrote the header comment to explain why `/_next/` must stay crawlable and record
  the `/api/` decision.
- `docs/spec/03-SITEMAP_MIGRATION.md` — removed `/_next/` from the prescribed
  `disallow` array and added a "Never disallow `/_next/`" note so the rule isn't re-added.
- `docs/seo-fixes/LOG.md` — this log (new).

**Blocker audit (nothing else blocks `/_next/` or sends noindex).** No
`public/robots.txt`; no `headers()` in `next.config.ts`; no `middleware.ts`/`proxy.ts`;
no `vercel.json`; no `X-Robots-Tag` anywhere.

**Verification.**
- Full production build (`next build` + all project verify gates, run via
  `node_modules/.bin` since pnpm 11 needs a newer Node than v20 here): **exit 0**.
  Gates passed: verify-redirects, verify-data, verify-gauge-operating-points,
  verify-no-psig-literals, verify-no-overlay, verify-metadata (153 routes),
  validate-schema. `next build`: 286 static pages, `/robots.txt` prerendered static.
- Started the built app (`next start -p 3100`) and curled `/robots.txt`:

  ```
  User-Agent: *
  Allow: /
  Disallow: /api/
  Disallow: /dev/

  Sitemap: https://hvacptcharts.com/sitemap.xml
  ```
  (`/_next/` no longer present; no `X-Robots-Tag` response header.)
- `eslint src/app/robots.ts`: clean. Repo-wide eslint has 5 pre-existing errors
  (`react/no-unescaped-entities` in content pages) + 97 warnings — none in the files
  changed here.

**Not pushed** (per instructions).
