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

---

## 2026-09-25 — Fix 3A/18: operating pressures computed from dataset; scenarios + AHRI-540 dropped

**Rule:** no typed pressures/temperatures — every operating value comes from the PT
dataset via new helpers, and each page prints its method.

**Shared helpers** (`src/data/refrigerants.ts`): `satPressure(refId, tempF, curve)` and
`satTemp(refId, psig, curve)` — thin scalar wrappers over the existing interpolators;
return `null` outside the fluid's PT range (never extrapolate).

**Operating pages** (`WhatPressurePage.tsx` + `mdx-what-pressure.ts` schema + 8 MDX):
added a `pressureModel` (residential-ac / commercial-refrigeration); the component now
computes suction/head per row and prints the method note. Residential suction =
dew(38–45°F evap); head = bubble(outdoor+15…+25). Commercial suction =
dew(evap±3°F); head = bubble(ambient+15…+30). Hand-typed psig/superheat/subcooling
literals removed from frontmatter (commercial rows gained `evaporatorF`).

Computed tables (whole PSIG, verified against the CoolProp-8 oracle, all within tol):
- R-404A: 35°F→72–82, 25°F→58–66, **0°F→30–36** (was 12–20), −15°F→17–22; head 95°F amb 273–333, 75°F amb 204–254.
- Residential @95°F outdoor: R-410A 114–130 / 367–419; R-32 116–133 / 375–429; R-22 66–76 / 226–260; R-454B 103–118 / 346–396; R-407C 60–71 / 260–299.
- R-449A / R-454C computed from their per-page rows (e.g. R-454C −25°F evap → 3–6 psig).

**Dropped R-454B 115°F-outdoor row** — head needs bubble@140°F but the R-454B dataset
stops at 134°F (step 3; reported here, not extrapolated).

**Design point** (`gauge-operating-points.ts`): condTempF 105→115 for the 8 in-scope
fluids (95°F outdoor + 20°F). Residential 40°F dew / 115°F bubble; commercial page evap
dew / 115°F bubble. Verified: R-22 → 68.6 dew | 242.8 bubble.

**Dropped fabricated "Real service scenarios"** — the multiplier-based (×0.78/×1.25)
properly-charged/undercharge/overcharge generator was removed; the section now renders
only hand-checked `fm.serviceScenarios`. (R-744's bespoke set is kept — out of scope.)
No in-scope page had hand-written scenarios, so none were kept.

**AHRI-540 / 85%-of-critical cutout claims deleted** (step 7, site-wide): the
WhatPressurePage envelope bullet + footer line; `high-head-pressure-causes` FAQ
("85% = ~593 PSIG") + source citation; `saturation-properties-calculator` ServiceProblem
#1 ("0.85 × P_critical = 593 PSIG"). Replaced with accurate "cutout is an OEM setpoint"
copy.

**Step 8** (PT-chart pages with an operating page): removed typed operating numbers from
`content/refrigerants/{r-410a,r-22,r-32,r-454b,r-407c,r-404a}.mdx` FAQs and linked to the
operating page; also corrected two wrong "278 PSIG" R-410A 95°F saturation values → 296.
R-449A/R-454C detail FAQs are saturation-only (left); r-134a/r-1234yf/r-744 out of scope.

**Verification:** production build exit 0, all gates pass (verify-metadata 153 routes,
verify-gauge-operating-points, validate-schema). Grep checks: "12-20 PSIG", "+3 PSIG"
(R-404A), "approximately 278", "85% of critical", "Standard 540-2020, the high-pressure
cutout" all gone (the only remaining "+3 PSIG" is on out-of-scope r1234yf, a correct
statement). Live curl confirmed R-404A 0°F→30–36/273–333 and the 115°F design points.
Lint of changed files: 0 errors.

**Not pushed.**

---

## 2026-09-25 — Fix 2/18: 301 redirects for legacy, typo and old comparison URLs

**Goal.** Every legacy/typo/old URL search engines still request must answer with
ONE permanent 301 straight to its canonical target (no chains, no 200 duplicates).
The six `-be` URLs alone still draw ~1,379 Bing clicks / ~3,557 ad pageviews.

**How each "from" URL was handled before → after.**
| From | Before | After |
|---|---|---|
| `/what-pressure-should-{410a,r22,r134a,r32,r454b,r404a}-be/` (×6) | already 301 | unchanged (still 301) |
| `/what-pressue-should-r404a-be/` (typo) | **nothing (404)** | **new 301** → `/what-pressure-should-r404a/` |
| `/r410a-vs-r32/` | **nothing (404)** | **new 301** → `/r-32-vs-r-410a/` |
| `/r-410a-vs-r-32/` | 308 (`permanent:true`) | **301** → `/r-32-vs-r-410a/` |
| `/r-134a-vs-r-1234yf/` | **nothing (404)** | **new 301** → `/r-1234yf-vs-r-134a/` |
| `/r-410a/` | already 301 | unchanged (301 → `/refrigerant/r-410a/`) |
| `/pressure-diagnostic-tool/` | 308 (`permanent:true`) | **301** → `/system-pressure-diagnostic-calculator/` |
| `/refrigerant/` | 301 → `/` (homepage) | **301 → `/pt-charts-tools-hub/`** (repointed) |
| `/refrigerant-prices/` (spec cross-check, step 3) | **nothing** | **new 301** → `/refrigerant-prices-guide/` |

No duplicate routes / page files / aliases served any of these with 200 (verified
`src/app/refrigerant/` holds only `[slug]`, no other matches). No internal links
pointed at any "from" URL (grep of `src/` + `content/` empty) and none were in the
sitemap — so nothing to rewrite there.

**Diff summary.**
- `next.config.ts` — all 13 mapped URLs now resolve via `redirects()` with
  `statusCode: 301`; moved `/r-410a-vs-r-32` and `/pressure-diagnostic-tool` out of
  the 308 "internal shortcuts" block; added 4 new sources (typo, `/r410a-vs-r32`,
  `/r-134a-vs-r-1234yf`, `/refrigerant-prices`); repointed `/refrigerant` → hub.
  24 redirects total. Single source of truth (no middleware/vercel.json).
- `scripts/verify-redirects.ts` — added test cases for the new/changed mappings
  (41/41 pass).

**Step 3 (spec cross-check).** Cross-checked every redirect the migration spec
`docs/spec/03-SITEMAP_MIGRATION.md` prescribes against `next.config.ts` (+ both
`reports/serp-inventory*.csv`, which list only live 200 routes). Exactly one
spec-mapped redirect was missing with a clear existing target → **added**
`/refrigerant-prices` → `/refrigerant-prices-guide/` (spec `03:220-226`,
`02-AUDIT.md:429`). No unclear/ambiguous targets remain. (Out of scope, untouched:
`/refrigerant/r-1234ze-e/`, all `/hvac-*-guide/`.)

**Verification (production build, `next start -p 3100`).** Build exit 0, all gates
pass (`verify-redirects` 41/41). Curl results:
- **Trailing-slash form of every "from" URL → single `301` with `Location` = the
  target.** All 12 targets → `200`.
- **No-slash form → `308` (trailingSlash normalization adds `/`) then `301` → `200`
  (2 hops).** This is the app-wide behavior for every slash-less source; the
  canonical indexed form (trailing slash) is a clean single 301.
- `/refrigerant/r-1234yf` (no slash) → `308` → `/refrigerant/r-1234yf/` → `200`
  (the real refrigerant detail page; no conflict with the comparison redirect).
- Lint of changed files (`next.config.ts`, `scripts/verify-redirects.ts`): clean.

**Not pushed** (per instructions).
