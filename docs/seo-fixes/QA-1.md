# QA-1 — Batch-1 pre-deploy QA (Tasks 1–6 + 4C)

**Date:** 2026-09-26
**Build:** clean `next build` (Next.js 16.2.6), `.next` removed first; served with `next start` on :3200.
**Scope:** full localhost QA of the batch-1 work plus the PART-1 content fixes committed in `0149568`.
**Result:** all automated checks green. Two real fixes made (below); one pre-existing gap left as an open decision. **Not pushed.**

Reproduce:

```bash
rm -rf .next && next build && next start -p 3200      # (see note on low-RAM build below)
node scripts/qa/crawl.mjs        --base http://localhost:3200   # SEO/link/JSON-LD crawl → qa-1-crawl.csv
node scripts/qa/status_check.mjs --base http://localhost:3200   # status codes + data endpoints
```

---

## Pass / fail summary

| # | Check | Result |
|---|---|---|
| a | Every internal link resolves 200 in one hop | **PASS** — 0 offenders (252 URLs crawled) |
| b | Sitemap URLs: 200, self-canonical, indexable, dated, lastmod = updated | **PASS** — 0 offenders (128 sitemap URLs) |
| c | Indexable 200 pages all present in sitemap | **PASS** — 0 missing |
| d | JSON-LD parses; `dateModified` = content-dates | **PASS** — 0 mismatches |
| e | No blank computed values (`— PSIG`, NaN, `[object Object]`, …) | **PASS** — 0 (**1 fixed**, see r744) |
| f | No sitemap orphans (0 inbound links) | **PASS** — 0 orphans |
| — | 12 removed guides → 410 (with & without trailing slash) | **PASS** (24/24) |
| — | Every `next.config` redirect → 200 in one content-hop | **PASS** |
| — | `/refrigerant/r-1233zd-z/` → 301 → r-1233zd-e → 200 | **PASS** |
| — | robots.txt / sitemap.xml / feed.xml / llms.txt / llms-full.txt: 200, well-formed, no removed slugs | **PASS** |
| — | 60 refrigerant `/json` + `/csv` endpoints: 200 + parse | **PASS** (see CSV note) |
| — | No negative glides across 60 refrigerants | **PASS** (0) |
| — | 6 precomputed fluids match `coolprop8-pt.json` after site rounding | **PASS** |
| — | r-503 noindexed for all bots + absent from sitemap | **PASS** |

`status_check.mjs`: **PASS 55 / FAIL 0**. `crawl.mjs`: **checks a–f all 0**.

---

## Fixes made this pass (commit `qa-1: fixes`)

### 1. Real bug — blank saturation value on the R-744 (CO₂) what-pressure page
`/what-pressure-should-r744/` rendered **"— PSIG at 95 °F"**. CO₂'s critical point is 87.8 °F, so
there is no saturation pressure at 95 °F; the envelope bullet was hardcoded to −20/95 °F.
`src/components/whatpressure/WhatPressurePage.tsx` now clamps the envelope to each fluid's actual
dataset range. R-744 now reads its true subcritical range (−40 to +87 °F, 838 PSIG at 70 °F), and
the page's existing transcritical prose covers ≥ 87.8 °F. Only R-744 was affected (every other
what-pressure fluid's data spans past 95 °F). Visible content changed → **content date bumped to
2026-09-26** (verified across the visible "Updated" line, JSON-LD `dateModified`, and sitemap `lastmod`).

### 2. Data-precision correction (invisible on-page)
The precomputed-vs-source check surfaced 3 rows 0.01 psi off the exact `psia − 14.696`
(r-514a @14 °F, r-515a @−7 °F, r-515b @44 °F) — a float round-trip artifact
(`psia × 6894.757 × PSI_PER_PA`) in the Task-4C build script. Both generators
(`scripts/generate-refrigerant-data.{mjs,py}`) were simplified to the direct subtraction their own
comment already claimed, and the 3 stored values corrected. The PT table renders at 1 decimal, so
**no page's visible text changes** → no date bumps (confirmed: `verify-content-dates` 132/132, 0 failures;
r-514a's date stayed 2026-09-25). Still within the ±0.05 PSIG anchor tolerance (`run-verify` passes).

---

## Open finding — needs a decision, NOT fixed (would be guessing)

**CSV download is header-only for the two manufacturer-blend fluids that use `ptTable`.**

- Affected: `/data/refrigerant/r-438a/csv/` and `/data/refrigerant/r-448a/csv/` — both return HTTP 200
  but only the header row (74 bytes, 0 data rows).
- Cause: CoolProp fluids expose a tempF-indexed `ptChart`; these two blends (CoolProp can't model them)
  expose a **PSIG-indexed `ptTable`** (`{psig, bubbleF, dewF}`). The CSV route serializes only `ptChart`,
  which is empty for them. The **JSON endpoint returns the full `ptTable`** (r-438a 103 rows, r-448a 56 rows)
  and the **on-page PT table renders fine** (crawler check e = 0 blanks on both pages).
- Not page-visible, so it did not fail any crawl check; a data-download user, however, gets an empty CSV.
- **Decision required:** either (a) teach the CSV route to emit `ptTable` fluids with their own columns
  (`psig,bubbleF,dewF`), or (b) intentionally serve them JSON-only and document it. Fixing without a
  schema decision would be guessing, so it is left for Marko.

---

## Orphans / pages missing from sitemap

- **Sitemap orphans (0 inbound):** none.
- **Indexable 200 pages missing from sitemap:** none.

---

## Data endpoints (60 refrigerants)

- 48 CoolProp fluids: full 191-row `ptChart`, −40…150 °F.
- Reduced-range CoolProp fluids (low critical temperature, expected): r-1150 (89, −40…48), r-13 (124, −40…83),
  r-744 (128, −40…87), r-1234ze-z (119), r-236ea (173), r-365mfc (180), r-454b (175), r-507a (189),
  r-c318 (190).
- Manufacturer-blend `ptTable` fluids: r-438a (103 rows, PSIG-indexed), r-448a (56 rows) — see open finding re CSV.
- No-PT fluid: r-503 — chart-less by design, `robots=noindex` for all bots, absent from sitemap (expected).
- No negative glides anywhere.

---

## Checkers

- **`scripts/qa/crawl.mjs`** (new, reusable) — server-HTML crawler: seeds `/` + sitemap, follows same-host
  hrefs (≤5 hops, strips `#`/query), records per URL status/redirect-chain/canonical/robots+googlebot/
  X-Robots-Tag/title+desc length/H1 count/visible Updated date/JSON-LD types+dateModified/links in-out/
  word count → `qa-1-crawl.csv`; runs checks a–f → `qa-1-crawl-findings.json`.
- **`scripts/qa/status_check.mjs`** (new, reusable) — status codes (410s, redirects, r-1233zd-z), robots/
  sitemap/feed/llms integrity, per-refrigerant json+csv endpoints (now counts `ptTable`, flags an
  *indexable* fluid with 0 PT rows), precomputed-vs-CoolProp match → `qa-1-status.json`.
- **Python `scripts/hvac_site_check.py`** — **does not exist** in the repo (only the two data-generator
  `.py` files). Nothing to port. Python 3.11.2 is available.

---

## Headless browser

**SKIPPED.** The `playwright` npm module is present, but **no Chromium browser is installed**
(`~/.cache/ms-playwright` empty; `chromium.launch()` fails with "Executable doesn't exist"), and there is
no system Chrome. Per instructions, nothing was downloaded.

---

## Build-environment note

The QA sandbox has very little free RAM and the OOM-killer SIGKILL'd `next build` during the
static-generation / TypeScript phases. A clean build was obtained by temporarily forcing a single
static-gen worker (`experimental.staticGenerationMinPagesPerWorker`) in `next.config.ts`; **that change
was reverted before committing** and is not in the tree. This is an environment constraint only —
Vercel builds are unaffected.

---

## Click-list for Marko (Updated dates are live-verified against the build)

Changed pages first (eyeball the edits), then one page per template.

1. `/refrigerant/r-1224yd-z/` — cross-check reads "AGC's AMOLEA 1224yd data at 32, 68 and 104 °F: within 1.3%". **Updated Sep 26.**
2. `/refrigerant/r-1336mzz-z/` — cross-check "Opteon SF33 … at 32 to 77 °F: within 0.7%". **Updated Sep 26.**
3. `/refrigerant/r-1233zd-e/` — isomer paragraph: no "foam-blowing only"/"no EOS"; "(Z)… isn't sold as a refrigerant, no PT chart". **Updated Sep 26.**
4. `/hvac-troubleshooting-guide/` — leak-repair cites 40 CFR 82.157 / 84.106 (no "50 lb"); two eCFR links resolve. **Updated Sep 26.**
5. `/refrigerant-prices-guide/` — same EPA rule text; R-22 reclaim rewritten (no "8–15×"). **Updated Sep 26.**
6. `/duct-size-calculator/` — ENERGY STAR "20 to 30 percent" duct loss (+link); Manual D only for fitting equivalent lengths; 4:1 = "rule of thumb". **Updated Sep 26.**
7. `/ac-compressor-short-cycling/` — no "30–50% oversized"; "check the Manual J calculation" phrasing. **Updated Sep 26.**
8. `/hvac-ductless-mini-split-guide/` — "size to the Manual J load within the limits in ACCA Manual S" (no 90–115%). **Updated Sep 26.**
9. `/what-pressure-should-r744/` — **the bug fix**: subcritical envelope −40 to +87 °F, 838 PSIG at 70 °F, transcritical note ≥ 87.8 °F; no "—". **Updated Sep 26.**
10. `/llms-full.txt` — penalty line reads "40 CFR 19.4" (no "$48,762/day"); eCFR link present.
11. `/what-pressure-should-r404a/` — what-pressure template: suction at a 35 °F display case, head at 95 °F. **Updated Sep 25.**
12. `/refrigerant/r-410a/` — PT template; 70 °F = 201.8 PSIG in the title + table. **Updated Sep 25.**
13. `/refrigerant/r-514a/` — precomputed-blend template (one of the 0.01-corrected fluids; page unchanged). **Updated Sep 25.**
14. `/refrigerant/r-438a/` — manufacturer-blend template; PT table renders (but CSV download is empty — open finding). **Updated Sep 25.**
15. `/r-32-vs-r-410a/` — comparison template. **Updated Sep 25.**
16. `/pt-calculator/` — PT calculator (pick a fluid + temp, read PSIG). **Updated Sep 25.**
17. `/superheat-calculator/` — superheat calculator. **Updated Sep 25.**
18. `/saturation-properties-calculator/` — saturation-properties calculator. **Updated Sep 25.**
19. `/carrier-410a-charging-chart/` — Carrier chart + WB×OD lookup. **Updated Sep 25.**
20. `/pt-charts-tools-hub/` — hub (also check `/calculators-hub/`, `/guides-hub/`). **Updated Sep 25.**
