import type { Metadata } from "next";
import Link from "next/link";
import { Activity, BookOpen, Gauge, ListChecks, Mountain, AlertTriangle } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { SITE_URL } from "@/lib/schema/shared";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { DuctSizeCalculator } from "@/components/calculators/DuctSizeCalculator";
import {
  ComparisonTable,
  FixCallout,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import {
  sizeDuct,
  exactDiameterInches,
  velocityFpm,
  frictionLossPerHundredFt,
  huebscherEquivalent,
  STANDARD_AIR_DENSITY,
  airDensity,
  atmPressurePsia,
} from "@/lib/duct-sizing";

const PAGE_URL = `${SITE_URL}/duct-size-calculator/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Duct Size Calculator — Round + Rectangular Sizing from CFM (ACCA Manual D Equal-Friction Method)",
  description:
    "Calculate round duct diameter from CFM and friction rate using the ACCA Manual D equal-friction method, plus Huebscher rectangular equivalents. Three worked examples (3-ton residential trunk, branch run, commercial supply), velocity limits, altitude correction, common errors, full sourcing.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Duct Size Calculator — Round + Rectangular Sizing from CFM (ACCA Manual D)",
    description:
      "Equal-friction duct sizing with Huebscher round⇔rectangular, velocity limits by application, altitude correction, and 3 worked examples.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Duct Size Calculator — ACCA Manual D Equal-Friction Method",
    description: "CFM → round duct diameter + rectangular equivalents, with velocity limits and altitude correction.",
    images: ["/twitter-image"],
  },
};

const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const r0 = (n: number) => (Number.isFinite(n) ? n.toFixed(0) : "—");
const r3 = (n: number) => (Number.isFinite(n) ? n.toFixed(3) : "—");

// Pre-compute worked example values
const EX1 = sizeDuct({ cfm: 1200, frictionTarget: 0.08, maxVelocity: 900 })!;
const EX2 = sizeDuct({ cfm: 100, frictionTarget: 0.08, maxVelocity: 700 })!;
const EX3 = sizeDuct({ cfm: 2000, frictionTarget: 0.10, maxVelocity: 1500 })!;

// CFM range table for common standard sizes at 0.08 friction
const SIZING_TABLE = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24].map((d) => {
  // For each diameter, find the CFM range from 60% velocity to 100% velocity at 0.08 friction
  // Easier: at 0.08 friction, what's the CFM that exactly matches this diameter?
  // Use V = 183.3 * Q / D² and friction = 0.0307 × (V/100)^1.9 / D^1.22 = 0.08
  // V = 100 × (0.08 × D^1.22 / 0.0307)^(1/1.9)
  const vMax = 100 * Math.pow((0.08 * Math.pow(d, 1.22)) / 0.0307, 1 / 1.9);
  const cfmAt08 = (vMax * Math.PI * d * d) / 576;
  // At 0.05 friction (return-side):
  const vMax05 = 100 * Math.pow((0.05 * Math.pow(d, 1.22)) / 0.0307, 1 / 1.9);
  const cfmAt05 = (vMax05 * Math.PI * d * d) / 576;
  return { d, vAt08: vMax, cfmAt08, vAt05: vMax05, cfmAt05 };
});

const DENVER_DENSITY = airDensity(70, 5280);
const DENVER_EX = sizeDuct({ cfm: 1200, frictionTarget: 0.08, tempF: 70, altitudeFt: 5280, maxVelocity: 900 })!;

const FAQS = [
  {
    q: "What is the equal-friction method and why is it the standard?",
    a: "Equal-friction sizing keeps the friction rate (pressure drop per 100 ft of duct) constant throughout the supply or return system — typically 0.08 in.w.c./100 ft for residential supply, 0.05 for residential return, 0.10-0.20 for commercial. Each duct section is sized to maintain that target friction at its design CFM. The method is the standard because it produces predictable total system static pressure (sum of friction × length plus fitting losses) without iterative balancing. ACCA Manual D, ASHRAE Handbook Fundamentals Chapter 21, and SMACNA all teach equal-friction as the primary sizing method for low- and medium-pressure HVAC systems.",
  },
  {
    q: "What friction rate should I use for residential design?",
    a: "0.08 in.w.c./100 ft for supply, 0.05 for return — the defaults in ACCA Manual D Table 7. These values balance duct cost (lower friction means larger ducts which cost more material and take more space) against blower energy (higher friction means smaller ducts but more blower work and noise). Going below 0.05 is rarely justified — the duct gets oversized without meaningful comfort gain. Going above 0.10 on residential supply pushes velocity into the audible range and forces a larger blower. Stay at 0.08/0.05 unless you have a specific reason to deviate.",
  },
  {
    q: "Why is the return-side friction target lower than the supply?",
    a: "Two reasons. (1) Noise: return ducts often run through unconditioned attic or basement space close to occupied rooms; lower velocity means lower whoosh. ASHRAE 33-2016 recommends ≤600 fpm for residential return paths near occupied space. (2) Filter pressure drop: returns typically include a filter that adds 0.10-0.30 in.w.c. of resistance; sizing return ducts more generously offsets some of that drop and keeps total external static within blower spec. A common rule of thumb: return cross-sectional area should be ~25% larger than supply at the same CFM, which falls out naturally from 0.05 vs 0.08 friction rates.",
  },
  {
    q: "When should I use rectangular vs round duct?",
    a: "Round is more efficient — less surface area per unit cross-section means less friction, less material, less duct cost. Always use round when ceiling/wall space allows it. Rectangular is necessary when you need to fit ductwork into tight rectangular cavities (typical residential floor systems, between joists in attic space). The penalty: at the same CFM and friction rate, a rectangular duct needs more cross-sectional area than the equivalent round, by roughly 5-20% depending on aspect ratio. The calculator above shows the round size first, then lists rectangular equivalents per Huebscher's equation.",
  },
  {
    q: "What does aspect ratio mean and why does ACCA limit it to 4:1?",
    a: "Aspect ratio is width-to-height of a rectangular duct (e.g. 20×5 = 4:1). The Huebscher equivalence equation assumes friction scales smoothly with shape; in practice, ratios above 4:1 see disproportionate friction increase because the higher surface-to-area ratio adds more wall friction than Huebscher predicts. Beyond 4:1 also creates uneven velocity profile (faster in the middle, slower at the corners) which generates noise. ACCA Manual D Table 7 caps aspect ratio at 4:1 for design work; the calculator above excludes ratios above 4:1 from its rectangular equivalents.",
  },
  {
    q: "How do I size return-air grilles to match the duct?",
    a: "Return-grille face velocity must be lower than duct velocity — typically 300-400 fpm at the grille for residential (vs 500-600 fpm in the duct). That means grille free area is roughly 2× the duct cross-section. For a 1200 CFM return at 600 fpm duct velocity, duct cross-section = 1200/600 = 2 ft² = 288 in². A 20×20 face grille has gross area 400 in², free area roughly 200 in² (50% net free area is typical for stamped grilles). Face velocity = 1200 × 144 / 200 = 864 fpm — too high. You'd need a 24×24 grille (576 in² gross, ~300 in² free, velocity = 576 fpm) or two 16×16 grilles.",
  },
  {
    q: "Does duct length matter for sizing, or just for total static pressure?",
    a: "Length affects total static pressure (which the blower has to overcome), not the diameter at any given section. Each section is sized for its CFM at the target friction rate, then the entire system's static = (sum of section length × friction rate) + fitting losses (expressed as equivalent length) + filter + coil + grilles. The blower spec then must exceed total external static at the design CFM. ACCA Manual D walks through this in Section 8.",
  },
  {
    q: "What's the right way to handle altitude in duct sizing?",
    a: `Air density drops with altitude — at Denver (5,280 ft) density is ~${r3(DENVER_DENSITY)} lb/ft³ vs ${r3(STANDARD_AIR_DENSITY)} sea-level standard. Friction loss scales linearly with density, so the same duct passing the same CFM at Denver has roughly ${r0((1 - DENVER_DENSITY / STANDARD_AIR_DENSITY) * 100)}% less friction than at sea level. The calculator above accepts altitude and temperature inputs and corrects density automatically. For example, a 1200 CFM trunk at 0.08 friction sea level needs a ${EX1.standardDiameter}″ duct; the same load at Denver needs ${DENVER_EX.standardDiameter}″ — slightly smaller because the air is thinner. Mountain-region designers who use sea-level tables get oversized ducts; the over-sizing doesn't hurt much in practice but it wastes material.`,
  },
  {
    q: "What about flex duct? Same sizing equations?",
    a: "No — flex duct has higher friction than smooth-wall galvanized at the same diameter. ACCA Manual D and ASHRAE both apply a flex-duct correction factor of approximately 1.5-2.5× (varies by manufacturer and how taut the flex is installed). The cleanest approach: size for galvanized, then upsize the flex by one standard size (e.g., a calculation calling for 8″ round → use 10″ flex, or use 8″ flex stretched taut with no excess length). Manufacturers like Atco and Flexmaster publish their own friction charts; consult those for tighter design.",
  },
];

const HOWTO_STEPS = [
  {
    title: "Determine the design CFM for the duct section",
    text: "From a Manual J load calculation: total CFM = (sensible cooling load BTU/hr) / (1.08 × ΔT). For a 3-ton (36,000 BTU/hr) residential system at 20°F coil ΔT, design CFM ≈ 36000 / (1.08 × 20) = 1667 CFM. Trunk sections carry the full CFM; branches carry only the rooms they feed.",
  },
  {
    title: "Pick the friction rate from the application preset",
    text: "Residential supply trunk: 0.08 in.w.c./100 ft. Residential supply branch: 0.08. Residential return: 0.05. Commercial low-pressure: 0.10. Commercial medium-pressure: 0.20. The calculator's Application dropdown sets these defaults.",
  },
  {
    title: "Enter CFM, friction rate, and altitude (if above 2,000 ft)",
    text: "The calculator solves the ASHRAE friction equation: D = (0.0992 × Q^1.9 / friction)^(1/5.02). It then rounds up to the nearest standard sheet-metal size (4″, 5″, 6″, 7″, 8″, 9″, 10″, 12″, 14″, 16″, 18″, 20″, 22″, 24″, etc.).",
  },
  {
    title: "Check the velocity against the application limit",
    text: "Residential supply trunk: ≤900 fpm. Branch: ≤700 fpm. Return: ≤600 fpm. Commercial low-pressure: ≤1500 fpm. If velocity exceeds the limit, the duct is too small — upsize. The calculator flags violations with a red warning.",
  },
  {
    title: "Pick a rectangular equivalent if round won't fit",
    text: "The Huebscher equation lists rectangular dimensions that produce the same friction at the same CFM as the round duct. Pick one that fits your cavity space. Avoid aspect ratios above 4:1 — they suffer extra friction beyond Huebscher's prediction.",
  },
  {
    title: "Sum total static pressure for the whole system",
    text: "Total external static = (sum of all section lengths × friction rate) + fitting equivalent lengths (elbows, takeoffs, transitions) + filter ΔP + coil ΔP + grilles. Confirm total external static is within the blower's published curve at design CFM.",
  },
];

const BodySections = (
  <>
    {/* SECTION 01 — Why duct sizing matters */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">01</span>
        Why duct sizing is the most consequential decision in residential HVAC design
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        A correctly sized cooling system on undersized ductwork can&apos;t reach its rated capacity — the airflow that the equipment spec sheet assumes never materializes, so neither does the cooling. Studies from NIST and Lawrence Berkeley National Laboratory document that 30-40% of residential cooling capacity is commonly lost to duct system problems: leakage, undersizing, poor routing, and uninsulated ducts in unconditioned space. The single largest controllable factor is sizing. ACCA published Manual D in 1991 specifically because the trade had been free-handing duct sizes for decades and getting it wrong consistently. The equal-friction method this calculator implements is the same method Manual D specifies.
      </p>

      <KeyInsight tone="blue" title="What &quot;correct&quot; sizing produces">
        At the target friction rate (0.08 in.w.c./100 ft for residential supply), every section of duct produces approximately the same pressure loss per 100 ft regardless of CFM. That predictable behavior is what lets you sum up section lengths × friction to get system-total static pressure, which is what the blower has to overcome. Get the sizing right and total external static matches blower spec, airflow matches design CFM, and the equipment delivers its rated capacity. Get sizing wrong (too small) and total static exceeds blower spec, airflow falls below design, capacity drops by the same fraction, and the homeowner experiences a system that &quot;doesn&apos;t keep up&quot; on hot days.
      </KeyInsight>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        The cost of getting it wrong is high. An undersized return on a 3-ton system can rob 15-25% of rated capacity (room becomes 76°F instead of 72°F setpoint on a 95°F day). Oversized supply trunks waste material and ceiling space but don&apos;t hurt performance — so when in doubt, size up rather than down. The calculator below makes both directions trivial: enter CFM, pick the friction rate, get the duct size.
      </p>
    </section>

    {/* SECTION 02 — Equal-friction method */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">02</span>
        The equal-friction method explained
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        The equal-friction method holds the friction-loss rate constant across every duct section in the supply (or return) trunk-and-branch system. Pick a friction rate at the start — typically 0.08 in.w.c./100 ft for residential supply per ACCA Manual D Table 7 — and every section is sized to maintain that rate at its design CFM.
      </p>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        Why this works: as you move from trunk to branch, CFM drops (the trunk carries air for the whole system; each branch carries only the rooms it feeds). The duct gets smaller. Velocity stays roughly constant if you preserve the friction rate — that&apos;s the &quot;equal-friction&quot; meaning. Total system static pressure then equals (sum of section lengths × friction rate) plus fitting losses plus filter/coil/grille losses — a single arithmetic sum, not an iterative balance.
      </p>

      <ComparisonTable
        headers={["Sizing method", "When used", "Pro", "Con"]}
        rows={[
          { label: "Equal-friction (this calculator)", cells: ["Most residential and small commercial low-pressure", "Simple arithmetic; predictable total static", "Doesn't optimize for balanced flow without dampers"] },
          { label: "Velocity reduction", cells: ["Older industrial / very large systems", "Conserves static pressure across distance", "Requires careful manual sizing per section"] },
          { label: "Static regain", cells: ["Large commercial / high-pressure variable-volume", "Recovers velocity pressure as static for balance", "Iterative calculation; needs design software"] },
          { label: "Constant velocity", cells: ["Specialty: paint booths, fume hoods", "Maintains transport velocity for particulates", "Inefficient for general HVAC"] },
        ]}
      />
    </section>

    {/* SECTION 03 — Interactive widget intro */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">03</span>
        How to use the calculator above
      </h2>
      <ol className="list-decimal space-y-2 pl-6 text-zinc-700 dark:text-zinc-300">
        <li><strong>Pick the application preset</strong> — residential supply trunk, branch, return, or commercial. The preset sets the default friction rate and velocity limit.</li>
        <li><strong>Enter CFM</strong> for the section being sized — from Manual J load calculation or measured airflow. Trunk = full system; branches = room sub-total.</li>
        <li><strong>Override friction</strong> only if you have a specific reason (very long runs may need 0.06 instead of 0.08 to keep total static within blower spec).</li>
        <li><strong>Set altitude</strong> if above 2,000 ft. Mountain-region installations need density correction or the duct comes out 5-10% too large.</li>
        <li><strong>Read the standard round size</strong> (highlighted) — that&apos;s the diameter to spec. The exact-calc value below it shows what the math produced; the standard size rounds up to the nearest sheet-metal stock.</li>
        <li><strong>Check the rectangular equivalents</strong> if round won&apos;t fit your installation cavity. Pick the lowest aspect ratio that fits.</li>
      </ol>
    </section>

    {/* SECTION 04 — Sizing reference table */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">04</span>
        Standard round duct CFM capacity reference (at 0.08 / 0.05 friction)
      </h2>
      <p className="mb-4 text-zinc-700 dark:text-zinc-300">
        Use this table for quick mental sizing — find the CFM you need to carry, read off the smallest round duct that handles it within the friction limit. Two columns: 0.08 in.w.c./100 ft (residential supply target) and 0.05 (residential return target).
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="px-3 py-2 text-left text-xs text-zinc-500">
            Max CFM per standard round duct size at design friction rates (sea level, standard air).
          </caption>
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Round size (in)</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Max CFM @ 0.08</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Velocity @ 0.08 (fpm)</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Max CFM @ 0.05</th>
              <th className="border-b border-zinc-200 px-3 py-2 text-left font-mono text-xs dark:border-zinc-800">Velocity @ 0.05 (fpm)</th>
            </tr>
          </thead>
          <tbody>
            {SIZING_TABLE.map((row) => (
              <tr key={row.d} className="even:bg-zinc-50/50 dark:even:bg-zinc-900/30">
                <td className="px-3 py-2 font-mono font-semibold">{row.d}″</td>
                <td className="px-3 py-2 font-mono">{r0(row.cfmAt08)}</td>
                <td className="px-3 py-2 font-mono">{r0(row.vAt08)}</td>
                <td className="px-3 py-2 font-mono">{r0(row.cfmAt05)}</td>
                <td className="px-3 py-2 font-mono">{r0(row.vAt05)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FixCallout>
        <strong>How to read the table:</strong> A 1200 CFM supply trunk at 0.08 friction needs a 14″ round duct (handles up to {r0(SIZING_TABLE[8].cfmAt08)} CFM). A 1200 CFM return at 0.05 friction needs a 16″ round (handles up to {r0(SIZING_TABLE[9].cfmAt05)} CFM at the lower friction rate). The return is one size larger than the supply at the same CFM — that&apos;s the natural consequence of the lower friction target.
      </FixCallout>
    </section>

    {/* SECTION 05 — Worked Example 1 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">05</span>
        Worked example 1 — 3-ton residential supply trunk (1,200 CFM)
      </h2>
      <ServiceProblem
        number={1}
        title="Sizing the main supply trunk for a 3-ton AC"
        refrigerant="(airflow calculation — not refrigerant-side)"
        scenario="3-ton (36,000 BTU/hr) residential AC, 400 CFM/ton design = 1,200 CFM total. Standard 70°F supply air at sea level. Equal-friction sizing at 0.08 in.w.c./100 ft per ACCA Manual D Table 7. Max trunk velocity 900 fpm."
      >
        <Panel title="Inputs" icon={ListChecks}>
          <Lookups rows={[
            { input: "CFM", output: "1,200" },
            { input: "Friction target", output: "0.08 in.w.c./100 ft", note: "ACCA Manual D residential supply" },
            { input: "Velocity limit", output: "900 fpm", note: "noise-controlled limit for trunk" },
            { input: "Air density", output: `${r3(STANDARD_AIR_DENSITY)} lb/ft³`, note: "standard sea-level air" },
          ]}/>
        </Panel>
        <Panel title="Solution" icon={Gauge}>
          <Lookups rows={[
            { input: "Exact diameter", output: `${r1(EX1.exactDiameter)}″`, note: "from closed-form: D = (0.0992 × 1200^1.9 / 0.08)^(1/5.02)" },
            { input: "Standard round size", output: `${EX1.standardDiameter}″`, note: "rounded up to nearest sheet-metal stock" },
            { input: "Velocity at standard size", output: `${r0(EX1.velocityAtStandard)} fpm`, note: `vs 900 fpm limit` },
            { input: "Actual friction at standard size", output: `${r3(EX1.frictionAtStandard)} in.w.c./100 ft`, note: "slightly below 0.08 target — duct is larger than exact" },
            { input: "Rectangular equiv. (best fit)", output: EX1.rectangularEquivalents[0] ? `${EX1.rectangularEquivalents[0].width}″ × ${EX1.rectangularEquivalents[0].height}″` : "—", note: "Huebscher equivalence, aspect ratio ≤ 4:1" },
          ]}/>
        </Panel>
        <VerdictBanner status="ok" title="Spec: 14″ round (or rectangular equivalent)">
          1,200 CFM at 0.08 friction calls for a {EX1.standardDiameter}″ round duct. Velocity is {r0(EX1.velocityAtStandard)} fpm — well below the 900 fpm noise limit. Actual friction is {r3(EX1.frictionAtStandard)} in.w.c./100 ft (below the 0.08 target because the standard size is slightly larger than the exact). The 14″ round duct delivers the design 1,200 CFM with margin to spare.
        </VerdictBanner>
        <FixCallout>
          <strong>If the trunk is 50 ft long</strong>: total friction = 0.05 × 50/100 = 0.025 in.w.c. (using actual friction not target). Add fitting equivalent lengths (1 elbow ≈ 20 ft equivalent, supply takeoffs ≈ 5-10 ft each), and the trunk contributes roughly 0.05-0.07 in.w.c. to total external static. The blower has ~0.5 in.w.c. external static available; trunk is well within budget.
        </FixCallout>
      </ServiceProblem>
    </section>

    {/* SECTION 06 — Worked Example 2 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">06</span>
        Worked example 2 — Single-room branch run (100 CFM bedroom)
      </h2>
      <ServiceProblem
        number={2}
        title="Sizing a branch run to one bedroom"
        refrigerant="(airflow calculation)"
        scenario="200 sq ft bedroom needing 100 CFM (Manual J cooling load for the room). Branch run from the supply trunk to the room ceiling diffuser, about 18 ft of duct. Same 0.08 friction target. Branch velocity limit 700 fpm (lower than trunk to keep room quiet)."
      >
        <Panel title="Solution" icon={Gauge}>
          <Lookups rows={[
            { input: "Exact diameter", output: `${r1(EX2.exactDiameter)}″`, note: "from same equation, smaller Q" },
            { input: "Standard round size", output: `${EX2.standardDiameter}″`, note: "next standard size up" },
            { input: "Velocity at standard size", output: `${r0(EX2.velocityAtStandard)} fpm`, note: "well below 700 fpm branch limit" },
            { input: "Actual friction at standard size", output: `${r3(EX2.frictionAtStandard)} in.w.c./100 ft`, note: "below target — small margin to play with" },
          ]}/>
        </Panel>
        <VerdictBanner status="ok" title="Spec: 6″ round flex or galvanized">
          100 CFM at 0.08 friction calls for a {EX2.standardDiameter}″ round duct. Most residential bedroom branches use 6″ flex; the calculator confirms 6″ is correct at this CFM and friction rate. If using flex (vs galvanized), upsize to 7″ to compensate for the ~1.5-2× friction penalty of flex liner vs smooth galvanized — Atco and Flexmaster publish their friction charts; ACCA Manual D includes a flex correction factor table.
        </VerdictBanner>
        <FixCallout>
          <strong>Common error</strong>: 4″ &quot;flex jumpers&quot; from trunk to register. 4″ flex at 100 CFM has velocity 1,146 fpm and friction over 0.5 in.w.c./100 ft — 6× the design target. The room gets ~50-60 CFM in practice, not 100, and the homeowner complains about being too hot. Always size flex branches by the calculator, not by what fits the boot.
        </FixCallout>
      </ServiceProblem>
    </section>

    {/* SECTION 07 — Worked Example 3 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">07</span>
        Worked example 3 — Commercial low-pressure supply (2,000 CFM)
      </h2>
      <ServiceProblem
        number={3}
        title="Office building supply branch, 5-ton VAV box"
        refrigerant="(airflow calculation)"
        scenario="5-ton commercial AC supplying a 2,000 sq ft open office. 400 CFM/ton = 2,000 CFM at maximum airflow. Commercial low-pressure design: 0.10 in.w.c./100 ft friction, velocity limit 1,500 fpm (commercial systems tolerate higher velocity than residential because of sound attenuators)."
      >
        <Panel title="Solution" icon={Gauge}>
          <Lookups rows={[
            { input: "Exact diameter", output: `${r1(EX3.exactDiameter)}″` },
            { input: "Standard round size", output: `${EX3.standardDiameter}″` },
            { input: "Velocity at standard size", output: `${r0(EX3.velocityAtStandard)} fpm`, note: "vs 1,500 fpm limit" },
            { input: "Actual friction at standard size", output: `${r3(EX3.frictionAtStandard)} in.w.c./100 ft`, note: "near 0.10 target" },
            { input: "Rectangular equiv.", output: EX3.rectangularEquivalents[0] ? `${EX3.rectangularEquivalents[0].width}″ × ${EX3.rectangularEquivalents[0].height}″` : "—", note: "fits in 16″-deep ceiling cavity" },
          ]}/>
        </Panel>
        <VerdictBanner status={EX3.velocityWarning === "ok" ? "ok" : "warn"} title={`Spec: ${EX3.standardDiameter}″ round (or rectangular equivalent)`}>
          2,000 CFM at 0.10 friction commercial sizing calls for a {EX3.standardDiameter}″ round duct or equivalent rectangular section. The {EX3.rectangularEquivalents[0]?.width}″ × {EX3.rectangularEquivalents[0]?.height}″ rectangular fits in the typical 16-inch ceiling cavity above the suspended ceiling. Velocity of {r0(EX3.velocityAtStandard)} fpm is acceptable for commercial low-pressure design.
        </VerdictBanner>
      </ServiceProblem>
    </section>

    {/* SECTION 08 — Round vs rectangular */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">08</span>
        Round vs rectangular — the Huebscher equivalence
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Round duct is more efficient than rectangular at the same cross-sectional area because it has the smallest perimeter (less wall surface = less friction). For HVAC the practical question is: given a target round size, what rectangular dimensions produce the same friction at the same CFM? The answer is the Huebscher equivalent diameter:
      </p>

      <pre className="my-3 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
{`D_eq = 1.30 × (a × b)^0.625 / (a + b)^0.25

where:  D_eq = equivalent round diameter (in)
        a, b = rectangular dimensions (in)`}
      </pre>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        Example: a 14″ round duct has D_eq = 14″. Find rectangular dimensions with the same equivalent diameter — the calculator lists them. A 16″ × 8″ rectangle gives D_eq = {r1(huebscherEquivalent(16, 8))}″ — very close to 14″. A 20″ × 6″ rectangle has aspect ratio 3.3:1 (acceptable) but D_eq = {r1(huebscherEquivalent(20, 6))}″ — also close. The calculator filters to aspect ratios ≤ 4:1 per ACCA Manual D because ratios above 4:1 suffer disproportionate friction beyond Huebscher&apos;s smooth prediction.
      </p>

      <KeyInsight tone="amber" title="Practical advantages of round">
        For the same duct capacity, round uses 15-25% less sheet metal than equivalent rectangular (lower surface area), produces lower friction at the same CFM (Huebscher is an &quot;equivalent friction&quot; not &quot;equivalent area&quot; relationship), and is easier to seal (one round joint vs four rectangular seams). The downside: round is harder to fit into rectangular cavities (between joists, in soffits). Most residential installs use round in attic and basement, rectangular through floor systems and tight ceiling spaces.
      </KeyInsight>
    </section>

    {/* SECTION 09 — Altitude */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">09</span>
        Altitude correction — when standard tables under-size at elevation
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Standard duct sizing tables assume sea-level air density (0.075 lb/ft³ at 70°F). At altitude, density drops via the barometric formula:
      </p>

      <ComparisonTable
        headers={["Location", "Elevation", "Pressure (psia)", "Density (lb/ft³)", "% friction vs sea level"]}
        rows={[
          { label: "Sea level (Miami, NYC)", cells: ["0 ft", `${r2(atmPressurePsia(0))}`, `${r3(airDensity(70, 0))}`, "100%"] },
          { label: "Atlanta", cells: ["1,050 ft", `${r2(atmPressurePsia(1050))}`, `${r3(airDensity(70, 1050))}`, `${r0((airDensity(70, 1050) / STANDARD_AIR_DENSITY) * 100)}%`] },
          { label: "Denver", cells: ["5,280 ft", `${r2(atmPressurePsia(5280))}`, `${r3(airDensity(70, 5280))}`, `${r0((airDensity(70, 5280) / STANDARD_AIR_DENSITY) * 100)}%`] },
          { label: "Aspen", cells: ["7,908 ft", `${r2(atmPressurePsia(7908))}`, `${r3(airDensity(70, 7908))}`, `${r0((airDensity(70, 7908) / STANDARD_AIR_DENSITY) * 100)}%`] },
          { label: "Mexico City", cells: ["7,350 ft", `${r2(atmPressurePsia(7350))}`, `${r3(airDensity(70, 7350))}`, `${r0((airDensity(70, 7350) / STANDARD_AIR_DENSITY) * 100)}%`] },
        ]}
      />

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        Friction loss scales linearly with density. At Denver, a duct passing 1,200 CFM has roughly {r0((1 - airDensity(70, 5280) / STANDARD_AIR_DENSITY) * 100)}% less friction than the sea-level equivalent. The calculator&apos;s altitude field corrects automatically — enter elevation and air temperature, and the friction equation uses the correct density. In practice, the altitude correction allows a slightly smaller standard duct than sea-level tables would specify. For mountain-region designers using printed tables, the practical advice: stick with the sea-level table size for safety margin, or use a calculator like this one for tighter design.
      </p>
    </section>

    {/* SECTION 10 — Common errors */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">10</span>
        Common duct-sizing errors and how to avoid them
      </h2>

      <TechSection icon="problem" tone="amber" title="Error 1 — Sizing the return the same as the supply">
        At the same CFM, return ducts need lower friction (0.05 vs 0.08) for noise reasons, which means a larger duct. Using a 14″ return duct for 1,200 CFM (sized at supply friction) gives ~750 fpm at the return grille — audible whoosh in a quiet bedroom. The right size is 16″ at 0.05 friction (~600 fpm). Common shortcut that causes problems: &quot;same size as supply&quot; — saves material cost, creates noise complaints.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 2 — Using flex without the friction correction">
        Flex duct has 1.5-2.5× the friction of smooth galvanized at the same diameter and CFM. Sizing flex with the galvanized friction equation produces undersized flex runs. Symptom: rooms with flex runs underperform; calling for more CFM doesn&apos;t help because the bottleneck is flex friction. Either size for galvanized and upsize the flex by one standard size, or use the manufacturer&apos;s flex-specific friction chart.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 3 — Ignoring fitting equivalent lengths">
        Elbows, takeoffs, transitions, and reducers all add static pressure beyond straight-duct friction. A 90° smooth elbow has equivalent length ~20 ft of straight duct at the same diameter. A boot takeoff with a damper adds 15-25 ft equivalent. Skipping fitting losses in the total-static calculation under-budgets blower work, and the system runs short of airflow. ACCA Manual D Appendix 3 lists equivalent lengths for common fittings; SMACNA Table 4-1 has a more complete catalog.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 4 — Aspect ratio above 4:1">
        Squeezing a 14″ round equivalent into a 28″ × 4″ rectangular cavity exceeds the 7:1 aspect ratio. Huebscher predicts D_eq ≈ {r1(huebscherEquivalent(28, 4))}″ (close to 14″), but actual friction is 30-50% higher than the equation suggests because the elongated cross-section has more wall surface per unit area. Per ACCA Manual D and ASHRAE Chapter 21, cap aspect ratios at 4:1 for sizing — beyond that, you need oversize sheet metal or you take the performance hit.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 5 — Forgetting altitude at mountain elevations">
        Designing a Denver system with sea-level psychrometric tables and sea-level friction tables undersizes equipment in two ways: (a) sea-level enthalpy under-states latent load (see <Link href="/psychrometric-calculator/" className="underline">psychrometric calculator</Link>); (b) sea-level friction over-sizes ducts (which is OK — leaves margin) but matters for total static pressure budget. Use altitude-corrected math throughout for installations above 2,000 ft.
      </TechSection>
    </section>

    {/* SECTION 11 — Fittings */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">11</span>
        Fittings and equivalent length (the missing piece of total static pressure)
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Straight-duct friction is only one component of total system static pressure. Every elbow, takeoff, transition, and reducer adds resistance equivalent to some length of straight duct at the same diameter. Common values from ACCA Manual D Appendix 3:
      </p>

      <ComparisonTable
        headers={["Fitting", "Description", "Equivalent length (ft of straight duct)"]}
        rows={[
          { label: "90° smooth elbow", cells: ["Long-radius (R/D ≥ 1.5)", "15-25 ft"] },
          { label: "90° mitered elbow", cells: ["Sharp 90° with turning vanes", "30-50 ft"] },
          { label: "45° elbow", cells: ["Half-bend, smooth radius", "8-12 ft"] },
          { label: "Wye takeoff (45°)", cells: ["Branch into trunk at 45°", "10-15 ft"] },
          { label: "Tee takeoff (90°)", cells: ["Branch into trunk at 90°", "30-60 ft"] },
          { label: "Boot takeoff w/ damper", cells: ["Branch with balancing damper", "15-25 ft"] },
          { label: "Transition (square→round)", cells: ["Trunk-to-branch reducer", "5-10 ft"] },
          { label: "Supply register", cells: ["Stamped face, 50% free area", "10-20 ft"] },
          { label: "Return grille", cells: ["Stamped face, 60% free area", "5-15 ft"] },
          { label: "1″ thick filter", cells: ["Pleated MERV 8", "25-50 ft equiv. (or look up ΔP curve)"] },
        ]}
      />

      <FixCallout>
        <strong>How to use:</strong> total system static = (sum of straight-duct lengths × friction rate per 100 ft) + (sum of fitting equivalent lengths × friction rate per 100 ft). For the 50 ft trunk with 2 elbows, 4 takeoffs, and a filter: equivalent length = 50 + 2×20 + 4×15 + 40 = 190 ft; total trunk static = 190 × 0.08 / 100 = 0.15 in.w.c. Add coil + grilles + register losses and you should land near the blower&apos;s rated external static at design CFM.
      </FixCallout>
    </section>
  </>
);

export default function DuctSizeCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "duct-size-calculator",
        name: "Duct Size Calculator — Round + Rectangular from CFM",
        description:
          "Compute round duct diameter from CFM and friction rate using ACCA Manual D equal-friction sizing, plus Huebscher rectangular equivalents. Velocity limits by application (residential supply/return, commercial), altitude correction, density-adjusted for non-standard conditions.",
        featureList: [
          "Closed-form solver: D = (0.0992 × Q^1.9 / friction)^(1/5.02)",
          "Standard sheet-metal round sizes (4″ to 48″) with auto-round-up",
          "Huebscher rectangular equivalents up to aspect ratio 4:1 per ACCA Manual D",
          "Application presets: residential supply trunk, branch, return, commercial low/medium pressure",
          "Velocity-limit checking with color-coded warnings",
          "Altitude and temperature density correction",
          "CFM reference table for all standard sizes at 0.08 and 0.05 friction",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Duct Size Calculator",
      }}
      introOneLiner="Enter the design CFM and friction rate (or pick an application preset), and the calculator returns the standard round duct size, velocity, actual friction, and Huebscher rectangular equivalents. Equal-friction method per ACCA Manual D, with altitude correction for mountain installations."
      howTo={{ steps: HOWTO_STEPS.map((s) => `${s.title}: ${s.text}`) }}
      math={{
        formula: "Friction (galvanized round): ΔP/100ft = 0.0307 × (V/100)^1.9 / D^1.22\nVelocity: V = 576 × Q / (π × D²)  [V in fpm, Q in CFM, D in inches]\nClosed-form D solve: D = (0.0992 × Q^1.9 / friction)^(1/5.02)\nHuebscher equivalent: D_eq = 1.30 × (a × b)^0.625 / (a + b)^0.25\nDensity correction: ρ = 0.075 × (530/(T+460)) × (P/14.696)",
        sourceCitation: "ACCA Manual D, Residential Duct Systems (3rd ed.); ASHRAE Handbook of Fundamentals 2021, Chapter 21: Duct Design; SMACNA HVAC Duct Construction Standards (3rd ed., 2005). Friction equation is the simplified Darcy-Weisbach + Colebrook-White form for galvanized steel ductwork at standard air density.",
        workedExample: `Design: 1,200 CFM trunk at 0.08 in.w.c./100 ft (residential supply, sea level).\nExact diameter: D = (0.0992 × 1200^1.9 / 0.08)^(1/5.02) = ${r1(EX1.exactDiameter)}″.\nRound up to standard: ${EX1.standardDiameter}″ (next stock size).\nVelocity at ${EX1.standardDiameter}″: V = 576 × 1200 / (π × ${EX1.standardDiameter}²) = ${r0(EX1.velocityAtStandard)} fpm.\nActual friction: ΔP/100ft = 0.0307 × (${r0(EX1.velocityAtStandard)}/100)^1.9 / ${EX1.standardDiameter}^1.22 = ${r3(EX1.frictionAtStandard)} in.w.c./100ft.\nVelocity ${r0(EX1.velocityAtStandard)} fpm < 900 fpm limit → spec is ${EX1.standardDiameter}″ round.\nRectangular equivalent (Huebscher): ${EX1.rectangularEquivalents[0]?.width}″ × ${EX1.rectangularEquivalents[0]?.height}″ gives D_eq = ${r1(EX1.rectangularEquivalents[0]?.equivDiameter ?? 0)}″.`,
      }}
      relatedTools={[
        { href: "/psychrometric-calculator/", label: "Psychrometric calculator", blurb: "Compute air enthalpy and density for non-standard conditions before sizing ducts." },
        { href: "/refrigerant-charge-calculator/", label: "Refrigerant charge calculator", blurb: "Line-set length adjustment to nameplate charge." },
        { href: "/carrier-410a-charging-chart/", label: "Carrier R-410A charging chart", blurb: "Target superheat for fixed-orifice systems — pairs with airflow verification." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "Inadequate condenser airflow is the most common high-head root cause." },
        { href: "/superheat-subcooling-fundamentals/", label: "SH & SC fundamentals", blurb: "Conceptual framework for charging once airflow is correct." },
        { href: "/calculators-hub/", label: "All HVAC calculators", blurb: "Browse the full set of calculators." },
      ]}
      faqs={FAQS}
      generatedDate={PUBLISHED.slice(0, 10)}
      bodySections={BodySections}
    >
      <DuctSizeCalculator />
    </CalculatorShell>
  );
}

// Suppress unused import warnings
void [Activity, BookOpen, Mountain, AlertTriangle, exactDiameterInches, velocityFpm, frictionLossPerHundredFt];
