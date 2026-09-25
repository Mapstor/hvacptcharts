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

## 2026-09-25 — Fix 3B/18: one target-superheat formula site-wide

**Helper** (`src/lib/target-superheat.ts`, new): `targetSuperheat(indoorWB, outdoorDB)
= round((3×WB − 80 − DB)/2)`, returns `null` (render "—") below 5°F. Build-time
assertion locks the spec check values (67/95→13, 65/95→10, 60/85→8, 55/75→5,
60/95→"—"). `TARGET_SUPERHEAT_LABEL` attributes it to the field approximation of
OEM fixed-orifice charts / California Title 24 RA3.2, Table RA3.2-2 — not Manual T.

**Wiring:** `ChargingChartMatrix.tsx` refactored to use the shared helper (whole-°F
cells) — so /target-superheat-chart/, /r410a-superheat-chart/, /r22-superheat-chart/,
/r410a-charging-chart/ all compute from it. On /superheat-calculator/ the hand-typed
"ACCA Manual T WB×DB matrix" (with fabricated cells like 65/105=17) was replaced with
`<ChargingChartMatrix>` + the label. Corrected typed anchors: 64/95 "8.5°F"→9°F;
64/105 "3.5°F"→"—"; worked-example "63/95 ≈17°F"→7°F (verdict re-checked: SH 15 > target
7 = undercharged, unchanged).

**Removed (step 3):** the AHRI-540 "minimum return-gas superheat" claim (20°F hermetic /
30°F semi-hermetic) everywhere — FAQs, table rows, feature lists, SVG bars, aria labels,
source lists (superheat-calculator, superheat-subcooling-fundamentals, system-pressure-
diagnostic, pt-superheat-subcooling, calculators-hub, guides-hub, HubPage default). And
"ACCA Manual T" as the source of charging/target-superheat tables on those pages →
reworded to the fixed-orifice field-approximation framing. (Manual-T citations that
source the SH×SC *diagnostic-pattern* matrix were left — out of 3B scope.)

**Verification:** build exit 0, all gates (targetSuperheat build assert passes → check
values guaranteed). Curl confirms Title-24 label + 9°F anchor render. Lint: 0 errors.
**Not pushed.**

---

## 2026-09-25 — Fix 3C/18: publish Carrier's actual Table 3 with citation

**Data** (`src/data/carrier-410a-chart.ts`, new): Carrier's published R-410A
fixed-orifice "Superheat Charging — AC Only" chart (Table 3) reproduced verbatim —
14 wet-bulb columns [50…76, incl. the printed 67] × 13 outdoor-temp rows [55…115],
null = "—" (do not charge), tolerance ±3°F. Build-time assert guards the shape +
anchor cells (95/67→10, 95/68→14, 50/55→9, 76/115→23, 50/65→"—"). Exports the full
citation (Carrier Catalog 24AAA-ACC-6SI 10/16 + Bryant II114CNA-CNC-03 09/15) and a
trademark notice. The 67°F column carries the "sits between 64 and 68; suggests 66"
footnote.

**Page + component** (`carrier-410a-charging-chart/page.tsx`, `CarrierChargingLookup.tsx`):
deleted both local (wrong/incomplete) chart copies; both now render from the shared
module. Static table shows the full Table 3; the interactive lookup + heatmap use
`carrierTargetSuperheat`. Worked examples recomputed from the table + dataset — the
flagship fix: 95°F OD / 67°F WB is **10°F** (68°F WB → 14°F), not the old "23.6 → 24°F".
Added an honest formula contrast: Carrier 10°F vs `targetSuperheat(67,95)`=13°F (3°F,
within ±3°F). Removed the unsourced Carrier-vs-Trane/Lennox/Goodman/Rheem comparison →
one sentence. Removed "ACCA Manual D", "AHRI Guideline K", "ACCA Manual T" citations;
kept AHRI 210/240 (correct rating condition). Added citation + trademark notice.

**Verification:** build exit 0, all gates (+ carrier-chart build assert). Curl confirms
95/67→10°F, citation + trademark + 67°F footnote render, brand comparison reduced to one
sentence, no "23.6"/"Manual D"/"Guideline K"/brand-table. Lint: 0 errors. **Not pushed.**

---

## 2026-09-25 — Fix 3D/18: calculators compute reference tables and worked examples from the dataset

**pt-calculator** (`src/app/pt-calculator/page.tsx`):
- "Saturation pressure quick reference" table now computed live via `satPressure()`
  over 11 fluids × [32,45,70,95,120]°F (bubble for pures, bubble/dew for blends,
  "transcritical" above critical). Corrects the wrong 95/120°F values (e.g. R-410A
  95°F 278→296, 120°F 380→419; R-32, R-134a, R-404A, R-407C, R-454C all corrected).
- "Operating pressure ranges" table rebuilt from the 3A method (residential dew38-45 /
  bubble amb+15..25; commercial dew evap±3 / bubble amb+15..30). Kept the 8 rows with a
  computed method (R-410A/R-32/R-454B/R-22/R-407C residential; R-404A/R-448A/R-454C
  commercial); **dropped and listed** R-744, R-290 heat pump, R-717, R-134a & R-513A
  chillers, R-1234yf mobile. Removes the "neg twenty evap" glitch.
- Worked example "5-8 percent / R-32 296 / R-410A 278" → computed `${satPressure}`
  (302.9 vs 296.4, ~2%). FAQ "5-8%" → "~2%".

**Worked examples (pt / superheat / subcooling calculators):** every saturation temp/
pressure now computed inline via `satTemp()`/`satPressure()` (dew for superheat, bubble
for subcooling), verdicts rechecked. Key fixes: R-410A 380 psig → 112.6°F so SC off a
100°F line = 12.6°F (was 11°F). Two superheat examples had physically-inverted hand-typed
saturations (R-407C bubble>dew; R-134a chiller sat 47°F > 45°F chilled water) → corrected,
**2 verdicts changed ok→warn**. pt-calc R-454C freezer had inverted cond bubble/dew →
fixed; R-744 LT "−50°F" (below the −40°F chart floor) → "out of range".

**Also fixed** a now-inconsistent factual claim on superheat-calculator: the bubble curve
*overstates* superheat by the glide (bubble temp < dew temp at a given pressure), not
"underestimates" — corrected the FAQ, the mistakes list, and two captions to match the
recomputed examples.

**Verification:** build exit 0, all gates. Grep: "5-8 percent", "neg twenty evap",
"approximately 278" all gone; no typed pressures remain in the pt-calc tables. Curl
confirms quick-ref 296/419, operating 114-130/367-419, 380→112.6 in both calculators,
R-32/R-410A ~2%. Lint: 0 errors. **Not pushed.**

---

## 2026-09-25 — Fix 4A/18: remove 12 off-topic guides (410); redirect 2 to their calculators

**Removed 12** (off-topic, low-traffic, error-prone). Each `src/app/<slug>/page.tsx`
deleted and replaced by `src/app/<slug>/route.ts` — `dynamic="force-dynamic"`, `GET`
returns **410 Gone** with `X-Robots-Tag: noindex` and a tiny HTML body linking to
`/pt-charts-tools-hub/`, `/calculators-hub/`, `/`:
energy-efficiency, commissioning, maintenance-service, indoor-air-quality,
mechanical-ventilation, system-design, controls-automation, safety-procedures,
tools-equipment, retrofitting-upgrades, energy-management, building-automation.

**Redirected 2** (duplicate a calculator): deleted their page.tsx and added 301s in
`next.config.ts` — `/hvac-load-calculation-guide/ → /hvac-load-calculator/`,
`/hvac-duct-design-guide/ → /duct-size-calculator/` (+ two cases in
`verify-redirects.ts`, now 43/43). No 410 handler needed (the redirect fires first).

**Fixed the load calculator** before sending it traffic: `hvac-load-calculator/page.tsx:256`
had `title="…{r2(EX1.cooling.tons)}…"` inside a *quoted* JSX attribute, so the
placeholders rendered as literal text. Converted to a template-literal expression
(`title={\`…${r2(...)}…\`}`). Grep of the built HTML for `{r0(`/`{r1(`/`{r2(`/`{r3(`:
**no other hits** (all other occurrences were legitimate JSX/`${}` expressions).

**Removed all references to the 14 URLs:** `sitemap.ts` (14 entries + 2 commented stubs),
`llms.txt/route.ts`, `feed.xml/route.ts`, `guides-hub/page.tsx` (dropped the emptied
"Sizing & design" section + 6 economics items; the ItemList JSON-LD auto-derives, so its
count updates automatically; reworded the "14 guides" prose → the 3 remaining guides), and
the cross-links in the kept `hvac-ductless-mini-split-guide` (6 links to removed guides →
retargeted to live calculators / removed). No components were used only by the removed
guides (all shared). Comprehensive grep of src/content/data: **zero** references to the 14
slugs remain (only the 2 redirect sources in next.config + verify-redirects). Kept
untouched: troubleshooting, refrigerant-recovery, ductless-mini-split (4B handles them).

**Verification (curl):** 12 removed → `/slug/` 410 (headers show `X-Robots-Tag: noindex`),
`/slug` 308→410; 2 redirected → single 301→200; built-HTML has no href to any of the 14;
sitemap.xml has none of the 14 and keeps the 3 guides. Build exit 0, all gates. **Not pushed.**

---

## 2026-09-25 — Fix 4B/18: noindex thin refrigerant pages; Google-only noindex on 3 guides

**Indexing flag** added to the refrigerant data layer: `indexable` (Zod
`z.boolean().default(true)`) + optional `noindexReason` in `src/data/refrigerants.ts`,
mirrored into `data/refrigerants.config.json`, `data/refrigerants.json`, and both
generators (`.mjs`/`.py`). When `indexable:false`: `generateMetadata` emits
`robots {index:false, follow:true}` (added a `robots` passthrough to
`shared.ts:pageMetadata`); the slug is filtered out of `sitemap.ts` and the homepage
ItemList JSON-LD; the page stays live and linkable. verify-metadata + validate-schema
still pass.

**Set indexable:false (11 refrigerants):**
- r-1150, r-c318, r-365mfc — `noindexReason`: content errors + a template that doesn't
  fit the fluid (to be rebuilt). (These have full ptCharts; the noindex is editorial.)
- 8 with `noindexReason: "pt-data-missing"` (no real PT table — for research). Missing
  source data per slug:
  - **r-1224yd-z** — AGC AMOLEA 1224yd datasheet / Akasaka & Lemmon (2023) Helmholtz EOS; not in the CoolProp 7.2.0 WASM build.
  - **r-1233zd-z** — no commercial PT chart exists (cis-isomer, research-grade only; commercial R-1233zd is the (E)-isomer).
  - **r-1336mzz-z** — Tanaka et al. (2020) Helmholtz EOS / Chemours Opteon 1100; not in the WASM build.
  - **r-450a** — Chemours Opteon XP10 datasheet; R450A.mix / R134a&R1234ze(E) mixture syntax unsupported by the WASM build.
  - **r-503** — retired (Montreal Protocol; CFC-13 component); archived pre-2010 ASHRAE Handbook only.
  - **r-514a** — Chemours Opteon XP30 datasheet; components R-1336mzz(Z)/R-1130(E) absent from the WASM pure-fluid library.
  - **r-515a** — Honeywell Solstice 515A datasheet; R1234ze(E)&R227ea mixture syntax unsupported.
  - **r-515b** — Honeywell Solstice N15 datasheet; mixture syntax unsupported.
  (Excluded: r-438a and r-448a — they DO render real datasheet-native ptTable data.)

**3 guides Google-noindexed** (Bing keeps them; rewrite pending): recovery, troubleshooting,
ductless-mini-split → `robots {index:true, follow:true, googleBot:{index:false, follow:true}}`.
Kept in the sitemap.

**Recovery-guide corrections:** dropped the "~$44,539/day" figure → "civil penalties per
day per violation, current inflation-adjusted maximum in 40 CFR 19.4 (under Clean Air Act
§ 113)"; fixed the § 82.166-as-penalty mislabel (it's recordkeeping); deleted the AHRI
Standard 770 citation; replaced "49 CFR 173.193"/"§ 173.34" with "DOT hazardous-materials
rules, 49 CFR Parts 171–180"; "2024 AIM Act Section 60 rules" → "the EPA 2024 rule under
AIM Act subsection (h) (40 CFR Part 84, Subpart C)"; deleted the unsourced "$50,000–$1.5M+"
settlement range; added the Section 608 A2L/A3 exam note (question bank valid only through
Jan 1 2027, no new Type IV; cite ACHR News 2026-09-19).

**Removed all 25C/25D/IRA/HEEHRA/rebate content** from the ductless-mini-split guide (whole
IRA section deleted + H1/meta/FAQ/schema/keywords/sources; sections renumbered 01-13);
troubleshooting + recovery had none.

**Verification (curl):** 3 guides HTTP 200 with `<meta name="googlebot" content="noindex,
follow">` while `robots` stays `index, follow`; the 11 refrigerant pages HTTP 200 with
`<meta name="robots" content="noindex, follow">` (r-410a control stays index); sitemap.xml
excludes all 11 refrigerant slugs and keeps the 3 guides; built HTML of the 3 guides has no
25C/IRA/HEEHRA. Build exit 0, all gates. Lint: 0 errors. **Not pushed.**

---

## 2026-09-25 — Fix 5A/18: honest content dates from git history, not build-time git/mtime [no-date]

**Problem:** sitemap/JSON-LD dates came from `getFileGitDates()` (git log at build) or
`dataSource.ptChartGeneratedAt` (a generation timestamp). Vercel builds from a shallow
clone (`--depth=10`), so after a ~14-commit batch most pages would claim they changed today.

**New dating pipeline (build never calls git or reads mtimes):**
- `scripts/update-content-dates.mjs` computes `data/content-dates.json` (133 routes,
  `{updated, published}`) from FULL local git history. `updated` = latest commit that
  changed the route's own content (page.tsx / MDX / that slug's data record); `[no-date]`
  commits skipped; per-slug JSON dated by diff-scanning each slug's object across commits,
  ignoring `ptChartGeneratedAt`. `--touch /route/` bumps one route.
- `src/lib/content-dates.tsx` — `contentDates(route)`, `longDate(iso)`, `<UpdatedLine>`.
- `sitemap.ts` lastmod + every JSON-LD `dateModified`/`datePublished` (refrigerant,
  what-pressure, comparison, calculator, hub schema builders) now read content-dates.
- **Deleted `src/lib/git-dates.ts`**; no page/sitemap/schema calls git or fs.mtime.
- `scripts/verify-content-dates.ts` (new build gate, after verify-metadata): fails if a
  rendered route (walked from `.next/server/app/**/*.html`, excluding Next internals/dev)
  has no entry, a date is unparsable/future, or published > updated. → 133/133, 0 failures.

**Visible line:** `Updated <Month D, YYYY>` (en-US) under the H1 of refrigerant,
what-pressure, comparison, guide/chart/diagnostic, calculator and hub pages. Omitted on
the homepage and legal/about/contact. No "Reviewed by" line.

**Dating method for per-slug JSON records:** for each refrigerant slug, a commit counts
only if that slug's object in `refrigerants.config.json`/`refrigerants.json` changed with
`dataSource.ptChartGeneratedAt` stripped (so a bare regen never bumps a page). Shared
templates were reflected only where the same commit also touched the route's own
file/MDX/record — which is how every Task 3–4 visible change landed — so no unrelated
shared-lib commit bumps a page.

**45 routes dated 2026-09-25** (from Task 3–4 commits): the 8 computed what-pressure pages
+ their step-8 refrigerant detail pages, the calculators/charts/hubs changed in 3B–3D
(cfc5f4e, 9c0da23, b7bc5d8, 2d7089d), the 3 kept guides + hvac-load-calculator (4A 8ee47c2),
and the 11 noindexed refrigerants + homepage ItemList (4B e393ca3, structural). All other
routes keep their real earlier dates (e.g. comparison pages 2026-07-13; min date 2026-05-20).

**Docs:** CLAUDE.md + AGENTS.md now require updating a page's date in the same commit as a
visible-content change, and `[no-date]` on mechanical commits.

**Verified:** build exit 0, all gates incl. verify-content-dates (133/133). Curl: Updated
line renders per page (r-32-vs-r-410a honestly shows July 13, 2026; homepage none); sitemap
lastmod + JSON-LD dateModified match content-dates. **Not pushed.**

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
