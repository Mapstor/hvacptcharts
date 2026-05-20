# hvacptcharts.com — Rebuild Specification

Complete specification package for rebuilding hvacptcharts.com on Next.js 15 with verified data, no template-swap copy, full schema markup, and original editorial.

## Files (read in this order)

1. **`01-DATA_SCHEMA.md`** — TypeScript types, Zod validation, CoolProp generator script. The data layer. 49/61 refrigerants are auto-generated from CoolProp; 18 need manual entry from manufacturer datasheets.
2. **`02-AUDIT.md`** — exhaustive per-page error inventory of the legacy site. ~25,000 individual factual errors catalogued. Reference material for understanding what NOT to repeat.
3. **`03-SITEMAP_MIGRATION.md`** — every URL preserved. 301 redirect map for the dedupe cases (`/calculators/` → `/calculators-hub/`, etc.). Sitemap.ts and robots.ts code ready to drop in.
4. **`04-CONTENT_BRIEF.md`** — per-template editorial briefs for all 10 page types. Tier 1 (22 refrigerants, full editorial) vs Tier 3 (39 refrigerants, concise reference). Information architecture, schema requirements, MDX structure with R-410A worked example.
5. **`05-SVG_INVENTORY.md`** — 10 SVG React components with props, dimensions, accessibility requirements. PTCurve, CycleDiagram, PhDiagram, SystemLayout, GlideVisualization, GWPComparisonBar, PhaseDownTimeline, PressureGauge, SafetyClassChip, SaturationDome.
6. **`06-SCHEMA_INVENTORY.md`** — every JSON-LD schema by page type with example payloads. Article, BreadcrumbList, FAQPage, Dataset, DefinedTerm, SoftwareApplication, HowTo, TechArticle.
7. **`07-PROJECT_SKILL.md`** — the runtime enforcer. Drop the SKILL.md into `.claude/skills/hvacptcharts/SKILL.md` in your repo. Claude Code reads it on every relevant prompt and refuses to ship template-swap copy, fabricated PT values, or wrong safety classes.
8. **`08-CLAUDE_CODE_PROMPTS.md`** — the execution playbook. ~50 atomic prompts in 9 phases, in order. Paste into CC one at a time. Each is self-contained and references the spec files by path.

## Project parameters (locked in this spec)

- Stack: Next.js 15 App Router + TypeScript strict + Tailwind + MDX
- Deploy: Vercel
- Data: CoolProp 7.2.0 generator + manual entry for 18 unmodeled blends
- URL parity: every legacy URL preserved (no SEO regression)
- Quality bar: every quantitative claim cited, no fabricated data, no template-swap copy, no paragraphs over 3 sentences, no fake author personas
- Calculators: 12 ported as-is per Marko's scope decision
- Ad slots: deferred (no Raptive/AdSense integration in v1)
- Expert reviewer: none (provenance footers cite real sources, not fake personas)

## Realistic timeline

- Phase 0-1 (data layer): 1-2 days
- Phase 2 (components): 2-3 days
- Phase 3 (templates): 3-5 days
- Phase 4 (content): 7-14 days — bulk of the work, ~135 pages of original editorial
- Phase 5 (polish + deploy): 2-3 days

**Total: 2-4 weeks of focused work.**

## How to use

1. Read all 8 files end-to-end first. Get the full picture.
2. Set up the new Next.js repo per Phase 0 in file 08.
3. Copy spec files into `docs/spec/` in the repo. Copy project skill into `.claude/skills/hvacptcharts/SKILL.md`.
4. Open Claude Code in your Docker sandbox with `--dangerously-skip-permissions`.
5. Paste prompts from file 08, one at a time, in order.
6. At each phase gate, run the verification commands. Don't proceed with known issues.
7. Cutover DNS only after staging passes a full crawl audit.

## Quality bar reminder

This rebuild exists because the current site shipped with ~25,000 fabricated quantitative errors and safety-critical mis-classifications. The defenses in this spec — typed data layer, runtime Zod validation, project skill enforcement, build-time anchor checks — make those failure modes structurally impossible to repeat. Don't bypass them. Don't shortcut Phase 4 with templated editorial. The whole point is to ship a site that's accurate enough to be cited.

