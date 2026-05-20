# AUDIT.md

Exhaustive inventory of errors in the current live hvacptcharts.com WordPress build. This is reference material: when Claude Code rebuilds a page, it cross-references this audit to know what the old version got wrong, so the same errors don't propagate.

Organized by page. File paths are relative to the child theme. Line numbers are from the version uploaded 2026-05-20.

## Severity classification

- **CRITICAL** — Wrong fact that could cause equipment damage, professional liability, or constitutes false trust signal. Must be fixed in rebuild.
- **HIGH** — Wrong fact users will notice. Damages credibility.
- **MEDIUM** — Inconsistency, dead link, schema gap. Hurts UX or SEO.
- **LOW** — Style, tone, formatting.

## Site-wide critical issues

### CRITICAL: All PT chart data is fabricated

**Files:** `r-*-styled-content.php` × 80+ files, plus `pt-functions.php`, plus `page-r22-vs-r410a.php` lines 32-44, plus `page-r410a-vs-r32.php`, plus every other comparison page that defines `$rXXXa_pt_data = array(...)`.

**Scope:** Every PT array on the site, across all storage locations.

**Evidence:** Spot-checked 28 refrigerants against authoritative sources (Arkema datasheets, Honeywell datasheets, EPA Section 608 training, NIST WebBook via CoolProp). Every value is wrong. Ratios range from 0.31× to 15.40× actual, with no consistent transformation — these are AI-fabricated, not algorithmically derived from any real dataset.

Sample of confirmed errors at 70°F (saturation pressure, PSIG):

| Refrigerant | Actual (CoolProp + manufacturer) | Site claims | Ratio |
|---|---|---|---|
| R-22 | 121.4 | 758.8 | 6.25× wrong |
| R-410A | 201.5 | 1054.0 | 5.23× wrong |
| R-134a | 71.1 | 442.8 | 6.23× wrong |
| R-32 | 188.5 | 1041.1 | 5.52× wrong |
| R-404A | 165.3 | 845.7 | 5.12× wrong |
| R-407C | 119.9 | 665.0 | 5.55× wrong |
| R-1234yf | 70.6 | 448.9 | 6.36× wrong |
| R-516a | 45.0 | 655.4 | 14.56× wrong |
| R-1336mzz-z | 11.0 | 169.4 | 15.40× wrong |
| R-13 | 423.0 | 130.2 | 0.31× wrong (low) |
| R-744 | 836.0 | 1529.8 | 1.83× wrong |
| R-717 | 114.0 | 505.2 | 4.43× wrong |

**Physical impossibility check:** Several site values exceed the refrigerant's critical pressure. R-22's critical pressure is ~709 PSIG; the site claims 758.8 at 70°F. R-410A's critical is ~696 PSIG; the site claims 1054 at 70°F. A saturated liquid-vapor system cannot exist above critical pressure. The numbers are not just wrong — they are physically impossible.

**Action in rebuild:** All PT data regenerated from CoolProp + manufacturer datasheets per `DATA_SCHEMA.md`. The 80+ PHP files are deleted; one TypeScript-typed JSON file replaces them.

### CRITICAL: kPa conversion is wrong by definition

**Files:** Every `r-*-styled-content.php`, line ~50 in each:

```php
$r410a_pt_celsius[$c] = round($r410a_pt_fahrenheit[$f_int] * 6.895);
```

This multiplies the (already wrong) PSI value by 6.895 — the PSI→kPa conversion factor. That is a unit conversion, not a temperature-to-pressure lookup. A PT chart in metric requires computing saturation pressure at each °C separately; you can't compute "what's the pressure at 25°C" by converting "what's the pressure at 77°F."

**Effect:** The metric PT tables are doubly wrong: wrong base value × wrong logic. Users in metric markets get garbage.

**Action in rebuild:** Replaced. CoolProp computes pressure for °C values directly. Both °F/PSIG and °C/kPaG come from independent thermodynamic calculations, not unit conversions of each other.

### CRITICAL: Template-swap copy on every refrigerant page

**File:** `single-refrigerant.php` lines 437-650+ (verified at line 442 and following).

**Evidence:**

```php
// Line 442:
<p><?php echo esc_html( $refrigerant_type ); ?> represents a significant advancement
   in refrigerant technology, designed to replace the ozone-depleting R-22 while
   maintaining superior performance characteristics. This near-azeotropic mixture
   combines the best properties of two HFC refrigerants to create a highly
   efficient cooling medium.</p>

// Line 446:
<li><strong>R-32 (Difluoromethane)</strong> - 50% by weight: Provides excellent
    thermodynamic properties and lower molecular weight</li>
<li><strong>R-125 (Pentafluoroethane)</strong> - 50% by weight: Contributes to
    system stability and non-flammability</li>
```

Only the refrigerant's name is templated. The body is R-410A-specific copy. Every refrigerant page on the site tells the reader that refrigerant is a 50/50 blend of R-32 and R-125. Examples of how this renders:

- **R-22 page** says R-22 is a 50/50 blend of R-32 and R-125. (R-22 is pure chlorodifluoromethane, CHClF₂.)
- **R-290 page** says propane is a 50/50 blend of R-32 and R-125. (R-290 is pure propane, C₃H₈.)
- **R-717 page** says ammonia is a 50/50 blend of R-32 and R-125. (R-717 is pure NH₃.)
- **R-744 page** says CO₂ is a 50/50 blend of R-32 and R-125. (R-744 is pure CO₂.)
- **R-1234yf page** says R-1234yf is a 50/50 blend of R-32 and R-125 designed to replace itself.

Same pattern repeats for "operates at 50-60% higher pressures than R-22" (lines 480), the troubleshooting block (lines 532-565), the lubricant block, the regulatory timeline.

**Action in rebuild:** This entire block — lines 437-650 of `single-refrigerant.php` — is replaced with per-refrigerant MDX content. There is zero hardcoded refrigerant-specific copy in the page template. Per-refrigerant editorial lives in `content/refrigerants/{slug}.mdx`. The template only renders structure (cards, tables, sections), filled by the data layer and the MDX content.

### CRITICAL: R-410A specifications shown with wrong units

**File:** `r-410a-styled-content.php`, sidebar block (verified on rendered page).

- "Critical Temp: 71.3°F" — should be °C (160.3°F).
- "Critical Pressure: 4901 PSI" — should be kPa (711 PSIA / 696 PSIG).
- "Boiling Point: -51.6°F" — should be °C (-60.9°F).

**Effect:** A technician reading the page sees a critical pressure of 4901 PSI and the PT table showing 3,331 PSI at 150°F. They reasonably conclude the chart is "below critical." In reality the actual critical pressure is ~696 PSIG, and the chart's values (also wrong) supposedly exceed critical by 5×. Multiple wrongs creating a wrong impression.

**Action:** Property values stored with explicit unit fields in the data schema (`tempC`, `tempF`, `pressurePsig`, `pressureKpaA`, etc.). Display labels match the field name. Impossible to mismatch.

### CRITICAL: Refrigerant prices are unsourced

**File:** `refrigerant-prices-guide.php`

The price table (R-410A $4-8/lb, R-22 $50-150/lb, etc.) is presented as "current market" with "Last Updated: May 2026" but has no source. Trend arrows ("↑ Rising", "→ Stable") are not attributed to any tracking. Some refrigerants listed (R-422B, R-427A, R-438A, R-1234yf) don't appear in the navigation, suggesting these were generated by the same LLM that fabricated the PT data.

**Effect:** Page positions itself as authoritative for a high-intent commercial query ("R-22 price 2026"). Wrong or fabricated numbers in a buying context create both legal/reputation risk and Helpful Content suppression risk.

**Action options for rebuild:**

A. Source from a real distributor's published price sheet (Refrigerant Depot, US Refrigerants, Reliable Distributors) with attribution and date. Lower-effort.

B. Pull from a real-time API (none exists publicly for refrigerants — would require a scraping setup).

C. Remove the specific dollar ranges entirely. Keep the editorial about why prices vary (phase-down, season, supply chain, reclaimed vs virgin). Lose the high-intent traffic but eliminate the risk.

D. Build a community-sourced price comparison (require user submissions, moderate, display as ranges). Long-term play.

Recommended: A for v1, with a transparent disclosure ("Prices sourced from [distributor name] published price sheet, updated [date]. Actual prices vary by region and quantity."). Stay defensible.

## Page-by-page audit

### `/` — Homepage (`front-page.php`)

**File:** `front-page.php`, 780 lines.

| Severity | Issue | Lines |
|---|---|---|
| LOW | "100K+ Monthly Users" stat — verify against actual analytics; if untrue, remove. Real number from GSC is ~13k impressions / 70 clicks per 90 days. | search "100K+" |
| LOW | "25+ Professional Calculators" — site has 12 calculators. Either count or remove. | search "25+" |
| LOW | "50+ Refrigerant PT Charts" — site has 61. Could say "60+" if you want round; or "61." | search "50+" |
| LOW | "30+ Technical Guides" — site has 17 guides + several explainer pages = ~25 total. Reasonable. | search "30+" |
| MEDIUM | Hero card values (R-410A 201.5/332.2, R-22 121.4/195.9, etc.) are **correct** because they were hand-typed (lines 434-518). These can stay or be replaced by computed values from the data source. Recommended: replace with `getPressureAtTempF(slug, 70)` calls so they stay in sync with the dataset. | 425-530 |
| MEDIUM | Internal links go to `/calculators/`, `/guides/`, `/pt-charts-tools/` but the nav links go to `/calculators-hub/`, `/guides-hub/`, `/pt-charts-tools-hub/`. Pick one canonical pattern. | search "href=" |
| HIGH | Footer "© 2026 HVAC PT Charts" — verify domain. Owner is solo so this is fine as long as the dates auto-update. | footer.php |
| LOW | No JSON-LD structured data anywhere. Homepage should emit `Organization` + `WebSite` schema with `SearchAction`. | none |

### `/refrigerant/{slug}/` — All 61 refrigerant pages

**Files:** `single-refrigerant.php` (template), `r-*-styled-content.php` (data + per-refrigerant styling).

All 61 pages share these structural issues. Detailed in CRITICAL section above. Here's what each renders that's specifically wrong:

#### `/refrigerant/r-410a/`

| Severity | Issue | Location |
|---|---|---|
| CRITICAL | PT chart °F/PSI table — every value wrong. 70°F shows 1054 PSI; actual 201.5. 100°F shows 1731 PSI; actual 317. | `r-410a-styled-content.php` lines 7-46 |
| CRITICAL | PT chart °C/kPa table — derived by multiplying wrong PSI by 6.895. Doubly wrong. | `r-410a-styled-content.php` lines 49-58 |
| CRITICAL | "Sidebar Quick Reference: Critical Temp: 71.3°F" — should be 71.3°C / 160.3°F. | rendered sidebar |
| CRITICAL | "Critical Pressure: 4901 PSI" — should be 4901 kPa = 711 psia. | rendered sidebar |
| CRITICAL | "Boiling Point: -51.6°F" — should be -51.6°C / -60.9°F. | rendered sidebar |
| HIGH | "GWP of 2088" — IPCC AR5 value. AR6 lists 2256. Both are defensible if cited; site cites neither. | post content |
| HIGH | "<0.1°C" glide claimed in one paragraph, "Less than 0.3°F" in another. Real value is ~0.27°F (~0.15°C). Pick one. | post content + line 448 single-refrigerant.php |
| HIGH | Phase-down timeline appears twice with different values: "2024: 40%, 2029: 70%, 2036: 85%" and "2024: 40%, 2029: 70%, 2034: 80%, 2036: 85%". The latter (with 2034) is closer to the actual AIM Act schedule. | post content |
| HIGH | "Lower Flammability Limit: None" — sloppy phrasing. A1-class refrigerants don't have an LFL because they're non-flammable per ASHRAE 34; better wording: "Non-flammable per ASHRAE 34 (A1)". | sidebar |
| HIGH | "EPA Section 608: Mandatory certification for all technicians" — true but incomplete. Type II covers high-pressure (which R-410A is); Universal covers all. Worth being specific. | post content |
| MEDIUM | "Quick Pressure Lookups" links to `/refrigerant/r-410a/pressure-at-70-degrees/` etc. — all 404. | `r-410a-styled-content.php` lines 552-580 |
| MEDIUM | Three different H-level structures stacked: H1 "R-410A Pressure Temperature Chart" from template, H2 "R-410A Refrigerant Complete Reference" from styled content, then H2 "What is R-410A Refrigerant?" from WP post content. | `single-refrigerant.php` lines 76 + styled content + the_content() |
| MEDIUM | No JSON-LD anywhere. Could carry FAQ, HowTo (charging procedures), Article. | none |
| LOW | Cycle diagram SVG (lines 397-431) hardcoded "High Pressure 400-500 PSI / Low Pressure 120-150 PSI". This is approximately correct for R-410A but should come from the data layer. | `single-refrigerant.php` 424-429 |

#### `/refrigerant/r-22/`

| Severity | Issue | Location |
|---|---|---|
| CRITICAL | PT chart wrong by 6×. 70°F shows 758.8 PSI; actual 121.4. | `r-22-styled-content.php` lines 7-39 |
| CRITICAL | "Understanding R-22 in Detail" section says R-22 is a 50/50 blend of R-32 and R-125. R-22 is pure CHClF₂. Source: template-swap from `single-refrigerant.php` line 442+. | rendered page |
| CRITICAL | Same section says R-22 was "designed to replace the ozone-depleting R-22 while maintaining superior performance characteristics" — designed to replace itself. | template line 442 |
| CRITICAL | "GWP of 2088" — that's R-410A's GWP. R-22's GWP is 1810 (AR5). | template-swap |
| CRITICAL | "Operates at approximately 50-60% higher pressures than R-22" — sentence compares R-22 to itself. | template-swap |
| CRITICAL | "Lubricant: POE required" — R-22 uses **mineral oil** or alkylbenzene, NOT POE. POE is for HFCs only. Using POE in an R-22 system would not be technically wrong (POE is more hygroscopic but works), but recommending it over mineral oil is wrong industry practice. This contradicts the hero card on the same page which correctly says "Mineral Oil: Compatible with traditional mineral oils." | template-swap |
| HIGH | Hero card (lines 313-360 of styled content) has CORRECT values: CHClF₂, GWP 1810, ODP 0.055, boiling -40.8°C, critical 96.1°C, A1. So the page contradicts itself. | styled content vs template |
| HIGH | Replacement options list "R-421A, R-422B, R-438A" — R-422B is not a common R-22 retrofit (R-422A and R-422D are). | styled content |
| MEDIUM | "Quick Pressure Lookups" links all 404. | styled content |

#### `/refrigerant/r-32/`

| Severity | Issue | Location |
|---|---|---|
| CRITICAL | PT chart wrong by 5.5×. 70°F shows 1041 PSI; actual 188.5 PSIG. (Note: the homepage hero card shows 188.5 correctly, so the page contradicts its own homepage.) | `r-32-styled-content.php` |
| CRITICAL | Template-swap copy says R-32 is a 50/50 blend of R-32 and R-125 (recursive). R-32 is pure difluoromethane (CH₂F₂). | template |
| CRITICAL | Says R-32 "non-flammable" — R-32 is **A2L (mildly flammable)**. Must be corrected; calling A2L "non-flammable" is dangerous for installers. | template-swap |
| HIGH | GWP shown as 2088. R-32's GWP is 675 (AR5). | template-swap |
| HIGH | Lubricant: should be POE. Page (via template-swap) says "POE required" which is correct by accident. | template-swap |

#### `/refrigerant/r-290/` (propane)

| Severity | Issue | Location |
|---|---|---|
| CRITICAL | Template-swap says propane is a 50/50 blend of R-32 and R-125. R-290 is pure propane (C₃H₈). | template |
| CRITICAL | Template-swap says A1 / non-flammable. R-290 is **A3 (highly flammable)**. This is a safety-critical error. | template-swap |
| CRITICAL | Template-swap says POE required. Propane uses mineral oil. | template-swap |
| CRITICAL | PT chart wrong. 70°F shows 365 PSI; actual 110 PSIG. | styled content |
| HIGH | GWP shown as 2088. R-290's GWP is 3 (AR5). | template-swap |

#### `/refrigerant/r-717/` (ammonia)

| Severity | Issue | Location |
|---|---|---|
| CRITICAL | Template-swap says ammonia is a 50/50 blend of R-32 and R-125. R-717 is pure NH₃. | template |
| CRITICAL | Template-swap says A1 / non-toxic. R-717 is **B2L (toxic, mildly flammable)**. This is a major safety-critical error — ammonia is the only B-class refrigerant on the site. | template-swap |
| CRITICAL | Template-swap says POE required. Ammonia systems use mineral oil or PAO. | template-swap |
| CRITICAL | PT chart wrong. 70°F shows 505 PSI; actual 114 PSIG. | styled content |

#### `/refrigerant/r-744/` (CO₂)

| Severity | Issue | Location |
|---|---|---|
| CRITICAL | Template-swap says CO₂ is a 50/50 blend of R-32 and R-125. R-744 is pure CO₂. | template |
| CRITICAL | CO₂ refrigeration systems often operate **transcritically** (above critical point); a normal PT chart only covers the subcritical region. Page makes no mention of this. | none |
| CRITICAL | PT chart wrong. 70°F shows 1530 PSI; actual 836 PSIG (CO₂ has uniquely high saturation pressure — the only refrigerant on the site that's high enough to challenge typical residential equipment ratings). Critical point of CO₂ is 88°F at 1056 PSIG. So above 88°F there's no saturation state and the table should stop. | styled content |

#### Remaining 56 refrigerants

All 56 share the same template-swap copy (50/50 R-32/R-125 blend claim, replacement timeline claims, lubricant claim, safety classification claim, comparison-to-R-22 claim) and all have PT data wrong by 2-15×. Detailed individual audits are redundant; the rebuild template addresses them structurally:

- Template has zero hardcoded refrigerant-specific copy.
- Per-refrigerant MDX file provides correct narrative (composition, applications, lubricants, retrofit guidance).
- All numbers come from the data layer.
- Safety classification (A1/A2/A2L/A3/B1/B2L/B3) read from data field and rendered prominently.
- Composition rendered from data field (empty array for pures, component list for blends).

### `/calculators-hub/` and `/calculators/` (duplicate hubs)

**Files:** `page-calculators.php`, hub template.

| Severity | Issue |
|---|---|
| MEDIUM | Two URLs serve essentially the same content. Header nav points to `/calculators-hub/`; footer points to `/calculators/`. Canonical risk. |
| MEDIUM | Hub is just a card grid with no original content. Could become a more useful index with a one-line description of when to use each calculator. |

### `/pt-charts-tools-hub/` and `/pt-charts-tools/` (duplicate hubs)

Same issue as calculators-hub. Same fix.

### `/guides-hub/` and `/guides/` (duplicate hubs)

Same issue.

### `/pt-calculator/`

**File:** Page content stored in WP post (`pt-calculator` page, 46059 chars of inline HTML).

| Severity | Issue |
|---|---|
| CRITICAL | The calculator on this page uses the same wrong PT data (loaded from the styled-content PHP files). Reading a temperature returns the wrong pressure. |
| MEDIUM | No JSON-LD `SoftwareApplication` or `Calculator` schema. |
| MEDIUM | UX: form layout could be tighter. Refrigerant selector should default to most-used (R-410A). |

**Action:** Rebuild from data source. Calculator JS reads `getPressureAtTempF(slug, tempF)` — same source as the static tables.

### `/superheat-calculator/` (top-traffic page: 18 clicks / 718 imp last 90d)

**File:** `superheat-calculator.php`, 29625 chars.

| Severity | Issue |
|---|---|
| CRITICAL | Same wrong PT lookup table — superheat = actual − saturated. With wrong saturated values, the calculator's superheat output is wrong by the same factor. A technician acting on the result charges the system wrong. |
| MEDIUM | No schema. |
| MEDIUM | Could benefit from a "target superheat by application" reference table inline (fixed-orifice 8-12°F, TXV 10-15°F, etc. — these need cross-checking against ACCA / manufacturer specs). |
| LOW | Form is functional but feels like a 2010 web app. |

This is your highest-clicking page. **Prioritize the rebuild here.** Real impact.

### `/subcooling-calculator/`

Same shape as superheat. Same fix.

### `/pt-superheat-subcooling-calculator/`

Combines both. Same shape.

### `/refrigerant-pt-comparison-tool/`

**File:** `refrigerant-pt-comparison-tool.php` (39240 chars in WP post + template) and `page-refrigerant-pt-comparison-tool.php`.

| Severity | Issue |
|---|---|
| CRITICAL | Compares wrong PT data against other wrong PT data. The relationship between refrigerants is roughly preserved (since they're all wrong by similar ratios for the major HFCs) but absolute values are useless. |
| HIGH | UX: a real comparison tool should overlay PT curves on a single chart. Current implementation may or may not — need to check rendered output. |

### `/refrigerant-retrofit-compatibility-calculator/`

**File:** `refrigerant-retrofit-compatibility-calculator.php` (36099 chars).

| Severity | Issue |
|---|---|
| HIGH | Compatibility logic must encode: lubricant compatibility (mineral oil systems can't take HFCs without conversion), pressure ratings (R-410A → R-22 retrofit fails because system can't handle the lower pressures? No, that's backward — R-22 → R-410A retrofit fails because system can't handle the higher pressures), application class (low-temp, medium-temp, high-temp). Need to verify the current logic is correct. |
| HIGH | Doesn't cover the new A2L retrofits (R-410A → R-454B for instance) which are now top-of-mind for installers. |

### `/saturation-properties-calculator/`

**File:** WP post (45126 chars).

| Severity | Issue |
|---|---|
| CRITICAL | Uses wrong PT data. |
| HIGH | "Saturation properties" should include enthalpy of vaporization, specific heat, density — properties CoolProp can give us for the pures. Current page may be limited to pressure/temperature only; check. |

### `/system-pressure-diagnostic-calculator/`

**File:** WP post (22630 chars).

| Severity | Issue |
|---|---|
| CRITICAL | Diagnostic flags depend on PT values; with wrong PT they flag wrong conditions. |

### `/refrigerant-charge-calculator/`

**File:** `refrigerant-charge-calculator.php` (13079 chars in template).

| Severity | Issue |
|---|---|
| HIGH | Charge calculation depends on line set length, density of refrigerant in lines (depends on temperature, depends on PT). Verify each step. |

### `/duct-size-calculator/`, `/psychrometric-calculator/`, `/hvac-load-calculator/`

Not PT-dependent. Per your decision: leave as-is for v1. Audit later as a separate scope.

### `/refrigerant-prices-guide/`

Covered in site-wide CRITICAL section.

### `/refrigerant-comparison-guide/`

**File:** `refrigerant-comparison-guide.php`, 47678 chars.

| Severity | Issue |
|---|---|
| HIGH | If it contains hardcoded PT comparisons (probable based on file size), they're wrong. |
| MEDIUM | A "comparison guide" is now better served by the interactive comparison tool. This page might be reframed as the "how to choose a refrigerant" decision guide instead. |

### `/refrigerant-safety-classifications/`

**File:** WP post (21041 chars).

| Severity | Issue |
|---|---|
| MEDIUM | Need to verify the ASHRAE 34 classification descriptions are current (2022 standard). A2L was added later than A2; B2L similarly. |
| MEDIUM | High-value page for "is X flammable" queries — should include a sortable/filterable table of every refrigerant on the site by safety class. |

### `/refrigerant-gwp-rankings/`

**File:** `gwp-rankings-guide.php`, 47850 chars + `gwp-rankings-guide-clean.php` (24481 — a backup).

| Severity | Issue |
|---|---|
| HIGH | If GWP values come from the same hallucinated source as the PT data, they're wrong. Spot-check needed. |
| HIGH | Need to specify AR5 vs AR6 — EPA still uses AR5 for the AIM Act, but newer regulations and ASHRAE may use AR6. |
| MEDIUM | Page is high-intent. Worth a careful rebuild as a sortable, filterable, source-cited ranking. |

### `/superheat-subcooling-fundamentals/`

**File:** `superheat-subcooling-fundamentals.php`, 35547 chars.

| Severity | Issue |
|---|---|
| LOW | Educational content. Lower data-error risk. Re-audit for clarity, add interactive examples. |

### `/pt-chart-guide/`

**File:** `pt-chart-guide-enhanced.php` (52217), `pt-chart-guide-clean.php` (16950 — backup).

| Severity | Issue |
|---|---|
| MEDIUM | If it shows example PT values, they're wrong. |
| MEDIUM | Worth a clean rewrite — the topic is core to the site's mission. |

### `/high-head-pressure-causes/`

**File:** `page-high-head-pressure-causes.php`, 85485 chars (the largest single page on the site).

| Severity | Issue |
|---|---|
| HIGH | Likely uses specific PSI values to describe normal/abnormal pressures. Each needs to be verified. |
| LOW | High click potential ("high head pressure ac" is a strong intent query). Worth rebuilding well. |

### `/carrier-410a-charging-chart/`

**File:** `page-carrier-410a-charging-chart.php`, 24452 chars.

| Severity | Issue |
|---|---|
| MEDIUM | The table (lines 125-140) shows hand-entered Carrier charging values that look approximately correct (270-290 PSI discharge at 70°F for R-410A is plausible). Verify against Carrier's published documents. |
| MEDIUM | Should be branded clearly as "Carrier-published values" with link to Carrier source. |

### Comparison pages: `/r-32-vs-r-410a/`, `/r-32-vs-r-454b/`, `/r-410a-vs-r-32/`, `/r-410a-vs-r-454b/`

**Files:** `page-refrigerant-comparison.php` (82940 chars), `page-r32-vs-r454b.php`, `page-r410a-vs-r32.php`, `page-r410a-vs-r454b.php`.

| Severity | Issue |
|---|---|
| CRITICAL | Each contains a duplicated `$rXXXa_pt_data = array(...)` definition with same wrong values. (Verified at `page-r22-vs-r410a.php` line 32 and 44.) Any "fix" of the styled-content files would miss these unless they share the same data source. |
| HIGH | Charts overlay the wrong data against itself. Visually, the relationship between R-32 and R-410A curves is preserved (both wrong by similar ratios) but absolute values are wrong. |
| MEDIUM | Some comparison page templates exist but have no published page assigned (e.g. `page-r22-vs-r410a.php`, `page-r22-vs-r32.php`, `page-r22-vs-r134a.php`, `page-r134a-vs-r1234yf.php`, `page-r404a-vs-r448a.php`, `page-r407c-vs-r410a.php`, `page-r410a-vs-r454b.php`, `page-r454b-vs-r32.php`). These represent "almost-published pSEO comparison expansions" — useful to know what was planned but the current set of just 4 live comparison pages is fine for v1. |

### "What pressure should X be" pages (6 total)

**Files:** `page-what-pressure-should-410a-be.php` (31139), `page-what-pressure-should-r22-be.php` (37511), `page-what-pressure-should-r32-be.php` (48365), `page-what-pressure-should-r134a-be.php` (46694), `page-what-pressure-should-r404a-be.php` (45515), `page-what-pressure-should-r454b-be.php` (46531).

| Severity | Issue |
|---|---|
| MEDIUM | Operating pressure values shown here are **largely correct** (R-22 low side 58-70 PSI, high side 200-250 PSI at 95°F ambient — these are plausible field ranges). Different storage location from the PT chart data → different (better) accuracy. So the site has correct ranges in one place and wrong saturation values in another, with no cross-reference. |
| MEDIUM | Could be unified: these pages talk about operating pressures (which depend on system, ambient, load) while PT chart pages talk about saturation (which is a thermodynamic property). The pages need to clearly distinguish these two concepts; currently they may blur. |

### 17 HVAC guides

**Files:** `hvac-*-guide.php` × 17, each 24-44KB.

| Severity | Issue |
|---|---|
| MEDIUM-HIGH | Each guide is a long-form article. Quality varies. Several were clearly generated by an LLM in a single pass (judging by formatting consistency across them). Quality audit needed per-guide. |
| MEDIUM | Many include specific numerical claims (CFM ranges for ductwork, COP values, kWh figures) that need verification. |
| LOW | Could benefit from interactive elements (calculators inline, decision trees, checklists). |

These are out of immediate scope but listed for awareness. Each is its own mini-project.

## Schema and SEO gaps (whole site)

| Severity | Issue |
|---|---|
| HIGH | No JSON-LD anywhere. No FAQ schema, no HowTo schema, no Article schema, no Dataset schema (PT charts are perfect candidates for Dataset). |
| HIGH | No `og:image` per page — social shares show blank previews. |
| HIGH | No `lastmod` in sitemap.xml. |
| MEDIUM | Canonical URLs sometimes mismatch the actual URL (e.g. `/refrigerant-prices/` has `canonical: /refrigerant-prices-guide/`). |
| MEDIUM | `meta robots` allows indexing but page may be thin (the "create" hooks in `functions.php` lines 82-156 auto-create pages with empty `post_content`, relying on the template to fill them). |
| LOW | `<title>` and `<meta description>` are often auto-generated and generic. |

## Dead links to fix or build

Every refrigerant page (verified for r-410a, r-22) links to URLs that 404:

- `/refrigerant/{slug}/pressure-at-50-degrees/`
- `/refrigerant/{slug}/pressure-at-70-degrees/`
- `/refrigerant/{slug}/pressure-at-75-degrees/`
- `/refrigerant/{slug}/pressure-at-80-degrees/`
- `/refrigerant/{slug}/pressure-at-90-degrees/`
- `/refrigerant/{slug}/pressure-at-100-degrees/`

The template-pressure-lookup.php exists but the URL rewriter in `functions.php` lines 27-39 expects them. The handler is wired; the pages may render. But on the live site they 404, suggesting the rewrite rules haven't been flushed or the handler is broken in some other way.

**Action in rebuild:** Either build these (curated set: each refrigerant × {32, 40, 50, 60, 70, 75, 80, 85, 90, 95, 100, 110, 120}°F = 13 temps × 61 refrigerants = 793 pages — too many for v1) or remove the links until ready.

Recommended for v1: **remove the links from the refrigerant pages.** Add this expansion as a phase-2 project after the core rebuild is live and stable.

## What's NOT broken (the good news)

- Site architecture is fine. URL pattern is clean.
- 18 of 61 refrigerants have real, correct WP post content stored in the database (R-22, R-410A, R-32, R-134a, R-404A, R-407C, R-290, R-454B, R-1234yf, R-1234ze, R-448A, R-449A, R-450A, R-452A, R-452B, R-454C, R-513A, R-516A, R-744, R-717, R-600a). This content is **not rendered** by the template (the template uses styled-content overrides), but the WP post bodies are correct and can serve as drafting material for the MDX rewrites.
- Front-page hero card values are correct (hand-typed).
- "What pressure should X be" pages have approximately correct operating-pressure ranges.
- Calculator math, where it doesn't depend on PT, is likely fine.
- WordPress export is clean and complete.

## Estimated total errors

- 61 refrigerant pages × 191 PT data points × 2 columns (°F+°C) = ~23,000 wrong numbers in PT tables alone.
- Plus 6 "what pressure" pages × ~20 reference values each.
- Plus comparison pages × duplicate PT arrays.
- Plus per-refrigerant safety classifications via template-swap = 61 wrong A1 classifications (R-32 should be A2L, R-454B/A/C should be A2L, R-290 should be A3, R-717 should be B2L, R-1234yf/ze should be A2L).
- Plus per-refrigerant composition claims via template-swap = 61 wrong "R-32/R-125 blend" claims.
- Plus per-refrigerant lubricant claims via template-swap = ~30 wrong "POE required" claims (correct for HFCs, wrong for HCFCs and HCs).

Total: rough estimate ~25,000 individual factual errors on the rendered site.

This number is why a rebuild is the right call rather than a fix-in-place. There is no incremental path from the current state to a correct state. The data must be rebuilt and the template must be rebuilt; everything else follows.
