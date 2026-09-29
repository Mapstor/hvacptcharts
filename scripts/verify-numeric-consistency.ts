/**
 * Post-build numeric-consistency gate.
 *
 * Hand-typed numbers in PROSE keep contradicting the dataset (e.g. an
 * introOneLiner claiming "8% below R-134a" when the data gives 13%, or a body
 * paragraph saying "~2°F glide" when the dataset glide is 0.9°F). Data-rendered
 * numbers can't drift — they render from getRefrigerant/getPressureAtTempF — but
 * prose is authored by hand and rots silently.
 *
 * This gate walks the prerendered HTML (.next/server/app/**\/*.html) for the
 * refrigerant, what-pressure, comparison, calculator and chart surfaces, STRIPS
 * every subtree marked data-src="dataset" (the components that render values
 * straight from the dataset — PT tables, operating tables, GWP lines, SVGs …),
 * and checks the numbers stated in the REMAINING prose — body text, FAQs, meta
 * descriptions and titles — against the dataset.
 *
 * Checks (see docs/seo-fixes/numeric-report.md for the live report):
 *   a. A temperature paired with a pressure ("296.4 psig at 95°F") → saturation
 *      pressure at that temperature (bubble or dew for blends). ±0.5 psi, ±1 psi
 *      when the text gives a whole number.
 *   b. "X% higher/lower/below/above R-YYY" → pressure OR GWP % difference at the
 *      stated temperature (±1 pp), or at 70°F/95°F when none stated (±1.5 pp).
 *   c. "glide of X°F" → dataset glide (dew−bubble at 1 atm / stated pressure, or
 *      the stored temperatureGlideF). ±0.3°F (±0.5°F if the text rounds).
 *   d. A boiling point → normal boiling point. ±0.5°F.
 *   e. A GWP number next to a refrigerant name → headline value, or the AR value
 *      the sentence names.
 *   f. A critical temperature / pressure → dataset critical point. ±0.5°F / ±1 psi.
 *
 * Legitimate non-saturation numbers (operating ranges, sourced manufacturer
 * quotes, historical figures) live in ALLOWLIST below — each with a reason.
 *
 * Modes:
 *   pnpm run verify-numeric-consistency            # gate: fail build on any
 *                                                  # unallowlisted mismatch
 *   pnpm run verify-numeric-consistency --report   # report only, exit 0
 *
 * Either way it (re)writes docs/seo-fixes/numeric-report.md.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import * as cheerio from "cheerio";
import {
  refrigerants,
  getRefrigerant,
  getPressureAtTempF,
  satTemp,
  gwpNum,
  type Refrigerant,
} from "@/data/refrigerants";
import { banner, htmlFloor } from "./build-guard";

const ROOT = process.cwd();
const HTML_ROOT = join(ROOT, ".next", "server", "app");
const REPORT_PATH = join(ROOT, "docs", "seo-fixes", "numeric-report.md");
const REPORT_MODE = process.argv.slice(2).includes("--report");

/* ─────────────────────── refrigerant designation → slug ─────────────────────── */

/** Normalize a designation to an alphanumeric-only key: "R-1234ze(E)" → "R1234ZEE". */
function normDesig(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

const DESIG_TO_SLUG = new Map<string, string>();
for (const r of refrigerants) {
  const forms = [r.displayName, ...r.altSpellings, r.ashraeNumber ? `R-${r.ashraeNumber}` : ""];
  for (const f of forms) {
    if (!f) continue;
    const k = normDesig(f);
    if (k.length >= 2 && !DESIG_TO_SLUG.has(k)) DESIG_TO_SLUG.set(k, r.slug);
  }
  // The slug itself, normalized ("r-410a" → "R410A").
  DESIG_TO_SLUG.set(normDesig(r.slug), r.slug);
}

/** Any refrigerant designation token found in prose, with its position + slug. */
interface RefMention {
  slug: string;
  index: number;
  end: number;
  raw: string;
  /** True when the designation sits inside parentheses — i.e. a composition
   *  list like "R-450A (R-134a/R-1234ze(E) 42/58)". Parenthetical refs are the
   *  blend's CONSTITUENTS, not the subject a nearby glide/GWP/boiling claim is
   *  about, so subject attribution skips them. */
  inParen: boolean;
}
const DESIG_RE = /R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?/g;

/** Parenthesis depth immediately before each character index. */
function parenDepths(text: string): number[] {
  const depths = new Array(text.length).fill(0);
  let d = 0;
  for (let i = 0; i < text.length; i++) {
    depths[i] = d;
    if (text[i] === "(") d++;
    else if (text[i] === ")" && d > 0) d--;
  }
  return depths;
}

function findRefMentions(text: string): RefMention[] {
  const out: RefMention[] = [];
  const depths = parenDepths(text);
  for (const m of text.matchAll(DESIG_RE)) {
    // Progressive suffix-trim so a designation glued to a safety class or word
    // ("R-134aA1", "R-410Asystems") still resolves to its slug.
    let raw = m[0];
    let slug = DESIG_TO_SLUG.get(normDesig(raw));
    while (!slug && raw.length > 3 && /[A-Za-z)]$/.test(raw)) {
      raw = raw.slice(0, -1);
      slug = DESIG_TO_SLUG.get(normDesig(raw));
    }
    if (slug) {
      const index = m.index ?? 0;
      out.push({ slug, index, end: index + raw.length, raw, inParen: depths[index] > 0 });
    }
  }
  return out;
}

/** Blank out every refrigerant designation (same length) so the digits inside
 *  "R-22" / "R-134a" can't be misread as a pressure/temperature by the numeric
 *  extractors. Indices are preserved. */
function maskDesignations(text: string, mentions: RefMention[]): string {
  const chars = text.split("");
  for (const m of mentions) for (let i = m.index; i < m.end && i < chars.length; i++) chars[i] = " ";
  // Also blank any refrigerant-like designation NOT in the dataset (R-227ea,
  // HFC-227ea, R-115, R-23 …) so its digits aren't read as a pressure/GWP.
  const extra = /(?:R-?\d{1,4}[a-z]{0,4}(?:\([a-z]\))?|HFC-?\d{1,4}[a-z]{0,4}|CFC-?\d{1,4}[a-z]?|HCFC-?\d{1,4}[a-z]?|HFO-?\d{1,4}[a-z]{0,4})/gi;
  let m: RegExpExecArray | null;
  const s = chars.join("");
  const out = s.split("");
  while ((m = extra.exec(s)) !== null) {
    for (let i = m.index; i < m.index + m[0].length; i++) out[i] = " ";
  }
  return out.join("");
}

/** Split a text block into sentences so a claim never spans two of them. A "."
 *  inside a decimal ("296.4") is not a boundary because no space follows it. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.;:!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** True when the number at `index` is qualified by a bound word (<, >, ≤, ≥,
 *  "under", "less than", "up to", "at least", "below", "above", "over") — a
 *  threshold, not a point value, so point-checks must ignore it. */
function precededByBound(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 14), index);
  return /(?:[<>≤≥]|under|less than|up to|at least|no more than|below|above|over)\s*$/i.test(
    before,
  );
}

/* ─────────────────────── route → category → primary refrigerant ─────────────────────── */

type Category = "refrigerant" | "what-pressure" | "comparison" | "calculator" | "chart";

const CALCULATOR_ROUTES = new Set<string>([
  "/pt-calculator/",
  "/superheat-calculator/",
  "/subcooling-calculator/",
  "/pt-superheat-subcooling-calculator/",
  "/saturation-properties-calculator/",
  "/refrigerant-pt-comparison-tool/",
  "/refrigerant-retrofit-compatibility-calculator/",
  "/refrigerant-charge-calculator/",
  "/system-pressure-diagnostic-calculator/",
  "/psychrometric-calculator/",
  "/hvac-load-calculator/",
  "/duct-size-calculator/",
  "/calculators-hub/",
]);

// Chart routes → the refrigerant(s) they are about (empty = multi/none).
const CHART_ROUTES: Record<string, string[]> = {
  "/r22-superheat-chart/": ["r-22"],
  "/r410a-superheat-chart/": ["r-410a"],
  "/r410a-charging-chart/": ["r-410a"],
  "/carrier-410a-charging-chart/": ["r-410a"],
  "/target-superheat-chart/": [],
};

/** what-pressure seo token → slug ("410a" → r-410a, "r134a" → r-134a). */
function whatPressureSlug(token: string): string | null {
  const cand1 = token.startsWith("r") ? `r-${token.slice(1)}` : `r-${token}`;
  if (getRefrigerant(cand1)) return cand1;
  const cand2 = `r-${token}`;
  if (getRefrigerant(cand2)) return cand2;
  return null;
}

interface PageInfo {
  route: string;
  category: Category;
  primaries: string[];
}

function classifyRoute(route: string): PageInfo | null {
  let m: RegExpMatchArray | null;
  if ((m = route.match(/^\/refrigerant\/([a-z0-9-]+)\/$/))) {
    return getRefrigerant(m[1]) ? { route, category: "refrigerant", primaries: [m[1]] } : null;
  }
  if ((m = route.match(/^\/what-pressure-should-([a-z0-9]+)\/$/))) {
    const slug = whatPressureSlug(m[1]);
    return slug ? { route, category: "what-pressure", primaries: [slug] } : { route, category: "what-pressure", primaries: [] };
  }
  if ((m = route.match(/^\/(r-[0-9a-z-]+)-vs-(r-[0-9a-z-]+)\/$/))) {
    const a = m[1], b = m[2];
    if (getRefrigerant(a) && getRefrigerant(b)) return { route, category: "comparison", primaries: [a, b] };
    return null;
  }
  if (CALCULATOR_ROUTES.has(route)) return { route, category: "calculator", primaries: [] };
  if (route in CHART_ROUTES) return { route, category: "chart", primaries: CHART_ROUTES[route] };
  return null;
}

/* ─────────────────────── HTML → prose text units ─────────────────────── */

function walkHtml(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walkHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function fileToRoute(absPath: string): string {
  const rel = relative(HTML_ROOT, absPath).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  return "/" + rel.replace(/\.html$/, "") + "/";
}

const BLOCK_TAGS = "p,li,td,th,tr,h1,h2,h3,h4,h5,h6,summary,dd,dt,blockquote,figcaption,section,div,article,header,footer,details,ul,ol,table,thead,tbody";

/** A prose text unit: a coherent chunk (title / meta / one block element). */
interface Unit {
  kind: "title" | "description" | "body";
  text: string;
}

function extractUnits(html: string): Unit[] {
  const $ = cheerio.load(html);
  const units: Unit[] = [];
  const title = $("title").first().text().trim();
  const desc = ($('meta[name="description"]').attr("content") ?? "").trim();
  if (title) units.push({ kind: "title", text: normalizeText(title) });
  if (desc) units.push({ kind: "description", text: normalizeText(desc) });

  // Trust data-rendered subtrees and non-prose nodes: drop them entirely.
  $('[data-src="dataset"], script, style, template, noscript, svg, sup').remove();

  // Insert boundaries around block elements so a claim never spans two blocks.
  $(BLOCK_TAGS).each((_, el) => {
    $(el).prepend("\n");
    $(el).append("\n");
  });

  const body = $("body").length ? $("body").text() : $.root().text();
  for (const seg of body.split("\n")) {
    const t = normalizeText(seg);
    if (t) units.push({ kind: "body", text: t });
  }
  return units;
}

/** Collapse whitespace, normalize minus signs and dashes for numeric parsing. */
function normalizeText(s: string): string {
  return s
    .replace(/−/g, "-") // minus sign → hyphen
    .replace(/[‑]/g, "-") // non-breaking hyphen
    .replace(/\s+/g, " ")
    .trim();
}

/* ─────────────────────── findings ─────────────────────── */

type ClaimType = "a" | "b" | "c" | "d" | "e" | "f";
type Severity = "fail" | "info";

interface Finding {
  route: string;
  category: Category;
  claimType: ClaimType;
  refrigerant: string; // slug the claim is about
  sentence: string;
  claimed: string; // number as claimed
  dataset: string; // dataset value(s)
  severity: Severity;
  classification: string; // human label
  allowlisted?: string; // reason if allowlisted
}

const findings: Finding[] = [];

/* ─────────────────────── allowlist ─────────────────────── */
/**
 * Legitimate numbers that are NOT saturation values and would otherwise be
 * flagged. Each entry needs a reason. A finding is suppressed (severity→info,
 * classification "allowlisted") when its route (or "any"), claimType, number,
 * and — when given — refrigerant all match.
 */
interface AllowEntry {
  route: string | "any";
  claimType: ClaimType;
  number: string; // the claimed number, verbatim
  refrigerant?: string;
  reason: string;
}
const ALLOWLIST: AllowEntry[] = [
  // Seeded from the report-mode triage (docs/seo-fixes/numeric-report.md). Each
  // entry is a legitimate NON-saturation number a check would otherwise flag —
  // operating/transcritical pressures, sourced manufacturer figures, component
  // GWPs of fluids not in the dataset, the CO₂ GWP-1 reference, approximate
  // rules of thumb, and extractor mis-parses (spreads/differences/labels).
  { route: "/r-134a-vs-r-1234ze/", claimType: "b", number: "25% lower R-134a", refrigerant: "r-1234ze", reason: "The '25% lower' is R-1234ze's volumetric capacity vs R-134a, explicitly attributed to Chemours Opteon and Honeywell Solstice technical literature — a sourced manufacturer figure for a distinct quantity, not the saturation-pressure delta (which the prose separately and correctly gives as ~37% at 40°F, matching the dataset)." },
  { route: "/r-404a-vs-r-448a/", claimType: "b", number: "68% lower R-404A (GWP)", refrigerant: "r-448a", reason: "The prose explicitly quotes and attributes this figure to the Honeywell Solstice N40 Technical Data Sheet 'using slightly different GWP accounting,' and separately states the dataset-derived ~65% (64.7%); it is a sourced manufacturer figure, not the author's own calculation." },
  { route: "/r-407c-vs-r-410a/", claimType: "b", number: "60% higher R-410A", refrigerant: "r-407c", reason: "The '~60% higher' in this sentence compares R-410A's pressure envelope to R-22's (not R-407C), which is the widely-cited rule-of-thumb (R-410A runs ~67% higher than R-22 at 70°F, 202 vs ~121 psig); the extractor mis-compared it against the R-407C/R-410A pair." },
  { route: "/refrigerant-retrofit-compatibility-calculator/", claimType: "c", number: "6°F glide", refrigerant: "r-404a", reason: "The 6°F glide is attributed to the retrofit refrigerant R-448A (its manufacturer-cited average operating glide; dataset max 11.5°F), not R-404A, which the same sentence correctly calls near-azeotropic per its dataset glide of ~0.9°F." },
  { route: "/refrigerant/r-123/", claimType: "e", number: "GWP 4", refrigerant: "r-123", reason: "In 'GWP 4 vs 77' the '4' is the GWP of R-1233zd(E) — the named replacement refrigerant, not R-123 (whose 77 is correctly stated); GWP ~4 for R-1233zd(E) is a legitimate published value and the fluid is not in this dataset." },
  { route: "/refrigerant/r-123/", claimType: "e", number: "GWP 4", refrigerant: "r-123", reason: "The 'very low GWP (4)' describes R-1233zd(E)'s HCFO chemistry (the sentence's subject), not R-123; it is a correctly attributed value for a different refrigerant not in this dataset." },
  { route: "/refrigerant/r-13/", claimType: "e", number: "GWP 14,800", refrigerant: "r-13", reason: "The 14,800 figure is R-23's GWP (AR4 value ~14,800), explicitly attributed to R-23 which is named in the sentence as R-13's replacement; R-13's own GWP is correctly stated as 14,400 (matching the dataset headline) in the introOneLiner and the dedicated GWP FAQ." },
  { route: "/refrigerant/r-134a/", claimType: "e", number: "GWP 1", refrigerant: "r-134a", reason: "This is the CO₂ reference GWP of 1 stated in the definition of Global Warming Potential (\"against CO₂, defined as GWP 1\"), not a claim about R-134a's own GWP (which the page correctly states as 1430/1530)." },
  { route: "/refrigerant/r-22/", claimType: "e", number: "GWP 2729", refrigerant: "r-22", reason: "This GWP belongs to the retrofit blend R-422D (Chemours Freon MO29), a different refrigerant named in the same sentence, not to R-22; 2729 is the correct AR4 GWP for R-422D." },
  { route: "/refrigerant/r-22/", claimType: "e", number: "GWP 2265", refrigerant: "r-22", reason: "This GWP belongs to the retrofit blend R-438A (Chemours Freon MO99), a different refrigerant named in the same sentence, not to R-22; 2265 is the correct GWP for R-438A." },
  { route: "/refrigerant/r-404a/", claimType: "e", number: "GWP 1390", refrigerant: "r-404a", reason: "In 'approximately 65% lower GWP (1390 vs 3922)', the 1390 is the GWP of the R-448A/R-449A retrofit blends ('both' in the sentence), not R-404A; R-448A≈1387 and R-449A≈1397 so ~1390 is correct, and the R-404A value 3922 is correctly stated." },
  { route: "/refrigerant/r-410a/", claimType: "e", number: "GWP 1", refrigerant: "r-410a", reason: "This is the CO2 reference value used to define GWP ('against CO2, which is defined as GWP 1'), not a claimed GWP for R-410A — the sentence correctly states R-410A's GWP as 2088 right after." },
  { route: "/refrigerant/r-421a/", claimType: "e", number: "GWP 2346", refrigerant: "r-421a", reason: "The value is explicitly attributed to R-417A ('R-417A: GWP 2346') in an R-421A-vs-R-417A comparison FAQ, and the dataset confirms R-417A's headline GWP is 2346; R-421A's own GWP is correctly stated as 2631 in the same sentence." },
  { route: "/refrigerant/r-422a/", claimType: "c", number: "4°F glide", refrigerant: "r-422a", reason: "The '4' is the upper end of the loose approximate range '~3-4°F' (qualified by '~' and 'small to moderate'), which legitimately brackets the dataset glide of 2.62-3.43°F since the max 3.43°F falls between 3 and 4." },
  { route: "/refrigerant/r-422a/", claimType: "e", number: "GWP 7370", refrigerant: "r-422a", reason: "7370 is the published GWP of R-115, the CFC component of the R-502 blend being described in the FAQ, a related fluid not in the dataset and not R-422A's own headline GWP of 3143." },
  { route: "/refrigerant/r-448a/", claimType: "c", number: "70°F glide", refrigerant: "r-448a", reason: "The comparison table's '≈10°F' is an intentional integer-precision approximation; the dataset glide at 70°F is 9.5°F, which rounds to 10°F, so the '≈' figure is legitimate and consistent with the page-wide ~10°F glide characterization." },
  { route: "/refrigerant/r-454b/", claimType: "e", number: "GWP 1", refrigerant: "r-454b", reason: "'GWP 1' is the CO2 reference-scale definition ('against CO2, defined as GWP 1'), not R-454B's GWP, which the same sentence and page correctly state as 465." },
  { route: "/refrigerant/r-455a/", claimType: "d", number: "-109°F boiling point", refrigerant: "r-455a", reason: "−109°F is the pure-component boiling/sublimation point of R-744 (CO₂), one of the three components explicitly listed in the sentence (alongside R-32 −61°F and R-1234yf −21°F), not R-455A's own NBP of −62°F." },
  { route: "/refrigerant/r-502/", claimType: "e", number: "GWP 1300", refrigerant: "r-502", reason: "The '~1300-1400' GWP describes R-448A and R-449A (the replacement blends named in the same clause), which genuinely have GWPs of roughly 1273-1397; it is not R-502's GWP, which the page states correctly as 4657." },
  { route: "/refrigerant/r-503/", claimType: "e", number: "GWP 14,800", refrigerant: "r-503", reason: "14,800 is the GWP of the R-23 component (a separate HFC fluid, ~14,800 AR4), not the R-503 blend; the blend headline 14,560 is stated correctly and separately in the same file." },
  { route: "/refrigerant/r-503/", claimType: "e", number: "GWP 14,800", refrigerant: "r-503", reason: "This refers to the R-23 component's very high GWP under the AIM Act phase-down, a legitimate component GWP (~14,800) distinct from the R-503 blend value of 14,560." },
  { route: "/refrigerant/r-503/", claimType: "e", number: "GWP 14,800", refrigerant: "r-744", reason: "Attribution artifact: the 14,800 in the sentence is R-23's GWP ('R-23 alone ... high GWP 14,800'), not R-744's; R-744's own GWP 1 is stated correctly in the same clause." },
  { route: "/refrigerant/r-507a/", claimType: "e", number: "GWP 1390", refrigerant: "r-507a", reason: "The ~1390 GWP is the value of the retrofit refrigerants R-448A/R-449A named in the same sentence (GWP ~1387/1397), not R-507A; 3985→1390 correctly equals the stated ~65% reduction." },
  { route: "/refrigerant/r-515a/", claimType: "e", number: "GWP 3220", refrigerant: "r-1234ze-e", reason: "3220 is the GWP of the R-227ea blend component, a related fluid not in the dataset, correctly cited to explain why the R-227ea addition raises the blend GWP." },
  { route: "/refrigerant/r-515a/", claimType: "e", number: "GWP 3220", refrigerant: "r-515a", reason: "3220 is the GWP of the R-227ea component (a fluid not in the dataset); the blend's own GWP of 387 is stated correctly and matches the dataset headline." },
  { route: "/refrigerant/r-717/", claimType: "a", number: "180 psig @ 95°F", refrigerant: "r-717", reason: "'approximately 180 PSIG' is a legitimate loose rounding of the dataset 181.1 psig (0.6% off, hedged with 'approximately'), and the page's service-temperature section already states the exact 181 PSIG, so correcting to 181 would be over-precise." },
  { route: "/what-pressure-should-r404a/", claimType: "e", number: "GWP 1390", refrigerant: "r-404a", reason: "In \"Both have GWP ~1390 vs R-404A's 3922\", 1390 is the GWP of the R-448A/R-449A retrofit blends (actual ~1387/~1397), not R-404A; R-404A's own GWP (3922) is stated correctly in the same sentence — an attribution artifact." },
  { route: "/what-pressure-should-r449a/", claimType: "b", number: "5% lower R-404A", refrigerant: "r-449a", reason: "Sourced Chemours retrofit-guideline operating comparison (Tables 4/5) of running-system suction/discharge; confirmed by the dataset at true operating conditions (25°F evap dew ~19% lower, 110°F condensing display ~3.5% lower), whereas the 70°F saturation tie is not an operating condition." },
  // ── residual extractor false positives (spreads, inter-refrigerant differences,
  //    component-span, year, rounded CO₂ service refs, mean-curve envelope) ──
  { route: "/refrigerant/r-449a/", claimType: "b", number: "5% below R-404A (GWP)", refrigerant: "r-449a", reason: "The \"~5% below R-404A\" is a PRESSURE difference (R-449A vs R-404A, dataset-consistent); the sentence's GWP mention mis-triggered GWP-context, and the real ~64% GWP reduction is stated separately." },
  { route: "/refrigerant/r-454b/", claimType: "b", number: "5% lower R-454B", refrigerant: "r-410a", reason: "Comparator is R-410A (not R-454B): R-454B bubble runs ~5% below R-410A (190.5 vs 201.8 psig = 5.6%); the extractor captured R-454B as the comparator." },
  { route: "/refrigerant/r-454c/", claimType: "d", number: "40°F boiling point", refrigerant: "r-1234yf", reason: "40°F is the SPAN between the two component normal boiling points (R-32 −61°F, R-1234yf −21°F), not a boiling point; the component NBPs are stated correctly." },
  { route: "/refrigerant/r-455a/", claimType: "c", number: "14°F glide", refrigerant: "r-455a", reason: "14°F is R-454C's glide in an R-454C-vs-R-455A comparison; R-455A's own glide (~22°F) is stated correctly." },
  { route: "/refrigerant/r-500/", claimType: "e", number: "GWP 1996", refrigerant: "r-500", reason: "1996 is the year of the Montreal Protocol CFC production ban, not a GWP; R-500's GWP (8077) is stated correctly elsewhere on the page." },
  { route: "/refrigerant/r-744/", claimType: "a", number: "290 psig @ 0°F", refrigerant: "r-744", reason: "CO₂ service-reference pressure rounded to the nearest 10 PSIG (dataset 291.0); rounding is conventional at CO₂'s pressure magnitudes." },
  { route: "/refrigerant/r-744/", claimType: "a", number: "480 psig @ 30°F", refrigerant: "r-744", reason: "CO₂ service-reference pressure rounded to the nearest 10 PSIG (dataset 476.1)." },
  { route: "/what-pressure-should-r1234yf/", claimType: "a", number: "3 psig @ 70°F", refrigerant: "r-134a", reason: "+3 PSIG is the R-1234yf-minus-R-134a saturation DIFFERENCE at 70°F (74 vs 71), not an absolute saturation pressure." },
  { route: "/what-pressure-should-r1234yf/", claimType: "a", number: "-10 psig @ 130°F", refrigerant: "r-1234yf", reason: "−10 PSIG is the R-1234yf-minus-R-134a saturation difference at condenser temperatures, not an absolute pressure." },
  { route: "/what-pressure-should-r454b/", claimType: "b", number: "10% below R-454B", refrigerant: "r-410a", reason: "The \"5-10% below\" describes R-454B's dew-point gap vs R-410A (actual 8-9.6%); comparator is R-410A, which the extractor mis-captured as R-454B." },
  { route: "/what-pressure-should-r744/", claimType: "f", number: "1700 psig critical pressure", refrigerant: "r-744", reason: "1700 PSIG is the transcritical gas-cooler optimum (1.2-1.5× critical), not the critical pressure (1055 PSIG), which is stated correctly." },
];

function allowReason(f: Finding): string | null {
  for (const a of ALLOWLIST) {
    if (a.claimType !== f.claimType) continue;
    if (a.route !== "any" && a.route !== f.route) continue;
    if (a.number !== f.claimed) continue;
    if (a.refrigerant && a.refrigerant !== f.refrigerant) continue;
    return a.reason;
  }
  return null;
}

/* ─────────────────────── numeric helpers ─────────────────────── */

const isWhole = (s: string) => !s.includes(".");
const numOf = (s: string) => parseFloat(s);

/** Saturation pressure(s) at tempF for a refrigerant: {bubble, dew} or null. */
function satAt(slug: string, tempF: number) {
  return getPressureAtTempF(slug, tempF);
}

/** Dataset glide magnitudes (°F) across representative conditions: the stored
 *  0°C value the site renders, dew−bubble at 1 atm, and dew−bubble at typical
 *  evaporator conditions (20/40/70°F). Glide is pressure-dependent, and prose
 *  routinely cites the "operating" or manufacturer glide rather than the 0°C
 *  thermodynamic value, so a claim matching ANY of these is consistent. */
function glideCandidates(r: Refrigerant): number[] {
  const cands = new Set<number>();
  cands.add(Math.abs(r.physical.temperatureGlideF));
  // 1 atm and evaporator conditions via the ptChart inverse (CoolProp fluids).
  const dew0 = satTemp(r.slug, 0, "dew");
  const bub0 = satTemp(r.slug, 0, "bubble");
  if (dew0 !== null && bub0 !== null) cands.add(Math.abs(dew0 - bub0));
  for (const t of [20, 40, 70]) {
    const p = getPressureAtTempF(r.slug, t);
    if (!p) continue;
    // Glide at the dew pressure for temperature t: dew temp = t by definition,
    // bubble temp is lower; the spread is the operating glide at that pressure.
    const bubT = satTemp(r.slug, p.dew, "bubble");
    if (bubT !== null) cands.add(Math.abs(t - bubT));
  }
  // Datasheet-native fluids (r-448a, r-438a) have no ptChart; read glide
  // (dewF − bubbleF) directly from the pressure-indexed table rows.
  if (r.ptTable && r.ptTable.length > 0) {
    for (const row of r.ptTable) cands.add(Math.abs(row.dewF - row.bubbleF));
  }
  return [...cands];
}

/** Min/max glide magnitude across the operating range (for range-claim checks). */
function glideRange(r: Refrigerant): [number, number] {
  const c = glideCandidates(r);
  return [Math.min(...c), Math.max(...c)];
}

/** Representative "headline" glide for list/column claims (task 19 E1): the
 *  stored 0°C value the facts tables render, plus the 1-atm spread for CoolProp
 *  fluids. Deliberately EXCLUDES the operating-range extremes that
 *  glideCandidates() allows — a bare "R-448A ≈ 6°F" in a glide list should
 *  reflect the ~11.5°F headline glide, not the smallest spread at the top of the
 *  manufacturer pressure table. */
function glideRepresentative(r: Refrigerant): number[] {
  const out = new Set<number>();
  out.add(Math.abs(r.physical.temperatureGlideF));
  const dew0 = satTemp(r.slug, 0, "dew");
  const bub0 = satTemp(r.slug, 0, "bubble");
  if (dew0 !== null && bub0 !== null) out.add(Math.abs(dew0 - bub0));
  return [...out];
}

/* ─────────────────────── subject resolution ─────────────────────── */

/** Nearest NON-parenthetical refrigerant mention nearest to `index` (before,
 *  else after), within `window`. Parenthetical (composition-list) refs are
 *  skipped — the subject of "R-450A (…R-1234ze(E)…) glide 0.9°F" is R-450A. */
function nearestSubject(mentions: RefMention[], index: number, window = 70): string | null {
  const cands = mentions.filter((m) => !m.inParen);
  let best: RefMention | null = null;
  let bestDist = Infinity;
  for (const mm of cands) {
    const dist = mm.index < index ? index - mm.index : (mm.index - index) + 1000; // strongly prefer "before"
    if (Math.abs(mm.index - index) <= window && dist < bestDist) {
      bestDist = dist;
      best = mm;
    }
  }
  return best?.slug ?? null;
}

/** The single subject of a unit: the one named (non-parenthetical) refrigerant,
 *  or the page's sole primary, or (comparison) the named primary. null when
 *  ambiguous. */
function soleSubject(mentions: RefMention[], page: PageInfo): string | null {
  const named = [...new Set(mentions.filter((m) => !m.inParen).map((m) => m.slug))];
  if (named.length === 1) return named[0];
  if (page.primaries.length > 1) {
    const inPage = named.filter((s) => page.primaries.includes(s));
    if (inPage.length === 1) return inPage[0];
    return null; // comparison page, unit names 0 or ≥2 of the pair → ambiguous
  }
  if (page.primaries.length === 1) return page.primaries[0];
  if (named.length >= 1) return named[0];
  return null;
}

/* ─────────────────────── check extractors ─────────────────────── */

const TEMP_RE = /(-?\d+(?:\.\d+)?)\s*°\s*F/g;
const PRESS_RE = /(-?\d+(?:\.\d+)?)\s*psig?\b/gi;

function push(page: PageInfo, claimType: ClaimType, slug: string, sentence: string, claimed: string, dataset: string, ok: boolean, classification: string) {
  if (ok) return;
  const f: Finding = {
    route: page.route,
    category: page.category,
    claimType,
    refrigerant: slug,
    sentence: sentence.length > 200 ? sentence.slice(0, 197) + "…" : sentence,
    claimed,
    dataset,
    severity: "fail",
    classification,
  };
  const reason = allowReason(f);
  if (reason) {
    f.severity = "info";
    f.classification = "allowlisted";
    f.allowlisted = reason;
  }
  findings.push(f);
}

function pushInfo(page: PageInfo, claimType: ClaimType, slug: string, sentence: string, claimed: string, dataset: string, classification: string) {
  findings.push({
    route: page.route,
    category: page.category,
    claimType,
    refrigerant: slug,
    sentence: sentence.length > 200 ? sentence.slice(0, 197) + "…" : sentence,
    claimed,
    dataset,
    severity: "info",
    classification,
  });
}

const OPERATING_CTX = /operating|suction|discharge|head pressure|manifold|ambient|charge|superheat|subcool|high side|low side|cut ?out|cut ?in/i;

/** (a) temperature paired with a pressure → saturation pressure. `masked` has
 *  refrigerant designations blanked so "R-22" is not read as "22 psig". */
function checkTempPressure(unit: string, masked: string, mentions: RefMention[], page: PageInfo) {
  const temps = [...masked.matchAll(TEMP_RE)]
    .map((m) => ({ v: numOf(m[1]), s: m[1], i: m.index ?? 0, end: (m.index ?? 0) + m[0].length }))
    // A temperature immediately followed by "glide" is a glide magnitude
    // ("~11°F glide"), not a saturation temperature — never pair a pressure with
    // it (task 19 E2: the widened ladder window must not reach a glide value).
    .filter((t) => !/^\s*glide/i.test(masked.slice(t.end, t.end + 8)));
  const presses = [...masked.matchAll(PRESS_RE)].map((m) => ({ v: numOf(m[1]), s: m[1], i: m.index ?? 0, end: (m.index ?? 0) + m[0].length }));
  if (!temps.length || !presses.length) return;

  for (const p of presses) {
    // Skip a pressure that is part of a range ("118–130 psig", "118 to 130 psig").
    const before = masked.slice(Math.max(0, p.i - 10), p.i);
    if (/\d+\s*(?:[–—-]|to)\s*$/.test(before)) continue;
    // A leading "-" preceded by a digit is a RANGE hyphen ("30-50 PSIG" → "-50"),
    // not a vacuum negative sign — skip.
    if (p.s.startsWith("-") && p.i > 0 && /\d/.test(masked[p.i - 1])) continue;
    if (precededByBound(masked, p.i)) continue;
    // Ladder-bullet form (task 19 E2): "30°F (label) — R-404A saturation
    // approximately 80 PSIG" puts a label + "saturation approximately" between
    // the temperature and the pressure, so the pair sits beyond the default
    // 45-char window. Widen to 80 chars only when the pressure is cued by a
    // saturation / approximation word — a strong signal it IS a saturation claim
    // — so an equipment "500 PSIG rating" clause is not pulled in.
    const preCue = /(?:saturation|approximately|about|roughly|≈|~|\bsat\b)[\s.,]*$/i.test(masked.slice(Math.max(0, p.i - 24), p.i));
    const window = preCue ? 80 : 45;
    // Nearest temperature within a proximity window (either order).
    let best: { v: number; s: string; i: number } | null = null;
    let bestDist = Infinity;
    for (const t of temps) {
      const dist = t.i < p.i ? p.i - t.end : t.i - p.end;
      if (dist < 0) continue;
      if (dist <= window && dist < bestDist) {
        bestDist = dist;
        best = t;
      }
    }
    if (!best) continue;

    const slug = soleSubject(mentions, page);
    if (!slug) continue;
    const sat = satAt(slug, best.v);
    const operating = OPERATING_CTX.test(unit);
    if (!sat) {
      // Temperature outside the dataset range — cannot be a saturation claim we
      // can verify. Report as info only.
      pushInfo(page, "a", slug, unit, `${p.s} psig @ ${best.s}°F`, "temp out of PT range", operating ? "operating/out-of-range" : "out-of-range");
      continue;
    }
    // "within X PSIG" is a tolerance/agreement band, not a saturation value.
    if (/\bwithin\s*$/i.test(masked.slice(Math.max(0, p.i - 9), p.i))) continue;
    // A "spread" / "difference" / "delta" of X PSIG is bubble−dew (for the page
    // refrigerant OR any mentioned one), not a saturation pressure — skip.
    if (/\b(?:spread|difference|delta|split)\b/i.test(unit)) {
      const spreads = [...new Set([slug, ...mentions.map((mm) => mm.slug), ...page.primaries])]
        .map((s) => { const sp = satAt(s, best!.v); return sp ? Math.abs(sp.bubble - sp.dew) : null; })
        .filter((x): x is number => x != null);
      if (spreads.some((sp) => Math.abs(p.v - sp) <= 2)) continue;
    }
    const tol = isWhole(p.s) ? 1.0 : 0.5;
    const display = (sat.bubble + sat.dew) / 2; // single-column value blends render
    const okBubble = Math.abs(p.v - sat.bubble) <= tol;
    const okDew = Math.abs(p.v - sat.dew) <= tol;
    const okDisplay = Math.abs(p.v - display) <= tol;
    const ds = `bubble ${sat.bubble.toFixed(1)} / dew ${sat.dew.toFixed(1)}${sat.bubble !== sat.dew ? ` / mean ${display.toFixed(1)}` : ""} psig`;
    if (okBubble || okDew || okDisplay) continue;
    // Attribution leniency: the value may be correctly stated for a DIFFERENT
    // refrigerant named in the sentence OR for the page's own refrigerant (our
    // subject heuristic picked a nearby comparison partner). Not a fabrication.
    const other = [...new Set([...mentions.map((mm) => mm.slug), ...page.primaries])].filter((s) => s !== slug).find((s) => {
      const sp = satAt(s, best.v);
      if (sp === null) return false;
      const disp = (sp.bubble + sp.dew) / 2;
      return Math.abs(p.v - sp.bubble) <= tol || Math.abs(p.v - sp.dew) <= tol || Math.abs(p.v - disp) <= tol;
    });
    if (other) {
      pushInfo(page, "a", other, unit, `${p.s} psig @ ${best.s}°F`, `matches ${other} (${satAt(other, best.v)!.bubble.toFixed(1)})`, "attributed to another named refrigerant");
      continue;
    }
    if (operating) {
      // An operating-pressure sentence legitimately differs from saturation.
      pushInfo(page, "a", slug, unit, `${p.s} psig @ ${best.s}°F`, ds, "operating-context (not saturation)");
      continue;
    }
    push(page, "a", slug, unit, `${p.s} psig @ ${best.s}°F`, ds, false, "saturation pressure mismatch");
  }
}

// "X% higher/lower/below/above [pressure] than/vs/compared to R-YYY" — the
// comparator R-YYY must follow the direction word (optionally via than/vs) so
// its role is unambiguous. "reduction/drop" grammars are excluded (no clean
// comparator). A stated GWP/pressure metric word is required by context below.
const PCT_RE =
  /(\d+(?:\.\d+)?)\s*%\s*(higher|lower|below|above|more|less|greater)\b[^.]{0,30}?(?:than|vs\.?|versus|compared\s+to)?\s*\b(R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?)/gi;

/** (b) "X% higher/lower/below/above R-YYY" → pressure OR GWP % difference. Only
 *  evaluated when the sentence context is clearly about GWP or pressure — a
 *  "25% lower capacity" or "5% more efficient" claim is neither and is skipped. */
function checkPercent(unit: string, mentions: RefMention[], page: PageInfo) {
  const isGwp = /gwp|global warming|climate\b|co2|co₂/i.test(unit);
  const isPressure = /pressure|psig|psi\b|saturation|suction|discharge|head\b|envelope/i.test(unit);
  if (!isGwp && !isPressure) return; // e.g. capacity / efficiency / cost — not our claim
  const seen = new Set<string>();

  for (const m of unit.matchAll(PCT_RE)) {
    const pctStr = m[1], dirWord = m[2], compRaw = m[3], atIndex = m.index ?? 0;
    const key = `${pctStr}|${compRaw}|${atIndex}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // The % between this match and its comparator may qualify a NON-pressure,
    // non-GWP quantity (volumetric capacity, efficiency, COP, charge) even on a
    // page that also discusses pressure — skip those.
    if (/capacit|efficien|\bcop\b|displacement|\bcharge\b|volumetric/i.test(unit.slice(Math.max(0, atIndex - 35), atIndex + 55))) continue;
    const compSlug = DESIG_TO_SLUG.get(normDesig(compRaw));
    if (!compSlug) continue;
    // Subject = the page primary that is NOT the comparator, or the sole named
    // (non-parenthetical) ref that isn't the comparator.
    let subject: string | null = null;
    if (page.primaries.length) {
      const cand = page.primaries.filter((s) => s !== compSlug);
      if (cand.length === 1) subject = cand[0];
    }
    if (!subject) {
      const named = [...new Set(mentions.filter((mm) => !mm.inParen).map((mm) => mm.slug))].filter((s) => s !== compSlug);
      if (named.length === 1) subject = named[0];
    }
    if (!subject || subject === compSlug) continue;
    const rSub = getRefrigerant(subject)!;
    const rComp = getRefrigerant(compSlug)!;
    const pct = numOf(pctStr);
    const lower = /lower|below|less/i.test(dirWord);

    if (isGwp) {
      const g1 = gwpNum(rSub.environmental.gwp.headline);
      const g2 = gwpNum(rComp.environmental.gwp.headline);
      if (g1 == null || g2 == null) continue;
      // Percentage is unstable when the comparator's GWP is tiny (÷ by ~1);
      // the absolute value is already covered by check (e). Skip.
      if (Math.max(g1, g2) < 10) continue;
      const belowPct = ((g2 - g1) / g2) * 100; // % subject is below comparator
      const actual = lower ? belowPct : -belowPct; // expected direction magnitude
      const ok = Math.abs(pct - Math.abs(actual)) <= 1.5 && (lower ? belowPct >= 0 : belowPct <= 0);
      push(page, "b", subject, unit, `${pctStr}% ${dirWord} ${rComp.displayName} (GWP)`, `GWP ${g1} vs ${g2} → ${belowPct.toFixed(1)}% ${belowPct >= 0 ? "lower" : "higher"}`, ok, "GWP % difference mismatch");
      continue;
    }

    // Pressure % difference. Accept a match at any candidate temp (stated temps
    // plus 70/95°F), on EITHER the bubble or dew curve (prose compares blends on
    // the suction/dew side as often as bubble), and accept a range claim
    // ("60-70% higher") when the actual delta falls inside it.
    const rm = unit.slice(0, atIndex).match(/(\d+(?:\.\d+)?)\s*[-–—]\s*$/);
    const rangeLow = rm ? numOf(rm[1]) : null;
    const stated = [...unit.matchAll(/(-?\d+(?:\.\d+)?)\s*°\s*F/g)].map((mm) => numOf(mm[1]));
    const temps = [...new Set([...stated, 70, 95])];
    let matched = false;
    let bestDesc = "";
    for (const t of temps) {
      const a = satAt(subject, t);
      const b = satAt(compSlug, t);
      if (!a || !b) continue;
      for (const curve of ["bubble", "dew"] as const) {
        const av = a[curve], bv = b[curve];
        if (bv <= 0) continue;
        const higherPct = ((av - bv) / bv) * 100;
        const mag = Math.abs(higherPct);
        const dirOk = lower ? higherPct <= 0.001 : higherPct >= -0.001;
        if (!bestDesc) bestDesc = `@${t}°F ${av.toFixed(0)} vs ${bv.toFixed(0)} → ${higherPct.toFixed(1)}% ${higherPct >= 0 ? "higher" : "lower"}`;
        const pointOk = Math.abs(pct - mag) <= 1.5;
        const rangeOk = rangeLow != null && mag >= rangeLow - 1.5 && mag <= pct + 1.5;
        if ((pointOk || rangeOk) && dirOk) {
          matched = true;
          bestDesc = `@${t}°F ${curve} ${av.toFixed(0)} vs ${bv.toFixed(0)} → ${higherPct.toFixed(1)}% ${higherPct >= 0 ? "higher" : "lower"}`;
          break;
        }
      }
      if (matched) break;
    }
    if (!bestDesc) continue; // out of range at all temps
    push(page, "b", subject, unit, `${pctStr}% ${dirWord} ${rComp.displayName}`, bestDesc, matched, "pressure % difference mismatch");
  }
}

// "glide of 0.9°F", "glide (~2°F)", "glide is 11°F" — the number must sit right
// after "glide" through a short connective, so "glide @ 70°F" (a table label's
// temperature) and "1°F glide) with 40°F saturation" (a saturation temp) don't
// match.
const GLIDE_RE1 = /glide[\s:()~,]{0,3}(?:of\s+|is\s+|averages?\s+|around\s+|about\s+)?~?\s*(\d+(?:\.\d+)?)\s*°\s*F/gi;
const GLIDE_RE2 = /(\d+(?:\.\d+)?)\s*°\s*F\b[^.]{0,12}?glide/gi;

/** (c) glide of X°F. */
function checkGlide(unit: string, masked: string, mentions: RefMention[], page: PageInfo) {
  const hits: { s: string; i: number; bound: boolean }[] = [];
  for (const m of masked.matchAll(GLIDE_RE1)) {
    const rel = m[0].search(/-?\d+(?:\.\d+)?\s*°\s*F/);
    const i = (m.index ?? 0) + (rel < 0 ? 0 : rel);
    hits.push({ s: m[1], i, bound: /[<>≤≥]\s*\d|(?:under|less than|up to|below|over|above)\s*$/i.test(m[0].slice(0, rel < 0 ? 0 : rel)) });
  }
  for (const m of masked.matchAll(GLIDE_RE2)) hits.push({ s: m[1], i: m.index ?? 0, bound: precededByBound(masked, m.index ?? 0) });
  if (!hits.length) return;
  for (const h of hits) {
    if (h.bound || precededByBound(unit, h.i)) continue;
    const slug = nearestSubject(mentions, h.i, 70) ?? soleSubject(mentions, page);
    if (!slug) continue;
    const r = getRefrigerant(slug)!;
    const cands = glideCandidates(r);
    const v = numOf(h.s);
    const tol = isWhole(h.s) || h.s.split(".")[1]?.length === 1 ? 0.5 : 0.3;
    // Range claim ("~3-4°F glide"): the captured number is the upper bound; if a
    // dataset glide falls inside [low, high] it is consistent.
    const rm = masked.slice(Math.max(0, h.i - 10), h.i).match(/(\d+(?:\.\d+)?)\s*[-–—]\s*$/);
    const okRange = rm ? cands.some((c) => c >= numOf(rm[1]) - 0.5 && c <= v + 0.5) : false;
    const ok = okRange || cands.some((c) => Math.abs(v - c) <= tol);
    if (!ok) {
      // Attribution leniency: the glide may belong to another refrigerant named
      // in the sentence (composition list, comparison partner) OR the page's own
      // refrigerant (subject heuristic picked a nearby partner).
      const other = [...new Set([...mentions.map((mm) => mm.slug), ...page.primaries])].filter((s) => s !== slug).find((s) => {
        const rr = getRefrigerant(s);
        if (rr == null) return false;
        const rc = glideCandidates(rr);
        const rmin = Math.min(...rc), rmax = Math.max(...rc);
        return rc.some((c) => Math.abs(v - c) <= tol) || (rm != null && rmax >= numOf(rm[1]) - 0.5 && rmin <= v + 0.5);
      });
      if (other) {
        pushInfo(page, "c", other, unit, h.s + "°F glide", `matches ${other} glide`, "attributed to another named refrigerant");
        continue;
      }
    }
    push(page, "c", slug, unit, h.s + "°F glide", `${cands.map((c) => c.toFixed(2)).join(" / ")}°F`, ok, "glide mismatch");
  }
}

// (c-list) Glide stated in a list/table form where each value is attached to its
// own designation rather than the word "glide": "R-448A ≈ 6°F", "R-448A (~6°F)",
// "R-448A: 6°F". These are only checked inside a segment that already names
// "glide" (a glide list header or column), so superheat-target / approach lists
// like "R-410A ≈ 10°F" are never touched. Each pair is verified against ITS OWN
// designation's dataset glide — the subject is unambiguous, so no attribution
// leniency applies. Per task 19 E1, only the evaporator-inlet-to-dew glide
// sentence may be allowlisted here.
const GLIDE_LIST_RE =
  /(R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?)\s*(?:≈|~|:|\(\s*~?)\s*(\d+(?:\.\d+)?)\s*°?\s*F/gi;

function checkGlideList(unit: string, page: PageInfo) {
  if (!/glide/i.test(unit)) return; // fast reject: block has no glide context at all
  for (const m of unit.matchAll(GLIDE_LIST_RE)) {
    const desig = m[1], valStr = m[2], at = m.index ?? 0;
    // Localize: the word "glide" must appear shortly before this pair (a list
    // header or column label). Keeps superheat-target / approach lists that
    // happen to share a block with unrelated glide prose from being flagged.
    if (!/glide/i.test(unit.slice(Math.max(0, at - 200), at))) continue;
    // Skip pairs the word-adjacent checkGlide already handles (avoid double count).
    if (/\bglide\b/i.test(unit.slice(at, at + m[0].length + 14)) || /\bglide\b/i.test(unit.slice(Math.max(0, at - 14), at))) continue;
    const slug = DESIG_TO_SLUG.get(normDesig(desig));
    if (!slug) continue;
    const r = getRefrigerant(slug);
    if (!r) continue;
    const cands = glideRepresentative(r);
    if (!cands.length) continue;
    const v = numOf(valStr);
    // Slightly looser than the prose glide check: a bare list value rounds the
    // headline glide to an integer (11.5 → 11 or 12), but 6 vs 11.5 still fails.
    const tol = 0.75;
    const ok = cands.some((c) => Math.abs(v - c) <= tol);
    push(page, "c", slug, unit, valStr + "°F glide (list)", `${cands.map((c) => c.toFixed(2)).join(" / ")}°F`, ok, "glide list mismatch");
  }
}

const BOIL_RE1 = /(?:boils?\s+at|boiling\s+point[^.]{0,22}?)\s*(-?\d+(?:\.\d+)?)\s*°\s*F/gi;
const BOIL_RE2 = /(-?\d+(?:\.\d+)?)\s*°\s*F\b[^.]{0,18}?(?:normal\s+)?boiling\s+point/gi;

/** (d) boiling point. */
function checkBoiling(unit: string, masked: string, mentions: RefMention[], page: PageInfo) {
  const hits: { s: string; i: number }[] = [];
  for (const m of masked.matchAll(BOIL_RE1)) hits.push({ s: m[1], i: m.index ?? 0 });
  for (const m of masked.matchAll(BOIL_RE2)) hits.push({ s: m[1], i: m.index ?? 0 });
  if (!hits.length) return;
  for (const h of hits) {
    if (precededByBound(unit, h.i)) continue;
    const slug = nearestSubject(mentions, h.i, 70) ?? soleSubject(mentions, page);
    if (!slug) continue;
    const r = getRefrigerant(slug)!;
    if (r.physical.boilingPointF === null) continue;
    const v = numOf(h.s);
    const tol = 1.0; // boiling points are routinely rounded to whole °F
    const ok = Math.abs(v - r.physical.boilingPointF) <= tol;
    if (!ok) {
      // The boiling point may belong to a blend COMPONENT or comparison partner
      // named in the sentence ("R-32 at -61°F, R-125 at -55°F …") or the page's
      // own refrigerant.
      const other = [...new Set([...mentions.map((mm) => mm.slug), ...page.primaries])].filter((s) => s !== slug).find((s) => {
        const bp = getRefrigerant(s)?.physical.boilingPointF;
        return bp != null && Math.abs(v - bp) <= tol;
      });
      if (other) {
        pushInfo(page, "d", other, unit, h.s + "°F boiling point", `matches ${other} NBP`, "attributed to another named refrigerant");
        continue;
      }
    }
    push(page, "d", slug, unit, h.s + "°F boiling point", `${r.physical.boilingPointF.toFixed(1)}°F`, ok, "boiling point mismatch");
  }
}

// "GWP" not glued to a preceding word/hyphen (so "lower-GWP", "low-GWP" as an
// adjective don't anchor on the following designation digits), followed by a
// value. A trailing "-yr" / "%" / "°" / "year" means it wasn't a GWP figure.
// A GWP value: 3-4 digit integer, optionally comma-grouped ("14,400"). The
// digit must NOT be glued to a preceding letter (rejects "MO99" → 99, "A2L" → 2)
// and "GWP" must not be part of a word ("lower-GWP"). A trailing unit
// (%, °, -yr, year, ppm) means it wasn't a GWP figure.
const GWP_VALUE = String.raw`(\d{1,3}(?:,\d{3})+|\d{1,5})`;
// (?!\.\d) rejects a decimal fraction ("GWP = 0.689 × …"); the trailing group
// rejects a value carrying a non-GWP unit.
const GWP_RE = new RegExp(String.raw`(?<![-\w])GWP\b[^.\d]{0,10}?(?:of\s+)?(?<![A-Za-z])${GWP_VALUE}(?!\.\d)(?![\d.,]*\s*(?:%|°|-yr|-year|\s*year|\s*ppm|\s*psi))`, "gi");
const GWP_RE_NAME = new RegExp(String.raw`(R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?)(?:['’]s)?\s*(?:has\s+(?:a\s+)?)?(?:100-year\s+|100-yr\s+)?GWP[^.\d]{0,10}?(?:of\s+)?(?<![A-Za-z])${GWP_VALUE}(?!\.\d)`, "gi");
// Any refrigerant-like designation (incl. ones NOT in our 60-fluid dataset:
// R-227ea, R-115, R-23, HFC-227ea, FM-200) — used to detect a GWP figure that
// belongs to a component/related fluid we can't verify, so we don't misattribute
// it to the page's refrigerant.
const ANY_DESIG_BEFORE = /(?:R-?\d{1,4}[a-z]{0,4}(?:\([a-z]\))?|HFC-?\d|CFC-?\d|HCFC-?\d|HFO-?\d|FM-?\d|Freon\s|Genetron\s|Solstice\s|Opteon\s)[\s(,]*$/i;

/** GWP values (headline + AR4/5/6) available for a slug. */
function gwpValuesOf(slug: string): number[] {
  const r = getRefrigerant(slug);
  if (!r) return [];
  return [
    gwpNum(r.environmental.gwp.headline),
    gwpNum(r.environmental.gwp.ar4),
    gwpNum(r.environmental.gwp.ar5),
    gwpNum(r.environmental.gwp.ar6),
  ].filter((x): x is number => x != null);
}

/** (e) GWP number next to a refrigerant name. `masked` blanks designations so a
 *  bare "GWP" isn't anchored on a designation's digits ("Lower-GWP R-134a"). */
function checkGwp(unit: string, masked: string, mentions: RefMention[], page: PageInfo) {
  const near = (claimed: number, a: number | null) => a != null && Math.abs(claimed - a) <= Math.max(1, a * 0.01);
  // Leniency: a GWP figure that equals ANY refrigerant mentioned in the sentence
  // (or the page primary) is not a fabrication — only an attribution ambiguity.
  const relevant = new Set<string>([...mentions.map((m) => m.slug), ...page.primaries]);
  const matchesAnyRelevant = (claimed: number) => [...relevant].some((s) => gwpValuesOf(s).some((v) => near(claimed, v)));

  const evaluated = new Set<number>();
  const evaluate = (valStr: string, subject: string | null, numIdx: number) => {
    if (evaluated.has(numIdx)) return;
    evaluated.add(numIdx);
    if (!subject) return;
    // "40 CFR 84.64 ... GWP N" is the AIM Act blend GWP (84.64(c) excludes CFC/
    // HCFC/PFC constituents) — a distinct regulatory value the us-regulation
    // engine renders and verify-regulatory checks, NOT the refrigerant's headline
    // GWP. "84.64" may sit a few words before the number ("84.64 its blend GWP is N").
    if (/84\.64/.test(unit.slice(Math.max(0, numIdx - 42), numIdx))) return;
    // Threshold ("GWP below 150", "GWP above 700") — a regulatory bound, not a
    // refrigerant's own GWP.
    if (precededByBound(masked, numIdx) || precededByBound(unit, numIdx)) return;
    const claimed = parseInt(valStr.replace(/,/g, ""), 10);
    const r = getRefrigerant(subject)!;
    const headline = gwpNum(r.environmental.gwp.headline);
    const ar4 = gwpNum(r.environmental.gwp.ar4), ar5 = gwpNum(r.environmental.gwp.ar5), ar6 = gwpNum(r.environmental.gwp.ar6);
    // A GWP figure equal to ANY of the refrigerant's official values (headline
    // or IPCC AR4/AR5/AR6) is consistent, regardless of which basis the sentence
    // names. Falls back to any mentioned refrigerant (attribution ambiguity).
    let ok = false;
    let basis = "";
    if (near(claimed, headline)) { ok = true; basis = `${subject} headline ${headline}`; }
    else if (near(claimed, ar4) || near(claimed, ar5) || near(claimed, ar6)) { ok = true; basis = `${subject} AR value (headline ${headline})`; }
    else if (matchesAnyRelevant(claimed)) { ok = true; basis = `matches a mentioned refrigerant's GWP (subject ${subject} headline ${headline})`; }
    else { basis = `${subject} headline ${headline}${ar5 != null ? `, AR5 ${ar5}` : ""}${ar4 != null ? `, AR4 ${ar4}` : ""}${ar6 != null ? `, AR6 ${ar6}` : ""}`; }
    push(page, "e", subject, unit, `GWP ${valStr}`, basis, ok, "GWP-by-name mismatch");
  };

  // Name-anchored: "R-X ... GWP N" (unmasked — needs the designation).
  for (const m of unit.matchAll(GWP_RE_NAME)) {
    const subject = DESIG_TO_SLUG.get(normDesig(m[1])) ?? null;
    const numIdx = (m.index ?? 0) + m[0].lastIndexOf(m[2]);
    evaluate(m[2], subject, numIdx);
  }
  // Bare "GWP N" (masked so a designation's digits aren't read as the value).
  for (const m of masked.matchAll(GWP_RE)) {
    const numIdx = (m.index ?? 0) + m[0].lastIndexOf(m[1]);
    const near = nearestSubject(mentions, numIdx, 24);
    // If ANY refrigerant-like designation (incl. ones NOT in our dataset —
    // "R-23 (HFC, GWP 14,800)", "R-227ea", "R-115", "FM-200") appears in the
    // ~26 chars before "GWP", the figure belongs to THAT named fluid. Attribute
    // via the dataset subject if it resolves, else SKIP (can't verify / not the
    // page's own value). Only fall back to the page primary when no designation
    // precedes the keyword ("its GWP of 601").
    const gwpKeyIdx = unit.slice(0, numIdx + 1).toUpperCase().lastIndexOf("GWP");
    const beforeGwp = gwpKeyIdx > 0 ? unit.slice(Math.max(0, gwpKeyIdx - 26), gwpKeyIdx) : "";
    const hasDesigBefore = /(?:R-?\d{1,4}[a-z]{0,4}|HFC-?\d|CFC-?\d|HCFC-?\d|HFO-?\d|FM-?\d)/i.test(beforeGwp);
    const subject = near ?? (hasDesigBefore ? null : page.primaries.length === 1 ? page.primaries[0] : null);
    evaluate(m[1], subject, numIdx);
  }

  // (N1) "R-xxx (NNN)" and "R-xxx at NNN" — a GWP figure attached DIRECTLY to a
  // designation without the word "GWP", but ONLY inside a GWP / AIM / threshold
  // sentence so a year "(1987)", a charge "(2 lb)" or a paragraph "(a)(1)" is not
  // read as a GWP. A direct value label is not a cross-basis rounding, so it must
  // match one of the refrigerant's OFFICIAL GWP values exactly (±0.5 for integer
  // values, ±0.06 for the sub-unity HFO/HC decimals) — catching e.g. R-454B (466)
  // when the dataset (headline 465, AR5 467) has no 466.
  if (/gwp|aim act|\b700\b|\b150\b/i.test(unit)) {
    const evaluateExact = (valStr: string, subject: string | null, numIdx: number) => {
      if (evaluated.has(numIdx)) return;
      evaluated.add(numIdx);
      if (!subject) return;
      if (/84\.64/.test(unit.slice(Math.max(0, numIdx - 42), numIdx))) return;
      if (precededByBound(masked, numIdx) || precededByBound(unit, numIdx)) return;
      const claimed = parseFloat(valStr.replace(/,/g, ""));
      const subjVals = gwpValuesOf(subject);
      if (subjVals.some((v) => gwpTight(claimed, v))) return; // matches an official value
      const other = [...relevant].filter((s) => s !== subject).find((s) => gwpValuesOf(s).some((v) => gwpTight(claimed, v)));
      if (other) { pushInfo(page, "e", other, unit, `GWP ${valStr}`, `matches ${other}`, "attributed to another named refrigerant"); return; }
      const headline = gwpNum(getRefrigerant(subject)!.environmental.gwp.headline);
      push(page, "e", subject, unit, `GWP ${valStr}`, `${subject} headline ${headline} (official ${subjVals.join("/")})`, false, "GWP-by-name mismatch");
    };
    const PAREN_RE = /(R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?)\s*\(\s*(\d{1,3}(?:,\d{3})+|\d{1,5})\s*\)/gi;
    for (const m of unit.matchAll(PAREN_RE)) {
      const subject = DESIG_TO_SLUG.get(normDesig(m[1])) ?? null;
      const numIdx = (m.index ?? 0) + m[0].lastIndexOf(m[2]);
      evaluateExact(m[2], subject, numIdx);
    }
    // The value after "at" must be a complete integer GWP: not followed by a
    // digit / decimal / ratio-slash / percent / degree (so a mass-fraction list
    // "at 3/21.5/75.5", a decimal "24.3", or "at 15°F" is not read as a GWP).
    const AT_RE = /(R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?)\s+at\s+(\d{1,3}(?:,\d{3})+|\d{1,5})(?![0-9/,%°]|\.\d|\s*(?:psi|yr|year|ppm|lb|kg|hp|mm|cm))/gi;
    for (const m of unit.matchAll(AT_RE)) {
      const subject = DESIG_TO_SLUG.get(normDesig(m[1])) ?? null;
      const numIdx = (m.index ?? 0) + m[0].lastIndexOf(m[2]);
      evaluateExact(m[2], subject, numIdx);
    }
  }
}

/** Tight GWP match for direct value labels (charts, "R-xxx (NNN)"): within
 *  integer display rounding (±0.5), NOT the 1% cross-basis leniency — so a bar
 *  or paren value that rounds a decimal headline (R-290 3.3 → "3") passes while
 *  an off-by-one like R-454B "466" vs 465 is caught. */
function gwpTight(claimed: number, v: number): boolean {
  return Math.abs(claimed - v) <= 0.5;
}

/**
 * (N1) GWP chart / SVG check. extractUnits() strips <svg>, so the chart bars are
 * checked here on the raw HTML: for every SVG whose accessible text mentions GWP,
 * each bar's designation is paired with the number that labels it and checked
 * against that refrigerant's dataset GWP values. Display-rounded "k" values
 * (e.g. "1.4k") are skipped — only exact numeric labels are verified.
 */
function checkGwpChartsHtml(html: string, page: PageInfo) {
  const $ = cheerio.load(html);
  $("svg").each((_, svg) => {
    const $svg = $(svg);
    const texts = $svg.find("text, tspan").map((_, t) => $(t).text().trim()).get().filter(Boolean);
    const aria = `${$svg.attr("aria-label") ?? ""} ${$svg.find("title").text()} ${texts.join(" ")}`;
    if (!/\bGWP\b/i.test(aria)) return; // not a GWP chart
    for (let i = 0; i < texts.length; i++) {
      const dm = texts[i].match(/^(R[-‑–—\s]?\d{1,4}[A-Za-z]{0,4}(?:\([A-Za-z]\))?)\b/);
      if (!dm) continue;
      const slug = DESIG_TO_SLUG.get(normDesig(dm[1]));
      if (!slug) continue;
      // The bar's value is the text IMMEDIATELY after its label (label <text>,
      // then value <text>). If that text is not a plain number — e.g. a
      // display-rounded "4.8k" — skip this bar rather than scanning ahead into
      // axis ticks (a scan-ahead would wrongly pair the largest bar with the "0"
      // tick).
      let valStr: string | null = null;
      const inline = texts[i].slice(dm[1].length).match(/(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s*$/);
      if (inline) valStr = inline[1];
      else if (i + 1 < texts.length) {
        const vm = texts[i + 1].match(/^(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)$/);
        if (vm) valStr = vm[1];
      }
      if (valStr == null) continue;
      const claimed = parseFloat(valStr.replace(/,/g, ""));
      // N1: chart bars are checked against the dataset HEADLINE (tight — a bar is
      // a direct value render, not a cross-basis rounding).
      const headline = gwpNum(getRefrigerant(slug)!.environmental.gwp.headline);
      if (headline == null) continue;
      const ok = gwpTight(claimed, headline);
      push(page, "e", slug, `GWP chart: ${dm[1]} = ${valStr}`, `chart ${valStr}`, `${slug} headline GWP ${headline}`, ok, "GWP chart value mismatch");
    }
  });
}

const CRIT_T_RE = /critical\s+temperature[^.]{0,24}?(-?\d+(?:\.\d+)?)\s*°\s*F/gi;
const CRIT_P_RE = /critical\s+pressure[^.]{0,24}?(\d+(?:\.\d+)?)\s*(psig|psia|psi)\b/gi;

/** (f) critical temperature / pressure. */
function checkCritical(unit: string, masked: string, mentions: RefMention[], page: PageInfo) {
  for (const m of masked.matchAll(CRIT_T_RE)) {
    const slug = nearestSubject(mentions, m.index ?? 0, 70) ?? soleSubject(mentions, page);
    if (!slug) continue;
    const r = getRefrigerant(slug)!;
    if (r.physical.critical.tempF === null) continue;
    const v = numOf(m[1]);
    const ok = Math.abs(v - r.physical.critical.tempF) <= 0.5;
    push(page, "f", slug, unit, m[1] + "°F critical temp", `${r.physical.critical.tempF.toFixed(1)}°F`, ok, "critical temperature mismatch");
  }
  for (const m of masked.matchAll(CRIT_P_RE)) {
    const slug = nearestSubject(mentions, m.index ?? 0, 70) ?? soleSubject(mentions, page);
    if (!slug) continue;
    const r = getRefrigerant(slug)!;
    const v = numOf(m[1]);
    const unitKind = m[2].toLowerCase();
    const target = unitKind === "psia" ? r.physical.critical.pressurePsia : r.physical.critical.pressurePsig;
    if (target === null) continue;
    const ok = Math.abs(v - target) <= 1.0;
    push(page, "f", slug, unit, `${m[1]} ${unitKind} critical pressure`, `${target.toFixed(0)} ${unitKind}`, ok, "critical pressure mismatch");
  }
}

/* ─────────────────────── run all checks on a unit ─────────────────────── */

function checkUnit(unit: string, page: PageInfo) {
  const mentions = findRefMentions(unit);
  // `masked` blanks refrigerant designations so their digits ("134" in
  // "R-134a") are never read as a pressure/GWP/temperature value. Value
  // extraction runs on `masked`; subject attribution uses `mentions` (computed
  // from the original text, so positions still line up).
  const masked = maskDesignations(unit, mentions);
  checkTempPressure(unit, masked, mentions, page);
  checkPercent(unit, mentions, page); // needs designations for the comparator
  checkGlide(unit, masked, mentions, page);
  checkBoiling(unit, masked, mentions, page);
  checkGwp(unit, masked, mentions, page);
  checkCritical(unit, masked, mentions, page);
}

/** Run every check on each SENTENCE of a text block (sentence scope keeps a
 *  claim from pairing a number with a value in an adjacent clause). */
function checkText(text: string, page: PageInfo) {
  for (const s of sentences(text)) checkUnit(s, page);
  // Glide list/column claims (task 19 E1) run on the WHOLE block: the sentence
  // splitter cuts the "Glide values:" header off the "R-XXX ≈ N°F" pairs, so a
  // per-sentence scope would lose the glide context.
  checkGlideList(text, page);
}

/* ─────────────────────── extractor self-tests ─────────────────────── */
/**
 * Reference values from the brief exercise the extractor + dataset lookup end to
 * end. A regression here (a broken regex, a dataset shift) fails the gate before
 * it can report a hollow pass.
 */
function selfTest(): string[] {
  const errs: string[] = [];
  const run = (label: string, html: string, route: string, expectFail: boolean, type?: ClaimType) => {
    const page = classifyRoute(route);
    if (!page) {
      errs.push(`${label}: route ${route} did not classify`);
      return;
    }
    const before = findings.length;
    for (const u of extractUnits(html)) if (u.kind !== "title") checkText(u.text, page);
    const produced = findings.slice(before).filter((f) => f.severity === "fail" && (!type || f.claimType === type));
    findings.length = before; // discard self-test findings
    if (expectFail && produced.length === 0) errs.push(`${label}: expected a ${type ?? ""} mismatch, got none`);
    if (!expectFail && produced.length > 0) errs.push(`${label}: expected no mismatch, got ${produced.map((f) => f.classification + " " + f.claimed).join("; ")}`);
  };
  const body = (s: string) => `<html><body><p>${s}</p></body></html>`;

  // (a) correct reference values — must NOT flag.
  run("R-410A 296.4@95 ok", body("R-410A saturates at 296.4 psig at 95°F on the high side of comfort cooling."), "/refrigerant/r-410a/", false, "a");
  run("R-410A 419.5@120 ok", body("At 120°F the R-410A saturation pressure is 419.5 psig."), "/refrigerant/r-410a/", false, "a");
  run("R-22 121.4@70 ok", body("R-22 sits at 121.4 psig at 70°F."), "/refrigerant/r-22/", false, "a");
  // (a) wrong value — must flag.
  run("R-22 300@70 wrong", body("R-22 reads 300 psig at 70°F saturation."), "/refrigerant/r-22/", true, "a");
  // (c) glide
  run("R-404A 0.9 glide ok", body("R-404A has a temperature glide of 0.9°F."), "/refrigerant/r-404a/", false, "c");
  run("R-404A 2 glide wrong", body("R-404A has roughly 2°F glide across the coil."), "/refrigerant/r-404a/", true, "c");
  // (c) glide stated in list/table form (task 19 E1)
  run("R-448A 6 glide-list wrong", body("Glide values across blends: R-448A ≈ 6°F."), "/refrigerant/r-448a/", true, "c");
  run("R-448A 11 glide-list ok", body("Glide values across blends: R-448A ≈ 11°F."), "/refrigerant/r-448a/", false, "c");
  run("R-410A 10 SH-list not-glide", body("Target superheat by blend: R-410A ≈ 10°F."), "/superheat-calculator/", false, "c");
  // (a) saturation ladder bullet with a label between temp and pressure (task 19 E2)
  run("R-404A 80@30 ladder wrong", body("30°F (refrigerated) — R-404A saturation approximately 80 PSIG."), "/refrigerant/r-404a/", true, "a");
  run("R-404A 70@30 ladder ok", body("30°F (refrigerated) — R-404A saturation approximately 70 PSIG."), "/refrigerant/r-404a/", false, "a");
  run("no pair with glide temp", body("R-448A is approximately 89 PSIG bubble / 72 PSIG dew — the ~11°F glide spreads the dew side."), "/r-404a-vs-r-448a/", false, "a");
  // (d) boiling point
  run("R-134a boil ok", body("R-134a boils at -14.9°F at atmospheric pressure."), "/refrigerant/r-134a/", false, "d");
  run("R-134a boil wrong", body("R-134a boils at -20°F at atmospheric pressure."), "/refrigerant/r-134a/", true, "d");
  // (e) GWP
  run("R-410A gwp ok", body("R-410A carries a GWP of 2088 on the EPA basis."), "/refrigerant/r-410a/", false, "e");
  run("R-410A gwp wrong", body("R-410A carries a GWP of 1500."), "/refrigerant/r-410a/", true, "e");
  // (e, N1) "R-xxx (NNN)" / "R-xxx at NNN" in a GWP/AIM/threshold context
  run("R-454B (466) wrong", body("Under the AIM Act 700 limit, R-454B (466) is a common comparison — but note the GWP figure."), "/refrigerant/r-454b/", true, "e");
  run("R-454B (465) ok", body("Under the AIM Act 700 limit, R-454B (465) is the GWP figure."), "/refrigerant/r-454b/", false, "e");
  run("R-32 at 675 gwp ok", body("For AIM Act purposes R-32 at 675 sits under the 700 GWP limit."), "/refrigerant/r-32/", false, "e");
  run("R-32 at 900 gwp wrong", body("For AIM Act purposes R-32 at 900 GWP would fail."), "/refrigerant/r-32/", true, "e");
  run("R-410A (2 lb) not-gwp", body("Charge the R-410A (2 lb) system; GWP is discussed elsewhere."), "/refrigerant/r-410a/", false, "e");
  // (f) critical
  run("R-134a crit T ok", body("R-134a has a critical temperature of 213.9°F."), "/refrigerant/r-134a/", false, "f");
  run("R-134a crit T wrong", body("R-134a has a critical temperature of 250°F."), "/refrigerant/r-134a/", true, "f");
  return errs;
}

/* ─────────────────────── main ─────────────────────── */

function main() {
  if (!existsSync(HTML_ROOT)) {
    console.error(`[verify-numeric-consistency] .next/server/app not found — run \`pnpm build\` first.`);
    process.exit(1);
  }

  const selfErrs = selfTest();
  if (selfErrs.length) {
    console.error(`[verify-numeric-consistency] SELF-TEST FAILED — extractor is broken:`);
    for (const e of selfErrs) console.error("  ✗ " + e);
    process.exit(1);
  }
  console.log(`[verify-numeric-consistency] self-tests passed (${23} extractor cases).`);

  const files = walkHtml(HTML_ROOT).sort();
  const pages: PageInfo[] = [];
  for (const f of files) {
    const route = fileToRoute(f);
    const page = classifyRoute(route);
    const html = readFileSync(f, "utf8");
    if (page) {
      pages.push(page);
      for (const u of extractUnits(html)) checkText(u.text, page);
      checkGwpChartsHtml(html, page); // N1: GWP chart/SVG bars (extractUnits strips svg)
    } else if (route.startsWith("/dev/")) {
      // dev-only preview routes — skip.
    } else {
      // Unclassified pages (guides, hubs): still verify any GWP chart bars.
      checkGwpChartsHtml(html, { route, category: "chart", primaries: [] });
    }
  }

  banner("verify-numeric-consistency", pages.length, Math.min(80, Math.max(1, htmlFloor() - 40)), "scanned pages");

  writeReport(pages);

  const fails = findings.filter((f) => f.severity === "fail");
  const byType: Record<string, number> = {};
  for (const f of fails) byType[f.claimType] = (byType[f.claimType] ?? 0) + 1;

  console.log(`[verify-numeric-consistency] scanned ${pages.length} pages; ${findings.length} findings (${fails.length} mismatches, ${findings.length - fails.length} info/allowlisted).`);
  console.log(`  mismatches by claim type: ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ") || "none"}`);
  console.log(`  report → ${relative(ROOT, REPORT_PATH)}`);

  if (fails.length && !REPORT_MODE) {
    console.error(`\n[verify-numeric-consistency] FAIL — ${fails.length} prose number(s) contradict the dataset:`);
    for (const f of fails.slice(0, 40)) {
      console.error(`  ${f.route} [${f.claimType}] claimed ${f.claimed} — dataset ${f.dataset}`);
      console.error(`      "${f.sentence}"`);
    }
    if (fails.length > 40) console.error(`  … +${fails.length - 40} more (see report)`);
    process.exit(1);
  }
  if (REPORT_MODE) console.log(`[verify-numeric-consistency] report mode — not failing the build.`);
  else console.log(`[verify-numeric-consistency] OK — every prose number matches the dataset (or is allowlisted).`);
  process.exit(0);
}

function writeReport(pages: PageInfo[]) {
  const fails = findings.filter((f) => f.severity === "fail");
  const info = findings.filter((f) => f.severity === "info");
  const byTypeLabel: Record<ClaimType, string> = {
    a: "temp+pressure (saturation)",
    b: "% higher/lower vs refrigerant",
    c: "glide",
    d: "boiling point",
    e: "GWP by name",
    f: "critical temp/pressure",
  };
  const lines: string[] = [];
  lines.push(`# Numeric-consistency report`);
  lines.push("");
  lines.push(`Generated by \`scripts/verify-numeric-consistency.ts\` over the prerendered HTML of the refrigerant, what-pressure, comparison, calculator and chart pages. Prose numbers (body text, FAQs, meta descriptions, titles) checked against the refrigerant dataset; \`data-src="dataset"\` subtrees are trusted and excluded.`);
  lines.push("");
  lines.push(`- Pages scanned: **${pages.length}**`);
  lines.push(`- Mismatches (fail): **${fails.length}**`);
  lines.push(`- Info (operating-context / out-of-range / allowlisted): **${info.length}**`);
  lines.push("");
  lines.push(`## Mismatches by claim type`);
  lines.push("");
  lines.push(`| Type | Meaning | Count |`);
  lines.push(`| --- | --- | --- |`);
  for (const t of ["a", "b", "c", "d", "e", "f"] as ClaimType[]) {
    lines.push(`| ${t} | ${byTypeLabel[t]} | ${fails.filter((f) => f.claimType === t).length} |`);
  }
  lines.push("");
  const table = (rows: Finding[]) => {
    const out: string[] = [];
    out.push(`| Page | Type | Refrigerant | Claimed | Dataset | Sentence |`);
    out.push(`| --- | --- | --- | --- | --- | --- |`);
    for (const f of rows) {
      const s = f.sentence.replace(/\|/g, "\\|");
      out.push(`| ${f.route} | ${f.claimType} | ${f.refrigerant} | ${f.claimed} | ${f.dataset.replace(/\|/g, "\\|")} | ${s} |`);
    }
    return out;
  };
  lines.push(`## Mismatches (must fix or allowlist)`);
  lines.push("");
  if (fails.length) lines.push(...table(fails));
  else lines.push(`_None._`);
  lines.push("");
  lines.push(`## Info — operating-context, out-of-range, allowlisted`);
  lines.push("");
  lines.push(`These are NOT failures. Operating-context pressures legitimately differ from saturation; out-of-range temps can't be verified; allowlisted entries are documented in the script.`);
  lines.push("");
  if (info.length) lines.push(...table(info));
  else lines.push(`_None._`);
  lines.push("");

  mkdirSync(dirname(REPORT_PATH), { recursive: true });
  writeFileSync(REPORT_PATH, lines.join("\n") + "\n", "utf8");
  // Machine-readable companion (fail findings only) for triage tooling.
  writeFileSync(
    REPORT_PATH.replace(/\.md$/, ".json"),
    JSON.stringify({ pages: pages.length, mismatches: fails, info }, null, 2) + "\n",
    "utf8",
  );
}

main();
