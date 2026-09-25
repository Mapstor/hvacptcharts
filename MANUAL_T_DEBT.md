# ACCA Manual T sourcing debt

Surfaced during Wave 1.5 (2026-07-17). Sitewide search found **117 mentions**
of "ACCA Manual T"; a subset attribute the target-superheat formula
`TSH = ((3 × WB) − 80 − DB) / 2` to Manual T without verification against
ACCA's actual publication.

The Wave 1.5 provenance sections applied on
`/target-superheat-chart/`, `/r410a-superheat-chart/`, and
`/r22-superheat-chart/` cite HVAC School's recounted Carrier / Wayne
Pendergast account, which describes the formula as "likely reverse
engineered" from an empirical chart of **unrecorded origin**. That
account is inconsistent with the "codified in Manual T" language still
present in the untouched files listed below.

## Site-wide rule going forward

Cite **"ACCA Manual T" name-only, no subtitle, everywhere.** This
dissolves the subtitle collision (see below) without asserting a title
that has not been verified against ACCA's catalog.

Manual T is genuinely ACCA's air-distribution / commissioning guide, so
citations that reference Manual T for **air-distribution or system-
balancing content** are correct usage and stay untouched. Audit each
citation individually before softening.

## In-session fixes (already applied in Wave 1.5)

- `src/app/target-superheat-chart/page.tsx` — FAQ #1 rewrite, FAQ #4
  rewrite, footer entry softened to
  `ACCA technician charging references (name-only)`.
- `src/app/r410a-superheat-chart/page.tsx` — footer entry softened
  as above.
- `src/app/r22-superheat-chart/page.tsx` — footer restructure removed
  the pre-existing Manual T formula attribution.
- `src/app/high-suction-low-head-pressure/page.tsx` — footer entry
  softened.
- `src/app/r410a-charging-chart/page.tsx` — footer entry softened
  during P-A4 (this session).

## Follow-up work required (out of Wave 1.5 scope)

### Formula-attribution instances to be re-sourced or softened

Each of the following states or implies that ACCA Manual T contains the
`TSH = ((3 × WB) − 80 − DB) / 2` formula. If ACCA Manual T is verified
against ACCA's catalog to contain that formula, retain and cite it
verifiably. Otherwise soften to
`ACCA technician charging references (name-only)`.

- `src/app/superheat-calculator/page.tsx` — 8 attributions:
  - FAQ #1 body (line 28) — "ACCA Manual T, 2017"
  - FAQ #? body (line 48) — Total-SH vs Evaporator-SH claim referencing
    Manual T charging charts
  - line 79 — calculation-note reference
  - line 96 — calculation-note reference
  - line 110 — sources sentence
  - line 216 — TechSection title
  - line 218 — TechSection body
  - line 223 — Panel title
- `src/app/superheat-subcooling-fundamentals/page.tsx` — 2 attributions:
  - line 36 — charging-chart attribution
  - line 40 — Total-SH target attribution
- `src/app/carrier-410a-charging-chart/page.tsx:644` — cited as charging
  procedure reference.
- `src/app/calculators-hub/page.tsx` — 3 attributions:
  - line 22 — hub intro body
  - line 35 — recommendation reasoning
  - line 140 — hub sources block
- `src/components/calculators/SuperheatCalculator.tsx:157` — reference
  table cell attribution.

### Subtitle collision (fix per site-wide rule above)

Manual T is cited under two conflicting subtitles across the site — both
unverified against ACCA's actual catalog:

- `src/app/hvac-system-design-guide/page.tsx:582` — "ACCA Manual T
  System Balancing and Air Distribution"
- `src/app/hvac-load-calculation-guide/page.tsx:612` — same subtitle
- Historical: `src/app/target-superheat-chart/page.tsx` — previously
  used "Air Distribution Basics for Residential and Small Commercial
  Buildings" (softened this session)

Apply the name-only rule to both design-guide instances.

## Reason to fix (not silently propagate)

The Wave 1.5 provenance sections make an epistemic promise on
`/target-superheat-chart/` and the two per-fluid superheat charts:
the formula's precise origin is unrecorded, it survives on OEM /
technician charging references, and the trade's memory reaches only "to
the best of anyone's knowledge." Any file that still asserts the formula
is codified in Manual T contradicts the centerpiece narrative.

## Resolution (Task 6 PART 2, 2026-09-25)

Site-wide audit of all 42 remaining "Manual T" hits. ACCA Manual T is an
air-distribution / commissioning guide; every citation attaching it to a
charging / superheat / subcooling / pressure / fault-diagnosis claim was
**misattributed** and removed. Where another verified source was already on the
line (ASHRAE Handbook of Refrigeration, AHRI standards, "Manufacturer spec", OEM
service literature) it was kept; where Manual T was the sole citation the claim
was rephrased generically ("OEM fixed-orifice charging charts", "manufacturer
spec", "standard charging practice") — no new citation was substituted.

- **Removed — misattributed (33):** calculators-hub :159/:189/:205;
  hvac-troubleshooting-guide :75/:163/:563; pt-calculator :955;
  refrigerant-charge-calculator :467/:515; guides-hub :19/:191;
  system-pressure-diagnostic-calculator :37/:53/:79/:107/:514/:594;
  high-head-pressure-causes :251/:509; subcooling-calculator :47/:110/:806/:953;
  superheat-subcooling-fundamentals :285; overcharged-ac-symptoms :306;
  pt-superheat-subcooling-calculator :102/:606; SubcoolingCalculator.tsx :155;
  HubPage.tsx :280 (default sourcesNote); lib/mdx-what-pressure.ts :137 (comment);
  lib/retrofit.ts :9 (comment); content/refrigerants/r-410a.mdx (source def +
  3 `[accamanualT]` on 800-PSI-envelope claims); content/refrigerants/r-22.mdx
  (source def + 1 `[accamanualT]`); content/what-pressure/r134a.mdx :9.
- **Rephrased — number-dependent (4):** SuperheatCalculator.tsx :157 (8–25°F →
  "OEM fixed-orifice charging charts"), :160 (kept "Manufacturer spec");
  SubcoolingCalculator.tsx :152 (kept "Manufacturer spec");
  pt-superheat-subcooling-calculator :188 (10°F window → cited to ASHRAE Handbook
  of Refrigeration, which was already alongside).
- **Kept — genuine air-distribution / name-only (4):** llms-full.txt :73
  ("Manual T: Air distribution balancing + commissioning"); guides-hub :235
  (name-only, "authoritative industry publications"); guides-hub :257 (generic
  "cite the source shown on the page" example); lib/target-superheat.ts :21 (the
  disclaimer that the formula is NOT from Manual T).
- **Formula-attribution (0):** none remained (resolved in earlier waves).

Net: "Manual T" mentions 42 → 4 (all air-distribution / name-only).
