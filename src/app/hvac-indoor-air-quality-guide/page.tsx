import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Wind, Droplet, AlertTriangle, ShieldCheck, ListChecks, FileCheck, Filter, Thermometer, Gauge, Sun } from "lucide-react";
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
import { BarChart } from "@/components/svg/concepts/BarChart";
import { ProcessFlow } from "@/components/svg/concepts/ProcessFlow";

const PAGE_URL = `${SITE_URL}/hvac-indoor-air-quality-guide/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Indoor Air Quality Guide — Pollutants, ASHRAE 62.2 Ventilation, MERV/HEPA Filtration, Humidity & Radon Control",
  description:
    "Complete residential indoor air quality guide: the 5 pollutant categories (particulate, gaseous, biological, biocidal, thermal), the 3-pillar IAQ strategy (source control + ventilation + filtration), ASHRAE 62.2 mechanical ventilation requirements, MERV vs HEPA vs alternative filtration, humidity control for IAQ, radon testing and mitigation per EPA protocol, mold prevention, CO life safety, indoor air monitoring, wildfire smoke and COVID-era IAQ considerations, code requirements, and common IAQ misconceptions. Sourced from ASHRAE Standards 62.2 + 52.2, EPA Indoor Air Quality programs, CDC + WHO guidance, IRC 2021 + IECC 2021, OSHA exposure limits.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Indoor Air Quality Guide — Pollutants + ASHRAE 62.2 + Filtration + Humidity + Radon",
    description: "Complete IAQ methodology: source control, ventilation, filtration, humidity, radon, mold, CO. ASHRAE 62.2 + EPA sourcing throughout.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Indoor Air Quality Guide — Pollutants, Ventilation, Filtration",
    description: "ASHRAE 62.2 + EPA + CDC sourced IAQ methodology.",
    images: ["/twitter-image"],
  },
};

const FAQS = [
  {
    q: "What's the most effective single thing I can do to improve my indoor air quality?",
    a: "Source control — eliminate or reduce pollutant emissions at the source rather than trying to filter them out after release. The IAQ hierarchy per EPA: (1) Source control (most effective; eliminates the pollutant), (2) Ventilation (dilutes pollutants with outdoor air), (3) Filtration (removes pollutants after release). Examples of source control: switch from gas to electric cooking (eliminates NO₂ + ultrafine combustion particles); store paints, solvents, and cleaning products outside the conditioned envelope (eliminates VOC emissions); seal radon entry points (eliminates radon ingress); fix moisture sources (eliminates mold growth substrate); use low-VOC building materials (eliminates formaldehyde and other emissions). Source control reduces pollutant load by 70-95% in typical residential; ventilation + filtration handle the remaining 5-30% that can&apos;t be eliminated at source. Trying to filter your way to clean air without addressing sources is fighting a losing battle.",
  },
  {
    q: "Do I need an air purifier?",
    a: "Probably not, if you have a properly-sized HVAC system with MERV 13+ filtration and ASHRAE 62.2-compliant mechanical ventilation. The HVAC system moves and filters far more air than any portable purifier — typical 2,000 sq ft home circulates 800-1,200 CFM through the central filter vs 200-400 CFM through a typical portable unit. Portable air cleaners are useful for: (a) supplementing HVAC filtration in a specific room (bedroom, home office); (b) handling acute episodes (wildfire smoke, contractor work releasing dust); (c) homes where HVAC filter housing can&apos;t accommodate MERV 13+ without static pressure problems; (d) homes with allergic or immunocompromised occupants needing extra capacity in high-occupancy rooms. Look for AHAM CADR rating (Clean Air Delivery Rate) appropriate for the room size; HEPA-class filtration; ozone-free designs. Avoid ionizers and ozone generators — both produce byproducts (ozone, ultrafine particles) that worsen IAQ rather than improving it. EPA explicitly warns against ozone generators sold as air purifiers.",
  },
  {
    q: "What MERV rating do I really need?",
    a: "MERV 13 is the post-2020 baseline for households where IAQ matters (households with children, allergies, asthma, immune sensitivity, pets, or smoking near the home). MERV 13 captures 90%+ of particles 0.3-1.0 μm — the size range that includes most viral and bacterial aerosols, fine smoke particles, and ultrafine combustion products. CDC explicitly recommends MERV 13 minimum for respiratory illness prevention in occupied spaces. ASHRAE Standard 52.2 specifies the test methodology. The catch: MERV 13 in a 1-inch filter slot adds 0.10-0.15 in.w.c. of pressure drop at typical residential airflow — beyond what some systems can handle without losing significant CFM. Solution: install a 4-5 inch deep-pleated filter housing (significantly more filter area = lower face velocity = lower pressure drop for the same MERV). A 4-inch MERV 13 typically has the same pressure drop as a 1-inch MERV 8. For homes without IAQ-sensitive occupants and standard residential exposure, MERV 8 is the practical minimum and adequately protects HVAC equipment.",
  },
  {
    q: "Is ASHRAE 62.2 mechanical ventilation actually necessary?",
    a: "Required by IRC 2021 Section M1505 in most US jurisdictions for new residential construction. Required by ENERGY STAR Single-Family New Homes program. Required by Passive House certification. The technical argument: tight modern construction (≤3 ACH50 per IECC R402.4.1.2) reduces natural infiltration to roughly 0.15-0.25 ACH natural — well below the air-quality threshold for typical residential occupancy. ASHRAE 62.2 specifies the minimum mechanical ventilation rate to maintain acceptable IAQ in tight construction: typically 7.5 CFM per occupant + 3 CFM per 100 ft² of conditioned floor area (total continuous ventilation). For a 2,000 sq ft home with 4 occupants: 7.5×4 + 3×20 = 90 CFM continuous outdoor air. This is delivered via bathroom exhaust fans running continuously, a separate exhaust-only ventilation fan, or a balanced ERV/HRV system. Without ASHRAE 62.2 mechanical ventilation in a tight home, indoor CO₂ regularly exceeds 1,500-2,000 ppm during occupied hours, indoor VOCs accumulate from construction materials and household products, and humidity control becomes problematic.",
  },
  {
    q: "Does my house need a radon test?",
    a: "Yes — EPA recommends every home be tested for radon, regardless of age, location, or construction type. Radon (a naturally-occurring radioactive gas) is the second-leading cause of lung cancer in the US after smoking per EPA and CDC estimates. Radon enters homes through foundation cracks, crawlspaces, and well water. Levels vary widely by home — neighbors can have very different readings. EPA action level: 4.0 pCi/L; recommended action above 2.0 pCi/L; no &quot;safe&quot; level (lower is better). Testing: short-term (2-90 days, $15-50 DIY kit from hardware store) for initial screening; long-term (90+ days, $30-100) for accurate baseline. Continuous monitors ($150-300) provide ongoing measurement and are increasingly recommended for high-radon-zone homes. Mitigation if elevated: typically sub-slab depressurization (vent under the slab to outside via a fan); cost $1,000-3,000 installed; reduces radon 50-95%. EPA Indoor Environments Division publishes Radon Map and current protocols at epa.gov/radon.",
  },
  {
    q: "Why does my house feel humid even with AC running?",
    a: "Two likely causes. (1) Oversized AC: equipment that&apos;s too large for the load short-cycles, satisfying thermostat (sensible cooling) before pulling enough moisture (latent cooling). Symptom: 72°F indoor but 65-75% RH. Fix: properly-sized variable-capacity AC that modulates to part load and runs longer at lower capacity (longer run time = more moisture removal per unit cooling). Use our <a href=\"/hvac-load-calculator/\" class=\"underline\">load calculator</a> to verify sizing. (2) Inadequate latent capacity: the AC&apos;s Sensible Heat Ratio (SHR) is higher than the home&apos;s load SHR — the equipment is sensible-heavy and can&apos;t produce enough latent removal. Fix: add a dedicated whole-home dehumidifier (~$1,500-3,000 installed, 60-130 pints/day capacity); ASHRAE recommends keeping indoor RH 30-60% with 40-50% optimal for comfort and IAQ. Indoor RH above 60% promotes mold growth and dust mite reproduction; below 30% causes static discharge, dry skin, and respiratory irritation.",
  },
  {
    q: "How dangerous is wildfire smoke and what should I do?",
    a: "Wildfire smoke contains PM2.5 (fine particulate matter under 2.5 μm) at concentrations that frequently exceed EPA&apos;s 24-hour standard (35 μg/m³) by 5-50× during active fires. PM2.5 penetrates deep into lungs and bloodstream; documented health effects include increased respiratory illness, cardiovascular events, and premature mortality even from short-term exposure. EPA AirNow.gov provides real-time outdoor AQI for any US location. Indoor protection strategy: (1) Run HVAC continuously on the &quot;fan&quot; setting (forces air through the filter) with MERV 13+ filter — the central system is the most effective indoor air cleaner. (2) Close all windows; minimize door opening; create a &quot;clean room&quot; (typically the bedroom) with a portable HEPA air cleaner sized for the room (AHAM CADR ≥ 2/3 of room area in ft²). (3) Avoid using gas stoves, fireplaces, candles, or other indoor combustion that adds particulate to already-high indoor levels. (4) Wear N95 mask outside; significantly reduces inhaled PM2.5. (5) Monitor indoor AQI with portable monitor (PurpleAir, IQAir, Awair); typical wildfire indoor AQI 75-150 even with mitigation vs outdoor 200-500+.",
  },
  {
    q: "Are HEPA filters worth installing in residential HVAC?",
    a: "Generally no — typical residential HVAC blowers cannot tolerate the pressure drop of true HEPA filtration (typically 0.5-0.8 in.w.c. at filter face vs 0.1-0.2 for MERV 8 and 0.2-0.3 for MERV 13). True HEPA in residential central HVAC requires either a dedicated HEPA bypass filter (parallel path that filters a portion of supply air) or a much larger filter housing than typical residential design accommodates. For most residential, MERV 13 in a 4-5 inch deep-pleated filter gives 90%+ of the IAQ benefit of HEPA at a fraction of the pressure drop penalty and equipment compatibility issues. For specific situations needing HEPA (immunocompromised occupant, severe allergy, lab cleanroom): use portable HEPA air cleaners in occupied rooms instead of trying to retrofit central HEPA. CDC and ASHRAE both note that MERV 13 captures sufficient viral/bacterial aerosol for typical residential IAQ goals; HEPA is overkill for most household exposures.",
  },
];

function buildSchema(): object[] {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "HVAC Indoor Air Quality Guide — Pollutants, ASHRAE 62.2 Ventilation, MERV/HEPA Filtration, Humidity & Radon Control",
      description:
        "Complete residential IAQ methodology: pollutant categories, source control + ventilation + filtration hierarchy, ASHRAE 62.2 requirements, MERV/HEPA filter strategy, humidity control, radon + mold + CO life safety, indoor monitoring, wildfire smoke + COVID-era considerations.",
      proficiencyLevel: "Beginner to Intermediate",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
      about: [
        { "@type": "Thing", name: "Indoor air quality" },
        { "@type": "Thing", name: "ASHRAE 62.2 ventilation" },
        { "@type": "Thing", name: "MERV filter ratings" },
        { "@type": "Thing", name: "Radon testing and mitigation" },
        { "@type": "Thing", name: "Mold prevention" },
      ],
      keywords: [
        "indoor air quality",
        "iaq",
        "ashrae 62.2",
        "merv 13 filter",
        "radon testing",
        "mold prevention",
        "wildfire smoke indoor air",
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
        { "@type": "ListItem", position: 3, name: "HVAC Indoor Air Quality Guide" },
      ],
    },
  ];
}

export default function HvacIndoorAirQualityGuidePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Indoor Air Quality Guide</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            HVAC Indoor Air Quality Guide — Pollutants, ASHRAE 62.2 Ventilation, MERV/HEPA Filtration, Humidity &amp; Radon Control
          </h1>
          <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
            A complete residential IAQ guide: the five pollutant categories, the EPA three-pillar strategy (source control → ventilation → filtration), ASHRAE Standard 62.2 mechanical ventilation requirements, MERV vs HEPA vs alternative filtration with the pressure-drop tradeoff, humidity control for IAQ + comfort, radon testing and mitigation per EPA protocol, mold prevention, CO life safety, indoor air monitoring, wildfire smoke and post-COVID respiratory illness considerations, code requirements, and common IAQ misconceptions. Sourced throughout from ASHRAE Standards 62.2 + 52.2, EPA Indoor Air Quality + Radon programs, CDC and WHO guidance, IRC 2021 Section M1505, IECC 2021 R403.6, OSHA 29 CFR 1910.1000 exposure limits, and ANSI/AHAM AC-1 portable air cleaner testing.
          </p>
        </header>

        {/* SECTION 01 — Why IAQ matters */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">01</span>
            Why indoor air quality matters more than outdoor
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Americans spend approximately 90% of their time indoors per EPA. Indoor air typically contains 2-5× the pollutant concentrations of outdoor air for most chemicals — and can be 100× higher during specific activities (cooking, cleaning, off-gassing of new materials). Yet outdoor air gets the regulatory attention while indoor air remains largely unmanaged in most homes. The EPA Office of Air Quality Planning and Standards estimates that &quot;indoor pollutants can cause more health damage than outdoor pollution&quot; for typical residential exposures.
          </p>

          <KeyInsight tone="blue" title="The IAQ shift post-2020">
            COVID-19 made indoor air quality a permanent public-health attention area. The pandemic accelerated several IAQ trends that had been growing: MERV 13+ filtration became the residential default (CDC recommendation), ASHRAE 62.2 mechanical ventilation adoption expanded, indoor CO₂ monitoring (as a proxy for ventilation adequacy) became consumer-grade affordable. Wildfire smoke events on the West Coast made portable HEPA air cleaners common household equipment. Real-estate listings now frequently mention IAQ features (HEPA, ERV, MERV 13+) where they once only mentioned cosmetic features. The IAQ market has matured from &quot;medical device for the chronically ill&quot; to &quot;routine residential infrastructure.&quot;
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="MERV filtration efficiency by particle size (ASHRAE 52.2)"
              orientation="horizontal"
              data={[
                { label: "MERV 4 (basic)", value: 5, sub: "% efficiency 3-10µm" },
                { label: "MERV 8 (standard)", value: 35, sub: "% 3-10µm, 0% <1µm" },
                { label: "MERV 11", value: 65, sub: "% 1-3µm" },
                { label: "MERV 13 (CDC rec)", value: 85, sub: "% 1-3µm; >50% <1µm", color: "#10b981", emphasis: true },
                { label: "MERV 14", value: 90, sub: "% 0.3-1µm", color: "#10b981" },
                { label: "MERV 16", value: 95, sub: "% 0.3-1µm", color: "#10b981" },
                { label: "HEPA (true)", value: 99.97, sub: "% 0.3µm", color: "#3b82f6" },
              ]}
              caption="MERV 13+ became the CDC-recommended residential default during COVID-19 — captures viral aerosols + wildfire PM2.5. Higher MERV = higher static pressure penalty on the blower; verify your HVAC system can handle the additional TESP before upgrading filter class."
            />
          </div>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            The health stakes are substantial. Poor IAQ contributes to asthma exacerbation (the CDC reports asthma is the most common chronic childhood disease, costing $80B+ annually in US healthcare), allergy symptoms, fatigue and reduced cognitive performance (CO₂ above 1,500 ppm measurably reduces decision-making per multiple peer-reviewed studies), respiratory infections, and cardiovascular events from PM2.5 exposure. Long-term: radon-induced lung cancer (second leading cause after smoking per EPA), formaldehyde and other VOC exposures linked to chronic disease, mold-induced respiratory inflammation. IAQ is preventive healthcare delivered through HVAC engineering.
          </p>
        </section>

        {/* SECTION 02 — Pollutant categories */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">02</span>
            The five pollutant categories
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Indoor pollutants fall into five distinct categories, each with different sources, health effects, and mitigation strategies:
          </p>

          <ComparisonTable
            headers={["Category", "Examples", "Sources", "Mitigation"]}
            rows={[
              { label: "Particulate", cells: ["PM2.5, PM10, ultrafine particles, smoke, dust, pollen, dander", "Cooking (especially gas), candles, wildfire smoke, outdoor air infiltration, pets, construction", "MERV 13+ filtration; HEPA in dedicated air cleaners; source elimination (electric cooking)"] },
              { label: "Gaseous", cells: ["VOCs (formaldehyde, benzene, others), CO, CO₂, NO₂, ozone, SOx", "Building materials, paints, cleaning products, gas combustion (NO₂, CO), outdoor air infiltration", "Source elimination (low-VOC materials, electric cooking); ventilation; activated carbon filtration"] },
              { label: "Biological", cells: ["Mold spores, bacteria, viruses, dust mite allergens, pet dander", "Moisture (mold), humans + pets (microbiome), dust accumulation, HVAC contamination", "Humidity control 30-60% RH; MERV 13+ filtration; UV-C for HVAC coil; deep cleaning"] },
              { label: "Biocidal / chemical", cells: ["Pesticide residues, cleaning chemical fumes, attic-applied chemicals", "Recent pesticide treatments, cleaning product use, attic insulation chemistry", "Source elimination; ventilation post-treatment; air cleaner with activated carbon"] },
              { label: "Thermal + radiation", cells: ["Radon (gaseous + radioactive), high indoor temperature, low humidity", "Foundation/crawlspace radon ingress, AC malfunction, dry heating", "Radon mitigation (sub-slab depressurization); thermostat management; humidification"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Source: EPA Indoor Air Quality categorization; CDC IAQ recommendations; WHO Air Quality Guidelines. Health-effect specifics per pollutant available at epa.gov/iaq.
          </p>
        </section>

        {/* SECTION 03 — Three-pillar strategy */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">03</span>
            The EPA three-pillar IAQ strategy
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            EPA&apos;s residential IAQ hierarchy ranks interventions by effectiveness:
          </p>

          <TechSection icon="insight" tone="blue" title="Pillar 1 — Source control (most effective)">
            Eliminate or reduce pollutant emissions at the source. Each pollutant eliminated at source removes 100% of the burden on ventilation + filtration to handle it. Examples: switch from gas cooking to induction (eliminates NO₂, CO, ultrafine combustion particles); use low-VOC paint, sealants, and adhesives (reduces formaldehyde, benzene, xylene); store solvents, paints, pesticides outside the conditioned envelope (eliminates VOC emission paths); seal radon entry points (eliminates radon ingress); fix moisture sources (eliminates mold growth substrate); test water before drinking (eliminates contaminant ingestion); keep humidity 30-60% RH (limits mold + dust mite reproduction). Source control reduces pollutant load 70-95% in typical residential.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pillar 2 — Ventilation (dilution)">
            Bring fresh outdoor air into the home to dilute pollutants that cannot be eliminated at source. Per ASHRAE Standard 62.2-2022, residential ventilation rate: roughly 7.5 CFM per occupant + 3 CFM per 100 ft² of conditioned floor area, delivered continuously. For a 2,000 sq ft home with 4 occupants: 7.5×4 + 3×20 = 90 CFM. Delivery via bathroom exhaust fans running continuously, dedicated exhaust-only fan, supply-only ventilation through HVAC, or balanced ERV/HRV systems. ASHRAE 62.2 also specifies kitchen + bathroom local exhaust rates. Without mechanical ventilation in tight modern construction (≤3 ACH50 per IECC R402), natural infiltration is insufficient for typical occupancy.
          </TechSection>

          <TechSection icon="insight" tone="blue" title="Pillar 3 — Filtration (capture)">
            Remove pollutants from circulating air via mechanical, electrostatic, or other filter media. Central HVAC filtration (MERV 8-13 typical residential) is the workhorse; portable air cleaners (HEPA-class) supplement in specific rooms. Effectiveness depends on: (a) the filter&apos;s pollutant capture rate at the size and type of pollutant, (b) how much air the system moves through the filter per unit time. A central HVAC system moves 800-1,200 CFM for typical residential; a portable air cleaner moves 200-400 CFM. The central system is the dominant filter for whole-home IAQ.
          </TechSection>

          <FixCallout>
            <strong>The order matters:</strong> investing in MERV 13 filtration while continuing to use a gas range without an effective exhaust hood is fighting the wrong battle. Source control (range hood ducted outside; eliminate gas if possible) eliminates 80-90% of the pollutant; filtration handles the remainder. Ventilation handles what filtration misses. Always start with source control; add ventilation; add filtration last.
          </FixCallout>
        </section>

        {/* SECTION 04 — ASHRAE 62.2 */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">04</span>
            ASHRAE Standard 62.2 — the residential ventilation requirement
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            ANSI/ASHRAE Standard 62.2 — Ventilation and Acceptable Indoor Air Quality in Low-Rise Residential Buildings (current edition 2022) — is the residential ventilation standard. Referenced by IRC 2021 Section M1505 in adopting jurisdictions; required by ENERGY STAR Single-Family New Homes program; required by Passive House certification.
          </p>

          <KeyInsight tone="blue" title="The 62.2 ventilation rate formula">
            <code className="text-xs font-mono block bg-zinc-900 p-2 rounded text-zinc-100 mt-1">
              Required ventilation (CFM) = (0.03 × conditioned floor area in ft²) + (7.5 × number of bedrooms + 1)
            </code>
            <p className="mt-2">For a 2,000 ft² home with 3 bedrooms: 0.03 × 2000 + 7.5 × 4 = 60 + 30 = 90 CFM continuous outdoor air. Compare to typical natural infiltration: a tight 2015+ build with 0.2 ACHnat at 16,000 ft³ volume = 53 CFM natural infiltration. The 62.2 calculation indicates 90 CFM is needed; natural infiltration provides 53; mechanical ventilation must add the difference (~37 CFM continuous).</p>
          </KeyInsight>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <BarChart
              title="Indoor pollutant exposure ratios — indoor vs outdoor concentrations"
              orientation="vertical"
              data={[
                { label: "Formaldehyde", value: 5, sub: "× outdoor", color: "#f59e0b" },
                { label: "VOCs", value: 4, sub: "× outdoor", color: "#f59e0b" },
                { label: "PM2.5 (cooking)", value: 100, sub: "× peak", color: "#dc2626", emphasis: true },
                { label: "CO₂ (occupied)", value: 3, sub: "× ambient", color: "#3b82f6" },
                { label: "Radon (basement)", value: 4, sub: "× outdoor", color: "#ef4444" },
                { label: "Mold spores", value: 8, sub: "× outdoor (water damage)", color: "#a855f7" },
              ]}
              axisLabel="Indoor/Outdoor concentration ratio"
              caption="EPA data shows indoor pollutants typically 2-5× outdoor concentrations; peak cooking events drive PM2.5 to 100× outdoor briefly. ASHRAE 62.2 ventilation + MERV 13 filtration + source control are the three pillars of residential IAQ."
            />
          </div>
          {/* Replacement closer below */}
          <KeyInsight tone="blue" title="The 62.2 quick reference">
            For a 2,000 ft² 3-bedroom home, ASHRAE 62.2 requires 90 CFM continuous outdoor air; tight construction typically provides 30-50 CFM via natural infiltration; mechanical ventilation must add the rest.
          </KeyInsight>

          <ComparisonTable
            headers={["Ventilation strategy", "How it works", "Pros", "Cons"]}
            rows={[
              { label: "Exhaust-only (bathroom fans on continuous)", cells: ["Run bathroom fans continuously at low speed", "Cheapest; uses existing equipment", "Negative pressure indoors; pulls outdoor air through whatever leakage paths exist (radon, soil gas)"] },
              { label: "Dedicated exhaust fan", cells: ["Dedicated continuous exhaust fan", "Inexpensive; controls discharge location", "Same negative pressure issue; doesn't recover heat"] },
              { label: "Supply-only (through HVAC)", cells: ["Outdoor air ducted into return plenum; conditioned with the rest", "Positive pressure indoors; uses HVAC system for conditioning", "Higher heating/cooling load; outdoor air enters unconditioned in shoulder seasons"] },
              { label: "Heat Recovery Ventilator (HRV)", cells: ["Balanced supply + exhaust with heat exchanger", "Recovers 60-80% of heat; no pressure imbalance", "Higher initial cost ($1,500-4,000 installed); doesn't recover latent in cooling mode"] },
              { label: "Energy Recovery Ventilator (ERV)", cells: ["Balanced supply + exhaust with heat + moisture exchanger", "Recovers heat AND humidity; balanced pressure", "Highest cost; moisture transfer needs maintenance"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            For tight modern construction in moderate-to-cold climates, ERV is typically the optimal long-run choice — recovers 60-80% of the energy associated with ventilation while maintaining balanced pressure. For mild climates, HRV is often sufficient. For existing-home retrofits with limited budget, exhaust-only ventilation per 62.2 is the minimum-cost compliant option. (A dedicated mechanical-ventilation deep-dive guide covering ERV/HRV selection and installation is in development.)
          </p>
        </section>

        {/* SECTION 05 — Filtration */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">05</span>
            Filtration — MERV vs HEPA vs alternatives
          </h2>

          <ComparisonTable
            headers={["Filter type", "Particle capture", "Pressure drop (initial)", "Residential central HVAC compatibility"]}
            rows={[
              { label: "MERV 8 (1\")", cells: ["Captures 20-50% PM2.5; 80%+ PM10", "0.10-0.20 in.w.c.", "Compatible with all residential equipment; baseline filtration"] },
              { label: "MERV 11-12 (1\")", cells: ["Captures 65-85% PM2.5", "0.15-0.30 in.w.c.", "Compatible; modest pressure drop increase"] },
              { label: "MERV 13 (1\")", cells: ["Captures 90%+ PM2.5; 50%+ PM1; 90%+ allergens", "0.20-0.40 in.w.c.", "Marginal for standard equipment; check static budget"] },
              { label: "MERV 13 (4-5\")", cells: ["Same 90%+ capture as 1\" MERV 13", "0.10-0.20 in.w.c.", "Recommended — same MERV at much lower pressure drop"] },
              { label: "MERV 14-16 (4-5\")", cells: ["Captures 95%+ PM2.5; 75%+ PM1", "0.20-0.40 in.w.c.", "High-IAQ residential; verify equipment compatibility"] },
              { label: "HEPA (true)", cells: ["99.97% PM0.3", "0.50-0.80 in.w.c.", "Generally NOT compatible with residential central; use in portable air cleaners"] },
              { label: "Activated carbon (combined)", cells: ["Captures VOCs + gases (in addition to particulate)", "Varies by media depth", "Useful for VOC-heavy homes; needs replacement every 3-6 months"] },
              { label: "Electrostatic (washable)", cells: ["Captures 60-90% PM2.5 when clean", "0.05-0.15 in.w.c.", "Low maintenance friction; degrades over time, requires periodic cleaning"] },
              { label: "Ionizers / ozone generators", cells: ["Marketed for particulate capture", "Low", "EPA explicitly warns against — produce ozone (lung irritant) and ultrafine particles"] },
            ]}
          />

          <FixCallout>
            <strong>The MERV 13 sweet spot for residential:</strong> CDC recommends MERV 13 minimum for respiratory illness protection. ASHRAE recommends MERV 13 minimum for IAQ-sensitive households. The pressure-drop penalty of 1-inch MERV 13 makes it marginal for some HVAC equipment. Solution: install a 4-5 inch deep-pleated filter housing — same MERV 13 capture rate at significantly lower pressure drop because the larger filter has lower face velocity. Equipment manufacturers (Carrier, Trane, Lennox, others) all offer 4-5 inch filter housings as factory accessories or aftermarket retrofits.
          </FixCallout>
        </section>

        {/* SECTION 06 — Humidity */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">06</span>
            Humidity control and IAQ
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Indoor relative humidity affects IAQ in three ways: (1) mold and dust mite reproduction (above 60% RH); (2) respiratory comfort (below 30% RH causes dry mucous membranes and increased respiratory irritation); (3) certain virus survival rates (some viruses survive longer at very low or very high RH). ASHRAE recommends maintaining indoor RH 30-60%, with 40-50% optimal.
          </p>

          <ComparisonTable
            headers={["Indoor RH range", "Health/IAQ impact", "Action"]}
            rows={[
              { label: "Below 30%", cells: ["Dry skin, respiratory irritation, increased virus transmission", "Add humidification (whole-home or portable)"] },
              { label: "30-40%", cells: ["Acceptable for most; on the dry side", "Acceptable in cold weather"] },
              { label: "40-60%", cells: ["Optimal for comfort + IAQ", "Target range"] },
              { label: "60-70%", cells: ["Dust mites reproduce; some mold begins", "Add dehumidification"] },
              { label: "Above 70%", cells: ["Mold growth + dust mites + condensation on cold surfaces", "Aggressive dehumidification + leak/source investigation"] },
            ]}
          />

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>The cooling-only humidity problem:</strong> AC removes moisture as a side effect of sensible cooling. Properly sized AC running at part-load extracts substantial latent. Oversized AC short-cycles and removes inadequate moisture — symptom: 72°F indoor but 65% RH. Fix: properly-sized variable-capacity equipment (see <Link href="/hvac-load-calculator/" className="underline">load calculator</Link>) OR add a dedicated whole-home dehumidifier (Aprilaire, Honeywell, Santa Fe brands — $1,500-3,000 installed, 60-130 pints/day capacity).
          </p>

          <p className="mt-4 text-zinc-700 dark:text-zinc-300">
            <strong>The cold-climate humidity problem:</strong> winter heating without humidification produces very dry indoor air (sometimes below 20% RH in cold-snap conditions). Cold outdoor air carries little moisture; once heated, RH plummets. Fix: whole-home humidifier (bypass humidifier on the air handler, ~$400-800 installed, treats whole house; or portable units in occupied rooms). Maintain 30-40% RH minimum in winter; verify no condensation forms on cold surfaces (windows, exterior walls) — that indicates over-humidification.
          </p>
        </section>

        {/* SECTION 07 — Radon, mold, CO */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">07</span>
            Life-safety pollutants — radon, mold, CO
          </h2>

          <TechSection icon="problem" tone="amber" title="Radon — the second-leading cause of lung cancer">
            Radon (naturally-occurring radioactive gas from uranium decay in soil) enters homes through foundation cracks, crawlspaces, and well water. EPA + CDC classify radon as the second-leading cause of lung cancer in the US after smoking; estimated 21,000+ annual deaths in the US. EPA action level: 4.0 pCi/L (picocuries per liter); recommended action above 2.0; no &quot;safe&quot; level (lower is better). Testing: short-term DIY ($15-50, 2-90 days), long-term ($30-100, 90+ days), or continuous monitor ($150-300). Mitigation if elevated: sub-slab depressurization (fan + venting under the slab) typical cost $1,000-3,000 installed; reduces radon 50-95%. EPA radon map at epa.gov/radon shows highest-risk zones; every home should be tested regardless of map zone.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Mold — moisture is the key">
            Mold growth requires water + organic substrate + temperature; eliminate water and mold cannot grow. Common moisture sources: water leaks (plumbing, roof, foundation), high indoor humidity (above 60% RH), condensation on cold surfaces (pipes, windows in winter), bathroom moisture without ventilation, basement moisture from groundwater intrusion. EPA + CDC recommend keeping indoor RH below 60%, fixing any visible water damage within 24-48 hours, and providing bathroom ventilation. Mold remediation: for small areas (under 10 sq ft) homeowners can clean with detergent + water + drying; for larger areas, hire an IICRC-certified mold remediation contractor. Health effects vary by mold type and individual sensitivity; toxic black mold (Stachybotrys) gets attention but isn&apos;t the most common mold — Aspergillus and Penicillium are more common and cause similar respiratory inflammation.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Carbon monoxide — the silent killer">
            CO is a colorless, odorless gas produced by incomplete combustion of fuel (gas furnaces, water heaters, cars idling in garages, gas ranges, fireplaces). Acute high CO exposure causes headache, dizziness, confusion, unconsciousness, death. Chronic low CO exposure causes fatigue, heart strain, cognitive symptoms that mimic flu or depression. UL 2034 specifies CO alarm performance: alarm at 70 ppm for 60-240 minutes, 150 ppm for 10-50 minutes, 400 ppm for 4-15 minutes. State codes typically require CO alarms on every habitable floor of homes with fuel-burning equipment. Beyond alarms: annual combustion analysis at the furnace flue (CO &lt;100 ppm) catches problems before ambient CO rises to alarm levels. Never operate vehicles in attached garages; never use unvented fuel-burning equipment indoors. See our <Link href="/hvac-maintenance-service-guide/" className="underline">maintenance guide</Link> for combustion analysis details.
          </TechSection>
        </section>

        {/* SECTION 08 — Monitoring */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">08</span>
            Indoor air quality monitoring
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300">
            Consumer-grade IAQ monitors have become affordable and useful. Useful pollutants to monitor in residential:
          </p>

          <ComparisonTable
            headers={["Parameter", "Why monitor", "Acceptable range", "Typical sensor cost"]}
            rows={[
              { label: "PM2.5", cells: ["Particulate; wildfire smoke; cooking emissions", "&lt;12 μg/m³ (EPA NAAQS annual)", "$50-300 (PurpleAir, IQAir, Awair)"] },
              { label: "PM10", cells: ["Larger particulates; dust", "&lt;50 μg/m³", "Same monitors as PM2.5"] },
              { label: "CO₂", cells: ["Ventilation adequacy proxy; cognitive performance", "&lt;1,000 ppm; &lt;800 ppm preferred", "$100-250 (NDIR sensor)"] },
              { label: "VOCs (TVOC)", cells: ["Total VOC indicator; off-gassing, cleaning, materials", "&lt;500 μg/m³", "$100-300 (often bundled in IAQ monitor)"] },
              { label: "Temperature + humidity", cells: ["Comfort + IAQ context", "30-60% RH; 68-78°F", "$30-100"] },
              { label: "Radon (continuous)", cells: ["Long-term radon trend", "&lt;2.0 pCi/L preferred; &lt;4.0 pCi/L action", "$150-300 (Airthings, Corentium)"] },
              { label: "CO alarm", cells: ["Life safety", "Alarm threshold per UL 2034", "$20-60 per alarm (required on every floor)"] },
              { label: "Formaldehyde + specific VOCs", cells: ["Specialized; new construction off-gassing", "&lt;0.1 ppm formaldehyde", "$300-1,000+ (research-grade)"] },
            ]}
          />

          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            For typical residential, the useful combination: a PurpleAir or similar PM2.5/PM10 monitor + a CO₂ sensor + a radon continuous monitor (if in radon-zone) + CO alarms per code. Total cost $300-700 for whole-home IAQ visibility. Some smart thermostats (Google Nest, Ecobee) include basic IAQ sensors but they&apos;re less accurate than dedicated monitors.
          </p>
        </section>

        {/* SECTION 09 — Special situations */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">09</span>
            Special situations — wildfire smoke, allergies, COVID-era
          </h2>

          <TechSection icon="problem" tone="amber" title="Wildfire smoke">
            Wildfire smoke contains PM2.5 at concentrations frequently 5-50× EPA&apos;s 24-hour standard during active fires. Protection: (1) Run HVAC continuously on &quot;fan&quot; with MERV 13+ filter; (2) Close all windows; create a clean room (typically the bedroom) with a HEPA portable air cleaner; (3) Avoid indoor combustion (gas range, candles, fireplaces); (4) Wear N95 outside; (5) Monitor indoor AQI with portable monitor. EPA AirNow.gov provides real-time outdoor AQI. After wildfires: replace HVAC filter; deep clean surfaces; consider professional duct cleaning if heavy smoke exposure.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Allergies + asthma">
            For allergy-sensitive households: MERV 13+ filtration is the central HVAC baseline. Humidity 40-50% RH (limits dust mite reproduction). Frequent vacuum with HEPA-filtered vacuum cleaner. Wash bedding weekly in hot water. Limit carpeting in bedrooms. For pet allergens: keep pets out of bedrooms; bathe pets weekly. For pollen-sensitive: keep windows closed during high-pollen days; rinse exposed surfaces and clothing after outdoor activity. ASHRAE Position Document on Allergic Disease provides detailed methodology.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="COVID-era + ongoing respiratory illness">
            CDC recommendations for respiratory virus mitigation indoors: (1) MERV 13+ central filtration; (2) ASHRAE 62.2 mechanical ventilation (especially relevant in tight construction); (3) Portable HEPA air cleaners in high-occupancy rooms (CADR ≥ 2/3 of room area in ft²); (4) UV-C disinfection in HVAC equipment (germicidal UV lamp aimed at the indoor coil — reduces biological growth, may inactivate some airborne pathogens). For schools, offices, and other shared spaces: ASHRAE&apos;s Epidemic Task Force guidance recommends MERV 13+ filtration as minimum + increased outdoor air ventilation + portable HEPA supplementation. These measures have become permanent fixtures in many post-2020 building IAQ programs.
          </TechSection>
        </section>

        {/* SECTION 10 — Code */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">10</span>
            Code requirements
          </h2>

          <ComparisonTable
            headers={["Code / Standard", "What it requires", "Applies to"]}
            rows={[
              { label: "IRC 2021 Section M1505", cells: ["Mechanical ventilation per ASHRAE 62.2", "New residential construction in IRC-adopting jurisdictions"] },
              { label: "IECC 2021 Section R403.6", cells: ["Mechanical ventilation system efficiency (fan power limits)", "New residential construction"] },
              { label: "IRC 2021 Section R315", cells: ["CO alarm requirements", "Homes with fuel-burning equipment or attached garages"] },
              { label: "IRC 2021 Section M1502", cells: ["Dryer duct termination + cleanout", "All residential clothes dryers"] },
              { label: "ASHRAE 62.2-2022", cells: ["Total + local ventilation rates; equipment efficiency", "Referenced by IRC; required by ENERGY STAR Single-Family"] },
              { label: "California Title 24 Part 6", cells: ["State-specific IAQ + ventilation requirements", "California new construction"] },
              { label: "ENERGY STAR Single-Family New Homes v3.2", cells: ["ASHRAE 62.2 + MERV 6+ minimum filter (MERV 13+ for IAQ Plus credit)", "ENERGY STAR certified residential"] },
              { label: "OSHA 29 CFR 1910.1000", cells: ["Permissible Exposure Limits (PELs) for workplace chemicals", "Commercial/industrial; useful reference for residential exposure limits"] },
              { label: "EPA SNAP regulations", cells: ["Refrigerant-related (covered separately in recovery guide)", "—"] },
            ]}
          />
        </section>

        {/* SECTION 11 — Misconceptions */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">11</span>
            Common IAQ misconceptions
          </h2>

          <TechSection icon="problem" tone="amber" title="Misconception 1 — Houseplants meaningfully clean indoor air">
            The famous &quot;NASA Clean Air Study&quot; (1989) tested plants in sealed chambers and found some VOC removal. The popular interpretation extrapolated wildly — &quot;you need 6-10 plants per room to clean your air.&quot; Multiple peer-reviewed follow-up studies (Cummings + Waring 2020 review in J Exp Sci &amp; Env Epidemiology) found that to match the VOC removal of typical ASHRAE 62.2 ventilation, you&apos;d need 100-1,000 plants per room. Plants improve psychological well-being; they don&apos;t meaningfully clean indoor air at realistic densities. Ventilation does.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Misconception 2 — Ozone generators clean the air">
            Ozone generators marketed as &quot;air purifiers&quot; produce ozone (O₃), which is a lung irritant. EPA explicitly warns: &quot;Some manufacturers and vendors suggest that ozone will render almost every chemical contaminant harmless... In fact, ozone is itself a respiratory hazard.&quot; (epa.gov/indoor-air-quality-iaq/ozone-generators-are-sold-air-cleaners). Ozone generators may oxidize some VOCs but produce ozone (a NAAQS criteria pollutant) at concentrations that exceed acceptable indoor levels. CDC + WHO + EPA all recommend against ozone-generating air cleaners in occupied indoor spaces.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Misconception 3 — Higher MERV is always better">
            MERV 16 in a 1-inch residential filter slot creates excessive pressure drop, drops blower CFM 20-40%, degrades equipment efficiency 15-30%, and may cause evaporator freezing. MERV 13 in a 4-5 inch deep-pleated filter is the practical optimum for residential — 90%+ particulate capture at acceptable pressure drop. Beyond MERV 13 for typical residential, diminishing returns vs HVAC efficiency penalty.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Misconception 4 — UV lights in HVAC kill viruses on the fly">
            UV-C lamps aimed at the indoor coil reduce biological growth ON the coil (mold, bacteria colonies) — useful for IAQ over time as it prevents coil contamination. Single-pass UV-C exposure of air flowing through ductwork at typical residential air velocity (500-900 fpm) provides too brief an exposure to kill most airborne pathogens in flight. The mechanism is coil-disinfection-over-time, not in-flight pathogen killing. Useful for IAQ but not a virus-protection silver bullet.
          </TechSection>

          <TechSection icon="problem" tone="amber" title="Misconception 5 — Old houses have better IAQ because they 'breathe'">
            Leaky old houses have more air exchange (often 0.7-1.0 ACHnat vs 0.2 in tight modern construction). But the air comes through random leakage paths — including foundation (radon, soil gas), attic (insulation chemicals, mold from attic moisture), and walls (mineral fiber insulation particles). Tight construction with deliberate mechanical ventilation provides BETTER IAQ because the air comes from a controlled location (typically high outdoors, away from contamination sources) and is filtered before entry. The &quot;old houses breathe&quot; intuition treats infiltration as benign; it&apos;s not.
          </TechSection>
        </section>

        {/* SECTION 12 — DIY vs pro */}
        <section className="mb-12">
          <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
            <span className="font-mono text-sm text-zinc-400">12</span>
            DIY vs professional IAQ improvements
          </h2>

          <ComparisonTable
            headers={["IAQ improvement", "DIY", "Professional", "Notes"]}
            rows={[
              { label: "Filter upgrade to MERV 13 (1\" or 4\")", cells: ["✓", "Optional", "DIY install; verify static pressure compatibility"] },
              { label: "Portable HEPA air cleaner", cells: ["✓", "—", "Off-the-shelf consumer product"] },
              { label: "Radon DIY testing", cells: ["✓", "✓ (long-term)", "Hardware store kits adequate for initial screening"] },
              { label: "Radon mitigation install", cells: ["—", "✓ (NEHA-certified contractor)", "Sub-slab depressurization requires professional"] },
              { label: "Source control (low-VOC paint, electric cooking)", cells: ["✓", "—", "Consumer product choice + lifestyle"] },
              { label: "ASHRAE 62.2 ventilation install", cells: ["—", "✓", "Requires HVAC contractor; sizing per 62.2 formula"] },
              { label: "ERV/HRV install", cells: ["—", "✓", "Substantial install; sizing + commissioning required"] },
              { label: "Whole-home humidification/dehumidification", cells: ["—", "✓", "Bypass humidifier or in-line dehumidifier"] },
              { label: "Mold remediation (small area &lt;10 sq ft)", cells: ["⚠️ with PPE", "✓ (preferred)", "Larger areas require IICRC-certified contractor"] },
              { label: "Indoor air monitor setup", cells: ["✓", "—", "Plug-and-play consumer products"] },
              { label: "UV-C lamp install (coil disinfection)", cells: ["⚠️", "✓", "Electrical work + correct UV-C placement"] },
              { label: "Whole-home air cleaner (electrostatic, polarized media)", cells: ["—", "✓", "Equipment integration with HVAC"] },
            ]}
          />
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
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: f.a.split(/\n\s*\n/).map((p) => `<p>${p.trim()}</p>`).join("") }} />
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
              <strong>ASHRAE Standards:</strong> ANSI/ASHRAE Standard 62.2-2022, Ventilation and Acceptable Indoor Air Quality in Low-Rise Residential Buildings. ANSI/ASHRAE Standard 62.1-2022 (commercial/institutional ventilation). ANSI/ASHRAE Standard 52.2-2017, Method of Testing General Ventilation Air-Cleaning Devices for Removal Efficiency by Particle Size (MERV). ASHRAE Standard 90.2 (residential energy). ASHRAE Position Document on Allergic Disease (most recent edition). ASHRAE Epidemic Task Force guidance (current edition).
            </p>
            <p className="mt-3">
              <strong>EPA Indoor Air Quality programs:</strong> EPA Indoor Air Quality main page (epa.gov/iaq). EPA &quot;A Guide to Air Cleaners in the Home&quot; (epa.gov/indoor-air-quality-iaq/guide-air-cleaners-home). EPA Ozone Generators Air Cleaners warning (epa.gov/indoor-air-quality-iaq/ozone-generators-are-sold-air-cleaners). EPA Radon Program (epa.gov/radon) including EPA Indoor Environments Division protocols. EPA Mold (epa.gov/mold). EPA AirNow.gov (real-time outdoor AQI).
            </p>
            <p className="mt-3">
              <strong>CDC + public health:</strong> CDC Indoor Environmental Quality. CDC ventilation recommendations for respiratory virus control. CDC Asthma surveillance data. World Health Organization (WHO) Air Quality Guidelines and Indoor Air Quality Guidelines.
            </p>
            <p className="mt-3">
              <strong>Building codes:</strong> International Residential Code (IRC) 2021, Section M1505 (mechanical ventilation), Section R315 (CO alarms), Section M1502 (dryer venting). International Energy Conservation Code (IECC) 2021, Section R403.6 (mechanical ventilation efficiency). California Title 24 Part 6 (state-specific IAQ requirements).
            </p>
            <p className="mt-3">
              <strong>Equipment + product standards:</strong> ANSI/AHAM AC-1 (Portable Air Cleaner CADR Test). UL 2034 (CO Alarm Performance). UL 867 (Electrostatic Air Cleaner safety). NSF/ANSI 372 (drinking water lead-free standards, peripheral to IAQ). NIOSH N95 mask standard (42 CFR Part 84).
            </p>
            <p className="mt-3">
              <strong>Workplace exposure limits:</strong> OSHA 29 CFR 1910.1000 (Permissible Exposure Limits — useful reference for residential exposure limits). NIOSH Recommended Exposure Limits (more health-protective than OSHA PELs). ACGIH Threshold Limit Values (TLVs).
            </p>
            <p className="mt-3">
              <strong>Research references:</strong> Cummings, B.E. and Waring, M.S. (2020) &quot;Potted plants do not improve indoor air quality: a review and analysis of reported VOC removal efficiencies.&quot; Journal of Exposure Science &amp; Environmental Epidemiology. NIST + Lawrence Berkeley National Laboratory residential IAQ studies. DOE Building America Solution Center IAQ best practices. EPA NAAQS (National Ambient Air Quality Standards) for indoor reference.
            </p>
            <p className="mt-3">
              <strong>What this page does not include:</strong> Specific product recommendations (consumer IAQ monitor and air cleaner market changes rapidly; consult ENERGY STAR Most Efficient list, AHAM CADR ratings, and current consumer reviews). Medical advice for specific conditions (consult an allergist or pulmonologist for individual respiratory health questions). Local code amendments (consult your local building department). Specific contractor recommendations (use NEHA-certified contractors for radon, IICRC-certified for mold remediation, ACCA-credentialed for HVAC).
            </p>
            <p className="mt-3 text-xs text-zinc-500">
              Page generated: {PUBLISHED.slice(0, 10)}.
            </p>
          </div>
        </section>

        {/* Related */}
        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Related tools and references</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/hvac-maintenance-service-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><FileCheck className="h-4 w-4 text-blue-600" /> Maintenance Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Filter strategy + combustion safety + coil cleaning for IAQ preservation.</p>
            </Link>
            <Link href="/hvac-commissioning-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-blue-600" /> Commissioning Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Verify ventilation rates and IAQ-relevant equipment at handoff.</p>
            </Link>
            <Link href="/psychrometric-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Droplet className="h-4 w-4 text-blue-600" /> Psychrometric Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Compute dew point for mold-risk analysis on cold surfaces.</p>
            </Link>
            <Link href="/hvac-load-calculator/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><Gauge className="h-4 w-4 text-blue-600" /> Load Calculator</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Verify AC sizing for proper humidity control.</p>
            </Link>
            <Link href="/hvac-troubleshooting-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-blue-600" /> Troubleshooting Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Decision trees for IAQ-related symptoms (musty smell, humidity, drainage).</p>
            </Link>
            <Link href="/hvac-energy-efficiency-guide/" className="block rounded-xl border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4 text-blue-600" /> Efficiency Guide</div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">SEER2/HSPF2 + ventilation energy recovery (ERV) considerations.</p>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}

// Suppress unused-import warnings
void [Wind, Filter, Thermometer, Sun, ListChecks, Lookups, Panel, ServiceProblem, VerdictBanner];
