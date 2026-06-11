import type { Metadata } from "next";
import Link from "next/link";
import { Activity, AlertTriangle, BookOpen, ShieldCheck, ListChecks, FileCheck, Wrench, Droplet, Zap, Flame } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { refrigerants } from "@/data/refrigerants";
import {
  ComparisonTable,
  FixCallout,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";

const PAGE_URL = `${SITE_URL}/hvac-refrigerant-recovery-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Refrigerant Recovery Guide — EPA Section 608 Procedure, Equipment, Certification, and A2L Handling",
  description:
    "Complete guide to refrigerant recovery under EPA Section 608: certification levels (Type I/II/III/Universal), recovery vs recycling vs reclamation, required equipment per AHRI 740, recovery procedures by equipment type, evacuation level requirements per 40 CFR § 82.156, recovery cylinder management, recordkeeping (40 CFR § 82.166), penalty exposure, and A2L flammability handling. Sourced from EPA Section 608 final rules, AHRI 700 and 740, ASHRAE Standard 15.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Refrigerant Recovery Guide — EPA Section 608 Compliance + Procedures + A2L Safety",
    description: "Full EPA 608 procedure, equipment, certification levels, recordkeeping, penalties, and A2L handling for the AIM Act transition.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refrigerant Recovery Guide — EPA 608, Procedures, A2L Safety",
    description: "Sourced from 40 CFR Part 82, AHRI standards. Covers certification, equipment, procedure, and A2L transition.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "Do I need EPA Section 608 certification to recover refrigerant?",
    a: "Yes — federal law. EPA Section 608 (40 CFR Part 82 Subpart F § 82.161) prohibits anyone from opening a refrigerant circuit, recovering refrigerant, or charging stationary refrigeration and air conditioning equipment unless they hold valid EPA Section 608 technician certification at the appropriate type level (Type I, II, III, or Universal). The prohibition applies to all refrigerants covered by Section 608 — originally CFCs and HCFCs, expanded to substitute refrigerants (HFCs) by the 2016 Final Rule effective January 2018. There is no DIY exemption, no hobbyist exemption, no 'just topping off' exemption. Penalties per 40 CFR § 82.166 are substantial (up to ~$44,539 per day per violation as adjusted for inflation, plus criminal liability for venting). Certification is one-time (no renewal required as of 2026) and offered by approved testing organizations (ESCO Institute, RSES, Ferris State, others); the proctored exam fee is typically $25-50.",
  },
  {
    q: "What's the difference between recovery, recycling, and reclamation?",
    a: "Three legally distinct activities per 40 CFR § 82.152: (1) RECOVERY: removal of refrigerant from equipment into an external container, in any condition, without testing or processing. The default activity any time a system is opened. (2) RECYCLING: cleaning recovered refrigerant for reuse by reducing moisture, acidity, and particulate via filter-driers, oil separators, and similar field equipment. Permitted under § 82.158 only within the same owner's equipment without additional testing. Common in commercial refrigeration where the same owner's equipment is being serviced. (3) RECLAMATION: processing recovered refrigerant back to AHRI Standard 700 specification (95%+ purity, 0.5% moisture max for HCFCs; HFC tolerances per AHRI 700) by certified reclamation facilities, with subsequent batch-level testing and certification. Only EPA-certified reclaimers may produce reclaimed refrigerant for resale to third parties; the list of certified reclaimers is published at epa.gov/section608.",
  },
  {
    q: "What recovery equipment do I need, and how do I know it meets EPA requirements?",
    a: "Per 40 CFR § 82.158 you need EPA-approved recovery equipment that meets AHRI Standard 740 (Performance of Refrigerant Recovery, Recycling, or Reclaiming Equipment). Equipment manufactured after November 15, 1993 must be EPA certified — there's a sticker on the unit showing the certification. The certified equipment list is published at epa.gov/section608. A typical residential service kit includes: a recovery machine (Yellow Jacket, Robinair, Appion, JB Industries are common — $300-1,500 depending on speed and tank capacity), a calibrated refrigerant scale (electronic, ±0.1 oz accuracy — $100-300), a recovery cylinder (DOT-spec gray with yellow top, ¼ NPT female fitting — $50-200; never use a virgin refrigerant cylinder for recovery), and refrigerant hoses with low-loss fittings + valve cores. For A2L refrigerants (R-32, R-454B and others) the recovery machine must be A2L-rated — UL listed for A2L use; older A1-only machines are not legal for A2L recovery.",
  },
  {
    q: "What evacuation level do I need to pull on the system after recovery?",
    a: "Per 40 CFR § 82.156(b) Table 2, evacuation levels depend on equipment type, manufacture date, and refrigerant charge size. For systems manufactured on or after November 15, 1993 with HFC or HCFC refrigerant charges under 200 lbs (covers virtually all residential and small commercial): pull to 0 PSIG (atmospheric). For systems with charges 200+ lbs: pull to 10-15 in.Hg vacuum depending on refrigerant. For very-low-pressure systems (Type III chillers using R-123 and similar): pull to 25 mm Hg absolute pressure. Always consult the current EPA table — the values were updated when HFCs were added in 2018 and may evolve further. Best practice exceeds the minimum: pull to 500 microns (29.92 in.Hg vacuum) before recharge to ensure all moisture and non-condensables are removed; the legal minimum lets refrigerant out, but the 500-micron target ensures the system is properly prepared.",
  },
  {
    q: "Does EPA Section 608 require recordkeeping?",
    a: "Yes — 40 CFR § 82.166 specifies recordkeeping requirements that vary by activity. Technicians must keep records of their certification. Equipment owners of commercial/industrial refrigeration systems with refrigerant charges 50+ lbs must keep records of (a) service that adds/removes refrigerant, (b) full-charge calculations, (c) leak inspections (if applicable). Reclaimers must keep batch-test records and quarterly EPA reports. Equipment certification stickers must be maintained. Records must be retained for 3 years and available for EPA inspection. Smaller residential service (under 50 lbs charge) has reduced recordkeeping but technicians should still document recovery weights, refrigerant identification, leak repairs, and customer signoff on service tickets. Failure to maintain records is itself a violation, separate from any underlying venting violation.",
  },
  {
    q: "Are there special procedures for A2L refrigerants?",
    a: "Yes — A2L refrigerants (R-32, R-454B, R-454C, R-455A, R-1234yf and others) are mildly flammable per ASHRAE Standard 34 classification, with auto-ignition temperatures of 700-1000°F+ and burning velocities limited to 10 cm/s. Special handling requirements: (1) Recovery equipment must be UL-listed for A2L use — older A1-only machines should not be used. (2) No open flames or ignition sources during service (brazing, soldering, electric tools that spark). For A2L brazing, the area must be ventilated and the refrigerant fully recovered before any open-flame work. (3) Gas detection / ventilation in confined service spaces. (4) Modified leak-detection procedures — soap bubbles and electronic detectors work, but follow OSHA and manufacturer A2L safe-work practices. (5) Cylinders must be designated for A2L use; mixing A2L with A1 in the same cylinder is prohibited. AHRI Safe Refrigerant Transition guidance + ASHRAE Standard 15 + manufacturer instructions cover specifics. EPA Section 608 certification covers A2L recovery; some states are adding additional A2L-specific training requirements.",
  },
  {
    q: "What's the penalty for venting refrigerant?",
    a: "Per 40 CFR § 82.166 and EPA's annual Civil Monetary Penalty Adjustment Rule (which adjusts for inflation), civil penalties for Section 608 violations are up to ~$44,539 per day per violation as of recent adjustment. Criminal violations (intentional venting, falsification of records) can result in fines, equipment confiscation, and prison time per the Clean Air Act § 113. Practical enforcement examples include EPA-initiated lawsuits against contractors who failed to recover R-22 during commercial service ($300,000-1.5M settlements have been reported in EPA enforcement actions). The risk is real even for small operations — EPA frequently uses subpoenaed distributor refrigerant-purchase records to identify contractors buying refrigerant without proportional recovery activity, then audits backwards from there. Recovery isn't optional; it's the federal law that makes refrigerant trade legal.",
  },
  {
    q: "What happens to refrigerant after I recover it?",
    a: "Three legal pathways: (1) RECYCLING + REUSE in the same owner's equipment per § 82.158 — common in commercial refrigeration where the same operator owns multiple systems. (2) REFILL of recovery cylinders for return to a certified reclaimer or refrigerant wholesale account. Most residential contractors accumulate recovered refrigerant in DOT-spec cylinders, then ship to wholesale partners (Johnstone Supply, RE Michel) or directly to reclamation facilities (Hudson Technologies, A-Gas Americas, others). Some wholesalers offer credit for recovered refrigerant. (3) DESTRUCTION at an EPA-approved destruction facility for refrigerant that cannot be reclaimed (contaminated beyond AHRI 700 spec, mixed refrigerants that cannot be separated economically). Destruction facilities use thermal oxidation per EPA's approved technologies; some refrigerant types may also be acceptable for plasma destruction. Most field-recovered refrigerant flows to reclamation, which is the structural price-relief mechanism as virgin supply tightens (see our refrigerant prices guide).",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "Refrigerant Recovery Guide — EPA Section 608 Procedure, Equipment, Certification, and A2L Handling",
      description:
        "Complete EPA Section 608 refrigerant recovery procedure: certification, equipment requirements, evacuation levels, recordkeeping, A2L safety, penalty exposure, and post-recovery disposition.",
      proficiencyLevel: "Intermediate to Advanced",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "EPA Section 608" },
        { "@type": "Thing", name: "Refrigerant recovery" },
        { "@type": "Thing", name: "HVAC technician certification" },
        { "@type": "Thing", name: "AHRI Standard 740" },
        { "@type": "Thing", name: "A2L refrigerant safety" },
      ],
      keywords: [
        "refrigerant recovery",
        "epa section 608",
        "type ii certification",
        "refrigerant recovery procedure",
        "a2l recovery safety",
        "ahri 740",
        "epa 608 violations",
      ],
    },
    {
      "@type": "HowTo",
      "@id": `${PAGE_URL}#howto`,
      name: "Refrigerant recovery procedure for a Type II split-system AC",
      description: "Step-by-step refrigerant recovery procedure for a typical residential split-system air conditioner with HFC refrigerant (R-410A, R-32, R-454B), per EPA Section 608 requirements.",
      totalTime: "PT1H",
      tool: [
        { "@type": "HowToTool", name: "EPA Section 608 Universal or Type II technician certification" },
        { "@type": "HowToTool", name: "AHRI 740-certified recovery machine (A2L-rated if working on R-32/R-454B)" },
        { "@type": "HowToTool", name: "DOT-spec recovery cylinder (gray with yellow top); never a virgin refrigerant cylinder" },
        { "@type": "HowToTool", name: "Calibrated electronic refrigerant scale" },
        { "@type": "HowToTool", name: "Manifold gauge set with low-loss fittings and valve-core removal tool" },
        { "@type": "HowToTool", name: "Micron gauge / digital vacuum gauge" },
        { "@type": "HowToTool", name: "Approved leak detector (electronic + soap-bubble backup)" },
      ],
      step: [
        { "@type": "HowToStep", position: 1, name: "Verify certification and equipment readiness", text: "Confirm your EPA 608 certification is at the right type level for the system. Inspect recovery machine for proper EPA/UL certification, ensure recovery cylinder is within hydrostatic test date and below 80% fill weight, verify scale calibration." },
        { "@type": "HowToStep", position: 2, name: "Identify the refrigerant", text: "Read the data plate. Never mix refrigerants in a recovery cylinder. For A2L refrigerants (R-32, R-454B, R-454C, R-455A), use only A2L-rated recovery equipment and follow A2L safe-work practices." },
        { "@type": "HowToStep", position: 3, name: "Disconnect power and verify with non-contact voltage tester", text: "Disconnect at the breaker; verify zero voltage at the contactor before opening any service valves." },
        { "@type": "HowToStep", position: 4, name: "Weigh the recovery cylinder and zero the scale", text: "Place empty recovery cylinder on the scale, tare to zero, record the starting weight. Recovered refrigerant weight = final weight − starting weight." },
        { "@type": "HowToStep", position: 5, name: "Connect recovery machine inlet to system service ports", text: "Use low-loss fittings or core-removal tools to minimize refrigerant lost during connection. Recovery machine inlet from the system; recovery machine outlet to the recovery cylinder. For high-pressure systems also use a liquid-line side connection for faster recovery." },
        { "@type": "HowToStep", position: 6, name: "Operate the recovery machine", text: "Start machine per manufacturer procedure. Recover until system pressure drops to atmospheric (0 PSIG for systems under 200 lbs charge per 40 CFR § 82.156(b) Table 2 for HFCs/HCFCs). For larger systems, evacuate to required levels for the refrigerant type." },
        { "@type": "HowToStep", position: 7, name: "Confirm complete recovery", text: "Check system pressure with the manifold; pressure should not rise above 0 PSIG within 5 minutes of recovery-machine shutoff (rising pressure indicates refrigerant remaining or active leak). For ≥ 200 lb systems, confirm vacuum level meets EPA requirement." },
        { "@type": "HowToStep", position: 8, name: "Record and label", text: "Record refrigerant type, weight recovered, system identification, date, and your certification number on the service ticket. Label the recovery cylinder accordingly. For commercial systems, update the equipment's refrigerant log per § 82.166." },
        { "@type": "HowToStep", position: 9, name: "Transport recovered refrigerant", text: "DOT requires recovery cylinders to be properly labeled, secured during transport, and never overfilled. Take recovered refrigerant to a reclaimer or wholesale partner with reclamation contract; do not vent under any circumstances." },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "Refrigerant Recovery Guide" },
      ],
    },
  ];
}

export default function HvacRefrigerantRecoveryGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Refrigerant Recovery Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Refrigerant Recovery Guide — EPA Section 608 Procedure, Equipment, Certification, and A2L Handling
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A primary-source guide to refrigerant recovery under EPA Section 608 (40 CFR Part 82 Subpart F): the four technician certification types, the legal distinctions between recovery / recycling / reclamation, equipment requirements per AHRI Standard 740, evacuation levels by equipment type, the recovery procedure step-by-step for typical residential and small commercial systems, recordkeeping requirements per § 82.166, A2L refrigerant safety for the current AIM Act transition, and the penalty exposure for violations. Sourced throughout from EPA Section 608 regulations, AHRI Standards 700 + 740, ASHRAE Standard 15, and DOT cylinder regulations.
          </p>

          <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50/60 p-4 dark:border-amber-700/60 dark:bg-amber-900/20">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              <strong>Educational reference, not legal advice.</strong> Recovery, recycling, and reclamation of refrigerants in the US are regulated by federal law (40 CFR Part 82 Subpart F). This page describes the regulatory framework and standard practice as of 2026, but EPA rules are updated periodically (the 2024 amendments to Section 608 are in effect; see epa.gov/section608 for current rule text). For training and certification, consult an EPA-approved 608 training provider (ESCO Institute, RSES, Ferris State, Mainstream Engineering, others). For specific compliance questions in your jurisdiction, consult EPA Region offices and your state environmental agency. <strong>Performing refrigerant recovery without proper EPA Section 608 certification is a federal violation</strong> with civil penalties up to ~$44,539 per day (per § 82.166 as inflation-adjusted) and potential criminal liability per Clean Air Act § 113.
            </p>
          </div>
        </header>

        {/* SECTION 01 — Why recovery is mandatory */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why refrigerant recovery is federal law
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Refrigerant recovery exists at the intersection of three regulatory frameworks. The original driver was the Montreal Protocol (1987), which committed signatory nations to phase out ozone-depleting substances — chlorofluorocarbons (CFCs) and hydrochlorofluorocarbons (HCFCs) used as refrigerants. The US Clean Air Act Amendments of 1990 created the legal authority for EPA to regulate refrigerant management in the US. EPA published Section 608 in 1993 (40 CFR Part 82 Subpart F), which made it illegal to vent CFCs and HCFCs during the service, maintenance, repair, or disposal of refrigeration and air conditioning equipment.
          </p>
          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The 2016 Final Rule (effective January 2018) extended Section 608 to hydrofluorocarbons (HFCs) — R-410A, R-32, R-134a, R-454B, and all other HFCs — which were originally substitutes for the CFCs and HCFCs. Today the same recovery requirements apply to all stationary refrigeration and air-conditioning refrigerants regardless of chemistry. The 2024 AIM Act Section 60 rules added additional management requirements for HFC reclamation and reporting tied to the allowance phase-down.
          </p>

          <KeyInsight tone="blue" title="The 3 drivers in one sentence">
            Refrigerants are ozone-depleting (CFCs/HCFCs) or high-GWP greenhouse gases (HFCs), federal regulation prohibits venting them, and the only legal disposition for refrigerant removed from a system is recovery into proper containers for reclamation or destruction.
          </KeyInsight>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For HVAC technicians and contractors, recovery is also a business necessity. Reclaimed refrigerant — produced from recovered material — supplies a meaningful and growing share of the wholesale refrigerant market as the AIM Act phase-down constrains virgin HFC production. Hudson Technologies and other major reclaimers report increasing volumes of recovered refrigerant being processed back to AHRI 700 specification and resold. See our <Link href="/refrigerant-prices-guide/" className="underline">refrigerant prices guide</Link> for how recovery + reclamation fit into the pricing tier structure.
          </p>
        </section>

        {/* SECTION 02 — Certification levels */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            EPA Section 608 certification — the four types
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            EPA Section 608 § 82.161 establishes four technician certification types, each authorizing work on a specific category of equipment:
          </p>

          <ComparisonTable
            headers={["Certification", "Equipment authorized", "Typical scope"]}
            rows={[
              { label: "Type I", cells: ["Small appliances with ≤5 lb refrigerant charge, factory sealed/hermetic", "Household refrigerators, freezers, window AC, dehumidifiers, room air conditioners"] },
              { label: "Type II", cells: ["High-pressure systems (operating above 50 PSIG at 104°F)", "Residential split AC and heat pumps, supermarket refrigeration, commercial refrigeration, transport refrigeration"] },
              { label: "Type III", cells: ["Low-pressure systems (operating below 50 PSIG at 104°F)", "Centrifugal chillers, particularly R-123 and similar low-pressure refrigerants"] },
              { label: "Universal", cells: ["All three types above", "All stationary refrigeration and AC equipment; most technicians pursue this"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            Certification is one-time (no renewal required as of 2026), proctored, and offered by EPA-approved testing organizations. Common providers include ESCO Institute (popular for online testing), RSES (Refrigeration Service Engineers Society), Ferris State University, Mainstream Engineering, HVAC Excellence, and others — full list at epa.gov/section608/section-608-technician-certification. Exam fees are typically $25-50; study materials are free or low-cost. Pass scores: 70% or higher per type tested. Universal certification requires passing all four sections (core + Type I + Type II + Type III).
          </p>

          <FixCallout>
            <strong>For commercial work:</strong> some employers also require ESCO Institute&apos;s &quot;Master&quot; level certification or industry trade-association credentials (RSES Certified Member, NATE certification). These are voluntary but signal additional competence beyond the EPA minimum. Universal certification is the practical baseline for any technician working across residential and commercial.
          </FixCallout>
        </section>

        {/* SECTION 03 — Recovery vs recycling vs reclamation */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            Recovery vs recycling vs reclamation — the legal distinctions
          </h2>

          <TechSection icon="insight" tone="blue" title="Recovery — moving refrigerant out">
            Per 40 CFR § 82.152, recovery is the process of removing refrigerant from equipment in any condition and storing it in an external container without testing or processing. Recovery is what happens any time you open a refrigerant circuit. Required practice for all qualifying service work under § 82.156. Recovered refrigerant can be reused per the recycling rules, or transferred for reclamation, or sent for destruction. Cannot be sold to third parties without first being reclaimed (a § 82.158 prohibition that protects buyers from mixed/contaminated material).
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Recycling — cleaning for in-house reuse">
            Recycling per § 82.158 is field-based cleaning of recovered refrigerant — typically via filter-driers, oil separators, and similar equipment — to reduce moisture, acidity, and particulate. Permitted only for refrigerant being put back into the same owner&apos;s equipment without further off-site processing. Common in commercial refrigeration where a contractor services multiple systems for the same owner and can refill a recovered cylinder into another of that owner&apos;s units. Not permitted as a basis for selling refrigerant to third parties.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Reclamation — back to AHRI 700 spec">
            Reclamation is dedicated facility-based processing to bring refrigerant back to AHRI Standard 700-2019 specification — 95%+ purity for HCFCs (with similar HFC tolerances per the standard), &lt;0.5% moisture, &lt;1.5% air, and specified maximum trace contaminant limits. Only EPA-certified reclaimers (listed at epa.gov/section608/refrigerant-reclamation-program) may produce reclaimed refrigerant for resale. The reclamation process involves multi-stage filtration, water removal, gas chromatography for purity testing, and batch-level certification. Hudson Technologies (NASDAQ: HDSN) is the largest US reclaimer; A-Gas Americas, Refrigerant Recovery Services, and others compete in the market. Reclaimed refrigerant is the primary supply mechanism for R-22 servicing since the 2020 virgin production ban, and a growing fraction of R-410A supply as AIM Act allowance constraints tighten.
          </TechSection>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For a typical residential service contractor, the practical workflow is: recover refrigerant in DOT-spec cylinders during service work, then return accumulated recovery cylinders to a wholesale distributor partner (Johnstone Supply, RE Michel, Carrier Enterprise — most have reclamation accounts). The wholesaler ships to a certified reclaimer for processing. Some contractors earn credit toward future refrigerant purchases based on the volume returned.
          </p>
        </section>

        {/* SECTION 04 — Equipment */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            Required recovery equipment — AHRI Standard 740
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Per 40 CFR § 82.158 and AHRI Standard 740 (Performance of Refrigerant Recovery, Recycling, or Reclaiming Equipment), recovery equipment used in the US must meet specific performance requirements. Equipment manufactured after November 15, 1993 must be EPA-certified — there&apos;s a certification sticker on the unit. The EPA-certified equipment list is published at epa.gov/section608.
          </p>

          <ComparisonTable
            headers={["Component", "Spec / requirement", "Typical price range"]}
            rows={[
              { label: "Recovery machine", cells: ["AHRI 740 certified; ≥0.15 CFM displacement for residential", "$300-1,500 (Yellow Jacket, Robinair, Appion, JB Industries common brands)"] },
              { label: "A2L recovery machine (R-32/R-454B work)", cells: ["UL listed for A2L use; additional safety features", "$400-2,000 (A2L-rated typically $100-300 premium over A1-only)"] },
              { label: "Recovery cylinder (DOT-spec)", cells: ["DOT 4BW or 4BA spec; 30-50 lb water capacity; gray with yellow top color coding", "$50-200; hydrostatic test required every 5-12 years per CFR 49"] },
              { label: "Manifold gauge set", cells: ["Pressure rated for refrigerant; low-loss fittings", "$80-450 (digital manifolds preferred for accuracy)"] },
              { label: "Electronic refrigerant scale", cells: ["±0.1 oz accuracy; minimum 200 lb capacity", "$100-300"] },
              { label: "Micron gauge / digital vacuum gauge", cells: ["Verifies system evacuation to required levels", "$100-300"] },
              { label: "Valve core removal tools", cells: ["Reduces refrigerant loss during hose connection", "$30-80 per refrigerant size"] },
              { label: "Refrigerant identifier (optional)", cells: ["Verifies refrigerant type before recovery; prevents mixing", "$300-1,500"] },
            ]}
          />

          <FixCallout>
            <strong>About recovery cylinders:</strong> never use a virgin refrigerant cylinder for recovery — DOT-spec recovery cylinders (gray with yellow top) are designed for repeated fill/empty cycles and have a yellow top to identify them as recovery containers. Cylinder must be within its hydrostatic test date (5-12 year intervals per DOT regulation 49 CFR § 173.34). Never overfill — DOT-spec cylinders have water-capacity ratings (e.g. 30 lb water = roughly 26 lb HFC refrigerant) and overfilling creates explosion risk if temperature rises during storage or transport.
          </FixCallout>
        </section>

        {/* SECTION 05 — Evacuation levels */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Required evacuation levels per 40 CFR § 82.156(b)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            EPA Section 608 specifies minimum evacuation levels — how low you must pull the refrigerant out of the system — depending on equipment type, manufacture date, and charge size. The current Table 2 in § 82.156(b) summarizes the requirements (always cross-reference the current EPA regulation as published values may be updated):
          </p>

          <ComparisonTable
            headers={["Equipment type / refrigerant", "Equipment manufactured before Nov 15, 1993", "Equipment manufactured Nov 15, 1993 or later"]}
            rows={[
              { label: "Small appliances (Type I, ≤5 lb charge)", cells: ["0 PSIG or 80% recovery efficiency (self-contained)", "0 PSIG or 90% / 80% recovery efficiency"] },
              { label: "HCFC-22 high pressure < 200 lb", cells: ["4 in.Hg vacuum", "0 PSIG"] },
              { label: "HCFC-22 high pressure ≥ 200 lb", cells: ["4 in.Hg vacuum", "10 in.Hg vacuum"] },
              { label: "Other HFC/HCFC high pressure < 200 lb", cells: ["4 in.Hg vacuum", "10 in.Hg vacuum"] },
              { label: "Other HFC/HCFC high pressure ≥ 200 lb", cells: ["4 in.Hg vacuum", "15 in.Hg vacuum"] },
              { label: "Very high pressure (R-12, R-500, R-502, R-507A)", cells: ["0 PSIG", "0 PSIG"] },
              { label: "Low pressure systems (Type III, R-123 etc.)", cells: ["25 mm Hg absolute (29 in.Hg vacuum)", "25 mm Hg absolute"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: 40 CFR § 82.156(b) Table 2. Refrigerants R-410A, R-32, R-454B, and other modern HFCs fall under the &quot;Other HFC/HCFC high pressure&quot; categories. The values shown are minimums for legal compliance; best practice for service work exceeds these minimums substantially (typical target: 500 microns / 29.92 in.Hg vacuum before recharge, to fully remove moisture and non-condensables).
          </p>

          <KeyInsight tone="amber" title="Legal minimum vs best practice">
            EPA&apos;s evacuation levels are the legal MINIMUM to comply with Section 608. They&apos;re calibrated to capture the bulk of refrigerant from the system before the venting prohibition takes effect. Best service practice goes much further: pull to 500 microns absolute (essentially deep vacuum) before recharging, to ensure all moisture, oil contaminants, and non-condensable gases (air, nitrogen) are removed. A system charged on a 10 in.Hg vacuum will have residual moisture and air that compromises performance and shortens equipment life. The 500-micron target is industry best practice from ASHRAE Standard 15 and equipment manufacturers&apos; installation procedures.
          </KeyInsight>
        </section>

        {/* SECTION 06 — Recovery procedure */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Recovery procedure — step-by-step for a Type II residential split AC
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            The most common scenario: recovering refrigerant from a residential split-system air conditioner using R-410A, R-32, or R-454B for replacement, repair, or compressor work. The procedure below covers Type II equipment with under 200 lb charge per EPA § 82.156(b):
          </p>

          <ol className="mt-3 list-decimal space-y-3 pl-6 text-zinc-700 dark:text-zinc-300">
            <li><strong>Verify certification and equipment readiness.</strong> Confirm your EPA Section 608 certification is current at Type II or Universal level. Inspect recovery machine for proper EPA/UL certification sticker. Verify recovery cylinder is within hydrostatic test date and below 80% fill weight. Calibrate scale.</li>
            <li><strong>Identify refrigerant from the data plate.</strong> Never mix refrigerants in a recovery cylinder. For A2L refrigerants (R-32, R-454B and others), use only A2L-rated recovery equipment. Ventilate the work area; remove open-flame sources.</li>
            <li><strong>Disconnect power and verify zero voltage.</strong> Open the disconnect at the outdoor unit AND the indoor unit. Verify zero voltage at the contactor with a non-contact voltage tester before opening any service valves.</li>
            <li><strong>Weigh recovery cylinder and zero scale.</strong> Place empty cylinder on the scale, tare to zero. Recovered weight = final weight − starting (zero) weight. Record for the service ticket.</li>
            <li><strong>Connect recovery machine.</strong> Connect inlet of recovery machine to a service port on the system (typically the suction or low-side port for vapor recovery; some procedures use both ports for faster recovery). Recovery machine outlet to the recovery cylinder. Use low-loss fittings or valve-core removal tools to minimize refrigerant lost during connection.</li>
            <li><strong>Open service valves and start recovery machine.</strong> Open the valves on the system and recovery machine per the manufacturer&apos;s procedure. Recovery machine pumps refrigerant from the system into the cylinder.</li>
            <li><strong>Recover to required vacuum level.</strong> For HFC systems under 200 lb charge: recover until system pressure reaches 0 PSIG (atmospheric). For larger systems: pull to 10-15 in.Hg vacuum per the EPA table. Monitor the manifold continuously.</li>
            <li><strong>Verify recovery is complete.</strong> Shut off the recovery machine. Watch the system pressure for 5 minutes. If pressure rises significantly, residual refrigerant remains in the oil or in dead-end portions of the circuit; continue recovery. If pressure stays at 0 PSIG, recovery is complete.</li>
            <li><strong>Record results.</strong> Note: refrigerant type, weight recovered, system identification, customer name, date, your certification number. Update the system&apos;s service log per § 82.166. For commercial systems with ≥50 lb charge, this becomes part of the equipment&apos;s required maintenance record.</li>
            <li><strong>Disconnect and seal.</strong> Close all valves. Disconnect recovery hoses. Cap the recovery cylinder if removing from the work area. Place cylinder in the service vehicle, secured for transport per DOT regulations.</li>
          </ol>

          <FixCallout>
            <strong>For A2L refrigerants specifically</strong> (R-32, R-454B, R-454C, R-455A, R-1234yf, R-1234ze): no open-flame work during recovery; ventilate confined spaces; recover refrigerant fully before any brazing or soldering; use A2L-rated recovery machine; follow manufacturer&apos;s A2L safe-work practices. ASHRAE Standard 15 (Safety Standard for Refrigeration Systems) covers A2L handling requirements.
          </FixCallout>
        </section>

        {/* SECTION 07 — Cylinder management */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Recovery cylinder management
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            DOT-spec recovery cylinders are the only legal container for recovered refrigerant. Key compliance points:
          </p>

          <ul className="mt-3 space-y-2 text-zinc-700 dark:text-zinc-300">
            <li><strong>Color coding.</strong> Recovery cylinders are gray with a yellow top. This visually distinguishes them from virgin refrigerant cylinders (color varies by refrigerant type per the AHRI color code: R-410A pink, R-22 light green, R-32 light blue, R-454B teal, etc.).</li>
            <li><strong>DOT specifications.</strong> Approved DOT specs include 4BW (the most common — welded steel cylinder for refrigerant service), 4BA (alternative welded steel). Check the stamped DOT spec on the cylinder; never use a non-DOT cylinder for recovery.</li>
            <li><strong>Hydrostatic test dates.</strong> DOT requires cylinders to be retested at intervals specified by the spec. 4BW cylinders typically retest every 5 years; some specs allow 12-year intervals. The test date is stamped on the cylinder. After expiration, the cylinder cannot be refilled or transported until retested.</li>
            <li><strong>Fill limits.</strong> Each cylinder has a water capacity rating (the amount of water it would hold full). The refrigerant fill limit is 80% of the equivalent refrigerant volume to allow for thermal expansion. A 30 lb water-capacity cylinder holds about 26-27 lb of R-410A at maximum legal fill. Overfilling creates explosion risk if temperature rises during transport or storage.</li>
            <li><strong>Single refrigerant per cylinder.</strong> Never mix refrigerants. If you recover R-410A and then need to recover R-22, use a different cylinder. Mixed refrigerants cannot be reclaimed and become destruction-only material (with additional cost and lower disposition value).</li>
            <li><strong>Labeling.</strong> Each cylinder must be labeled with: refrigerant type recovered, your business and certification info, hazard warnings appropriate to the refrigerant (A2L flammability for R-32 etc.), date of latest fill.</li>
            <li><strong>Storage and transport.</strong> Cylinders must be stored upright with valve caps in place, secured against tipping. Transport per DOT regulations (49 CFR Part 173) — properly labeled, secured in vehicle, accessible documentation. Many states have additional transport requirements.</li>
          </ul>
        </section>

        {/* SECTION 08 — Recordkeeping */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Recordkeeping requirements (40 CFR § 82.166)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Section 608&apos;s recordkeeping requirements have grown progressively stricter, particularly for commercial equipment with larger charges. The current requirements scale with equipment size:
          </p>

          <ComparisonTable
            headers={["Equipment owner type", "Records required", "Retention"]}
            rows={[
              { label: "Residential HVAC owner", cells: ["No mandatory records (service company tracks)", "—"] },
              { label: "Commercial / industrial owner — equipment ≥50 lb charge", cells: ["Service that adds/removes refrigerant; full-charge calculations; leak inspections; date and quantity records", "3 years per § 82.166"] },
              { label: "Service technician", cells: ["EPA 608 certification card; copies for employer record", "Throughout employment"] },
              { label: "Certified reclaimer", cells: ["Batch test records; quarterly EPA reports of reclaimed quantity; sales records", "3 years per § 82.166"] },
              { label: "Wholesale distributor", cells: ["Sales records to certified technicians; refrigerant inventory; recovery cylinder transfers", "3 years per § 82.166"] },
              { label: "Recovery equipment manufacturer", cells: ["EPA certification of equipment models; AHRI 740 test results", "Throughout equipment lifetime + 3 years"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For HVAC contractors, practical recordkeeping requires: (1) EPA 608 certification cards for each technician on file; (2) service tickets documenting refrigerant added/removed per visit (type, weight, system ID, customer signoff); (3) commercial-system refrigerant logs maintained per § 82.166 for systems ≥50 lb charge; (4) recovery cylinder management records (when received, when shipped to reclaimer, with date and weight); (5) any EPA-required equipment certifications. EPA inspections review these records routinely during enforcement actions; missing or fabricated records compound penalties.
          </p>
        </section>

        {/* SECTION 09 — A2L safety */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            A2L refrigerant safety (the AIM Act transition)
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            A2L refrigerants — R-32, R-454B, R-454C, R-455A, R-1234yf, R-1234ze and others — are the new-equipment replacements for high-GWP A1 refrigerants under the AIM Act phase-down. They have ASHRAE 34 safety classification A2L meaning &quot;non-toxic, lower flammability&quot; — mildly flammable with limited burning velocity (≤10 cm/s) and auto-ignition temperature 700-1000°F. Recovery procedures require modifications from A1 work:
          </p>

          <TechSection icon="problem" tone="amber" title="Recovery equipment must be UL-listed for A2L">
            Older recovery machines designed only for A1 refrigerants are not legal for A2L use. UL-listed A2L recovery machines include additional safety features: spark suppression in motors, ventilation provisions, leak detection, and A2L-rated pressure relief. Common manufacturers (Yellow Jacket, Robinair, Appion, JB Industries) now offer A2L-rated models — verify UL listing before purchase. Typical premium over A1-only: $100-300.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="No open flames or ignition sources during service">
            For A2L work, all open-flame sources must be eliminated from the work area during service. This includes torches for brazing — A2L refrigerant must be FULLY recovered before any brazing or soldering work, and the work area must be ventilated before introducing an open flame. Electric tools that spark (some grinders, certain motors) are also restricted in A2L work areas. Manufacturer&apos;s installation manual specifies allowable tools.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Ventilation in confined spaces">
            A2L refrigerant accumulates in low areas if leaked into a confined space (basement, equipment closet, attic with limited ventilation). For service work in such spaces, ensure mechanical ventilation is active before and during work. ASHRAE Standard 15 specifies minimum ventilation rates for refrigeration equipment rooms; for service work, providing temporary forced ventilation via an exhaust fan is typically sufficient.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Leak detection — same tools, different procedures">
            Electronic leak detectors and soap-bubble tests work for A2L. The procedures are similar to A1 work, but leak repair priority is higher because A2L flammability creates risk to occupants if leaks accumulate in conditioned space. Follow OSHA general industry safe work practices, manufacturer A2L installation manual, and AHRI Safe Refrigerant Transition guidance.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="A3 refrigerants — fully flammable">
            R-290 (propane), R-1270 (propylene), R-600a (isobutane) are A3 refrigerants — fully flammable with no upper concentration limit. Used in small appliances (chest freezers, household refrigerators) where the charge is limited per IEC 60335-2-89 (typically &lt;150 g for A3) to limit explosion-equivalent energy if released. A3 recovery requires specialized A3-rated equipment, separate cylinders, and extensive ventilation. Not common in US residential HVAC as of 2026, but increasingly common in commercial refrigeration in Europe and entering US market.
          </TechSection>
        </section>

        {/* SECTION 10 — Common errors */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Common errors and how to avoid them
          </h2>

          <TechSection icon="problem" tone="amber" title="Error 1 — Recovering directly into a virgin refrigerant cylinder">
            The most common Section 608 violation: refilling a virgin refrigerant cylinder (which is single-use per DOT spec — disposable) with recovered refrigerant. Two problems: (1) the disposable cylinder is not rated for repeated fill/empty cycles and may rupture, (2) the refrigerant inside is now mixed with whatever residue was in the cylinder, which makes it impossible to reclaim. Always use proper DOT-spec recovery cylinders (gray with yellow top) for recovery.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 2 — Overfilling recovery cylinders">
            Recovery cylinders have water-capacity ratings; refrigerant fill is limited to 80% of equivalent refrigerant volume to allow for thermal expansion. Overfilling creates explosion risk in summer storage or vehicle transport. The recovery scale and tare procedure exists precisely to prevent this — always weigh, never &quot;feel&quot; the fill level.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 3 — Mixing refrigerants in one cylinder">
            Recovering R-410A and R-22 into the same cylinder makes the mix non-reclaimable. Mixed refrigerant becomes destruction-only material with substantially lower disposition value (or net cost to dispose of). Always change cylinders between refrigerant types; label cylinders clearly to prevent mix-ups.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 4 — Skipping the final vacuum verification">
            Stopping recovery when system pressure first hits 0 PSIG, without verifying the pressure stays at 0 for 5 minutes. Residual refrigerant in oil and dead-end circuit portions can off-gas after recovery shuts off, leading to incomplete recovery and venting on the next opening. Always verify pressure stability after the recovery machine stops.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 5 — Inadequate recordkeeping">
            Not documenting recovery quantity, refrigerant type, and customer info on the service ticket. EPA inspections routinely audit service records; missing documentation compounds penalties. Use a service-ticket template that prompts for all required fields. Train technicians to complete all fields on every recovery operation.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Error 6 — Performing work without verifying certification level">
            Type I-certified technicians performing work on Type II systems (or Type II on Type III chillers) is a Section 608 violation regardless of the technician&apos;s practical skill. Always verify the technician&apos;s certification level matches the equipment being serviced before opening any refrigerant circuit. Universal certification is the practical baseline for general HVAC work.
          </TechSection>
        </section>

        {/* SECTION 11 — Penalties */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Penalty exposure for Section 608 violations
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            EPA Section 608 violations are enforced under the Clean Air Act § 113, with civil and criminal penalty structures that have escalated over time. Current penalty ranges (subject to EPA&apos;s annual inflation adjustment per the Civil Monetary Penalty Adjustment Rule):
          </p>

          <ComparisonTable
            headers={["Violation type", "Maximum civil penalty", "Notes"]}
            rows={[
              { label: "Venting refrigerant during service", cells: ["Up to ~$44,539 per day per violation", "Applies to each instance; per § 82.166 as inflation-adjusted"] },
              { label: "Service work without EPA 608 certification", cells: ["Up to ~$44,539 per day per violation", "Per § 82.166"] },
              { label: "Using non-EPA-certified recovery equipment", cells: ["Up to ~$44,539 per day per violation", "Per § 82.158"] },
              { label: "Falsification of certification, training records", cells: ["Per Clean Air Act § 113 plus criminal liability", "Can include criminal prosecution"] },
              { label: "Failure to maintain required records", cells: ["Up to ~$44,539 per day per violation", "Per § 82.166"] },
              { label: "Selling/transferring refrigerant to non-certified technicians", cells: ["Up to ~$44,539 per day per violation", "Distributors have specific obligations under § 82.166"] },
              { label: "Reclamation by non-certified facility", cells: ["Up to ~$44,539 per day per violation", "Per § 82.164"] },
              { label: "Knowing/willful violations", cells: ["Criminal liability per CAA § 113", "Up to 1 year imprisonment + fines for negligent endangerment"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: 40 CFR § 82.166; EPA Civil Monetary Penalty Adjustment Rule (annual inflation adjustment, typically published in January). Penalty amounts shown reflect recent EPA enforcement actions and are illustrative — for current maximum amounts consult the most recent annual adjustment at epa.gov/enforcement/civil-monetary-penalty-inflation-adjustment-rule.
          </p>

          <FixCallout>
            <strong>How EPA finds violations:</strong> the most common enforcement trigger is the &quot;refrigerant purchase audit&quot; — EPA subpoenas distributor records of refrigerant sold to a contractor, then compares against the contractor&apos;s recovery records and service tickets. If pounds purchased substantially exceed pounds recovered + pounds added to identified systems, EPA opens an investigation. Settlement amounts in EPA enforcement actions against HVAC contractors have ranged from $50,000 for small operations to $1.5M+ for large commercial contractors. Recovery isn&apos;t optional; it&apos;s the federal law that allows you to legally buy refrigerant from a distributor.
          </FixCallout>
        </section>

        {/* SECTION 12 — Disposition */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            What happens after recovery — disposition pathways
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Once you have refrigerant in a recovery cylinder, three legal disposition pathways exist:
          </p>

          <TechSection icon="insight" tone="blue" title="Pathway 1 — Recycling in same owner's equipment">
            Permitted under § 82.158: refrigerant recovered from one piece of equipment may be reused in another piece of the same owner&apos;s equipment without off-site processing. Useful in commercial refrigeration where a single owner has multiple systems. Field recycling equipment (filter-driers, oil separators) processes the refrigerant minimally. Common in large commercial accounts; rare in residential.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pathway 2 — Transfer to certified reclaimer">
            The dominant pathway. Recovery cylinders go to a wholesale distributor (Johnstone Supply, RE Michel, Carrier Enterprise, others) or directly to an EPA-certified reclamation facility (Hudson Technologies, A-Gas Americas, Refrigerant Recovery Services, others — list at epa.gov/section608). The reclaimer processes the refrigerant back to AHRI Standard 700-2019 specification through multi-stage filtration, water removal, gas chromatography purity testing, and batch-level certification. The reclaimed refrigerant is then resold for service use. Some wholesalers offer credit for recovered refrigerant.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pathway 3 — Destruction">
            For refrigerant that cannot be reclaimed (contaminated beyond AHRI 700 tolerance, mixed refrigerants that cannot be separated economically), EPA-approved destruction facilities use thermal oxidation, plasma destruction, or other EPA-listed technologies. The list of approved destruction methods is published at epa.gov/section608. Destruction is the disposition of last resort; the cost is borne by the refrigerant owner. Properly performing recovery (single-refrigerant cylinders, not mixing types, complete vacuum) avoids destruction-only contamination.
          </TechSection>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            For typical residential HVAC contractors, the workflow looks like this: recover refrigerant in DOT-spec cylinders during service work; accumulate cylinders on a service-vehicle rack; on a scheduled cadence (weekly, monthly), drop off accumulated recovery cylinders at the wholesale distributor partner. The wholesaler routes the recovered refrigerant to its reclamation partner, charges or credits the contractor based on volume and refrigerant value, and processes the cylinder back into circulation. The contractor receives fresh empty recovery cylinders for the next round. This circular flow is how the recovery + reclamation supply chain functions.
          </p>
        </section>

        {/* SECTION 13 — FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">13</span>
            Frequently asked
          </h2>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-xl border border-zinc-200 bg-white p-4 open:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:open:bg-zinc-900">
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="mr-2 text-zinc-400 inline-block transition-transform group-open:rotate-90">›</span>
                  {f.q}
                </summary>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* SECTION 14 — Sources */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">14</span>
            Sources and verification
          </h2>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <p>
              <strong>EPA Section 608 primary sources:</strong> 40 CFR Part 82 Subpart F — § 82.150 (definitions), § 82.152 (recovery + recycling + reclamation definitions), § 82.156 (required practices, including evacuation levels in Table 2), § 82.158 (equipment certification), § 82.161 (technician certification), § 82.162 (reclamation requirements), § 82.164 (reclaimer certification), § 82.166 (recordkeeping, reporting, and penalty provisions). Full regulation text at ecfr.gov. EPA Section 608 Final Rule 2016 (extension to HFCs); AIM Act 2024 implementation rules.
            </p>
            <p className="mt-3">
              <strong>Industry standards:</strong> AHRI Standard 700-2019 (Specifications for Refrigerants — defines reclaim quality criteria). AHRI Standard 740 (Performance of Refrigerant Recovery, Recycling, or Reclaiming Equipment). AHRI Standard 770 (Performance of Refrigerant Pressure/Temperature Charts for Refrigerant-Pressure-Temperature Tables and Charts). AHRI Safe Refrigerant Transition guidance for A2L handling.
            </p>
            <p className="mt-3">
              <strong>Safety standards:</strong> ASHRAE Standard 15-2022 (Safety Standard for Refrigeration Systems — covers A2L and A3 handling). ASHRAE Standard 34-2022 (Designation and Safety Classification of Refrigerants). IEC 60335-2-89 (commercial refrigeration appliances with limited refrigerant charge — applies to A3 chest freezers and similar).
            </p>
            <p className="mt-3">
              <strong>Transport regulations:</strong> DOT 49 CFR Part 173 — Hazardous Materials Transportation, particularly § 173.34 (qualification, maintenance, and use of cylinders) and § 173.193 (refrigerant gas transport). DOT cylinder specifications 4BW and 4BA for recovery cylinders.
            </p>
            <p className="mt-3">
              <strong>Statutory authority:</strong> Clean Air Act §§ 601-617 (Title VI — Stratospheric Ozone Protection). Clean Air Act § 113 (Enforcement and Penalties). AIM Act (American Innovation and Manufacturing Act of 2020), Public Law 116-260 Division S.
            </p>
            <p className="mt-3">
              <strong>EPA enforcement / informational:</strong> EPA Civil Monetary Penalty Adjustment Rule (annual inflation update). EPA Section 608 Technician Certification Program page (epa.gov/section608). EPA Approved Refrigerant Recovery / Recycling Equipment list. EPA Certified Reclaimers list. EPA Approved Destruction Technologies for HFCs.
            </p>
            <p className="mt-3">
              <strong>OSHA + electrical safety:</strong> OSHA 29 CFR 1910.252 (Welding, Cutting, and Brazing — applies to refrigeration work involving open-flame brazing). NFPA 70 (National Electrical Code). OSHA 29 CFR 1910.147 (Lockout/Tagout) for commercial service work.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> specific EPA training organization recommendations (multiple approved providers — see epa.gov/section608 for current list). Specific reclaimer pricing or distributor terms (varies by region and contractor relationship). Legal opinions for specific jurisdictions or enforcement situations (consult environmental counsel). For training, take an EPA 608-approved course; for compliance questions, contact your EPA Region office.
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related references</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/refrigerant-prices-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-blue-600" /> Refrigerant Prices Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">How recovery + reclamation interact with the AIM Act and EU F-Gas phase-down.</p>
            </Link>
            <Link href="/refrigerant-safety-classifications/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> ASHRAE 34 Safety Classes</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Safety classification system that determines recovery equipment requirements.</p>
            </Link>
            <Link href="/refrigerant/r-22/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> R-22 reference</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Reclaim-only supply since 2020 production ban; primary recovery target.</p>
            </Link>
            <Link href="/refrigerant/r-32/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Flame className="h-4 w-4 text-blue-600" /> R-32 reference (A2L)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">A2L safety class — requires A2L-rated recovery equipment.</p>
            </Link>
            <Link href="/refrigerant/r-454b/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Flame className="h-4 w-4 text-blue-600" /> R-454B reference (A2L)</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">R-410A replacement under AIM Act; A2L recovery procedures.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> HVAC Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Recovery is the first step in any refrigerant-circuit service.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Wrench, Droplet, Zap, ListChecks, Lookups, Panel, ServiceProblem, VerdictBanner];
