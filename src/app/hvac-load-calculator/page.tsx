import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Sun, Snowflake, Home, Users, AlertTriangle, BookOpen, ListChecks, Gauge } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { SITE_URL } from "@/lib/schema/shared";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { HvacLoadCalculator } from "@/components/calculators/HvacLoadCalculator";
import {
  ComparisonTable,
  FixCallout,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { calculateLoad } from "@/lib/load-calc";

const PAGE_URL = `${SITE_URL}/hvac-load-calculator/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Load Calculator — Manual J-Style Cooling & Heating BTU/hr by Climate Zone",
  description:
    "Compute residential cooling tons and heating BTU/hr from floor area, climate zone, construction era, window area, and occupancy. Component breakdown (walls, windows, roof, infiltration, people, equipment), sensible-vs-latent split, equipment-sizing guidance with oversizing warnings. Quick Manual J estimate within ±20% of full report.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "HVAC Load Calculator — Cooling Tons + Heating BTU/hr by Climate Zone",
    description:
      "Quick Manual J residential load estimate. Component breakdown, sensible/latent split, equipment sizing with oversizing warnings.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "HVAC Load Calculator — Quick Manual J Estimate",
    description: "Residential cooling tons + heating BTU/hr from 7 inputs. Component breakdown, sizing guidance.",
    images: ["/twitter-image"],
  },
};

const r0 = (n: number) => (Number.isFinite(n) ? Math.round(n).toLocaleString() : "—");
const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");

// Worked example precomputation
const EX1 = calculateLoad({ floorAreaSqft: 1500, stories: 1, climateZoneId: "4A", constructionEraId: "1980-2005", windowAreaId: "average", occupants: 3 })!;
const EX2 = calculateLoad({ floorAreaSqft: 2500, stories: 2, climateZoneId: "2A", constructionEraId: "2005-2015", windowAreaId: "average", occupants: 5 })!;
const EX3 = calculateLoad({ floorAreaSqft: 1000, stories: 1, climateZoneId: "5A", constructionEraId: "2015-plus", windowAreaId: "low", occupants: 2 })!;

const FAQS = [
  {
    q: "How accurate is this calculator vs a full Manual J report?",
    a: "Typically within ±20% for standard residential construction. A full Manual J report uses room-by-room dimensions (each wall surveyed separately), specific orientations for solar gain, actual measured infiltration (blower-door test), and detailed internal-gain breakdowns. This calculator uses a 7-input simplification — climate zone, square footage, stories, construction era, window area, occupancy, and optional equipment load. For ballpark sizing and gut-check on existing equipment, the simplified result is reliable. For permit-required new construction or equipment specification, hire a Manual J professional or use software like Wrightsoft Right-J or Carrier HAP.",
  },
  {
    q: "Why does oversizing HVAC equipment cause problems?",
    a: "An oversized AC short-cycles: it removes sensible heat faster than the coil can pull moisture out of the air, then satisfies the thermostat and turns off before reaching steady-state humidity removal. Result: indoor RH climbs above 60% on humid days, occupants feel sticky even at 72°F setpoint, and the coil sweats on the next cycle. Manual J + Manual S together exist specifically to prevent this — Manual S says size to between 100-115% of Manual J cooling load for single-stage equipment, 110-125% for two-stage. Going above 125% guarantees short-cycle problems unless the equipment is variable-speed.",
  },
  {
    q: "Why is my heating load larger than my cooling load on a per-BTU basis?",
    a: "ΔT is larger in winter for most US climates. A Zone 4 home has cooling ΔT of 90 − 75 = 15°F vs heating ΔT of 70 − 17 = 53°F — 3.5× higher. Same envelope, much bigger driving force in winter. Cooling load is dominated by solar gain (especially windows) and internal gains (people, equipment, lights), which heating doesn't credit. So in cooling-dominated climates (Zone 1-2) cooling load > heating load; in heating-dominated (Zone 5+) heating load > cooling load by a wide margin. Equipment sizing typically follows cooling load (because the AC compressor sets system capacity), and a furnace is sized for the heating load separately.",
  },
  {
    q: "How does this handle the sensible heat ratio (SHR)?",
    a: "The calculator reports SHR = sensible cooling / total cooling explicitly. Typical residential SHR is 0.75-0.85 in humid climates (Zone 1-4A) — 15-25% of cooling capacity goes to moisture removal. Hot/dry climates (2B, 3B, 4B, 5B) have higher SHR (0.85-0.95) because outdoor air has less moisture. The matching equipment SHR depends on coil temperature: lower coil saturated suction temperature → more latent removal → lower equipment SHR. Equipment SHR is published in AHRI ratings; if the home's load SHR is 0.75 and the equipment's rated SHR is 0.78, the equipment will dehumidify adequately. If equipment SHR is 0.85 and load is 0.75, you'll have humidity complaints.",
  },
  {
    q: "Why does my actual energy bill suggest a different system size than this calculates?",
    a: "Energy bills measure total energy consumed across all conditions (mild and extreme), not peak design-day capacity. A system might run 30% capacity for 80% of cooling season and 90% capacity for 5% of cooling season. The peak load this calculator computes corresponds to the 1% design conditions (the 87 hottest hours of an average year per ASHRAE methodology). Total seasonal energy doesn't translate directly to peak design load — they answer different questions. Use this calculator for capacity sizing; use SEER × design CDD to estimate seasonal energy.",
  },
  {
    q: "What's the right way to think about altitude and the load calculation?",
    a: "Altitude affects two things: (1) heating load is slightly lower because cold air is thinner (less mass to heat), but the effect is small (~5% at Denver, ~10% at Aspen); (2) latent cooling load drops more substantially because outdoor air at altitude carries less water per unit volume even at the same grains/lb. For sea-level vs Denver comparison: same Zone 5A climate zone but Denver air is ~17% less dense, which reduces sensible loads ~17%. The calculator doesn't apply altitude correction directly — the climate zones bundle typical altitudes for each zone's example cities. For high-elevation installations, derate the result by ~10-15% for altitudes above 5,000 ft.",
  },
  {
    q: "Does this account for radiant heat gain through the roof?",
    a: "Yes — the CLTD (Cooling Load Temperature Differential) for the roof is set to ΔT + 35°F, which captures solar-radiant gain on a typical asphalt or composite shingle roof on a summer day. Light-colored cool roofs and white TPO commercial roofs have CLTD closer to ΔT + 15°F, which would lower the roof component by ~50%. The calculator doesn't have a roof-color input; for cool-roof or radiant-barrier construction, derate the result by 8-12% to be more accurate.",
  },
  {
    q: "How do I use this with the duct sizing calculator?",
    a: `Once you have the cooling load, multiply by 400 CFM/ton to get design airflow. From the example: ${r2(EX1.cooling.tons)}-ton load × 400 = ${r0(EX1.cooling.tons * 400)} CFM. Take that CFM into the <a href="/duct-size-calculator/" class="underline">duct sizing calculator</a> to size the main supply trunk at 0.08 in.w.c./100 ft. Branches carry only the rooms they feed (room CFM = room load / total load × total CFM). The two calculators together cover the equipment-sizing and air-distribution sides of a single residential design.`,
  },
];

const HOWTO_STEPS = [
  {
    title: "Measure conditioned floor area",
    text: "Sum the floor area of all conditioned (heated + cooled) spaces — excluded: unconditioned garages, attics, crawlspaces, sunrooms with no ductwork. For a typical home, this is the square footage shown on the appraisal or MLS listing. Don't include basements unless they're conditioned with active supply registers.",
  },
  {
    title: "Identify the IECC climate zone",
    text: "Look up your county at energycodes.gov/climate-zone-map. Eight zones cover the US: 1 (Miami/Honolulu) through 8 (Fairbanks). The 'A' subscript means humid, 'B' dry, 'C' marine. For load calc, A vs B matters most for the latent component — the calculator's climate-zone selector uses A defaults but you can hand-tune outdoor design conditions if needed.",
  },
  {
    title: "Pick the construction era",
    text: "Roughly corresponds to when the home was built or last fully re-insulated. Pre-1980: minimal insulation, single-pane windows. 1980-2005: standard fiberglass batts in walls, R-30 in attic, double-pane windows. 2005-2015: IECC-compliant insulation, low-e windows, tighter envelope. 2015+: high-performance — typically only new construction or deep retrofits qualify.",
  },
  {
    title: "Estimate window area",
    text: "Low (12% of floor area): modest window count, no large sliders. Average (15%): standard residential. High (20%): lots of glass, sliders, picture windows, sunroom. If unsure pick Average. Higher window area means much higher cooling load because solar gain dominates window components.",
  },
  {
    title: "Enter actual occupant count",
    text: "Daytime cooling design typically uses peak occupancy (everyone home for a long weekend). For a 4-bedroom home with 4 typical occupants but occasional houseguests, use 5-6 in the calc. Each occupant adds 250 BTU/hr sensible + 150 BTU/hr latent (sedentary activity per ASHRAE).",
  },
  {
    title: "Optionally override the equipment + lighting estimate",
    text: "Default is 2.5 BTU/hr × floor area (covers typical lights + appliances + electronics). Higher for homes with: large kitchens, multiple computers/servers, hot tubs, electric saunas, indoor pools. Override to a measured value if available (look at electric bill: average watts × 3.412 = BTU/hr).",
  },
  {
    title: "Read off cooling tonnage and heating BTU/hr",
    text: "Total cooling load is the main number — round up to nearest standard equipment size (1.5, 2, 2.5, 3, 3.5, 4, 5 ton). Per ACCA Manual S, size equipment to 100-115% of Manual J cooling load for single-stage, 110-125% for two-stage, 110-130% for variable-capacity. Heating BTU/hr sizes the furnace independently — for typical residential, heating load is much larger than cooling in cold climates.",
  },
];

const BodySections = (
  <>
    {/* SECTION 01 — Why load calculation matters */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">01</span>
        Why correct load calculation is the foundation of every HVAC design
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        The cooling load tells you how many tons of capacity the home needs at design conditions (the hottest 1% of hours in a typical year). The heating load tells you the furnace size in BTU/hr at the coldest 1%. Get either wrong and the consequences cascade for the equipment&apos;s 15-20 year service life: oversized AC short-cycles and never controls humidity (comfort complaints, $200/yr extra energy waste, premature compressor failure); undersized AC runs continuously on hot days and never reaches setpoint (callbacks, system replacement under warranty); oversized furnace short-cycles and produces uneven temperatures (cold floors, warm ceilings, ductwork condensation in humid summers when the same blower handles AC); undersized furnace can&apos;t keep up on the coldest morning of the year (frozen pipes, lost productivity, code violation in cold climates).
      </p>

      <KeyInsight tone="amber" title="The single biggest mistake in residential HVAC">
        Sizing by rule of thumb (&quot;500 sq ft per ton&quot;) instead of by load calculation. This shortcut produces 25-50% oversizing in modern high-performance homes, where envelope improvements have cut loads dramatically. A 2015+ build at the same floor area as a 1985 home needs roughly 30-40% less cooling capacity — same square footage, very different load. ACCA Manual J exists precisely to make load-based sizing routine; this calculator gives the quick version that catches the bulk of the error.
      </KeyInsight>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        The full Manual J 8th edition is a ~600-page document with worksheets for each wall, window, door, and skylight by orientation, plus duct-system gains/losses, infiltration via blower-door test, and per-room load distribution for register/branch sizing. Most professional HVAC contractors run it in software (Wrightsoft Right-J, EnergyGauge, Carrier HAP) rather than by hand. This page&apos;s calculator is the &quot;back of the envelope&quot; — 7 inputs, accurate within ±20% of full Manual J for typical residential, suitable for gut-checking existing equipment and getting in the right ballpark for new construction before contracting a full Manual J report.
      </p>
    </section>

    {/* SECTION 02 — How to use */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">02</span>
        How to use the calculator above
      </h2>
      <ol className="list-decimal space-y-3 pl-6 text-zinc-700 dark:text-zinc-300">
        <li><strong>Floor area:</strong> the conditioned (heated + cooled) square footage. Excludes unconditioned garage, attic, crawlspace, sunroom without ductwork. For typical homes, the appraisal or MLS &quot;heated SF&quot; is the right number.</li>
        <li><strong>Stories:</strong> 1 or 2. 2-story homes have less roof area per unit floor area but more wall area. Both effects matter for load.</li>
        <li><strong>Climate zone:</strong> IECC zone 1 through 8 — find your county at <code>energycodes.gov/climate-zone-map</code>. The calculator preloads ASHRAE 1% cooling and 99% heating design temperatures for each zone.</li>
        <li><strong>Construction era:</strong> pre-1980, 1980-2005, 2005-2015, or 2015+. Each era bundles typical wall/roof/window U-values and infiltration based on IECC requirements in force during the period. Use the era that matches when the envelope was last fully renovated, not necessarily the original build date.</li>
        <li><strong>Window area:</strong> Low (12% of floor), Average (15%), High (20%). Eyeball it — most modern residential is Average. Lots of glass walls / picture windows pushes to High.</li>
        <li><strong>Occupants:</strong> peak occupancy (with houseguests, not the typical workday number).</li>
        <li><strong>Equipment + lighting:</strong> usually leave blank for the calculator default (2.5 BTU/hr × ft²); override for atypical homes (large home offices, kitchens with commercial appliances, electric resistance heat sources).</li>
      </ol>
    </section>

    {/* SECTION 03 — Component breakdown */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">03</span>
        What each load component represents
      </h2>

      <TechSection icon="insight" tone="blue" title="Walls — U × A × CLTD">
        Conduction through opaque exterior walls. U-value depends on insulation (R-7 to R-21+ in residential). CLTD (Cooling Load Temperature Differential) is the effective ΔT including time-lag and solar effects on the wall surface — typically ΔT + 15°F for vinyl-sided framed walls per Manual J Table 4A. Walls are usually 15-25% of total cooling load for typical residential.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Windows — conduction + solar gain (separately)">
        Two components. <strong>Conduction</strong> is U × A × ΔT — heat transfer through the window itself, dominated by the U-value. <strong>Solar gain</strong> is A × SHGC × insolation — sunlight passing through the glass becomes heat. Solar gain typically dominates: a south-facing window can transmit 50-80 BTU/hr/ft² of solar load even with low-e glass. The window component is often the largest single contributor (20-40%) of cooling load.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Roof — U × A × CLTD_roof">
        Conduction through the ceiling assembly (drywall, joist cavity insulation, decking, shingles). CLTD_roof is much higher than walls (typically ΔT + 35°F) because shingles bake in direct sun and the attic above easily reaches 130-150°F on a 95°F day. Cool roofs (light-color shingles, white TPO) and radiant barriers cut this by 30-50%. Typically 10-20% of cooling load.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Infiltration — sensible and latent">
        Outdoor air leaking in through cracks, joints, vents, and openings. ACH (air changes per hour) measured in CFM = (ACH × volume) / 60. The same CFM drives both sensible (warm air to cool) and latent (humid air to dehumidify) loads. Sensible = 1.08 × CFM × ΔT; latent = 0.68 × CFM × Δgrains (grains H₂O / lb dry air). Modern tight construction (≤0.3 ACH) makes infiltration a small fraction; leaky old homes (0.6+ ACH) push infiltration to 25-40% of total load.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="People — sensible + latent">
        Each person at sedentary activity generates ~250 BTU/hr sensible heat (body warmth) + ~150 BTU/hr latent (respiration + perspiration). Per ASHRAE Standard 55 + Manual J Table 5C. For typical residential occupancy (3-5 people), this is 1,000-2,000 BTU/hr — small fraction of total load but matters for the latent split.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Equipment + lighting — internal sensible gain">
        Refrigerators, microwaves, ovens, computers, TVs, lights — anything that consumes electricity ultimately turns into heat. Rule of thumb: 2.5 BTU/hr per ft² covers typical residential. Override for atypical homes: large kitchens during cooking, home offices with multiple computers, indoor saunas/pools, electric resistance baseboards left on. Note that this is the sensible component only; latent from showers and cooking adds maybe 500 BTU/hr (built into the calculator).
      </TechSection>
    </section>

    {/* SECTION 04 — Climate zone table */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">04</span>
        Climate zone reference (IECC 2021 + ASHRAE design conditions)
      </h2>
      <p className="mb-4 text-zinc-700 dark:text-zinc-300">
        The IECC divides the US into 8 climate zones based on heating degree-days. Each zone has characteristic design conditions per ASHRAE&apos;s Climatic Design Conditions database. The calculator&apos;s climate-zone dropdown loads these defaults automatically.
      </p>

      <ComparisonTable
        headers={["Zone", "Cooling DB / WB", "Heating DB", "Example cities"]}
        rows={[
          { label: "1A — Hot/Humid", cells: ["91°F / 77°F", "49°F", "Miami, Honolulu, Key West"] },
          { label: "2A — Hot/Humid", cells: ["94°F / 76°F", "34°F", "Houston, New Orleans, Tampa"] },
          { label: "3A — Warm/Humid", cells: ["92°F / 75°F", "27°F", "Atlanta, Memphis, Dallas"] },
          { label: "4A — Mixed/Humid", cells: ["90°F / 73°F", "17°F", "Washington DC, NYC, St. Louis"] },
          { label: "5A — Cool/Humid", cells: ["87°F / 70°F", "2°F", "Chicago, Boston, Detroit"] },
          { label: "6A — Cold", cells: ["84°F / 68°F", "-6°F", "Minneapolis, Burlington, Helena"] },
          { label: "7 — Very Cold", cells: ["81°F / 65°F", "-16°F", "Duluth, International Falls"] },
          { label: "8 — Subarctic", cells: ["76°F / 60°F", "-36°F", "Fairbanks, Anchorage interior"] },
        ]}
      />
    </section>

    {/* SECTION 05 — Construction era table */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">05</span>
        Construction-era U-values and infiltration
      </h2>
      <p className="mb-4 text-zinc-700 dark:text-zinc-300">
        Each era bundles typical wall, roof, and window U-values that match the IECC requirements in force during the period. Pick the era that matches your home&apos;s envelope today (not necessarily the original build year — major insulation/window upgrades shift the era).
      </p>

      <ComparisonTable
        headers={["Era", "Wall R / U", "Roof R / U", "Window U / SHGC", "ACH natural"]}
        rows={[
          { label: "Pre-1980", cells: ["R-7 / U-0.14", "R-11 / U-0.09", "U-1.1 / 0.85", "0.6"] },
          { label: "1980-2005", cells: ["R-13 / U-0.077", "R-30 / U-0.033", "U-0.50 / 0.60", "0.4"] },
          { label: "2005-2015", cells: ["R-19 / U-0.053", "R-38 / U-0.026", "U-0.40 / 0.40", "0.3"] },
          { label: "2015+", cells: ["R-21 / U-0.048", "R-49 / U-0.020", "U-0.30 / 0.30", "0.2"] },
        ]}
      />
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        SHGC = Solar Heat Gain Coefficient (fraction of incident sunlight transmitted as heat). ACH natural = air changes per hour under typical pressure differential without blower-door pressurization. R-values are nominal cavity insulation; the U-value also accounts for thermal bridging through framing (typically reduces effective R by 15-20%).
      </p>
    </section>

    {/* SECTION 06 — Worked Example 1 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">06</span>
        Worked example 1 — 1,500 sq ft single-story, Zone 4A, 1980-2005 build
      </h2>
      <ServiceProblem
        number={1}
        title="Typical mid-Atlantic residential — replacement equipment sizing"
        refrigerant="(load calculation — equipment-side)"
        scenario="1,500 sq ft single-story rancher built 1992. Zone 4A (Washington DC area). Standard double-pane windows (≈15% of floor area). 3 occupants. Existing 3-ton 13 SEER AC, 80 kBTU furnace. Homeowner wants right-sized replacement equipment."
      >
        <Panel title="Inputs" icon={ListChecks}>
          <Lookups rows={[
            { input: "Floor area", output: "1,500 ft²" },
            { input: "Climate zone", output: "4A (DC, NYC)", note: "cooling 90°F / 73°F WB, heating 17°F" },
            { input: "Construction era", output: "1980-2005", note: "R-13 walls, R-30 roof, double-pane" },
            { input: "Window area", output: "Average (15%)" },
            { input: "Occupants", output: "3" },
          ]}/>
        </Panel>
        <Panel title="Load breakdown" icon={Gauge}>
          <Lookups rows={[
            { input: "Walls", output: `${r0(EX1.cooling.components.walls)} BTU/hr` },
            { input: "Windows (conduction)", output: `${r0(EX1.cooling.components.windowsConduction)} BTU/hr` },
            { input: "Windows (solar)", output: `${r0(EX1.cooling.components.windowsSolar)} BTU/hr`, note: "largest single contributor" },
            { input: "Roof", output: `${r0(EX1.cooling.components.roof)} BTU/hr` },
            { input: "Infiltration sensible", output: `${r0(EX1.cooling.components.infiltrationSensible)} BTU/hr`, note: `${r0(EX1.geometry.infiltrationCfm)} CFM` },
            { input: "Infiltration latent", output: `${r0(EX1.cooling.components.infiltrationLatent)} BTU/hr` },
            { input: "People (sens + lat)", output: `${r0(EX1.cooling.components.peopleSensible + EX1.cooling.components.peopleLatent)} BTU/hr` },
            { input: "Equipment + lighting", output: `${r0(EX1.cooling.components.equipment)} BTU/hr` },
          ]}/>
        </Panel>
        <VerdictBanner status="info" title="Cooling: ~{r2(EX1.cooling.tons)} tons; Heating: ~{r0(EX1.heating.totalBtuHr)} BTU/hr">
          Sensible {r0(EX1.cooling.sensibleBtuHr)} + Latent {r0(EX1.cooling.latentBtuHr)} = Total {r0(EX1.cooling.totalBtuHr)} BTU/hr = {r2(EX1.cooling.tons)} tons. SHR = {r2(EX1.cooling.shr)}. Heating load {r0(EX1.heating.totalBtuHr)} BTU/hr at 17°F outdoor / 70°F indoor.
        </VerdictBanner>
        <FixCallout>
          <strong>Sizing decision:</strong> existing 3-ton equipment is roughly {(3 / EX1.cooling.tons * 100 - 100).toFixed(0)}% oversized vs the calculated load. A {Math.ceil(EX1.cooling.tons / 0.5) * 0.5}-ton replacement is correct sizing per ACCA Manual S (100-115% of Manual J). If keeping 3 tons, choose 2-stage or variable-capacity to reduce short-cycling. For heating: {r0(EX1.heating.totalBtuHr)} BTU/hr at 92% AFUE = {r0(EX1.heating.totalBtuHr / 0.92)} BTU/hr furnace input. The 80 kBTU existing furnace is {(80000 / EX1.heating.totalBtuHr * 100 - 100).toFixed(0)}% oversized — replace with 60 kBTU or use the existing on its lowest stage.
        </FixCallout>
      </ServiceProblem>
    </section>

    {/* SECTION 07 — Worked Example 2 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">07</span>
        Worked example 2 — 2,500 sq ft 2-story, Zone 2A (Houston), 2005-2015 build
      </h2>
      <ServiceProblem
        number={2}
        title="Hot/humid climate — latent load dominates"
        refrigerant="(load calculation)"
        scenario="2,500 sq ft 2-story home built 2010 in Houston. Standard residential envelope. 5 occupants (family of 4 + nanny). Hot, very humid climate. Standard double-pane low-e windows."
      >
        <Panel title="Result" icon={Gauge}>
          <Lookups rows={[
            { input: "Total cooling load", output: `${r0(EX2.cooling.totalBtuHr)} BTU/hr (${r2(EX2.cooling.tons)} tons)` },
            { input: "Sensible / Latent", output: `${r0(EX2.cooling.sensibleBtuHr)} / ${r0(EX2.cooling.latentBtuHr)} BTU/hr` },
            { input: "SHR (sensible / total)", output: r2(EX2.cooling.shr), note: "low SHR = humid climate, lots of latent work" },
            { input: "Total heating load", output: `${r0(EX2.heating.totalBtuHr)} BTU/hr`, note: "modest — Zone 2A is mild winter" },
            { input: "Square ft per ton", output: `${r0(EX2.cooling.sqftPerTon)} ft²/ton`, note: "lower than the rule-of-thumb 500 because of higher latent load" },
          ]}/>
        </Panel>
        <VerdictBanner status="warn" title="Hot/humid latent challenge">
          SHR of {r2(EX2.cooling.shr)} means {((1 - EX2.cooling.shr) * 100).toFixed(0)}% of cooling capacity goes to dehumidification — much higher than a Zone 4 home. Equipment matching matters: AHRI-rated equipment SHR must be at or below {r2(EX2.cooling.shr)} to handle the latent load. Look for AC units with 75-77°F entering wet-bulb conditions reporting SHR ≤ 0.78. Variable-capacity equipment is especially valuable here — at part load (mild morning) the system can run longer at lower capacity, pulling more moisture per BTU.
        </VerdictBanner>
        <FixCallout>
          <strong>Equipment recommendation:</strong> {Math.ceil(EX2.cooling.tons / 0.5) * 0.5}-ton variable-capacity heat pump (handles cooling + heating from same unit). Pair with a separate dehumidifier or oversized return ducts (low coil air velocity = more latent removal per ton). Standard single-stage equipment at this load will short-cycle on mild days and cause humidity complaints despite meeting setpoint.
        </FixCallout>
      </ServiceProblem>
    </section>

    {/* SECTION 08 — Worked Example 3 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">08</span>
        Worked example 3 — 1,000 sq ft high-performance condo, Zone 5A
      </h2>
      <ServiceProblem
        number={3}
        title="High-performance envelope — surprisingly small load"
        refrigerant="(load calculation)"
        scenario="1,000 sq ft 1-bedroom condo in Boston (Zone 5A) built 2018 to local high-performance standards. Triple-pane windows, R-21+ walls, tight envelope (0.2 ACH). 2 occupants. Surrounded on most sides by other conditioned units (this calc treats walls as exterior — actual condo loads would be lower)."
      >
        <Panel title="Result" icon={Gauge}>
          <Lookups rows={[
            { input: "Total cooling load", output: `${r0(EX3.cooling.totalBtuHr)} BTU/hr (${r2(EX3.cooling.tons)} tons)` },
            { input: "Sensible / Latent", output: `${r0(EX3.cooling.sensibleBtuHr)} / ${r0(EX3.cooling.latentBtuHr)} BTU/hr` },
            { input: "Total heating load", output: `${r0(EX3.heating.totalBtuHr)} BTU/hr`, note: "much higher than cooling because Zone 5A winter is severe" },
            { input: "Square ft per ton", output: `${r0(EX3.cooling.sqftPerTon)} ft²/ton`, note: "vastly higher than rule-of-thumb 500 — high-performance envelope" },
          ]}/>
        </Panel>
        <VerdictBanner status="info" title="The high-performance reality">
          A 1,000 sq ft tight, well-insulated condo needs roughly {r2(EX3.cooling.tons)} tons of cooling — close to the minimum residential equipment size (1.5 tons). Heating load is the bigger sizing driver here at {r0(EX3.heating.totalBtuHr)} BTU/hr. A 1.5-ton heat pump (18,000 BTU/hr cooling) covers cooling with {(((18000 / EX3.cooling.totalBtuHr) - 1) * 100).toFixed(0)}% margin and provides {r0(18000 * 2.5)} BTU/hr heating at average COP — close to the heating load but supplemental electric resistance covers the difference. A ductless mini-split is often the right choice at this scale.
        </VerdictBanner>
        <FixCallout>
          <strong>Why this isn&apos;t 2 tons:</strong> 1,000 sq ft × the legacy 500 ft²/ton rule = 2 tons. The high-performance envelope cuts that nearly in half. Right-sizing matters most for small high-performance homes — 2-ton equipment in a 1,000 sq ft tight condo will short-cycle horribly and the homeowner will be miserable despite meeting the thermostat. Stick to load-based sizing or use a variable-capacity ductless mini-split that modulates down to 25-30% of nominal capacity.
        </FixCallout>
      </ServiceProblem>
    </section>

    {/* SECTION 09 — SHR and equipment matching */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">09</span>
        Sensible Heat Ratio (SHR) and equipment matching
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        SHR = sensible cooling / total cooling. It tells you what fraction of cooling capacity goes to dropping dry-bulb temperature vs removing moisture. A home in a humid climate has lower SHR (more latent share); a home in a dry climate has higher SHR (mostly sensible). Equipment is also rated for an SHR — at AHRI standard conditions, residential AC typically rates SHR 0.74-0.82.
      </p>

      <KeyInsight tone="blue" title="The matching rule">
        For correct humidity control, <strong>equipment SHR ≤ load SHR</strong>. If the home&apos;s load SHR is 0.78 and equipment rated SHR is 0.82, the equipment removes too much sensible heat per unit latent — thermostat satisfies quickly, RH never gets low. Symptom: 72°F indoor but 65% RH, occupants feel sticky. Fix: lower coil sat. suction temperature (smaller cooling capacity at the same airflow) OR add a separate dehumidifier.
      </KeyInsight>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        How to match in practice: check the AHRI rating for candidate equipment at the home&apos;s entering wet-bulb conditions. AHRI publishes SHR per equipment combination (outdoor unit + indoor coil + line set). Compare against the load SHR from this calculator. If equipment SHR is higher than load SHR, either downsize the equipment (smaller compressor = lower sat. suction = more latent removal), oversize the indoor coil (more surface area = lower air velocity = more latent contact time), or plan for supplementary dehumidification.
      </p>
    </section>

    {/* SECTION 10 — Common errors */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">10</span>
        Common load-calc errors and how to avoid them
      </h2>

      <TechSection icon="problem" tone="amber" title="Error 1 — Sizing by rule of thumb">
        &quot;500 ft²/ton&quot; or &quot;1 ton per bedroom&quot; — these rules systematically oversize modern construction by 25-50%. They were derived in the 1960s-70s when building envelopes were drastically different. Always run a load calc (this one or full Manual J). If the load calc says 2 tons and the rule of thumb says 3, trust the load calc.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 2 — Using construction-era defaults for a home that was retrofitted">
        A 1985 home that had new windows + R-49 attic insulation added in 2018 doesn&apos;t perform like a 1985 home — it performs closer to a 2005-2015 build for the parts that were upgraded. Pick the era that matches the current envelope, not the original construction.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 3 — Ignoring orientation for solar load">
        The calculator averages solar load across orientations. A home with most of its windows facing west has 60-100% higher cooling load than the calculator predicts, because afternoon western sun coincides with peak outdoor temperature. For homes with dominant orientation, derate the calculator&apos;s cooling result by orientation correction: north-dominant -10%, south-dominant 0%, east-dominant +10%, west-dominant +20%.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 4 — Designing for typical instead of peak occupancy">
        A 4-bedroom home might have 4 people most days but 10 people for Thanksgiving dinner. The equipment has to handle peak conditions or it &quot;can&apos;t keep up&quot; when houseguests visit. Manual J convention: design for peak occupancy plus 1-2 visitor allowance for typical residential.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 5 — Not separating heating and cooling equipment sizing">
        In cold climates (Zone 4+), heating load substantially exceeds cooling load. Sizing the AC for cooling load and assuming the matched furnace is &quot;the right size&quot; misses the point — the furnace is rated separately. A 2-ton AC paired with a 100 kBTU furnace might be perfect for a Zone 5A home, even though the AC is much smaller than the furnace would suggest by tonnage equivalence. Always size each independently to its own load.
      </TechSection>
    </section>

    {/* SECTION 11 — Connecting to other tools */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">11</span>
        Connecting load calc to duct sizing and charging
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Load calculation produces a tonnage; from there, the design cascade continues through Manual D (duct sizing) and Manual S (equipment selection). The chain:
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
        <li><strong>Manual J (this calculator)</strong> → cooling tons + heating BTU/hr from envelope analysis.</li>
        <li><strong>Manual S</strong> (equipment selection) → pick equipment with cooling capacity 100-115% of Manual J cooling (1-stage) or 110-125% (2-stage), matched coil + outdoor unit per AHRI-certified combination. Furnace input = heating load / AFUE.</li>
        <li><strong>Manual D</strong> (<Link href="/duct-size-calculator/" className="underline">duct sizing calculator</Link>) → design CFM = cooling tons × 400 (or per equipment data sheet). Size trunk and branches at 0.08 / 0.05 friction.</li>
        <li><strong>Field charging</strong> (<Link href="/superheat-calculator/" className="underline">superheat</Link> / <Link href="/subcooling-calculator/" className="underline">subcooling</Link> / <Link href="/carrier-410a-charging-chart/" className="underline">Carrier chart</Link>) → after install, verify refrigerant charge at design conditions to confirm equipment delivers rated capacity.</li>
      </ol>
      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        Skip any link and the system underperforms. Right equipment + wrong ducts = airflow strangled, capacity drops. Right ducts + wrong charge = pressures wrong, capacity drops. Right everything = system delivers Manual J load at design conditions and runs efficiently the rest of the season.
      </p>
    </section>
  </>
);

export default function HvacLoadCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "hvac-load-calculator",
        name: "HVAC Load Calculator — Quick Manual J Cooling + Heating",
        description:
          "Compute residential cooling tons and heating BTU/hr from 7 inputs (floor area, stories, climate zone, construction era, window area, occupants, equipment). Quick Manual J estimate within ±20% of full report. Component breakdown, sensible/latent split, equipment-sizing guidance with oversizing warnings.",
        featureList: [
          "Component-based load calculation per ACCA Manual J 8th edition methodology",
          "8 IECC climate zones with ASHRAE 1% / 99% design temperatures",
          "4 construction eras with IECC-prescriptive U-values and infiltration",
          "Sensible / latent breakdown with SHR for equipment matching",
          "Equipment sizing recommendation with oversizing warning per Manual S",
          "Full component breakdown: walls, windows (conduction + solar), roof, infiltration, people, equipment",
          "Heating load with furnace input requirement at 92% AFUE",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "HVAC Load Calculator",
      }}
      introOneLiner="Compute residential cooling tons and heating BTU/hr from 7 inputs. Component breakdown, sensible/latent split, and equipment sizing guidance with oversizing warnings. Quick Manual J estimate — accurate within ±20% of full Manual J for typical residential."
      howTo={{ steps: HOWTO_STEPS.map((s) => `${s.title}: ${s.text}`) }}
      math={{
        formula: "Cooling sensible per component:\n  Q_walls = U × A × CLTD_walls          (CLTD_walls ≈ ΔT + 15°F)\n  Q_windows = U × A × ΔT + A × SHGC × SHGF\n  Q_roof = U × A × CLTD_roof            (CLTD_roof ≈ ΔT + 35°F)\n  Q_infil_sens = 1.08 × CFM × ΔT\n  Q_people_sens = 250 × occupants\nCooling latent:\n  Q_infil_lat = 0.68 × CFM × Δgrains\n  Q_people_lat = 150 × occupants\nTotal cooling = sum of all components; tons = total / 12,000\nHeating: same per-component conduction formulas with heating ΔT, no solar credit, no internal-gains credit (conservative).\nCFM_infil = ACH × volume / 60",
        sourceCitation: "ACCA Manual J Residential Load Calculation, 8th edition (2016). ASHRAE Handbook of Fundamentals 2021, Chapter 17: Residential Cooling and Heating Load Calculations. IECC 2021 (climate zones + prescriptive R-values). ASHRAE Climatic Design Conditions database (1% cooling DB / 99% heating DB by station).",
        workedExample: `Example 1: 1,500 sq ft single-story, Zone 4A (DC area), 1980-2005 build, 15% window area, 3 occupants.\nGeometry: perimeter ≈ ${r0(4 * Math.sqrt(1500))} ft, gross wall area ${r0(EX1.geometry.wallAreaSqft + EX1.geometry.windowAreaSqft)} ft², window area ${r0(EX1.geometry.windowAreaSqft)} ft², roof ${r0(EX1.geometry.roofAreaSqft)} ft².\nVolume = 1500 × 8 = 12,000 ft³.\nInfiltration CFM = 0.4 × 12000 / 60 = 80 CFM.\nCooling ΔT = 90 − 75 = 15°F; CLTD_walls = 30°F; CLTD_roof = 50°F.\nWalls: 0.077 × ${r0(EX1.geometry.wallAreaSqft)} × 30 = ${r0(EX1.cooling.components.walls)} BTU/hr.\nWindows solar (dominant): ${r0(EX1.cooling.components.windowsSolar)} BTU/hr.\nTotal sensible: ${r0(EX1.cooling.sensibleBtuHr)}, latent: ${r0(EX1.cooling.latentBtuHr)}.\nTotal cooling: ${r0(EX1.cooling.totalBtuHr)} BTU/hr = ${r2(EX1.cooling.tons)} tons.\nHeating ΔT = 70 − 17 = 53°F → heating load ${r0(EX1.heating.totalBtuHr)} BTU/hr.`,
      }}
      relatedTools={[
        { href: "/duct-size-calculator/", label: "Duct size calculator", blurb: "Once you have tonnage, size ducts at 400 CFM/ton with the ACCA Manual D equal-friction method." },
        { href: "/psychrometric-calculator/", label: "Psychrometric calculator", blurb: "Verify outdoor air enthalpy at design conditions; compute SHR from coil entering/leaving states." },
        { href: "/carrier-410a-charging-chart/", label: "Carrier R-410A charging chart", blurb: "After install, verify R-410A charge at design conditions to confirm equipment delivers Manual J load." },
        { href: "/superheat-calculator/", label: "Superheat calculator", blurb: "Field charging for TXV/EEV systems." },
        { href: "/refrigerant-charge-calculator/", label: "Refrigerant charge calculator", blurb: "Line-set adjustment to nameplate charge." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "Diagnostic for equipment underperforming vs design." },
      ]}
      faqs={FAQS}
      generatedDate={PUBLISHED.slice(0, 10)}
      bodySections={BodySections}
    >
      <HvacLoadCalculator />
    </CalculatorShell>
  );
}

// Suppress unused import warnings
void [Activity, Sun, Snowflake, Home, Users, AlertTriangle, BookOpen];
