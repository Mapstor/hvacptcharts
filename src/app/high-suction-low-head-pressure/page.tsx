import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListChecks } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE, pageMetadata } from "@/lib/schema/shared";
import { getFileGitDates } from "@/lib/git-dates";
import { fmtPsigBubble } from "@/lib/pressure-format";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { Panel } from "@/components/calculators/shared/ServiceProblem";
import { GaugeSignatureDiagram } from "@/components/diagrams/GaugeSignatureDiagram";

const PAGE_URL = `${SITE_URL}/high-suction-low-head-pressure/`;
const { published: PUBLISHED, modified: MODIFIED } = getFileGitDates("src/app/high-suction-low-head-pressure/page.tsx");

// A short label prevents redundant per-branch prose repeating the numbers.
const R410A_40F_EVAP = fmtPsigBubble("r-410a", 40);
const R22_40F_EVAP = fmtPsigBubble("r-22", 40);
const R410A_95F_SAT = fmtPsigBubble("r-410a", 95);
const R22_95F_SAT = fmtPsigBubble("r-22", 95);
const R22_50F_SAT = fmtPsigBubble("r-22", 50);
const R22_80F_SAT = fmtPsigBubble("r-22", 80);

const SOURCES: readonly { name: string; publisher: string; url: string | null }[] = [
  {
    name: "Sporlan (Parker) Bulletin 10-11 — Thermostatic Expansion Valves: Installing and Servicing (June 2011)",
    publisher: "Parker Hannifin / Sporlan Division",
    url: "https://www.parker.com/content/dam/Parker-com/Literature/Sporlan/Sporlan-pdf-files/Sporlan-pdf-010/10-11.pdf",
  },
  {
    name: "Sporlan Form 10-143 — 12 Solutions for Fixing Common TEV Problems",
    publisher: "Parker Hannifin / Sporlan Division",
    url: "https://www.parker.com/content/dam/Parker-com/Literature/Sporlan/Sporlan-pdf-files/Sporlan-pdf-010/10-143.pdf",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "High Suction Low Head Pressure: Causes & Fixes (HVAC Tree)",
  description: `High suction + low head pressure diagnostic: overcharge, TXV failure, valve leakage. R410A example at 40°F evap ≈ ${R410A_40F_EVAP} PSIG suction with 8-branch tree.`,
  path: "/high-suction-low-head-pressure/",
});

// Diagnostic branches — each pattern-signature includes the expected
// suction and discharge PSIG values from the dataset (via fmtPsigBubble)
// so the diagnostic page cites the same numbers as the what-pressure
// pages it links to.
const BRANCHES = [
  {
    title: "Compressor valve leakage (most common on aging systems)",
    signature: `Suction elevated well above 40°F saturation (R-410A norm ${R410A_40F_EVAP} PSIG); manifold reads several PSIG above the saturation-plus-SH band. Discharge low despite normal ambient; amp draw usually below nameplate.`,
    body: "Worn or leaking compressor discharge valves let high-side gas leak back to the low side during the compression stroke. The result is elevated suction (uncompressed gas fills the crankcase) and depressed discharge (compressor can't build the high-side pressure). Diagnostic: after shutdown, high-side pressure equalizes to low-side within seconds instead of over minutes — a strong indicator of internal leakage. Fix: compressor replacement; valve rebuilds are rare on residential hermetics.",
  },
  {
    title: "Overcharge with restricted metering device — atypical pattern",
    signature: `Suction elevated well above the ${R410A_40F_EVAP} PSIG R-410A 40°F saturation reference, discharge low or normal. Subcooling very high (18°F+). Amp draw normal or slightly elevated.`,
    body: "Rare failure mode where an overcharged system also has a restriction downstream of the condenser. Refrigerant backs up in the condenser (raising SC), but the compressor is still moving mass without efficient heat rejection. Diagnostic: high SC + high suction is the fingerprint. Recover in 1–2 oz increments, verify SC returns to spec, then re-check discharge.",
  },
  {
    title: "TXV overfeeding or stuck open",
    signature: `Suction high (well above the ${R410A_40F_EVAP} PSIG norm at 40°F evap on R-410A), superheat near zero or slightly negative, discharge low.`,
    body: "The TXV is passing more refrigerant than the evaporator can boil, flooding the coil and pushing liquid down the suction line. Suction pressure elevates because the evaporator is fully wet and running near liquid saturation; discharge stays low because the compressor is pumping liquid (poor volumetric efficiency) rather than vapor. Diagnostic: measured SH < 5°F is the primary fingerprint; if the valve is stuck open, warming the sensing bulb doesn't change flow. Sporlan Bulletin 10-11 section B enumerates the overfeed failure modes as a family: an oversized valve for the actual load, a bulb-strap that has slipped loose so the sensor reads pipe temperature instead of suction gas, a moisture freeze-up at the port that holds the valve open once ice bridges the seat, an equalizer line kink or blockage on external-equalized valves, and lost element charge that leaves the valve unable to close. Each mode presents the same manifold signature; the discriminator is the SH reading and the physical inspection of the bulb, strap, and equalizer. Form 10-143's procedural rule is bulb-first: verify the strap tension, contact position (4–5 o'clock on the suction line just outside the evaporator), and insulation before touching the valve. Sporlan's field data shows that bulb-installation errors and airflow errors both produce the low-SH/high-suction fingerprint that mimics valve failure — adjusting or replacing the valve without fixing the bulb guarantees the comeback. Fix, in order: bulb strap and insulation, airflow at nameplate CFM, then valve replacement only after those clear.",
  },
  {
    title: "Reversing valve leak-through (heat pump only)",
    signature: `Suction high, discharge low, poor cooling capacity. In heating mode: reversed pattern (high suction, low discharge in heating). Discharge line noticeably cool after the valve.`,
    body: "On a heat pump, the reversing valve internally leaks discharge gas back to the suction port. The compressor pumps against a partial short-circuit; both pressures move toward each other. Diagnostic: temperature-differential check at the reversing valve — discharge port should be hot (170°F+ on R-410A); suction port should be cool. If the temps are close, the valve is passing. Fix: reversing valve replacement.",
  },
  {
    title: "Loose belt or slipping shaft coupling (open-drive systems)",
    signature: `Suction high, discharge low, amp draw well below nameplate. Compressor pulley spinning noticeably slower than motor.`,
    body: "On open-drive compressors (mostly commercial refrigeration and some older automotive), a loose or worn belt lets the compressor turn slower than the motor. Reduced RPM = reduced mass flow = suction stays high, discharge stays low. Diagnostic: tachometer or visual check on the belt-and-pulley. Fix: replace or tension the belt.",
  },
  {
    title: "Low compressor motor current — winding or start-cap failure",
    signature: `Suction high, discharge low, amp draw below nameplate. Compressor may hum but produce low pressure differential.`,
    body: "A partial winding failure or start-capacitor issue lets the compressor run at reduced torque and speed. Same fingerprint as belt slippage: reduced mass flow, converging pressures. Diagnostic: motor amp draw vs. nameplate FLA, capacitor microfarad reading vs. spec. Fix: replace failed component (capacitor is often the culprit; winding failures usually require compressor replacement).",
  },
  {
    title: "Non-condensable contamination (uncommon signature)",
    signature: `Discharge normal or slightly elevated, but head pressure fails to rise proportionally with load. Suction normal. Discharge saturation temperature above what R-410A + ambient predicts by 15–20°F.`,
    body: "Rare but possible: significant nitrogen or air trapped in the system after leak-check without proper evacuation. In pure form, non-condensables raise discharge above the refrigerant's saturation curve — the specific &quot;high suction low head&quot; signature only appears when combined with another issue like a valve leak. Diagnostic: recover, evacuate to 500 microns held 30 minutes, recharge with pure refrigerant. If pressures normalize, non-condensables were part of the problem.",
  },
  {
    title: "System operating at low ambient (system-wide low pressures)",
    signature: `Both pressures low relative to design; suction not truly &quot;high&quot; but appears elevated relative to head. Actually normal for cold-weather operation.`,
    body: `On a cool-day service call (60–70°F outdoor), pressures naturally fall below the 95°F rating condition — R-410A discharge saturation might sit at 80°F (${fmtPsigBubble("r-410a", 80)} PSIG) instead of 95°F+ (${R410A_95F_SAT} PSIG). If the tech expects rating-day discharge and reads low discharge with slightly elevated suction, they may misdiagnose. Verify pressures are consistent with actual ambient before diagnosing a fault. Compare against the what-pressure page for the refrigerant.`,
  },
];

const FAQS = [
  {
    q: "How is this different from just &quot;low head pressure&quot;?",
    a: `The high-suction/low-head signature is a specific pattern — both pressures deviate from normal in opposite directions, and they converge toward each other. It points to internal leakage between the high and low sides (compressor valves, reversing valve, TXV) or to reduced mass flow (belt slip, motor). The broader &quot;low head pressure&quot; category also includes undercharge and low ambient. See /high-head-pressure-causes/ for the opposite signature (high head with normal or elevated suction).`,
  },
  {
    q: "Can undercharge cause high suction and low head?",
    a: "Not typically. Undercharge usually depresses BOTH pressures — the compressor is pumping less mass. High suction + low head is the fingerprint of internal leakage (compressor valves, reversing valve on heat pumps) or reduced compressor mass flow (belt slip, motor issues). Verify subcooling before assuming undercharge: low SC + both pressures low = undercharge; high SC + high suction + low head = internal leakage.",
  },
  {
    q: "What are normal R-410A pressures at 40°F evap and 95°F ambient?",
    a: `On a properly-charged residential R-410A AC at the 95°F rating condition, evaporator saturation runs about 40°F (${R410A_40F_EVAP} PSIG). Condenser saturation sits 20–30°F above ambient, so ~115–120°F saturation (${fmtPsigBubble("r-410a", 120)} PSIG). Actual manifold readings include superheat and subcooling adjustments — see /what-pressure-should-410a/ for the full envelope with OEM-observed suction and discharge bands.`,
  },
  {
    q: "What are normal R-22 pressures at 40°F evap and 95°F ambient?",
    a: `R-22 evaporator saturation at 40°F = ${R22_40F_EVAP} PSIG. Condenser at 95°F sat = ${R22_95F_SAT} PSIG; at 115–120°F sat (typical R-22 ambient adjustment) about ${fmtPsigBubble("r-22", 120)} PSIG. Manifold readings include SH pickup on suction and SC drop on liquid line — see /what-pressure-should-r22/ for the full observed envelope.`,
  },
  {
    q: "What causes suction to spike above the normal range?",
    a: "The evaporator saturation temperature is climbing — either because refrigerant flow into the coil exceeds what the coil can boil (TXV overfeed, high load, restricted return airflow) or because vapor is bypassing compression and returning to the suction (compressor valve leakage, reversing valve on heat pumps). The specific combined signature with low head pressure isolates the internal-leakage causes from the load-side causes.",
  },
  {
    q: "Can I check for compressor valve leakage without disassembly?",
    a: "Yes — the post-shutdown equalization test is the standard field method. With the system running, shut off power and start a timer. On a healthy hermetic compressor, high-side pressure decays to low-side over 3–10 minutes (through the metering device). With significant valve leakage, equalization completes in under 30 seconds because gas backflows internally. Combined with the high-suction/low-head running signature, this is diagnostic for valve failure.",
  },
];

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "TechArticle",
      "@id": `${PAGE_URL}#article`,
      headline: "High Suction Low Head Pressure — HVAC Diagnostic Tree",
      description:
        "Eight-branch diagnostic tree for the high-suction/low-head-pressure signature: compressor valve leakage, TXV overfeed, reversing valve, belt slip, motor failure, and non-condensables. R-410A and R-22 expected values with fixes per branch.",
      proficiencyLevel: "Intermediate",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: MODIFIED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      citation: SOURCES.map((s) => ({
        "@type": "CreativeWork",
        name: s.name,
        publisher: s.publisher,
        ...(s.url ? { url: s.url } : {}),
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides-hub/` },
        { "@type": "ListItem", position: 3, name: "High Suction Low Head Pressure" },
      ],
    },
  ];
}

export default function HighSuctionLowHeadPressurePage() {
  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/guides-hub/" className="hover:underline">Guides</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">High Suction Low Head Pressure</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">High Suction Low Head Pressure</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            Diagnostic tree for the specific pattern where both pressures move toward each other — suction elevated, discharge depressed. Different from generic &quot;low head&quot; or &quot;high suction&quot; alone; this combined signature isolates internal-leakage and reduced-mass-flow causes.
          </p>
        </header>

        <KeyInsight tone="blue" icon="insight" title="Answer, in two sentences">
          High suction + low head pressure points to internal leakage between the sides (compressor valve failure, TXV overfeed, reversing valve leak-through) or to reduced compressor mass flow (belt slip, motor issue). On R-410A at 40°F evap, normal suction is around {R410A_40F_EVAP} PSIG — well above that with head below normal points to one of the eight causes below.
        </KeyInsight>

        <GaugeSignatureDiagram
          slug="r-410a"
          normalEvapTempF={40}
          normalCondTempF={105}
          faultLow="up"
          faultHigh="down"
          faultLabel="Suction high, head low — compression fault signature"
        />

        <TechSection icon="insight" tone="blue" title="Why this signature converges the gauges">
          <p>
            The compressor is the mechanical divider that keeps the low side low and the high side high. Every fault on this page attacks that division in one of two ways: gas leaks across the divide inside the compressor or between-side valves (compressor discharge valves, reversing valve, an overfed TXV that lets liquid back-feed through the coil), or the compressor spins too slowly to hold the divide (belt slip, motor issue). Either way, the two sides bleed toward each other and settle closer together than the load and ambient predict.
          </p>
          <p>
            That&apos;s why SH and SC are the discriminators on this page, not the raw pressures alone. Suction near R-410A 40°F saturation ({R410A_40F_EVAP} PSIG) with SH near zero fingerprints a TXV flooding the coil; suction above that with SH normal fingerprints leakage through the compressor rather than into the evaporator. Discharge depressed with SC normal points at reduced mass flow; discharge depressed with SC elevated (18°F+) points at the rare overcharge-plus-restriction combo. The gauges alone can&apos;t tell the four apart — SH and SC do.
          </p>
          <p>
            Before running the diagnostic tree, run the <em>pumped-down capacity test</em>: close the liquid line service valve and time how long the low side takes to fall to a set point. On a healthy compressor the low side crashes quickly; on a valve-leaking compressor it drifts down because high-side gas is bleeding back. Combined with the running signature, this test isolates compressor failure from external causes before you crack a single flare. See the <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link> and <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link> for the SH/SC arithmetic.
          </p>
        </TechSection>

        <TechSection icon="warning" tone="amber" title="Scope of this page — read before diagnosing">
          <p>
            This page treats the SPECIFIC pattern of suction ABOVE normal combined with discharge BELOW normal. Two adjacent problems live on separate pages:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
            <li><Link href="/high-head-pressure-causes/" className="underline">High head pressure causes</Link> — head elevated with normal or elevated suction. Opposite signature.</li>
            <li><Link href="/low-suction-pressure/" className="underline">Low suction pressure</Link> — suction low regardless of head. Undercharge, restriction, low-airflow patterns.</li>
          </ul>
          <p className="mt-3">If your gauges show high-suction/low-head, continue below.</p>
        </TechSection>

        <TechSection icon="data" tone="purple" title="Diagnostic branches — 8 causes">
          <p>
            Each branch below cites the expected gauge signature. Match your measured pressures to the closest signature; if two branches partially fit, work through the most common first (compressor valve leakage). All dataset PSIG values are R-410A at 40°F evap = <span className="font-mono">{R410A_40F_EVAP}</span> and 95°F sat = <span className="font-mono">{R410A_95F_SAT}</span>; R-22 equivalents 40°F = <span className="font-mono">{R22_40F_EVAP}</span> and 95°F = <span className="font-mono">{R22_95F_SAT}</span>. Values from CoolProp 7.2.0.
          </p>
          <div className="mt-4 space-y-4">
            {BRANCHES.map((b, i) => (
              <Panel key={i} title={`${i + 1}. ${b.title}`} icon={ListChecks}>
                <div className="text-sm space-y-2">
                  <p><strong>Signature:</strong> {b.signature}</p>
                  <p>{b.body}</p>
                </div>
              </Panel>
            ))}
          </div>
        </TechSection>

        <TechSection icon="data" tone="purple" title="Worked scenario — R-22 residential AC with compression fault">
          <p>
            Three panels walk the diagnostic from raw gauge readings through SH/SC to a verdict. PSIG references render through the site&apos;s helpers so every saturation number stays anchored to the R-22 dataset.
          </p>
          <div className="mt-4 space-y-4">
            <Panel title="A. Measured" icon={ListChecks}>
              <div className="text-sm space-y-2">
                <p>
                  A 3-ton R-22 residential AC on a 90°F day. Manifold reads suction well above the {R22_40F_EVAP} PSIG 40°F evap reference — closer to the {R22_50F_SAT} PSIG value that would correspond to 50°F saturation. Discharge sits below the {R22_95F_SAT} PSIG 95°F condenser reference, closer to the {R22_80F_SAT} PSIG 80°F sat line. Compressor amps 8 A against 12 A FLA. Supply-air ΔT 12°F (nameplate 18–22°F).
                </p>
              </div>
            </Panel>
            <Panel title="B. PT + SH + SC" icon={ListChecks}>
              <div className="text-sm space-y-2">
                <p>
                  Suction saturation ≈ 50°F. Suction line at compressor 58°F → SH ≈ 8°F (low-normal, not the near-zero of a flooding TXV). Liquid line 88°F, condenser saturation ≈ 80°F → SC ≈ –8°F (impossible; liquid line is warmer than saturation, meaning the condenser is not fully condensing). Both pressures have converged toward each other, SH is low but not zero, SC is negative — the fingerprint pattern for compressor valve leakage rather than TXV overfeed.
                </p>
              </div>
            </Panel>
            <Panel title="C. Verdict + confirmation" icon={ListChecks}>
              <div className="text-sm space-y-2">
                <p>
                  Kill power at the disconnect and start a timer. High side drops to low side in 22 seconds. Per FAQ 6 on this page, a healthy hermetic equalizes over 3–10 minutes through the metering device; sub-30-second equalization is diagnostic for internal leakage. Verdict: replace compressor. Verify by pulling the compressor and inspecting the discharge valve reeds; recover the R-22 to EPA 608 requirements first.
                </p>
              </div>
            </Panel>
          </div>
        </TechSection>

        <TechSection icon="book" tone="emerald" title="Related tools and reference">
          <ul className="text-sm space-y-1">
            <li>
              <Link href="/superheat-calculator/" className="underline">Superheat Calculator</Link>{" "}
              — quantify the SH ≈ 0 signature that fingerprints TXV overfeed.
            </li>
            <li>
              <Link href="/subcooling-calculator/" className="underline">Subcooling Calculator</Link>{" "}
              — high SC + high suction is the overcharge-with-restriction fingerprint.
            </li>
            <li>
              <Link href="/high-head-pressure-causes/" className="underline">High head pressure causes</Link>{" "}
              — the opposite signature (high head, normal or high suction).
            </li>
            <li>
              <Link href="/what-pressure-should-410a/" className="underline">What pressure should R-410A be?</Link>{" "}
              — full residential AC operating envelope for the R-410A dataset numbers cited above.
            </li>
            <li>
              <Link href="/system-pressure-diagnostic-calculator/" className="underline">System Pressure Diagnostic Calculator</Link>{" "}
              — enter measured pressures and get a pattern-match diagnostic across all four SH × SC quadrants.
            </li>
          </ul>
        </TechSection>

        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Frequently asked</h2>
          <div className="space-y-4">
            {FAQS.map((f, i) => (
              <details key={i} className="group rounded-lg border border-zinc-200 p-4 open:bg-zinc-50 dark:border-zinc-800 dark:open:bg-zinc-900">
                <summary className="cursor-pointer list-none font-semibold">
                  <span className="mr-2 text-zinc-400 group-open:rotate-90 inline-block transition-transform">›</span>
                  {f.q}
                </summary>
                <div className="prose prose-sm prose-zinc mt-3 max-w-none dark:prose-invert">
                  {f.a.split(/\n\s*\n/).map((p, j) => <p key={j}>{p.trim()}</p>)}
                </div>
              </details>
            ))}
          </div>
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300"><BookOpen className="mr-1 inline h-3.5 w-3.5" />Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {SOURCES.map((s, i) => (
              <li key={i}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-words">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
            <li>ACCA technician charging references (name-only).</li>
            <li>ASHRAE Handbook of Refrigeration 2022 — compressor mechanics and TXV behavior.</li>
            <li>CoolProp 7.2.0 — R-410A and R-22 PT chart values.</li>
          </ul>
          <p className="mt-3">Page generated: {PUBLISHED.slice(0, 10)}. Facts on this page are paraphrased from the linked sources; direct sentences are not reproduced. PSIG values render through the site&apos;s pressure-format helpers so a dataset regeneration updates the prose automatically.</p>
        </footer>
      </article>
    </>
  );
}
