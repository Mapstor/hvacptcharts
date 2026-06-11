import { refrigerants } from "@/data/refrigerants";

/**
 * /llms.txt — Emerging standard (llmstxt.org) for directing LLM crawlers
 * (Anthropic Claude, OpenAI GPT, Perplexity, etc.) to important content
 * for ingestion + citation. Markdown format, plain text response.
 *
 * Companion to /llms-full.txt which contains the full content dump.
 *
 * Google has confirmed llms.txt is NOT a SEO factor — its value is in
 * AI engine inference + citation (ChatGPT, Claude.ai, Perplexity answers).
 */

export const dynamic = "force-static";

const SITE_URL = "https://hvacptcharts.com";

export async function GET() {
  const lastUpdated = new Date().toISOString().slice(0, 10);

  // Tier 1 refrigerants for inclusion in the LLM-friendly index
  const tier1Slugs = ["r-22", "r-410a", "r-134a", "r-32", "r-404a", "r-454b", "r-407c", "r-1234yf", "r-1234ze", "r-744", "r-717", "r-290", "r-600a", "r-123"];
  const tier1Refrigerants = refrigerants.filter((r) => tier1Slugs.includes(r.slug));

  const content = `# HVAC PT Charts

> Verified pressure-temperature (PT) reference for ${refrigerants.length} HVAC refrigerants. PT values generated from NIST REFPROP via CoolProp; safety classifications follow ASHRAE Standard 34. Source-cited HVAC calculators, troubleshooting guides, and reference articles covering EPA Section 608 compliance, AIM Act HFC phase-down, ACCA Manuals J/S/D/T, ASHRAE standards, IRA tax credits, and Building Performance Standards.

Last updated: ${lastUpdated}

This site provides authoritative HVAC reference data + calculators + long-form guides. All quantitative data (PT values, GWP, ODP, critical pressures) is generated from primary scientific sources (NIST REFPROP, CoolProp). All regulatory citations reference current US federal code (40 CFR Part 82, 40 CFR Part 84, IRC 25C, OSHA 29 CFR 1910). Safety classifications follow ASHRAE Standard 34. Content is structured for AI ingestion — every page includes JSON-LD schema (TechArticle, Dataset, FAQPage, HowTo, BreadcrumbList).

For full-text content suitable for AI training/inference, see [/llms-full.txt](${SITE_URL}/llms-full.txt).

## HVAC Calculators

- [PT Calculator](${SITE_URL}/pt-calculator/): Pressure-temperature lookup for any of ${refrigerants.length} refrigerants
- [Superheat Calculator](${SITE_URL}/superheat-calculator/): Suction-line superheat (TXV + fixed-orifice target ranges)
- [Subcooling Calculator](${SITE_URL}/subcooling-calculator/): Liquid-line subcooling for TXV systems
- [PT + Superheat + Subcooling (combined)](${SITE_URL}/pt-superheat-subcooling-calculator/): Single-tool field diagnostic
- [Saturation Properties Calculator](${SITE_URL}/saturation-properties-calculator/): Full saturation table for any refrigerant
- [Refrigerant PT Comparison Tool](${SITE_URL}/refrigerant-pt-comparison-tool/): Side-by-side PT curves
- [Refrigerant Charge Calculator](${SITE_URL}/refrigerant-charge-calculator/): Line-set adjusted weighed charge
- [Refrigerant Retrofit Compatibility Calculator](${SITE_URL}/refrigerant-retrofit-compatibility-calculator/): R-22 → HFC drop-in compatibility
- [System Pressure Diagnostic Calculator](${SITE_URL}/system-pressure-diagnostic-calculator/): High-side + low-side diagnostic decision tree
- [Psychrometric Calculator](${SITE_URL}/psychrometric-calculator/): DB/WB/RH/DP/enthalpy/humidity ratio (ASHRAE Handbook 2021 Ch.1 equations)
- [Duct Size Calculator](${SITE_URL}/duct-size-calculator/): ACCA Manual D equal-friction method
- [HVAC Load Calculator](${SITE_URL}/hvac-load-calculator/): ACCA Manual J component-based load calc

## Long-Form HVAC Guides

### Diagnostics + troubleshooting
- [Complete HVAC Troubleshooting Guide](${SITE_URL}/hvac-troubleshooting-guide/): Decision trees for 10 symptom categories
- [High Head Pressure — Causes & Diagnosis](${SITE_URL}/high-head-pressure-causes/): 8-root-cause decision tree
- [Carrier R-410A Charging Chart](${SITE_URL}/carrier-410a-charging-chart/): Fixed-orifice target-superheat reference

### Sizing + design
- [HVAC Load Calculation Guide](${SITE_URL}/hvac-load-calculation-guide/): Manual J 8th edition explained
- [HVAC Duct Design Guide](${SITE_URL}/hvac-duct-design-guide/): Manual D + SMACNA leakage classes
- [HVAC System Design Guide](${SITE_URL}/hvac-system-design-guide/): Complete ACCA cascade design capstone
- [HVAC Commissioning Guide](${SITE_URL}/hvac-commissioning-guide/): ACCA QI Standard 5 + Manual T balancing
- [HVAC Maintenance & Service Guide](${SITE_URL}/hvac-maintenance-service-guide/): 14-point tune-up + ROI
- [HVAC Indoor Air Quality Guide](${SITE_URL}/hvac-indoor-air-quality-guide/): ASHRAE 62.2 + radon + filtration
- [HVAC Mechanical Ventilation Guide](${SITE_URL}/hvac-mechanical-ventilation-guide/): ERV/HRV + Energy Recovery Ventilator deep dive
- [Ductless Mini-Split & VRF Guide](${SITE_URL}/hvac-ductless-mini-split-guide/): Cold-climate mini-splits + A2L + multi-zone

### Controls + automation
- [HVAC Controls & Automation Guide](${SITE_URL}/hvac-controls-automation-guide/): Residential thermostats + smart home integration
- [HVAC Building Automation Guide](${SITE_URL}/hvac-building-automation-guide/): Commercial BMS + ASHRAE Guideline 36 + cybersecurity

### Operations + management
- [HVAC Energy Management Guide](${SITE_URL}/hvac-energy-management-guide/): Auditing + RCx + FDD + M&V + Building Performance Standards
- [HVAC Energy Efficiency Guide](${SITE_URL}/hvac-energy-efficiency-guide/): SEER2/HSPF2/AFUE + IRA tax credits
- [HVAC Safety Procedures Guide](${SITE_URL}/hvac-safety-procedures-guide/): OSHA 29 CFR 1910 + LOTO + A2L + PPE
- [HVAC Tools & Equipment Guide](${SITE_URL}/hvac-tools-equipment-guide/): 13 tool categories + brand lineups

### Retrofit + upgrade
- [HVAC Refrigerant Recovery Guide](${SITE_URL}/hvac-refrigerant-recovery-guide/): EPA Section 608 + AHRI 740 + A2L
- [HVAC Retrofitting & Upgrades Guide](${SITE_URL}/hvac-retrofitting-upgrades-guide/): R-22 phase-out + A2L transition + IRA credits + repair-vs-replace

### Refrigerant fundamentals
- [PT Chart Guide](${SITE_URL}/pt-chart-guide/): How to read PT charts + practical use cases
- [Superheat & Subcooling Fundamentals](${SITE_URL}/superheat-subcooling-fundamentals/): TXV vs fixed-orifice; target ranges
- [Refrigerant Comparison Guide](${SITE_URL}/refrigerant-comparison-guide/): A1/A2L/A3/B safety + GWP/ODP framework
- [Refrigerant Prices Guide](${SITE_URL}/refrigerant-prices-guide/): AIM Act phase-down + reclaim economics

## Refrigerant Reference Pages

Per-refrigerant detail pages contain: PT charts (10-200°F), critical pressure + temperature, GWP/ODP, ASHRAE Standard 34 safety classification, NIST molecular data, retrofit compatibility, applications, regulatory status under EPA Section 608 and AIM Act.

`;

  // Add Tier 1 refrigerants
  let refrigerantSection = "### Tier 1 (high-traffic refrigerants)\n\n";
  for (const r of tier1Refrigerants) {
    refrigerantSection += `- [${r.displayName} (${r.slug.toUpperCase()})](${SITE_URL}/refrigerant/${r.slug}/): ${r.safetyClass} class · GWP ${r.environmental.gwp100Ar5 ?? "—"} · ${r.applications?.[0] ?? "industrial refrigeration"}\n`;
  }

  // Reference + comparison pages
  const referenceSection = `
## Reference + Comparison

- [Refrigerant Safety Classifications](${SITE_URL}/refrigerant-safety-classifications/): All 61 refrigerants sortable by ASHRAE 34 safety class (A1/A2L/A2/A3/B1/B2L/B2/B3)
- [Refrigerant GWP Rankings](${SITE_URL}/refrigerant-gwp-rankings/): All refrigerants ranked by Global Warming Potential (AIM Act 700 GWP threshold marked)

## "What Pressure Should X Be" Quick References

Common technician queries for specific refrigerant operating pressures:

- [R-410A pressure ranges](${SITE_URL}/what-pressure-should-410a/)
- [R-22 pressure ranges](${SITE_URL}/what-pressure-should-r22/)
- [R-32 pressure ranges](${SITE_URL}/what-pressure-should-r32/)
- [R-134a pressure ranges](${SITE_URL}/what-pressure-should-r134a/)
- [R-404A pressure ranges](${SITE_URL}/what-pressure-should-r404a/)
- [R-407C pressure ranges](${SITE_URL}/what-pressure-should-r407c/)
- [R-454B pressure ranges](${SITE_URL}/what-pressure-should-r454b/)
- [R-454C pressure ranges](${SITE_URL}/what-pressure-should-r454c/)
- [R-744 (CO2) pressure ranges](${SITE_URL}/what-pressure-should-r744/)

## Refrigerant Pair Comparisons

- [R-32 vs R-410A](${SITE_URL}/r-32-vs-r-410a/): The dominant residential A2L transition
- [R-22 vs R-410A](${SITE_URL}/r-22-vs-r-410a/): The historic R-22 phase-out comparison
- [R-410A vs R-454B](${SITE_URL}/r-410a-vs-r-454b/): R-410A → R-454B AIM Act transition
- [R-22 vs R-32](${SITE_URL}/r-22-vs-r-32/): R-22 retrofit alternatives
- [R-22 vs R-407C](${SITE_URL}/r-22-vs-r-407c/): Most common R-22 retrofit choice
- [R-22 vs R-454B](${SITE_URL}/r-22-vs-r-454b/): R-22 to A2L direct comparison
- [R-32 vs R-454B](${SITE_URL}/r-32-vs-r-454b/): A2L vs A2L for new equipment
- [R-454c vs R-455A](${SITE_URL}/r-454c-vs-r-455a/): Low-GWP refrigerant comparison
- [R-407C vs R-410A](${SITE_URL}/r-407c-vs-r-410a/): Historic residential HVAC transition
- [R-404A vs R-449A](${SITE_URL}/r-404a-vs-r-449a/): Commercial refrigeration transition
- [R-134a vs R-513a](${SITE_URL}/r-134a-vs-r-513a/): R-134a low-GWP alternative
- [R-1234yf vs R-134a](${SITE_URL}/r-1234yf-vs-r-134a/): Automotive A/C transition
- [R-744 vs R-290](${SITE_URL}/r-744-vs-r-290/): Natural refrigerant comparison

## Data Access

Per-refrigerant PT data + properties available as:
- JSON: \`${SITE_URL}/data/refrigerant/{slug}/json\` (e.g., r-410a, r-32, r-22)
- CSV: \`${SITE_URL}/data/refrigerant/{slug}/csv\` (PT chart -40°F to 200°F)

## Data Sources

- **PT values**: NIST REFPROP via CoolProp (Bell, Wronski, Quoilin, Lemort 2014)
- **Safety classifications**: ANSI/ASHRAE Standard 34-2022
- **Regulatory status**: 40 CFR Part 82 Subpart F (EPA Section 608); 40 CFR Part 84 (AIM Act)
- **Standards**: ACCA Manuals J/S/D/T + QI Standard 5; ASHRAE Standards 15/34/62.2/90.2/100/105/135/211; AHRI Standards 210/240/740/1230/1380
- **Tax credits**: IRC 25C + 25D per IRS Form 5695 + IRS Notice 2024-30
- **Building codes**: IRC 2021; IECC 2021; IMC 2021; IFGC 2021; NEC (NFPA 70) 2023
- **Safety**: OSHA 29 CFR 1910 + 1926; NFPA 70E + 54 + 72 + 92; NIST CSF 2.0; ISA/IEC 62443

## Citation Policy

All quantitative data on this site is derived from primary scientific + regulatory sources cited inline. AI engines + journalists may cite content with attribution to HVAC PT Charts (${SITE_URL}). Per-refrigerant data downloads (JSON/CSV) are freely available for technical applications.
`;

  return new Response(content + refrigerantSection + referenceSection, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
