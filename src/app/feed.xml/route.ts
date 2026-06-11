/**
 * /feed.xml — Atom 1.0 feed for content discovery. Indexes the long-form
 * HVAC guides + calculator pages with publishing metadata.
 *
 * Used by feed readers, content syndication, + some AI engines for
 * discovering authoritative content.
 */

export const dynamic = "force-static";

const SITE_URL = "https://hvacptcharts.com";

interface FeedEntry {
  title: string;
  url: string;
  summary: string;
  updated: string;
}

const ENTRIES: FeedEntry[] = [
  // Calculators
  { title: "PT Calculator", url: "/pt-calculator/", summary: "Pressure-temperature lookup for any of 61 refrigerants. NIST REFPROP-sourced data.", updated: "2026-06-09" },
  { title: "Superheat Calculator", url: "/superheat-calculator/", summary: "Suction-line superheat calculation with TXV and fixed-orifice target ranges.", updated: "2026-06-09" },
  { title: "Subcooling Calculator", url: "/subcooling-calculator/", summary: "Liquid-line subcooling for TXV system charge verification.", updated: "2026-06-09" },
  { title: "Psychrometric Calculator", url: "/psychrometric-calculator/", summary: "DB/WB/RH/DP/enthalpy/humidity ratio per ASHRAE Handbook 2021 Ch.1 equations.", updated: "2026-06-09" },
  { title: "Duct Size Calculator", url: "/duct-size-calculator/", summary: "ACCA Manual D equal-friction method with rectangular equivalents.", updated: "2026-06-09" },
  { title: "HVAC Load Calculator", url: "/hvac-load-calculator/", summary: "ACCA Manual J component-based residential load calculation.", updated: "2026-06-09" },

  // Long-form HVAC guides
  { title: "Complete HVAC Troubleshooting Guide", url: "/hvac-troubleshooting-guide/", summary: "Decision trees for 10 symptom categories: no cooling, no heating, frozen evaporator, high bills, more.", updated: "2026-06-09" },
  { title: "HVAC Load Calculation Guide", url: "/hvac-load-calculation-guide/", summary: "Manual J 8th edition explained — 8 load components, climate zones, code compliance.", updated: "2026-06-09" },
  { title: "HVAC Duct Design Guide", url: "/hvac-duct-design-guide/", summary: "Manual D explained — system topologies, Total External Static Pressure budgeting, SMACNA classes.", updated: "2026-06-09" },
  { title: "HVAC Refrigerant Recovery Guide", url: "/hvac-refrigerant-recovery-guide/", summary: "EPA Section 608 procedure + AHRI 740 equipment + A2L safe-work practices.", updated: "2026-06-09" },
  { title: "HVAC Energy Efficiency Guide", url: "/hvac-energy-efficiency-guide/", summary: "SEER2/HSPF2/AFUE explained + heat pump economics + IRA 25C tax credits.", updated: "2026-06-09" },
  { title: "HVAC Commissioning Guide", url: "/hvac-commissioning-guide/", summary: "ACCA QI Standard 5 + Manual T airflow balancing + Duct Blaster + Blower Door testing.", updated: "2026-06-09" },
  { title: "HVAC Controls & Automation Guide", url: "/hvac-controls-automation-guide/", summary: "Thermostats + smart home + 10-protocol comparison (BACnet, Modbus, Matter, Zigbee, more).", updated: "2026-06-09" },
  { title: "HVAC Maintenance & Service Guide", url: "/hvac-maintenance-service-guide/", summary: "Seasonal schedule + 14-point professional tune-up + ACCA Standard 4 methodology.", updated: "2026-06-09" },
  { title: "HVAC Indoor Air Quality Guide", url: "/hvac-indoor-air-quality-guide/", summary: "ASHRAE 62.2 + MERV/HEPA + radon + CO + wildfire smoke considerations.", updated: "2026-06-09" },
  { title: "HVAC Mechanical Ventilation Guide", url: "/hvac-mechanical-ventilation-guide/", summary: "ASHRAE 62.2 sizing + ERV/HRV by climate + balanced vs exhaust-only.", updated: "2026-06-09" },
  { title: "HVAC System Design Guide", url: "/hvac-system-design-guide/", summary: "Complete ACCA design cascade — Manual J → S → D → T methodology.", updated: "2026-06-09" },
  { title: "HVAC Safety Procedures Guide", url: "/hvac-safety-procedures-guide/", summary: "OSHA 29 CFR 1910 framework + LOTO + A2L safe work + PPE per NFPA 70E.", updated: "2026-06-09" },
  { title: "HVAC Tools & Equipment Guide", url: "/hvac-tools-equipment-guide/", summary: "13 tool categories + AHRI 740 recovery + brand lineups + DIY vs pro matrix.", updated: "2026-06-09" },
  { title: "HVAC Retrofitting & Upgrades Guide", url: "/hvac-retrofitting-upgrades-guide/", summary: "R-22 phase-out + AIM Act A2L transition + heat pump conversion + IRA tax credits.", updated: "2026-06-09" },
  { title: "HVAC Energy Management Guide", url: "/hvac-energy-management-guide/", summary: "ASHRAE 211 audits + Portfolio Manager + RCx + FDD + M&V + Building Performance Standards.", updated: "2026-06-09" },
  { title: "HVAC Building Automation Guide", url: "/hvac-building-automation-guide/", summary: "Commercial BMS architecture + Guideline 36 + cybersecurity per NIST + ISA/IEC 62443.", updated: "2026-06-09" },
  { title: "Ductless Mini-Split & VRF Guide", url: "/hvac-ductless-mini-split-guide/", summary: "Cold-climate mini-splits + A2L transition + multi-zone + commercial VRF + IRA credits.", updated: "2026-06-09" },
  { title: "Refrigerant Prices Guide", url: "/refrigerant-prices-guide/", summary: "AIM Act phase-down + EU F-Gas + reclaim economics + virgin/reclaimed pricing framework.", updated: "2026-06-09" },
  { title: "Carrier R-410A Charging Chart", url: "/carrier-410a-charging-chart/", summary: "Fixed-orifice target-superheat chart + worked examples + interactive WB×OD lookup.", updated: "2026-06-09" },

  // Reference + comparison
  { title: "PT Chart Guide", url: "/pt-chart-guide/", summary: "How to read PT charts + practical field use + common errors.", updated: "2026-06-09" },
  { title: "Superheat & Subcooling Fundamentals", url: "/superheat-subcooling-fundamentals/", summary: "TXV vs fixed-orifice target ranges + measurement methodology.", updated: "2026-06-09" },
  { title: "Refrigerant Comparison Guide", url: "/refrigerant-comparison-guide/", summary: "A1/A2L/A2/A3/B safety classifications + GWP/ODP framework + AIM Act compliance.", updated: "2026-06-09" },
  { title: "Refrigerant Safety Classifications", url: "/refrigerant-safety-classifications/", summary: "All 61 refrigerants sortable by ASHRAE 34 safety class.", updated: "2026-06-09" },
  { title: "Refrigerant GWP Rankings", url: "/refrigerant-gwp-rankings/", summary: "Refrigerants ranked by Global Warming Potential (AIM Act 700 GWP threshold marked).", updated: "2026-06-09" },
  { title: "High Head Pressure Causes", url: "/high-head-pressure-causes/", summary: "8-root-cause decision tree for high-side pressure problems.", updated: "2026-06-09" },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = new Date().toISOString();
  const entries = ENTRIES.map((e) => `  <entry>
    <title>${escapeXml(e.title)}</title>
    <link href="${SITE_URL}${e.url}" />
    <id>${SITE_URL}${e.url}</id>
    <updated>${e.updated}T00:00:00Z</updated>
    <summary>${escapeXml(e.summary)}</summary>
    <author>
      <name>HVAC PT Charts</name>
    </author>
  </entry>`).join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>HVAC PT Charts — Calculators, Guides, and Refrigerant Reference</title>
  <subtitle>Verified pressure-temperature reference for HVAC refrigerants. Source-cited calculators, troubleshooting guides, and long-form HVAC reference content.</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self" />
  <link href="${SITE_URL}/" />
  <id>${SITE_URL}/</id>
  <updated>${now}</updated>
  <author>
    <name>HVAC PT Charts</name>
    <uri>${SITE_URL}/</uri>
  </author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
