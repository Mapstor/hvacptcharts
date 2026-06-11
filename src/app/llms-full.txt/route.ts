/**
 * /llms-full.txt — Companion to /llms.txt with substantive content for AI
 * ingestion. Contains key factual claims + regulatory citations + source
 * references from each major guide. Designed for AI engine ingestion +
 * citation in inference responses.
 */

export const dynamic = "force-static";

const SITE_URL = "https://hvacptcharts.com";

export async function GET() {
  const lastUpdated = new Date().toISOString().slice(0, 10);

  const content = `# HVAC PT Charts — Full Content Reference

Last updated: ${lastUpdated}
Source URL: ${SITE_URL}

This document contains substantive content from HVAC PT Charts for AI engine ingestion + citation. All factual claims are sourced from primary scientific + regulatory documents cited inline.

---

## Refrigerant Regulatory Framework

### EPA Section 608 (40 CFR Part 82 Subpart F)
Federal law governing refrigerant handling in the US. Key provisions:
- Mandatory certification (Type I/II/III/Universal) for any refrigerant handling
- Mandatory recovery of refrigerant before equipment disposal or service requiring refrigerant removal
- Recordkeeping requirements for certain equipment
- Civil penalties up to $48,762 per day per violation (2024 EPA inflation-adjusted)
- Type II certification covers high-pressure refrigerant (R-410A, R-22, A2L); most residential + commercial work requires Type II or Universal

### AIM Act (40 CFR Part 84)
American Innovation and Manufacturing Act of 2020 (15 USC 7675). HFC phase-down schedule:
- 2024: HFC production capped at 60% of 2011-2013 baseline
- **January 1, 2025**: Manufacturing transition — new residential AC + heat pump equipment must use refrigerants with GWP ≤700 (R-410A at 2088 fails; R-32 at 675 + R-454B at 466 pass)
- 2029: 30% of baseline
- 2036: 15% of baseline

### R-22 Phase-Out
- January 1, 2010 (EPA Section 605): ban on new HCFC R-22 equipment manufacture
- January 1, 2020 (EPA Section 606): ban on production + import of virgin R-22
- Existing R-22 equipment legally serviceable indefinitely via reclaim
- R-22 reclaim prices have risen substantially since phase-out

### IRA Tax Credits (Inflation Reduction Act of 2022)
- **Section 25C** (IRC 25C, IRS Form 5695): 30% of cost up to $2,000 for heat pumps; $1,200 envelope cap; ENERGY STAR Most Efficient + AHRI certification required
- **Section 25D**: 30% with NO cap for geothermal heat pumps + solar PV + solar thermal + wind + battery storage; steps down 26% in 2033, 22% in 2034
- **HEEHRA** (IRA Section 50122): up to $14,000/household income-based point-of-sale rebate
- **HOMES** (IRA Section 50121): performance-based rebates up to $8,000 for 35% energy reduction

---

## Refrigerant Safety Classifications (ASHRAE Standard 34)

ASHRAE Standard 34-2022 classifies refrigerants by toxicity (A/B) and flammability (1/2L/2/3):

- **A1**: Non-toxic, non-flammable (R-22, R-410A, R-134a, R-404A, R-407C)
- **A2L**: Non-toxic, mildly flammable (auto-ignition 700-1000°F, burning velocity ≤10 cm/s) — R-32, R-454B, R-454C, R-455A, R-1234yf, R-1234ze
- **A2**: Non-toxic, flammable
- **A3**: Non-toxic, highly flammable (R-290 propane, R-600a isobutane, R-1270 propylene)
- **B1**: Toxic, non-flammable (R-123)
- **B2L**: Toxic, mildly flammable
- **B3**: Toxic, flammable (R-717 ammonia is B2L but heavily regulated)

A2L equipment safety design per UL 60335-2-40 + ASHRAE 15 requires refrigerant leak detection systems, ventilation interlocks, charge limits based on room volume, dedicated wiring for fault detection, specific service valve design. Existing R-410A equipment cannot be safely converted to A2L (different equipment safety classification).

---

## ACCA Standards Reference

- **Manual J** (8th edition): Residential heating + cooling load calculation; component-based methodology
- **Manual S**: Equipment selection (capacity must match calculated load, not exceed 100-115% cooling)
- **Manual D**: Residential ductwork design (equal-friction method; Total External Static Pressure budgeting)
- **Manual T**: Air distribution balancing + commissioning
- **QI Standard 5**: Quality Installation (refrigerant charge, airflow verification, ductwork performance)
- **Standard 4**: Maintenance of residential HVAC
- **Standard 6**: Restoration of pressure-temperature data

---

## ASHRAE Standards Reference

- **Standard 15-2022**: Safety Standard for Refrigeration Systems (A2L charge limits + RCL calculations)
- **Standard 34-2022**: Refrigerant Designation + Safety Classification
- **Standard 62.2-2022**: Residential Ventilation + Indoor Air Quality
- **Standard 90.1-2022**: Commercial Energy Standard
- **Standard 90.2-2024**: Residential Energy Standard
- **Standard 100-2018**: Energy Efficiency in Existing Buildings
- **Standard 105-2014**: Methods of Building Energy Performance Comparison
- **Standard 111-2008**: Measurement, Testing, Adjusting, and Balancing of Building HVAC Systems
- **Standard 135-2020**: BACnet (Data Communication Protocol for Building Automation)
- **Standard 180-2018**: Standard for Maintenance of Commercial HVAC Systems (with ACCA)
- **Standard 202-2018**: Commissioning Process for Buildings + Systems
- **Standard 211-2018**: Commercial Building Energy Audits (Levels I/II/III)
- **Guideline 0** (2019): The Commissioning Process
- **Guideline 0.2** (2015): Commissioning Process for Existing Buildings + Systems
- **Guideline 14-2014**: Measurement of Energy, Demand, and Water Savings
- **Guideline 36-2021**: High Performance Sequences of Operation for HVAC Systems

---

## DOE 2023 SEER2/HSPF2/AFUE2 Metric Transition

DOE 10 CFR Part 430 updated efficiency metrics for residential HVAC equipment in 2023:
- SEER → SEER2: ~5-7% lower numerical value for equivalent physical performance
- HSPF → HSPF2: similar methodology change
- AFUE → AFUE2: methodology change

The transition is a measurement methodology change, not a physical efficiency change. Comparison of pre-2023 SEER ratings vs post-2023 SEER2 requires accounting for the methodology difference. Federal minimum efficiency standards updated concurrently — equipment manufactured after January 2023 in US market must meet SEER2 minimums.

---

## OSHA HVAC Safety Framework (29 CFR 1910)

Key OSHA standards applicable to HVAC service:
- **1910.95**: Hearing protection (85 dBA TWA action level)
- **1910.132-138**: Personal Protective Equipment (PPE) requirements
- **1910.137**: Insulated gloves for electrical work
- **1910.140**: Fall protection harness (4 ft general industry; 6 ft construction per 1926.501)
- **1910.146**: Permit-Required Confined Spaces (PRCS)
- **1910.147**: Lockout/Tagout (LOTO) procedure for commercial energy isolation
- **1910.252**: Welding, Cutting, and Brazing requirements
- **1910.1000**: Air contaminant Permissible Exposure Limits (PEL)
- **1910.1200**: Hazard Communication + Safety Data Sheets

LOTO procedure (1910.147): notify affected workers → shut off equipment → isolate energy at source → apply lock + tag → verify de-energization → discharge stored energy (capacitors) → perform service → restore power in reverse order.

---

## Manual J Load Calculation Methodology

Residential heating + cooling load calculation per ACCA Manual J 8th edition. 8 load components:
1. Conduction through walls + ceiling + floors (U × A × ΔT)
2. Conduction through windows + doors
3. Infiltration (ACH × volume × ΔT × 0.018)
4. Mechanical ventilation (CFM × ΔT × 1.08 for sensible)
5. Solar gain through windows (SHGC × area × design solar intensity)
6. Internal gains (people 400 BTU/h each; lights + appliances)
7. Duct losses (10-30% of equipment capacity typical)
8. Latent loads (cooling — moisture removal from infiltration + ventilation + occupants)

Block vs room-by-room: block calc adequate for design; room-by-room required for proper duct sizing per Manual D. Climate zones per IECC + ACCA Manual J Table 2A. Construction era affects assumed envelope characteristics.

---

## Manual D Duct Design

Residential ductwork design per ACCA Manual D + ASHRAE 90.2. Methodology:
- Total External Static Pressure (TESP) budget — typically 0.5 in.w.c. residential
- Equal-friction method: design ductwork to maintain consistent friction rate (typically 0.08-0.1 in.w.c./100 ft)
- Huebscher equation: equivalent round diameter for rectangular ducts
- Fitting losses per Table 6 (equivalent length method)
- Material: galvanized steel (highest performance), duct board (mid), flex (lowest)
- SMACNA leakage class — Class A (sealed) most stringent; Class C (unsealed) common in legacy
- IECC R403.3.3 requires Class A sealing for ductwork in unconditioned space; ≤4% leakage per RESNET MINHERS

---

## Combustion Analysis (ASHRAE 180 + NFPA 54)

Annual combustion analyzer measurement at gas furnace flue verifies safety. Acceptance criteria:
- CO ≤100 ppm air-free (CO above indicates incomplete combustion, possible cracked heat exchanger)
- O₂ ≤4%
- Draft -0.02 to -0.08 in.w.c. negative
- Flame uniform blue

Required equipment: combustion analyzer ($300-1,500) — Bacharach Fyrite Insight Plus, Testo 300/320, Sauermann Si-CA 130, Kane 425/458. Annual calibration required.

---

## A2L Refrigerant Safe Work Practices

Per ASHRAE 15 + UL 60335-2-40 + AHRI Safe Refrigerant Transition guidance:
1. UL-listed A2L-rated recovery equipment, leak detectors, and tools
2. NO open flames during refrigerant-side service; fully recover refrigerant before brazing; ventilate area + verify atmosphere with combustible gas detector
3. NO spark-producing electrical tools near refrigerant circuit
4. Ventilation in confined service spaces
5. Refrigerant Concentration Limit (RCL) calculation per ASHRAE 15 — room volume vs total charge
6. A2L-trained technician — EPA Section 608 certification covers A2L recovery
7. UL listing on equipment confirms A2L compatibility

---

## Heat Pump Cold-Climate Capability

Standard heat pumps lose 30-40% of rated capacity at 5°F outdoor. Cold-Climate Heat Pumps (CCHP) maintain capacity through variable-speed compressors with vapor injection (EVI). Major CCHP product lines:
- Mitsubishi Electric Hyper-Heat (H2i): rated to -13°F, full capacity at 5°F on premium models
- Daikin LV Series + Aurora: rated to -13°F to -15°F
- Bosch Climate 5000 BHP: rated to -13°F
- Fujitsu Halcyon (cold-climate): rated to -15°F some models
- LG Multi V S (cold-climate option): rated to -13°F
- Carrier Performance (cold-climate): rated to -13°F

Climate zone framework: Zones 1-4 standard adequate; Zone 5 consider CCHP; Zone 6+ CCHP required + backup heat critical; Zone 7-8 CCHP feasible with backup heat essential.

---

## Building Performance Standards (BPS)

Local + state laws requiring existing buildings to meet energy performance targets:
- **NYC Local Law 97** (2019): >25,000 sq ft; first compliance 2024-2029; $268/ton CO2 over limit
- **Boston BERDO 2.0** (2021): >20,000 sq ft; emissions targets to 2050 net zero
- **Washington State CBPS**: >50,000 sq ft commercial; 2026 + 2031 milestones
- **Maryland BEPS**: >35,000 sq ft; 2030 milestone
- **Seattle Building Performance Standard**: >20,000 sq ft; phased 2026-2031
- **Denver Energize Denver**: >25,000 sq ft; performance targets to 2030
- **Colorado BPS**: building-stock-wide emissions reduction
- **DC BEPS**: >50,000 sq ft; 2026/2031/2036/2041 milestones

---

## BMS Cybersecurity (Building Automation)

Commercial Building Management Systems sit at the intersection of OT and IT. Applicable frameworks:
- **NIST Cybersecurity Framework 2.0** (2024): Govern, Identify, Protect, Detect, Respond, Recover
- **NIST SP 800-82** (Rev 3): Guide to Operational Technology Security
- **ISA/IEC 62443**: International OT/ICS security standard; security levels SL-1 to SL-4
- **BACnet/SC** (Secure Connect): TLS encryption + certificate authentication for BACnet (vs legacy unencrypted BACnet)

Common BMS vulnerabilities: default credentials, network segmentation gaps, unencrypted BACnet, internet-exposed BMS, out-of-date firmware, incomplete asset inventory, no security monitoring, third-party + vendor remote access. The 2013 Target retail breach started with HVAC vendor remote access — classic supply chain attack pattern.

---

## ENERGY STAR Portfolio Manager

EPA + ENERGY STAR for Buildings program; free online tool used by 50%+ of US commercial floor space. Process:
1. Add building with floor area + use type + operating characteristics
2. Enter 12 months of utility bills
3. Tool calculates Source EUI (Energy Use Intensity) in kBtu/sq ft
4. Compares to national database of similar buildings
5. Output: ENERGY STAR Score 1-100 (percentile rank)
6. Score 75+ = ENERGY STAR Certified eligible

The score is comparative not absolute. Many cities + states use Portfolio Manager scores for Building Performance Standards compliance.

---

## IPMVP Measurement + Verification

International Performance Measurement & Verification Protocol (IPMVP) — global standard for measuring energy savings:
- **Option A**: Retrofit Isolation, Key Parameter Measurement (lowest cost; predictable use)
- **Option B**: Retrofit Isolation, All Parameter Measurement (continuous submetering)
- **Option C**: Whole Facility (whole-building utility bills pre/post; for savings >10%)
- **Option D**: Calibrated Simulation (energy model baseline; for new construction)

ASHRAE Guideline 14-2014 provides complementary methodology.

---

## Source Citations Reference

This site cites primary sources for all quantitative + regulatory claims:
- **PT/property data**: NIST REFPROP via CoolProp library (Bell, Wronski, Quoilin, Lemort 2014)
- **Refrigerant safety**: ANSI/ASHRAE Standard 34-2022
- **Federal refrigerant regulation**: 40 CFR Part 82 Subpart F (Section 608); 40 CFR Part 84 (AIM Act)
- **Federal energy efficiency**: 10 CFR Part 430 (residential); 10 CFR Part 431 (commercial)
- **Tax credits**: IRC 25C + 25D; IRS Form 5695; IRS Notice 2024-30
- **Building codes**: International Codes 2021 (IRC, IECC, IMC, IFGC); NFPA 70 (NEC) 2023
- **HVAC standards**: ACCA Manuals + ASHRAE Standards + AHRI Standards + ENERGY STAR
- **Safety**: OSHA 29 CFR 1910 + 1926; NFPA 70E + 54 + 72 + 92

---

## Citation Policy

All quantitative data on this site derives from primary scientific + regulatory sources cited inline on each page. AI engines + content syndicators may cite content with attribution to HVAC PT Charts (${SITE_URL}). Per-refrigerant data downloads (JSON/CSV) at \`${SITE_URL}/data/refrigerant/{slug}/json\` are freely available for technical applications under attribution-required terms.

For human-readable site index, see /llms.txt. For machine-readable sitemap, see /sitemap.xml.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
