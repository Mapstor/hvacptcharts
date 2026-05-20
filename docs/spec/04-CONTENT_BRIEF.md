# CONTENT_BRIEF.md

For each page type on the new site: what sections it contains, in what order, what schema it emits, what UX elements it uses, and the quality bar each section must hit. Claude Code reads this when building each template.

The principle for every page: a working HVAC technician arriving from Google should find what they need without scrolling past filler. Every section earns its place. Every claim is sourced or computed.

## Quality bar (applies to every page)

These are non-negotiable. The verification skill (see `07-PROJECT_SKILL.md`) enforces them at generation time.

1. **No fabricated numbers.** Every PSI, PSIG, kPa, °F, °C value comes from `getRefrigerant(slug)` or is computed at runtime. No hardcoded numbers in templates except for genuinely constant reference values (atmospheric pressure 14.696 PSIA, etc.).
2. **No template-swap copy.** The bug that made every refrigerant page say "is a 50/50 blend of R-32 and R-125" was hardcoded prose with a name slot. Templates contain zero refrigerant-specific prose. Editorial lives in MDX files per refrigerant.
3. **Every claim cites a source.** If a paragraph asserts "R-22 production ended in 2020," it links to the EPA rule. If it asserts "R-410A has GWP 2088," the GWP is rendered from `r.environmental.gwp100Ar5` with a footnote linking to IPCC AR5. Citations are first-class.
4. **Safety class is rendered, not narrated.** A2L/A3/B2L flammability matters too much to bury in prose. Every refrigerant page has a safety-class chip in the hero, with the correct interpretation ("A2L = mildly flammable, special handling required").
5. **No block of text longer than 3 sentences.** Decided spec, never violated. Every section is scannable: short paragraphs, bullets, tables, callouts.
6. **SVGs over screenshots.** Custom diagrams; never stock illustration. Every diagram is data-driven where the data exists.
7. **No emoji as decoration.** The current site uses 📊 and 🔧 and 💰 as "icons" which read as amateur. Use real SVG icons (Lucide React).

## Page template 1: Refrigerant detail (`/refrigerant/{slug}/`)

The site's core page. 61 of these get generated. Used by techs reading PT values in the field. Mobile-first.

### Information architecture

```
1. Hero
   ├─ Refrigerant name (h1)
   ├─ Safety class chip (color-coded by class)
   ├─ Type chip (HFC / HCFC / HFO / HC / Natural / Blend)
   ├─ One-line description (computed: "Pure HFC | A1 | GWP 675" or "50/50 blend of R-32 + R-125 | A1 | GWP 2088")
   └─ Quick-lookup PSIG at 70°F (the field-tech default)

2. Sticky mobile lookup bar (appears on scroll)
   ├─ Temperature input
   ├─ Returns: bubble PSIG, dew PSIG (or single PSIG for pure refrigerants)
   └─ Unit toggle (°F/°C, PSIG/kPa)

3. Full PT chart
   ├─ Interactive PT curve (SVG, hover for values)
   ├─ Full PT table (-40°F to 150°F, 1°F or 5°F increments toggleable)
   ├─ Unit toggles
   ├─ Download as CSV / PDF
   └─ Print-friendly view

4. Properties grid
   ├─ Critical point (T, P)
   ├─ Boiling point at 1 atm
   ├─ Molar mass
   ├─ ODP
   ├─ GWP (AR5 + AR6 if different, footnoted)
   ├─ Composition (if blend)
   └─ Temperature glide (if blend with glide >1°F, prominent)

5. Per-refrigerant narrative (MDX)
   ├─ What is this refrigerant? (one paragraph, sourced)
   ├─ Where it's used (application list)
   ├─ Phase-down status (if applicable)
   └─ Service / retrofit notes (lubricant, common issues)

6. Replacement/replaces section
   ├─ What this refrigerant replaces (link cards)
   ├─ What can replace this refrigerant (link cards)
   └─ Retrofit considerations (lubricant change, line set, EXV/TXV implications)

7. Related calculators (link cards)
   ├─ PT Calculator (preselected to this refrigerant)
   ├─ Superheat Calculator
   ├─ Subcooling Calculator
   └─ Comparison Tool

8. FAQ (refrigerant-specific, 5-8 questions per refrigerant)

9. Data provenance footer
   ├─ "PT chart data generated from {source}"
   ├─ "Properties cross-checked against {sources}"
   ├─ "Last verified: {date}"
   └─ Disclaimer (use as reference; verify against equipment data plate)
```

### Schema emitted

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "{Refrigerant} Pressure Temperature Chart & Properties",
      "datePublished": "{ptChartGeneratedAt}",
      "dateModified": "{ptChartGeneratedAt}",
      "author": { "@type": "Organization", "name": "HVAC PT Charts" },
      "publisher": { "@type": "Organization", "name": "HVAC PT Charts" }
    },
    {
      "@type": "DefinedTerm",
      "name": "{displayName}",
      "alternateName": ["{altSpellings}"],
      "termCode": "{ashraeNumber}",
      "description": "{one-line description}"
    },
    {
      "@type": "Dataset",
      "name": "{Refrigerant} Saturation Pressure-Temperature Data",
      "description": "Bubble and dew point saturation pressures from -40°F to 150°F at 1°F increments.",
      "creator": { "@type": "Organization", "name": "HVAC PT Charts" },
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "text/csv",
          "contentUrl": "https://hvacptcharts.com/api/refrigerant/{slug}.csv"
        }
      ],
      "variableMeasured": [
        { "@type": "PropertyValue", "name": "Bubble point pressure", "unitText": "PSIG" },
        { "@type": "PropertyValue", "name": "Dew point pressure", "unitText": "PSIG" },
        { "@type": "PropertyValue", "name": "Temperature", "unitText": "DEG F" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [/* per-refrigerant Q&As from MDX frontmatter */]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "..." },
        { "@type": "ListItem", "position": 2, "name": "PT Charts", "item": "..." },
        { "@type": "ListItem", "position": 3, "name": "{displayName}" }
      ]
    }
  ]
}
```

### MDX content file (`content/refrigerants/{slug}.mdx`)

Each refrigerant has a hand-written MDX file with frontmatter. Example structure for `r-410a.mdx`:

```mdx
---
slug: r-410a
title: "R-410A Pressure Temperature Chart & Properties"
metaTitle: "R-410A PT Chart, Pressures, GWP & Properties | HVAC PT Charts"
metaDescription: "Verified R-410A pressure-temperature chart from -40°F to 150°F. ASHRAE A1 classification, GWP 2088, POE-compatible. Field-ready reference."
introOneLiner: "50/50 blend of R-32 and R-125, the industry standard for residential AC since the early 2000s, currently phasing down under the AIM Act."

# Frontmatter fields used to render structured sections (instead of free prose)
narrative:
  whatItIs: |
    R-410A is a near-azeotropic blend of difluoromethane (R-32) and pentafluoroethane (R-125)
    in equal mass proportions. It was developed in the 1990s to replace R-22 in residential
    and light commercial cooling, offering zero ozone-depletion potential while delivering
    higher volumetric capacity than the refrigerant it succeeded.

  whereItsUsed:
    - Residential central air conditioning
    - Heat pumps (residential and light commercial)
    - Light commercial split systems
    - Packaged rooftop units in existing installations

  phaseDownStatus: |
    Under the EPA's AIM Act, R-410A faces a tiered phase-down: production and import
    of HFCs with GWP above 700 in new residential equipment ends January 1, 2025 for
    most categories. R-410A's GWP of 2088 places it well above this threshold, making
    new equipment transitions to R-32 (GWP 675) and R-454B (GWP 466) the industry's
    near-term path. Existing R-410A systems continue to be serviceable.

  serviceNotes: |
    Polyolester (POE) oil is required. POE is hygroscopic, so vacuum integrity matters
    more than with mineral oil systems — leave the system on a vacuum pump until 500
    microns hold for 30+ minutes before charging. System pressures are roughly 60%
    higher than equivalent R-22 systems, so gauges, hoses, and recovery equipment
    must be rated accordingly.

faqs:
  - q: "What is the normal operating pressure of R-410A?"
    a: |
      On a 95°F day with a properly charged residential system, expect low-side (suction)
      pressures around 130 PSIG and high-side (discharge) pressures around 350-400 PSIG.
      Saturation pressure at 95°F is 291 PSIG; actual operating values depend on superheat,
      subcooling, and ambient conditions.

  - q: "What does R-410A's GWP of 2088 mean?"
    a: |
      Global Warming Potential is a relative measure: a single kilogram of R-410A released
      to the atmosphere traps about 2,088 times as much heat over 100 years as a single
      kilogram of CO2. This figure (IPCC AR5) is what the EPA uses to assign R-410A to the
      AIM Act phase-down tier.

  - q: "Can I retrofit an R-22 system to R-410A?"
    a: |
      No, R-410A operates at substantially higher pressures than R-22 and uses an
      incompatible lubricant (POE instead of mineral oil). Retrofitting requires
      replacing the compressor, expansion device, and possibly the indoor coil — at
      that point the economics favor a full system replacement. For a true retrofit of
      an existing R-22 system, look at R-407C, R-422D, R-438A, or R-427A.

  - q: "Is R-410A flammable?"
    a: |
      R-410A is classified A1 by ASHRAE 34: non-toxic and non-flammable under normal
      conditions. Its near-term replacements R-32 (A2L) and R-454B (A2L) are mildly
      flammable and require different safety practices for storage, leak detection,
      and equipment design.

  - q: "When will R-410A be phased out completely?"
    a: |
      Production phase-down for new equipment in most residential categories begins
      January 1, 2025. R-410A itself remains available for servicing existing
      equipment indefinitely under current regulations; reclaimed R-410A is expected
      to take an increasing share of the service supply through the 2030s.

retrofitGuidance:
  fromRefrigerant: r-22
  notes: |
    Direct retrofit is not recommended. R-410A's higher pressures exceed the design
    rating of most R-22 system components. The standard path forward is full system
    replacement with new R-410A or R-32/R-454B equipment.
---

{/* MDX body — optional additional content beyond frontmatter */}

import { CycleDiagram } from '@/components/refrigerant/CycleDiagram';

R-410A systems operate in the same vapor-compression cycle as their R-22 predecessors,
with the working fluid undergoing isentropic compression, isobaric heat rejection,
isenthalpic expansion, and isobaric heat absorption. The defining difference is the
pressure-temperature curve: at equivalent operating points, R-410A sits roughly 60%
higher than R-22.

<CycleDiagram refrigerantSlug="r-410a" />
```

The template reads this MDX, renders structured sections from the frontmatter, and embeds the body. Per-refrigerant copy is editable in one file.

### Tier 1 vs Tier 3 refrigerants

**Tier 1 (full editorial treatment, ~21 refrigerants):**
R-22, R-410A, R-134a, R-32, R-404A, R-407C, R-290, R-454B, R-1234yf, R-1234ze, R-448A, R-449A, R-450A, R-452A, R-452B, R-454C, R-513A, R-516A, R-744, R-717, R-600a, R-123 (high CTR despite lower coverage)

These get full MDX with all sections: whatItIs (2-3 paragraphs), whereItsUsed (5-8 specific applications), phaseDownStatus, serviceNotes, 6-8 FAQs, retrofitGuidance, MDX body with custom diagrams.

**Tier 3 (concise reference, ~40 refrigerants):**
Everything else (R-11, R-12, R-13, R-218, R-218, R-236ea, etc. — refrigerants with mostly historical or niche interest).

These get the same template structure but lighter MDX: whatItIs (1 paragraph), whereItsUsed (3-5 applications), phaseDownStatus (if applicable), 3-4 FAQs. Same data quality; less editorial.

The structural template is identical. Quality is identical. The difference is the depth of the narrative wrapper.

## Page template 2: "What pressure should X be?" (`/what-pressure-should-{slug}-be/`)

6 pages. Different from the refrigerant detail pages: these answer the "field operating pressure" question, not the "thermodynamic saturation" question. The distinction matters and is currently blurred on the live site.

### Information architecture

```
1. Hero
   ├─ Title: "What Should R-22 Pressures Be?"
   ├─ TL;DR card with quick-reference operating ranges
   └─ "Difference between saturation pressure and operating pressure" callout

2. Operating pressure reference table
   ├─ Ambient outdoor temperature × system type (cooling, heat pump, refrigeration)
   ├─ Expected low side (suction) PSIG range
   ├─ Expected high side (discharge) PSIG range
   ├─ Expected superheat
   ├─ Expected subcooling
   └─ Notes on what each range means

3. Saturation pressure reference (links to /refrigerant/{slug}/)
   "Operating pressure differs from saturation pressure. Saturation = what the chart says.
    Operating = what the gauges show. The difference is superheat (vapor) or subcooling (liquid)."

4. Diagnostic cheatsheet
   ├─ "Low side is X PSIG lower than expected" → causes
   ├─ "High side is X PSIG higher than expected" → causes
   └─ "Both pressures off by X" → causes

5. Per-pressure-condition deep dive
   ├─ Low low side (undercharge, restriction, low evap airflow)
   ├─ High low side (overcharge, compressor inefficiency)
   ├─ Low high side (undercharge, low ambient, system rest)
   └─ High high side (overcharge, dirty condenser, non-condensables)

6. FAQ (6-10 specific questions)

7. Cross-links to:
   ├─ /refrigerant/{slug}/ (saturation chart)
   ├─ /superheat-calculator/
   ├─ /subcooling-calculator/
   └─ /high-head-pressure-causes/ (for high-side issues)

8. Provenance footer
```

### Schema emitted

- `Article`
- `FAQPage`
- `BreadcrumbList`
- `HowTo` (for the diagnostic cheatsheet section — list of "If X then check Y" steps)

### Quality note

The operating pressure ranges on the current live site for these pages look approximately correct (verified for R-22). They were apparently hand-typed by a different process than the styled-content PHP files. Reuse where verifiable; rewrite where needed; add the explicit "saturation vs. operating" distinction that the current pages lack.

## Page template 3: Refrigerant comparison (`/r-X-vs-r-Y/`)

4 live pages. Each compares two specific refrigerants side-by-side.

### Information architecture

```
1. Hero
   ├─ Title: "R-32 vs R-410A: A Working Comparison"
   ├─ One-line: "{X} is for new equipment going forward. {Y} is for servicing existing systems."
   └─ Side-by-side hero card (key stats for each)

2. Overlaid PT chart
   ├─ Both curves on one SVG, with both bubble + dew if zeotropic
   ├─ Hover tooltip shows both values at the temperature
   ├─ Unit toggles
   └─ "At 70°F: X = {x_psig} PSIG, Y = {y_psig} PSIG, difference = {delta} PSIG"

3. Side-by-side properties table
   ├─ Type (HFC pure / HFC blend / HFO blend)
   ├─ Safety class
   ├─ GWP (AR5 and AR6)
   ├─ Critical point
   ├─ Temperature glide
   ├─ Lubricant
   ├─ Typical operating pressures
   └─ Phase-down status

4. Use case decision guide
   ├─ "Choose X if..."
   ├─ "Choose Y if..."
   └─ "When neither is ideal..."

5. Retrofit / transition guidance
   ├─ Can you swap X for Y in an existing system?
   ├─ Lubricant compatibility
   ├─ Pressure rating compatibility
   ├─ Expansion device compatibility
   └─ EPA / regulatory considerations

6. Cost comparison
   ├─ Current per-pound pricing (if/when sourced)
   ├─ Equipment availability
   └─ Long-term phase-down trajectory

7. FAQ (5-8 specific to this pair)

8. Cross-links to individual refrigerant pages

9. Provenance footer
```

### Schema emitted

- `Article`
- `FAQPage`
- `BreadcrumbList`

### Per-comparison MDX file (`content/comparisons/{x-vs-y}.mdx`)

Each comparison has hand-written copy in MDX. Structural template renders the data-driven parts (PT overlay, property table); MDX provides the narrative analysis ("choose X if...", retrofit guidance, etc.).

## Page template 4: Calculator pages

The 9 PT-dependent calculators get the same shell but different math.

### Common structure

```
1. Hero (calculator name + one-line purpose)

2. The calculator itself
   ├─ Inputs (clean form, mobile-friendly)
   ├─ Live computed output
   ├─ Refrigerant selector (where applicable)
   ├─ Unit toggles
   └─ "Why this result?" expandable explanation

3. How to use this calculator
   ├─ Step-by-step with example values
   └─ Common errors

4. Underlying math (collapsible)
   ├─ Formula
   ├─ Source for the formula (ASHRAE / ACCA / manufacturer)
   └─ Worked example

5. Related tools (link cards)

6. FAQ (5-8 questions)

7. Provenance footer
```

### Per-calculator specifics

**`/pt-calculator/`** (TIER 1)
- Input: refrigerant + temperature (or pressure)
- Output: saturation pressure (or temperature), with bubble/dew for zeotropes
- Math: lookup + linear interpolation from `refrigerants.json`
- FAQ: "What's the difference between PSI and PSIG?", "Why do some refrigerants show two pressures?", "How accurate is this calculator?"

**`/superheat-calculator/`** (HIGHEST TRAFFIC — 18 clicks/90d)
- Inputs: refrigerant + suction line pressure (PSIG) + suction line temperature
- Output: superheat (°F), with diagnostic context ("8-12°F is normal for fixed-orifice; 10-15°F for TXV")
- Math: saturation T at given pressure (from data layer) − actual line T = superheat
- Target table inline (fixed-orifice vs TXV vs evap target)
- FAQ: "What is superheat?", "What should superheat be on a {common refrigerant}?", "How do I measure superheat?"
- **Priority for the rebuild**: this page earns the most clicks; gets the most polish

**`/subcooling-calculator/`**
- Inputs: refrigerant + liquid line pressure (PSIG) + liquid line temperature
- Output: subcooling (°F)
- Math: saturation T at given pressure − actual line T = subcooling
- Same shape as superheat

**`/pt-superheat-subcooling-calculator/`**
- Combined: single form for both
- Useful when checking a full system at once

**`/saturation-properties-calculator/`**
- Inputs: refrigerant + T or P
- Outputs: bubble P, dew P, liquid density, vapor density, enthalpy of vaporization, specific heat (for refrigerants where we have these via CoolProp)
- Math: CoolProp `PropsSI` calls at build time, lookup at runtime

**`/refrigerant-pt-comparison-tool/`**
- Input: 2-4 refrigerants to compare
- Output: overlaid PT curves with hover tooltips, side-by-side properties
- Differentiator from the per-pair comparison pages: this is the interactive tool; those are written narratives.

**`/refrigerant-charge-calculator/`**
- Inputs: system size (tons or kW) + line set length + line set diameters
- Output: estimated charge in lbs (with disclaimer to verify against equipment label)
- Math: standard line set adjustment formulas (0.6 oz/ft of 3/8" liquid line, etc.)

**`/refrigerant-retrofit-compatibility-calculator/`**
- Inputs: existing refrigerant + target refrigerant
- Output: compatibility verdict (drop-in / retrofit with oil change / not recommended / impossible)
- Logic: cross-reference safety class, lubricant compatibility, pressure class, temperature class

**`/system-pressure-diagnostic-calculator/`**
- Inputs: refrigerant + ambient temperature + low side reading + high side reading + line temperatures
- Output: diagnostic flags (overcharge, undercharge, dirty condenser, low airflow, restriction)
- Logic: compares measured values against computed expected ranges; flags deviations

### Schema for calculators

```json
{
  "@type": "WebApplication",
  "applicationCategory": "EngineeringApplication",
  "operatingSystem": "Any (web-based)",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

Plus `FAQPage` and `BreadcrumbList`.

## Page template 5: Homepage (`/`)

### Information architecture

```
1. Hero
   ├─ H1: "HVAC Pressure-Temperature Charts"
   ├─ Subhead: "Verified PT data for 61 refrigerants. Calculators for superheat,
                subcooling, charging, and retrofit. Used by HVAC professionals worldwide."
   └─ Primary CTAs: "Browse PT Charts" + "Open Superheat Calculator"

2. Quick-access PT chart cards (most-trafficked refrigerants)
   ├─ R-410A, R-22, R-134a, R-32, R-404A, R-454B
   ├─ Each card: refrigerant name, type chip, "PSIG at 70°F: {value}"
   └─ Values computed from data layer (not hardcoded — the current site's hand-typed values are right but fragile)

3. "Find a refrigerant" search/filter
   ├─ Type filter (CFC / HCFC / HFC / HFO / HC / Natural / Blend)
   ├─ Safety class filter
   ├─ GWP filter (under 150 / 150-700 / 700-2000 / 2000+)
   └─ Free-text search by name

4. Featured calculators (link cards)
   ├─ Superheat (top traffic)
   ├─ PT
   ├─ Subcooling
   ├─ Charge
   └─ Comparison tool

5. "What's new" section (when applicable)
   ├─ Phase-down updates
   ├─ New refrigerant additions
   └─ Calculator improvements

6. Brief site overview (one paragraph, sourced)
   "HVAC PT Charts provides verified saturation pressure-temperature data for {N} refrigerants,
    sourced from CoolProp 7.2.0 thermodynamic models and cross-referenced against manufacturer
    datasheets from Honeywell, Chemours, Arkema, and the ASHRAE Handbook of Refrigeration 2022.
    All calculator math uses this same dataset — every page, every number, one source of truth."

7. Footer (nav links, provenance, copyright)
```

### Schema emitted

- `WebSite` with `SearchAction`
- `Organization`
- `BreadcrumbList`

## Page template 6: Hub pages (`/calculators-hub/`, `/pt-charts-tools-hub/`, `/guides-hub/`)

### Information architecture

```
1. Hub header (h1 + 1-sentence description)

2. Card grid
   ├─ Each card: title + one-line description + traffic-relevant detail (e.g. "Used by 5,000+ HVAC techs / month" if true)
   └─ Cards link to individual tool/refrigerant/guide

3. "Most popular this month" callout (top 3-5 in the hub)

4. Brief intro paragraph (not filler — explain when to use this category of tool)

5. Cross-links to other hubs
```

### Schema

- `CollectionPage`
- `BreadcrumbList`

## Page template 7: Long-form guide (`/superheat-subcooling-fundamentals/`, `/pt-chart-guide/`, etc.)

### Information architecture

```
1. Hero with TL;DR (3-sentence summary up top — what techs want)

2. Table of contents (sticky on desktop)

3. Sections with:
   ├─ H2 heading
   ├─ Plain-language explanation
   ├─ Worked example with real numbers
   ├─ Inline calculator or interactive (where applicable)
   ├─ Citation footnotes
   └─ Cross-links

4. FAQ at end

5. Related tools / next reads

6. Provenance footer
```

### Schema

- `Article` with full author/publisher
- `FAQPage`
- `HowTo` if the guide is procedural
- `BreadcrumbList`

## Page template 8: Reference pages (`/refrigerant-safety-classifications/`, `/refrigerant-gwp-rankings/`)

### Information architecture

```
1. Hero (h1 + 1-sentence purpose)

2. Brief explanation of the classification / ranking system (2-3 paragraphs)

3. The actual reference (sortable, filterable table)
   ├─ Every refrigerant on the site
   ├─ Each row links to /refrigerant/{slug}/
   ├─ Sortable columns
   └─ Filterable by type, class, status

4. Notes on interpretation

5. Sources

6. Cross-links

7. Provenance footer
```

These are pages that LLMs love to cite because they're authoritative reference tables.

## Page template 9: Carrier-style charging chart (`/carrier-410a-charging-chart/`)

### Information architecture

```
1. Hero
   ├─ Title: "Carrier R-410A Charging Chart"
   ├─ "Source: Carrier Service Manual {year}, used with attribution"
   └─ One-line: "Manufacturer-published charging values for Carrier residential R-410A split systems."

2. The chart (table)
   ├─ Outdoor ambient × indoor wet bulb × expected liquid pressure × expected suction pressure
   ├─ Sourced from Carrier
   └─ Direct quote of the original

3. How to use this chart
   ├─ When Carrier-published values apply (model-specific)
   ├─ Limitations
   └─ When to fall back to general PT references

4. Line set length adjustments (current page has this; preserve and verify)

5. Related: other manufacturer charging charts (phase 2)

6. Cross-links to general R-410A reference, calculators

7. Provenance footer with explicit Carrier source citation
```

This page model is reusable for phase 2 expansion (Lennox, Trane, Goodman, Rheem, Daikin charging charts).

## Page template 10: Site pages (about, contact, legal)

Standard layout. Brief, no marketing fluff. Real contact methods. Real privacy policy that reflects what the site actually does (Vercel analytics? Plausible? AdSense placeholders?).

## SVG components inventory

Listed here for context; full spec in `05-SVG_INVENTORY.md`. Used across page templates:

| Component | Used on |
|---|---|
| `<PTCurve>` | Refrigerant pages (single curve), comparison pages (overlay) |
| `<CycleDiagram>` | Refrigerant pages (Tier 1), explainer guides |
| `<PhDiagram>` | Refrigerant pages (Tier 1 only) |
| `<SystemLayout>` | Homepage, PT chart guide, what-pressure pages |
| `<GlideVisualization>` | Refrigerant pages where glide >1°F |
| `<GWPComparisonBar>` | Refrigerant pages, GWP rankings, comparison pages |
| `<PhaseDownTimeline>` | AIM Act-affected refrigerants, regulatory guides |
| `<PressureGauge>` | What-pressure pages, diagnostic calculator |
| `<SafetyClassChip>` | Every refrigerant page hero |
| `<SaturationDome>` | PT chart guide, advanced reference pages |

## Authorship and provenance

Per Marko's decision: no expert author personas. Every page footer carries:

```
Data sources:
- PT chart: {generated from CoolProp 7.2.0 / Honeywell datasheet 2023 / etc.}
- Properties: CoolProp 7.2.0 + ASHRAE Standard 34-2022
- GWP: IPCC AR5 Table 8.A.1 (AR6 value also provided where applicable)
- Last verified: {ISO date}

This page is provided as a reference. Always verify pressure values against
the equipment data plate and manufacturer service literature before charging
or troubleshooting a specific system. Saturation pressure differs from
operating pressure; see [/superheat-subcooling-fundamentals/]() for the
distinction.
```

No fake "Reviewed by John Smith, EPA-Certified Technician" claims. The Organization is the publisher. The data sources are the authority.

## Tone of voice

Technical. Direct. Assumes the reader is a working professional or a serious DIYer. Doesn't oversimplify. Doesn't pad. No emoji as decoration. No "Looking for {topic}? You've come to the right place!" intros — get to the answer.

Reference points for tone:
- Engineering Toolbox: too dry, too unfiltered, not designed for mobile
- ACDirect blog: pretty good, slightly chatty
- Engineering ToolBox + Stack Overflow's best answers + the EPA's training PDFs = our target

The current site's tone is fine; it's the facts underneath that need fixing. New copy stays similarly technical but with better information density.

## Internal linking strategy

Every page links to:

1. The most relevant calculator (e.g. R-410A page links to PT calculator preselected to R-410A)
2. The "replaces" and "replaced by" refrigerants (link cards in the retrofit section)
3. The relevant hub
4. 2-3 contextually-relevant guides

Every refrigerant page is reachable in ≤ 2 clicks from the homepage. Every refrigerant page is reachable in ≤ 1 click from at least one other refrigerant page (via replace/replaced-by links or the comparison tool).

The result: a tight hub-and-spoke topology that distributes link equity instead of concentrating it on the homepage.
