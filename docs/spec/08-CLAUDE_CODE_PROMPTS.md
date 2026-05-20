# CLAUDE_CODE_PROMPTS.md

The execution playbook. Sequenced, atomic prompts to feed Claude Code in order. Each prompt is self-contained: CC reads the relevant deliverable file(s), executes the task, commits, moves on.

Total: ~50 prompts across 8 phases. Most prompts take CC 1-5 minutes. Build time ~3 working days end-to-end, with manual review checkpoints.

## How to use this playbook

1. Open the project in your CC sandbox with `--dangerously-skip-permissions`.
2. Run prompts in order. Do not skip; ordering reflects dependencies.
3. After each phase, run the verification step. If it fails, fix before moving on.
4. The skill in `.claude/skills/hvacptcharts/SKILL.md` loads automatically — CC reads it on every relevant prompt and enforces the rules.
5. The 8 deliverable files (DATA_SCHEMA, AUDIT, SITEMAP_MIGRATION, CONTENT_BRIEF, SVG_INVENTORY, SCHEMA_INVENTORY, PROJECT_SKILL, this file) live in `docs/spec/` in the repo. CC references them by path.

## Phase 0 — Repository bootstrap (4 prompts)

### Prompt 0.1 — Init the Next.js project

> Create a new Next.js 15 project at `/Users/markovisic/projects/hvacptcharts/` using App Router, TypeScript, Tailwind, ESLint, and the `src/` directory structure. Skip the example pages. Use pnpm. Set up the standard portfolio config:
> - `next.config.js` with `trailingSlash: true`
> - `package.json` private, no telemetry
> - `tsconfig.json` with `@/*` path alias to `src/*`
> - Tailwind config with the design tokens documented in `docs/spec/05-SVG_INVENTORY.md` (color variables)
>
> Initialize git, create the initial commit. Don't deploy yet.

### Prompt 0.2 — Copy spec files into the repo

> Create `docs/spec/` and copy these 8 files into it:
> - 01-DATA_SCHEMA.md
> - 02-AUDIT.md
> - 03-SITEMAP_MIGRATION.md
> - 04-CONTENT_BRIEF.md
> - 05-SVG_INVENTORY.md
> - 06-SCHEMA_INVENTORY.md
> - 07-PROJECT_SKILL.md
> - 08-CLAUDE_CODE_PROMPTS.md
>
> Sources are in `/Users/markovisic/projects/hvacptcharts-spec/`. Commit.

### Prompt 0.3 — Install the project skill

> Create `.claude/skills/hvacptcharts/` and write `SKILL.md` exactly as specified in `docs/spec/07-PROJECT_SKILL.md`. Also create the `verify.ts` and `reference/coolprop-anchors.json` companion files from that same spec. Commit.

### Prompt 0.4 — Create CLAUDE.md at repo root

> Write a top-level `CLAUDE.md` that:
> - Names the project and links to the 8 spec docs
> - Lists the non-negotiable quality rules from `07-PROJECT_SKILL.md` in a 5-bullet TL;DR
> - Says: "Read the appropriate spec doc(s) before starting any task. Read the project skill at `.claude/skills/hvacptcharts/SKILL.md` and follow it."
> - Documents the working directories: `/data/`, `/scripts/`, `/src/data/`, `/src/components/svg/`, `/src/components/refrigerant/`, `/content/refrigerants/`, `/src/app/`.
> - Commands: `pnpm dev`, `pnpm build`, `pnpm run generate-data`, `pnpm run verify-data`.
>
> Commit.

**Manual checkpoint:** Verify `pnpm dev` runs and serves the default Next.js page. Verify the skill is loaded by CC (test prompt: "What's rule 3 in the hvacptcharts skill?").

## Phase 1 — Data layer (8 prompts, the most critical phase)

### Prompt 1.1 — Build the master config

> Read `docs/spec/01-DATA_SCHEMA.md`. Create `data/refrigerants.config.json` with one entry per refrigerant from the full list of 61 slugs (the full alphabetical list is in `docs/spec/03-SITEMAP_MIGRATION.md`).
>
> For each entry, populate every field from the spec. Use the CoolProp coverage matrix in `01-DATA_SCHEMA.md` to set the correct `strategy` (`coolprop`, `mix`, `custom`, or `manual`) and `cpIdentifier`. Use the verified examples for R-410A, R-22, R-448A as the template for full population.
>
> Where you don't have verified data for a field (e.g. atmospheric lifetime for a specific refrigerant), use `null` rather than guessing. We will fill these in later from sources.
>
> For `composition`: for blends, the mass fractions come from ASHRAE 34-2022 designation. For pures, empty array.
>
> For `tradeNames`: include only well-known commercial names. Don't invent.
>
> For `verifiedAgainst`: list at least 2 sources per refrigerant (CoolProp + at least one of: Arkema datasheet, Honeywell datasheet, Chemours datasheet, ASHRAE Handbook of Refrigeration 2022).
>
> Commit when complete. Do not run the generator yet.

This is a 30-60 minute task for CC. Output is one large JSON file.

### Prompt 1.2 — Install CoolProp and set up the generator script

> Install CoolProp via pip with `--break-system-packages`. Create `scripts/generate-refrigerant-data.py` exactly as specified in `docs/spec/01-DATA_SCHEMA.md`. Make it executable. Run it. Verify the output file `data/refrigerants.json` is created with ~49 fully populated refrigerants (manual ones will error/skip; that's expected).

### Prompt 1.3 — Create manual blend skeleton files

> For each of the 12 refrigerants marked `strategy: "manual"` in `data/refrigerants.config.json` (r-1150, r-1224yd-z, r-1233zd-z, r-1336mzz-z, r-427a, r-438a, r-448a, r-450a, r-503, r-514a, r-515a, r-515b), create a skeleton file at `data/manufacturer-blends/{slug}.json` with:
> - `ptChart: []` (empty)
> - `ptSource: "TODO: transcribe from {datasheet name}"` (datasheet name from `01-DATA_SCHEMA.md`)
> - `physical: { ...all fields, set to null where unknown }`
>
> Re-run the generator. The output should now include these 12 with empty PT charts. The 49 CoolProp ones should be fully populated. Build the loader and verify it parses.

### Prompt 1.4 — TypeScript loader and types

> Create `src/data/refrigerants.ts` exactly as specified in `docs/spec/01-DATA_SCHEMA.md`. Includes the Zod schema, types, the loader, the `getRefrigerant` and `getPressureAtTempF` helpers. Verify it parses `data/refrigerants.json` without errors. If Zod rejects any record, the bug is in `refrigerants.config.json` — fix the config, regenerate, retry.

### Prompt 1.5 — Sources registry

> Create `data/sources.json` with entries for at minimum: IPCC AR5 Table 8.A.1, IPCC AR6 WG1 Chapter 7, ASHRAE Standard 34-2022, EPA AIM Act, EPA Section 608, CoolProp 7.2.0, Honeywell Solstice N40 datasheet, Honeywell Solstice 515A datasheet, Honeywell Solstice N15 datasheet, Chemours Opteon XP10 datasheet, Chemours Opteon 1100 datasheet, Chemours Opteon 1150 datasheet, Arkema Forane 22 PT chart, Arkema Forane 410A PT chart, Arkema Forane 427A datasheet, Honeywell Genetron MO99 datasheet, AGC AMOLEA 1224yd datasheet, ACCA Manual S, ACCA Manual T, ASHRAE Handbook of Refrigeration 2022. Each with title, publisher, year, url (real, current), accessed date.
>
> Web-search for each datasheet to get the current canonical URL. Don't make up URLs.

### Prompt 1.6 — Build-time verifier

> Create `scripts/run-verify.ts` and a build hook as specified in `docs/spec/07-PROJECT_SKILL.md`. Add `"prebuild": "pnpm run verify-data"` to `package.json`. Run `pnpm run verify-data` — it should pass with the current dataset because the 10 anchor refrigerants are all CoolProp-generated and within tolerance.

### Prompt 1.7 — Data export endpoints

> Create `src/app/data/refrigerant/[slug].csv/route.ts` and `src/app/data/refrigerant/[slug].json/route.ts`. CSV emits the PT chart as a CSV with headers `tempF,tempC,bubblePsig,dewPsig,bubbleKpag,dewKpag`. JSON emits the full record. These are linked from the `Dataset` schema's `distribution` field. Test with `curl http://localhost:3000/data/refrigerant/r-410a.csv`.

### Prompt 1.8 — Phase 1 commit and review

> Run `pnpm build`. It should succeed and emit the 49 generated refrigerant data files + the routes. Run a smoke test: `node -e "const r = require('./data/refrigerants.json'); console.log(r.find(x => x.slug === 'r-410a').ptChart.find(p => p.tempF === 70))"` — should print bubble PSIG of ~201.5. Commit the entire phase. Push to GitHub.

**Manual checkpoint:** Marko verifies a few PT values against his own reference (e.g. compares R-410A PSIG at 70°F to a known Arkema chart). If anything is more than 2% off, debug before phase 2.

## Phase 2 — Core SVG components (5 prompts)

### Prompt 2.1 — Set up component scaffolding

> Create `src/components/svg/` and `src/components/refrigerant/`. Set up Storybook (or a `/dev/svg-gallery/` route for local visual testing). Define the shared types and CSS variables from `docs/spec/05-SVG_INVENTORY.md` in `src/lib/svg-tokens.ts` and `src/app/globals.css`.

### Prompt 2.2 — SafetyClassChip

> Read `docs/spec/05-SVG_INVENTORY.md` section 10. Build `src/components/svg/SafetyClassChip.tsx` exactly as specified. Both `chip` and `card` variants. All 8 safety classes. Add to the gallery route with one example of each class. Verify visual correctness.

### Prompt 2.3 — PTCurve

> Read `docs/spec/05-SVG_INVENTORY.md` section 1. Build `src/components/svg/PTCurve.tsx` per spec. Build `src/components/refrigerant/RefrigerantPTCurve.tsx` wrapper that takes a slug. Both bubble and dew curves with shaded glide region. Hover crosshair. Unit toggles. Mobile portrait orientation toggle. Add 3 examples to the gallery: R-22 (pure), R-410A (low glide), R-407C (high glide).

### Prompt 2.4 — GWPComparisonBar

> Read `docs/spec/05-SVG_INVENTORY.md` section 7. Build `src/components/svg/GWPComparisonBar.tsx`. Add the `comparisonGroup` field handling (refrigerants grouped by application). Add reference lines for EU F-Gas 150 and AIM Act 700. Gallery example: residential AC group (R-32, R-454B, R-452B, R-410A, R-407C).

### Prompt 2.5 — Phase 2 commit

> Commit the three foundational SVG components. Each renders in the gallery without errors.

## Phase 3 — Refrigerant detail page (7 prompts)

This is the highest-leverage page type. Get it right and 61 pages come for free.

### Prompt 3.1 — Page route and basic template

> Create `src/app/refrigerant/[slug]/page.tsx` and `src/app/refrigerant/[slug]/layout.tsx`. Implement `generateStaticParams` to pre-render all 61 refrigerants. Basic template structure per `docs/spec/04-CONTENT_BRIEF.md` section "Page template 1": hero with name, type chip, safety class chip; full PT chart (use the component from Phase 2); properties grid; MDX content slot; provenance footer. Test with `/refrigerant/r-410a/`.
>
> CRITICAL: zero refrigerant-specific prose in the template file. Per rule 2 of the skill.

### Prompt 3.2 — MDX content infrastructure

> Set up MDX in the Next.js app per the contentlayer or `@next/mdx` pattern. Create `content/refrigerants/` directory. The page template reads `content/refrigerants/{slug}.mdx`, parses the frontmatter for structured fields (narrative, faqs, retrofitGuidance), and renders both the structured fields and the MDX body.
>
> Create `content/refrigerants/r-410a.mdx` exactly as specified in `docs/spec/04-CONTENT_BRIEF.md`. Wire it up so `/refrigerant/r-410a/` renders the full page.

### Prompt 3.3 — Tier 1 MDX content (21 files)

> For each Tier 1 refrigerant (R-22, R-410A, R-134a, R-32, R-404A, R-407C, R-290, R-454B, R-1234yf, R-1234ze, R-448A, R-449A, R-450A, R-452A, R-452B, R-454C, R-513A, R-516A, R-744, R-717, R-600a, R-123), write the full MDX content per the template in `docs/spec/04-CONTENT_BRIEF.md`.
>
> For each, include:
> - `narrative.whatItIs` — 2-3 paragraphs, sourced.
> - `narrative.whereItsUsed` — 5-8 specific applications.
> - `narrative.phaseDownStatus` — if regulated.
> - `narrative.serviceNotes` — lubricant, common issues.
> - 6-8 FAQs, each with a sourced answer.
> - `retrofitGuidance` if it has a meaningful "replaces" target.
>
> Read the WordPress export `/Users/markovisic/projects/hvacptcharts-spec/hvacptcharts_WordPress_2026-05-20.xml` — 18 of these 21 refrigerants have correct WP post content stored there. Use as DRAFTING reference, but verify every claim against the data layer and a source. Rewrite in our voice. Do not copy-paste verbatim.
>
> Verify each rendered page passes the project skill's rules (no R-32/R-125 claim on non-R-410A pages, etc.).
>
> This is a large prompt — do it in batches of 3-4 refrigerants per CC session to avoid context drift. Commit after each batch.

### Prompt 3.4 — Tier 3 MDX content (40 files)

> For each Tier 3 refrigerant (everything not in the Tier 1 list above; ~40 refrigerants), write the lighter MDX content per the spec:
> - `narrative.whatItIs` — 1 paragraph.
> - `narrative.whereItsUsed` — 3-5 applications.
> - 3-4 FAQs.
>
> Do these in batches of 5-8 per session. Commit each batch. Verify rendered output.

### Prompt 3.5 — Schema emission

> Build `src/lib/schema/refrigerant.ts` per `docs/spec/06-SCHEMA_INVENTORY.md` page type 1. The function takes a Refrigerant record + FAQs and returns the schema graph. Build `src/components/seo/JsonLd.tsx` per the same spec. Add `<JsonLd>` to the refrigerant page template. Verify the emitted JSON parses through `https://validator.schema.org/` (run via local script or manual paste).

### Prompt 3.6 — Cycle and Phase-Down components

> Read `docs/spec/05-SVG_INVENTORY.md` sections 3 and 8. Build `CycleDiagram` and `PhaseDownTimeline`. Wire into Tier 1 refrigerant pages via wrapper components.

### Prompt 3.7 — Glide visualization

> Read `docs/spec/05-SVG_INVENTORY.md` section 6. Build `GlideVisualization`. Conditionally render on refrigerant pages where `r.physical.hasSignificantGlide === true`. Test on R-407C, R-454C, R-455A pages.

**Manual checkpoint:** Marko reviews 5 random refrigerant pages: R-410A, R-22, R-32, R-290, R-717. Verifies: PT data correct, safety class correct, composition correct, no R-32/R-125 template-swap copy. If any fail, debug before phase 4.

## Phase 4 — Calculator pages (6 prompts)

### Prompt 4.1 — PT Calculator

> Read `docs/spec/04-CONTENT_BRIEF.md` page template 4 and the PT Calculator subsection. Build `src/app/pt-calculator/page.tsx`. Client component for the form. Refrigerant selector defaults to R-410A. Live computed result via `getPressureAtTempF`. Unit toggles. Schema per `06-SCHEMA_INVENTORY.md` page type 2. Verify against the live site's URL.

### Prompt 4.2 — Superheat Calculator (HIGHEST PRIORITY)

> Build `src/app/superheat-calculator/page.tsx` per the spec. THIS IS THE HIGHEST-TRAFFIC PAGE; spend the most time on it.
>
> Inputs: refrigerant + suction PSIG + suction line °F. Output: superheat with diagnostic context.
>
> Math: superheat = measuredTempF − interpolatedSaturationTempAtSuctionPressure. The saturation temp comes from inverting the PT chart (search for the temp whose bubble PSIG matches the input). Linear interpolation between PT points.
>
> Include the target superheat reference table inline (fixed-orifice vs TXV vs refrigeration; cite ACCA Manual T).
>
> Include 6 FAQ items per spec. Schema as page type 2.

### Prompt 4.3 — Subcooling + combined

> Build `src/app/subcooling-calculator/page.tsx` and `src/app/pt-superheat-subcooling-calculator/page.tsx`. Same shape as superheat. Cross-link.

### Prompt 4.4 — Saturation Properties

> Build `src/app/saturation-properties-calculator/page.tsx`. Output: bubble P, dew P, liquid density, vapor density (where available), enthalpy of vaporization. These additional properties need to come from CoolProp — extend `scripts/generate-refrigerant-data.py` to compute them at build time for pure refrigerants and store in a new field. Update Zod schema accordingly. Regenerate data.

### Prompt 4.5 — Charge Calculator + Retrofit Compatibility + Diagnostic + Comparison Tool

> Build the remaining four calculators per spec. Refer to `docs/spec/02-AUDIT.md` for what each currently does wrong, and `04-CONTENT_BRIEF.md` for the rebuild target. Cite all formula sources.

### Prompt 4.6 — Port-as-is calculators

> Per Marko's scope decision: port `psychrometric-calculator`, `duct-size-calculator`, and `hvac-load-calculator` from the WordPress export. Wrap their existing logic in our new template chrome (hero, MDX intro, FAQ, schema, provenance footer). Do not audit or improve the underlying math; mark them with a banner "Calculator under review — verify results against equipment specifications." This is technical debt for a future phase.

## Phase 5 — Other content pages (6 prompts)

### Prompt 5.1 — What-pressure-should-X-be pages (6)

> Build the 6 pages per `docs/spec/04-CONTENT_BRIEF.md` page template 2. The current site's operating pressure ranges are approximately correct — verify against ACCA / EPA Section 608 / manufacturer literature, then port. Add the saturation-vs-operating distinction explicitly. Emit `HowTo` schema for the diagnostic cheatsheet per `06-SCHEMA_INVENTORY.md` page type 4.

### Prompt 5.2 — Comparison pages (3 of the 4 live ones)

> Build `r-32-vs-r-410a`, `r-32-vs-r-454b`, `r-410a-vs-r-454b` per page template 3. Build `PTCurveOverlay` SVG component per `05-SVG_INVENTORY.md` section 2. Write MDX content for each pair: the "choose X if..." section and retrofit guidance.
>
> Set up the 301 redirect from `/r-410a-vs-r-32/` to `/r-32-vs-r-410a/` in `next.config.js` per `03-SITEMAP_MIGRATION.md`.

### Prompt 5.3 — Long-form reference pages

> Build `/superheat-subcooling-fundamentals/`, `/pt-chart-guide/`, `/high-head-pressure-causes/`, `/refrigerant-comparison-guide/` per page template 7. Each gets `TechArticle` schema. Write the MDX content from scratch — use the WP export only as a topical reference, not as source text.

### Prompt 5.4 — Sortable reference pages

> Build `/refrigerant-safety-classifications/` and `/refrigerant-gwp-rankings/` per page template 8. Each is a sortable, filterable table of all 61 refrigerants. Both emit `Dataset` schema per the spec. The table rows link to the individual refrigerant pages. Mobile: collapse to cards.

### Prompt 5.5 — Carrier charging chart

> Build `/carrier-410a-charging-chart/` per page template 9. Cite Carrier as the source. The PHP file `page-carrier-410a-charging-chart.php` in the WordPress export has hand-typed values that look approximately correct — verify each against the current Carrier service manual. If any are off, fix to match the actual Carrier-published value.

### Prompt 5.6 — Prices guide

> Build `/refrigerant-prices-guide/` per the recommendation in `docs/spec/02-AUDIT.md`. Per Marko's decision: source from Refrigerant Depot or US Refrigerants published price sheets, cite explicitly with the publication date. Do not invent ranges. Editorial focuses on "why prices vary" (phase-down, season, reclaimed vs virgin) — the educational angle, not a buying recommendation. If a credible distributor price sheet cannot be sourced within reasonable effort, REMOVE the specific dollar ranges entirely and replace with qualitative guidance. Better to lose the page's traffic than ship false numbers.

## Phase 6 — Homepage and hubs (3 prompts)

### Prompt 6.1 — Homepage

> Build `/` per page template 5 in `docs/spec/04-CONTENT_BRIEF.md`. Hero with H1 + subhead + dual CTAs. Quick-access refrigerant cards with values COMPUTED from the data layer (no hardcoded numbers). Find-a-refrigerant filter UI. Featured calculator cards. One paragraph about the site and data provenance.
>
> Stats: only use real numbers. "61 refrigerants" (correct), "9 verified calculators" (correct after phase 4), "25+ technical guides" (correct counting hub pages + guides). Do not claim "100K+ Monthly Users" unless GSC confirms it.

### Prompt 6.2 — Hub pages

> Build `/calculators-hub/`, `/pt-charts-tools-hub/`, `/guides-hub/` per page template 6. Each is a card grid with a brief intro paragraph. Configure the 301 redirects from `/calculators/`, `/pt-charts-tools/`, `/guides/` per `03-SITEMAP_MIGRATION.md`.

### Prompt 6.3 — Site pages

> Build `/about-us/`, `/contact-us/`, `/privacy-policy/`, `/terms-of-service/` per page template 10. Real contact methods. Real privacy policy reflecting what the new site actually does (Vercel analytics if used; no AdSense yet since we deferred). Use Marko's standard portfolio template for legal pages, adjusted for this site.

## Phase 7 — HVAC guides port (2 prompts)

### Prompt 7.1 — Port 17 HVAC guides

> Per Marko's scope: port the 17 long-form HVAC guides from WordPress with minimal editorial change. For each:
> 1. Extract the content from the WP export.
> 2. Convert to MDX in `content/guides/{slug}.mdx`.
> 3. Render through page template 7 (TechArticle schema).
> 4. Verify any specific numerical claims (CFM ranges, COP values) — flag suspicious ones for Marko to review.
> 5. Update internal links to point to the new URL patterns.
> 6. Add provenance footer.
>
> Do not rewrite the editorial — port-and-port-only. Editorial improvements are phase 3.
>
> Do these in batches of 4 guides per session. Commit each batch.

### Prompt 7.2 — Cross-linking pass

> Walk every refrigerant page, calculator page, what-pressure page, and comparison page. Add contextually relevant internal links:
> - Refrigerant pages link to their relevant calculators (PT, superheat, subcooling) preselected to that refrigerant.
> - Refrigerant pages link to replaces / replaced-by refrigerants.
> - Calculator pages link to relevant refrigerant pages from the example.
> - Comparison pages link to individual refrigerant pages.
> - Long-form guides cross-link to relevant calculators and refrigerants.
>
> Result: every refrigerant page is reachable in ≤2 clicks from the homepage and ≤1 click from at least one other refrigerant page.

## Phase 8 — Build, verify, deploy (5 prompts + manual ops)

### Prompt 8.1 — Sitemap and robots

> Implement `src/app/sitemap.ts` and `src/app/robots.ts` exactly per `docs/spec/03-SITEMAP_MIGRATION.md`. Verify `pnpm build` generates a complete sitemap.xml with all ~135 URLs and the refrigerants showing real `lastModified` from the data layer.

### Prompt 8.2 — Schema validation pass

> Create `scripts/validate-schema.ts` that crawls the built site, extracts every `<script type="application/ld+json">`, and validates against the per-page-type requirements in `docs/spec/06-SCHEMA_INVENTORY.md`. Run it. Fix any failures.

### Prompt 8.3 — Visual QA pass

> Spin up the production build locally (`pnpm build && pnpm start`). Walk through these specific URLs and verify:
>
> - `/refrigerant/r-410a/` — PT at 70°F shows ~201 PSIG, safety class A1 chip, composition shows R-32 50% / R-125 50%.
> - `/refrigerant/r-22/` — PT at 70°F shows ~121 PSIG, safety class A1, composition empty (pure CHClF₂), lubricant says mineral oil compatible.
> - `/refrigerant/r-32/` — PT at 70°F shows ~189 PSIG, safety class A2L chip (not A1), composition empty.
> - `/refrigerant/r-290/` — PT at 70°F shows ~110 PSIG, safety class A3 (not A1), description identifies it as propane, lubricant says mineral oil.
> - `/refrigerant/r-717/` — PT at 70°F shows ~114 PSIG, safety class B2L (not A1), description identifies it as ammonia.
> - `/refrigerant/r-744/` — Critical point handling: chart cuts off near 88°F (critical), warning shown for transcritical operation.
> - `/superheat-calculator/` — Enter R-410A + 130 PSIG suction + 50°F line temp → result around 5°F superheat.
> - `/r-32-vs-r-410a/` — Both PT curves overlay, side-by-side properties.
> - `/refrigerant-gwp-rankings/` — Sortable, R-744 at top (GWP 1), R-23 near bottom (GWP ~14800).
>
> Document any issues. Fix.

### Prompt 8.4 — Deploy to Vercel staging

> Deploy to Vercel under a staging subdomain (e.g. `hvacptcharts-staging.vercel.app`). Verify production build matches local. Run a Screaming Frog crawl. Compare crawled URL list against the inventory in `docs/spec/03-SITEMAP_MIGRATION.md`. Every expected URL must return 200; every 301 must redirect correctly; no unexpected 404s.

### Prompt 8.5 — Pre-cutover checklist

Manual ops (not for CC). Walk through:

- [ ] Schema validates in Google Rich Results Test for at least 5 randomly-sampled pages.
- [ ] Mobile rendering looks correct on real device.
- [ ] Sitemap.xml URL matches what's submitted to Google Search Console (after cutover).
- [ ] DNS TTL dropped to 5 minutes at least 24 hours before planned cutover.
- [ ] Vercel project has the production domain `hvacptcharts.com` ready to attach.
- [ ] Old WordPress site is backed up (full export + database + uploads + theme).
- [ ] GSC property is migrated/added for the new site if it's a fresh property.
- [ ] Robots.txt allows Googlebot.

### Manual cutover

Not a CC task:

1. In your DNS provider: change A/AAAA records to point at Vercel's IPs (or CNAME for non-apex).
2. In Vercel: attach `hvacptcharts.com` as the production domain.
3. Verify with `dig` and `curl -I` that the new site is serving.
4. In Google Search Console: submit the new sitemap.xml at `https://hvacptcharts.com/sitemap.xml`.
5. Submit a fresh index request for the top 10 URLs.
6. Monitor GSC's "Coverage" report daily for the next 7 days, weekly for 30.

## Post-deploy monitoring

Watch for:

- **Ranking volatility.** Expect 2-6 weeks of fluctuation. The data underneath changed from wrong-by-5× to correct; Google's quality signals may take time to re-evaluate.
- **404 errors in GSC.** Should be minimal because every URL was preserved. Any 404s reported are bugs in the migration — fix immediately.
- **Crawl rate.** Should hold or increase. A drop suggests technical issues.
- **Click-through rate on top queries.** R-22, R-410A, R-134a, R-32. CTR should improve as the SERP snippets get richer from the new schema.
- **Average position.** Slow improvement expected on long-tail technical queries because the editorial is more substantive and the data is correct.

## What to expect in the first 30 days

Realistic projection:
- **Day 1-7:** Google re-crawls. Some pages drop from positions while it re-evaluates. Don't panic.
- **Day 7-14:** Schema markup gets indexed. Rich results may start appearing for FAQ-eligible queries.
- **Day 14-30:** Steady recovery. Long-tail technical queries should improve as the editorial quality is recognized.
- **Day 30+:** Whatever pattern emerges in days 14-30 continues. If still declining, audit individual pages and identify which ones are losing.

Honest expectation: a content-quality rebuild of this magnitude can take 60-90 days to fully recover ranking. The bet is that long-term the verified-data + rich-schema site outranks the current wrong-data site by a significant margin, because both Google's Helpful Content systems and LLM citation systems prefer it.

## Phase 9 — Phase 2 expansion (deferred)

Not in scope for v1 rebuild. Listed for tracking:

- **Pressure-at-temperature pages** (~120 pages) — 10 top refrigerants × 12 common temperatures. Each page has the saturation pressure at that specific temp + diagnostic context.
- **Manufacturer charging charts** (~5-10 pages) — Lennox, Trane, Goodman, Rheem, Daikin following the Carrier template.
- **Additional comparison pages** (~10 pages) — buyer-relevant pairs (R-22 vs R-407C retrofit, R-404A vs R-448A retrofit, R-134a vs R-1234yf, etc.). Templates already exist in the WP export; just need data + MDX.
- **HVAC guides editorial pass** — full rewrite of the 17 guides with proper sourcing and original analysis. Probably 3-4 weeks of focused work.
- **A real HVAC Load Calculator** — full Manual J implementation. Significant work.

Each of these is its own multi-day project. Open them as separate tickets after the v1 rebuild stabilizes for 30+ days.

## Final note

Quality is the priority. If at any point during execution you (CC or Marko) feel a corner is being cut — stop. The cost of shipping wrong data is higher than the cost of the rebuild taking another day. The previous site is the proof.

The spec is designed so that even if every single prompt above is executed mechanically by CC with zero creativity, the result is a site that beats the current one structurally on data quality, content quality, schema, and UX. Add creativity on top and it's competitive with the top of the SERP for every query the niche covers.
