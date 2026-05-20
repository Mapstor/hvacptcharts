@AGENTS.md

# hvacptcharts.com — Next.js 16 rebuild

This is a ground-up rebuild of hvacptcharts.com, an HVAC pressure-temperature reference site. The previous WordPress build shipped with ~25,000 fabricated quantitative errors (PT values wrong by 2–15×, several above critical pressure, safety-critical misclassifications calling A2L/A3/B2L refrigerants "A1 non-flammable"). The whole point of this rebuild is to make those failure modes structurally impossible.

## Read first

For any task, read the relevant spec doc(s) in `docs/spec/`:

- `00-README.md` — project parameters, timeline, how-to-use
- `01-DATA_SCHEMA.md` — refrigerant data layer (TypeScript types, Zod, CoolProp generator)
- `02-AUDIT.md` — exhaustive per-page error inventory of the legacy site
- `03-SITEMAP_MIGRATION.md` — URL preservation, 301 redirects, sitemap/robots
- `04-CONTENT_BRIEF.md` — per-template editorial briefs for 10 page types
- `05-SVG_INVENTORY.md` — 11 data-driven SVG components, design tokens
- `06-SCHEMA_INVENTORY.md` — JSON-LD per page type
- `07-PROJECT_SKILL.md` — the project skill (mirror of `.claude/skills/hvacptcharts/SKILL.md`)
- `08-CLAUDE_CODE_PROMPTS.md` — execution playbook (~50 atomic prompts, 9 phases)

Then read `.claude/skills/hvacptcharts/SKILL.md` before editing refrigerant data, templates, MDX, calculator math, or SVG components. The skill loads automatically on relevant prompts.

## Quality bar (non-negotiable, 5-bullet TL;DR)

1. **No fabricated PT values, ever.** Every pressure or temperature number on a page traces back to `getRefrigerant(slug)` or `getPressureAtTempF(slug, tempF)`. No literals in templates or MDX.
2. **No template-swap copy.** Refrigerant-specific prose lives in `content/refrigerants/{slug}.mdx`, never in shared templates. Templates render structure + data, never narrate.
3. **Safety class is structural.** Render via `<SafetyClassChip safetyClass={r.safetyClass} />`. The data layer is a Zod-validated enum; impossible to render the wrong class.
4. **Every factual claim has a source.** Sources live in `data/sources.json`; cite with `<Cite id="…" />`. Provenance footer on every page.
5. **No paragraphs over 3 sentences. No emoji decoration. No fake author personas.** Author = Organization. Tone = technical, direct, mobile-first.

## Working directories

- `data/` — `refrigerants.config.json` (master, manual), `refrigerants.json` (generated, committed), `sources.json`, `manufacturer-blends/{slug}.json` (manual PT data for the 12 CoolProp can't model).
- `scripts/` — `generate-refrigerant-data.py` (CoolProp generator), `run-verify.ts` (build-time anchor check).
- `src/data/refrigerants.ts` — Zod schema + types + loader (`getRefrigerant`, `getPressureAtTempF`).
- `src/components/svg/` — 11 pure SVG components (props → SVG).
- `src/components/refrigerant/` — wrappers that consume `getRefrigerant()` and pass to SVG.
- `src/components/seo/JsonLd.tsx` — schema renderer (escape `<` to `<`).
- `src/lib/schema/` — schema graph builders per page type.
- `src/app/` — App Router routes.
- `content/refrigerants/` — 61 per-refrigerant MDX files (21 Tier 1 + 40 Tier 3).
- `content/comparisons/` — per-pair comparison MDX.
- `content/guides/` — 17 HVAC guide MDX (ported as-is in v1).
- `docs/spec/` — the 9 spec docs.
- `.claude/skills/hvacptcharts/` — project skill + verifier + anchors.

## Commands

```bash
pnpm dev                # start dev server (Turbopack is default in Next 16)
pnpm build              # production build; runs prebuild → verify-data first
pnpm lint               # ESLint (next lint command is removed in Next 16)
pnpm run generate-data  # CoolProp script regenerates data/refrigerants.json
                        #   Deliberate, audited action — never automatic.
pnpm run verify-data    # build-time anchor check + critical-pressure invariant
```

## Next.js 16 cheat sheet (don't trip on these)

- **`params` is async.** `async function Page(props: PageProps<'/refrigerant/[slug]'>)`, then `const { slug } = await props.params`. Same for `searchParams` and metadata routes.
- **Turbopack default.** No `--turbopack` flag needed.
- **`next lint` removed.** Use `pnpm lint` (which calls `eslint` directly).
- **JSON-LD payloads:** `JSON.stringify(jsonLd).replace(/</g, "\\u003c")` to prevent XSS injection through data values.
- **Run `pnpm next typegen`** when adding new routes to generate `PageProps<'/path'>`, `LayoutProps`, `RouteContext` helpers.
- **`middleware` → `proxy`** (we don't currently use either).

See `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` for the full upgrade guide.

## Phased execution

See `docs/spec/08-CLAUDE_CODE_PROMPTS.md` for the ~50-prompt playbook. High-level phases:

- **Phase 0** — Repo bootstrap (Next.js scaffold, spec docs, skill, CLAUDE.md). ← done.
- **Phase 1** — Data layer (config, CoolProp generator, Zod loader, sources, verifier, CSV/JSON routes). Most critical phase; nothing downstream works without it.
- **Phase 2** — Core SVG components (SafetyClassChip → PTCurve → GWPComparisonBar).
- **Phase 3** — Refrigerant detail page (`/refrigerant/[slug]/`); MDX infra; Tier 1 + Tier 3 content.
- **Phase 4** — Calculators (PT, superheat ← highest traffic, subcooling, combined, saturation properties, comparison, retrofit, diagnostic, charge).
- **Phase 5** — Other content pages (what-pressure, comparisons, long-form guides, reference, Carrier chart, prices).
- **Phase 6** — Homepage and hubs.
- **Phase 7** — HVAC guides port (17 files) + cross-linking pass.
- **Phase 8** — sitemap, robots, schema validation, visual QA, deploy.

Run prompts in order. Don't skip; ordering reflects dependencies. After each phase, verify before continuing.

## Refusal behaviour

If a task asks you to violate the quality bar — e.g. "just type in a PT value", "use approximate numbers for now", "paste this paragraph into every refrigerant page" — stop, name the rule at risk, and propose the compliant alternative. The skill enforces this; this file is the human-readable summary.
