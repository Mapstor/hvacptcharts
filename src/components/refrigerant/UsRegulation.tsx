import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, FileText, Info } from "lucide-react";
import type { Refrigerant } from "@/data/refrigerants";
import {
  isRegulated,
  regulatoryClass,
  gwp8464,
  restrictions,
  derivedSaleRows,
  usSubsectors,
  subsectorStatus,
  ods,
  ODS_SERVICING_NOTE,
  eu,
  euApplies,
  EU_FRAMING,
  EU_URL,
  PHASEDOWN,
  AIM_SOURCE_LINE,
  AIM_SOURCE_URL,
  fmtDate,
  type AppliedRestriction,
  type Tier,
} from "@/lib/us-regulation";

/* ── shared formatters ─────────────────────────────────────────────────── */

function tiersLabel(tiers: Tier[] | undefined): string {
  if (!tiers || tiers.length === 0) return "";
  return tiers.map((t) => `GWP ≥ ${t.gwpAtLeast} (${t.condition.replace("refrigerant charge capacity ", "").replace("high-temperature side of a cascade system", "cascade high side")})`).join("; ");
}
function limitLabel(a: AppliedRestriction): string {
  if (a.ruleKind === "gwp") return `GWP ≥ ${a.limit}`;
  if (a.ruleKind === "named") return "listed refrigerant";
  return tiersLabel(a.tiers);
}
const ACTION_SHORT: Record<string, string> = {
  "Manufacture / import": "Manufacture / import",
  Installation: "Installation",
  "Sale / distribution": "Sale / distribution",
};

/* ── facts-row one-liner ───────────────────────────────────────────────── */

export function newEquipmentFactValue(r: Refrigerant): React.ReactNode {
  const klass = regulatoryClass(r);
  if (klass === "none") {
    return <span>Not an AIM Act regulated substance; 40 CFR 84.54 GWP limits don&apos;t apply.</span>;
  }
  if (klass === "ods-cfc") return <span>Class I ODS (CFC) — US production/import ended January 1, 1996.</span>;
  if (klass === "ods-hcfc") return <span>Class II ODS (HCFC) — US production/import phased out (see timeline).</span>;
  const n = restrictions(r).length;
  const g8 = Math.round(gwp8464(r));
  if (n === 0) {
    return (
      <span>
        AIM Act HFC, 84.64 GWP {g8} — below every 40 CFR 84.54 limit;{" "}
        <Link href="#us-new-equipment" className="underline">no new-equipment restriction</Link>.
      </span>
    );
  }
  return (
    <span>
      Restricted in {n} new-equipment categories —{" "}
      <Link href="#us-new-equipment" className="underline">US new-equipment rules (40 CFR 84.54)</Link>.
    </span>
  );
}

/* ── allowance steps (shared) ──────────────────────────────────────────── */

function AllowanceSteps() {
  const future = PHASEDOWN.schedule.filter((s) => Number(s.years.slice(0, 4)) >= 2029);
  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      <strong>HFC production &amp; consumption allowances</strong> step down to{" "}
      {future.map((s, i) => (
        <span key={s.years}>
          {i > 0 ? (i === future.length - 1 ? ", and " : ", ") : ""}
          {s.percentOfBaseline}% of baseline in {s.years.replace("2036 and after", "2036 and later")}
        </span>
      ))}{" "}
      (42 U.S.C. 7675(e)(2)(C)).
    </p>
  );
}

/* ── phase-down timeline (section 08 content) ──────────────────────────── */

export function RegulatoryTimeline({ r }: { r: Refrigerant }) {
  const klass = regulatoryClass(r);

  if (klass === "ods-cfc" || klass === "ods-hcfc") {
    const milestones = ods(r);
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {r.displayName} is an ozone-depleting substance controlled under the US Clean Air Act (class {klass === "ods-cfc" ? "I — CFC" : "II — HCFC"}),
          not the AIM Act. Milestones below are US production/import limits.
        </p>
        <ul className="space-y-2">
          {milestones.map((m) => (
            <li key={m.date + m.event} className="flex gap-3 rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              <span>
                <strong>{fmtDate(m.date)}</strong> — {m.event}.{" "}
                <a href={m.url} className="text-blue-700 underline dark:text-blue-300" target="_blank" rel="nofollow noopener">{m.source}</a>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-zinc-500">{ODS_SERVICING_NOTE}</p>
      </div>
    );
  }

  if (klass === "none") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>{r.displayName} is not an AIM Act regulated substance</strong>{" "}(not one of the 18 HFCs in 42 U.S.C. 7675(c), and not a blend containing one). The 40 CFR 84.54 GWP limits don&apos;t apply. Its availability is governed by ordinary commodity dynamics and equipment-specific installation standards, not a climate phase-down.
          </p>
        </div>
      </div>
    );
  }

  // regulated HFC
  const g8 = Math.round(gwp8464(r));
  const mapped = usSubsectors(r).map((s) => ({ s, st: subsectorStatus(r, s) }));
  const restricted = mapped.filter((m) => m.st.earliestRestricted);
  const allowedUntil = mapped.filter((m) => m.st.allowedUntil);
  const notRestricted = mapped.filter((m) => m.st.notRestricted);
  const total = restrictions(r).length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        {r.displayName} is a <strong>regulated HFC under the AIM Act</strong>{" "}(42 U.S.C. 7675). Its 40 CFR 84.64 GWP is <strong>{g8}</strong>
        {total > 0 ? (
          <> — restricted in <strong>{total}</strong> new-equipment categories under 40 CFR 84.54.</>
        ) : (
          <> — below every 40 CFR 84.54 GWP limit, so <strong>no 84.54 new-equipment limit restricts it</strong>.</>
        )}
      </p>

      {restricted.length > 0 && (
        <ul className="space-y-2">
          {restricted
            .sort((a, b) => (a.st.earliestRestricted ?? "").localeCompare(b.st.earliestRestricted ?? ""))
            .map((m) => {
              const first = m.st.applied[0];
              return (
                <li key={m.s.id} className="flex gap-3 rounded-md border border-amber-200 bg-amber-50/40 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>From {fmtDate(m.st.earliestRestricted!)}</strong> — new {m.s.label.toLowerCase()}: {first.action.toLowerCase()} restricted ({limitLabel(first)}) [{first.para}].
                  </span>
                </li>
              );
            })}
        </ul>
      )}

      {allowedUntil.map((m) => (
        <p key={m.s.id} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>{r.displayName} remains installable in new <strong>{m.s.label.toLowerCase()}</strong> until {fmtDate(m.st.allowedUntil!)} (below the current limit).</span>
        </p>
      ))}

      {notRestricted.map((m) => (
        <p key={m.s.id} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{r.displayName} is <strong>not restricted</strong> in new {m.s.label.toLowerCase()}{" "}(its 84.64 GWP {g8} is below that subsector&apos;s limit).</span>
        </p>
      ))}

      <AllowanceSteps />
      <p className="text-sm">
        <Link href="#us-new-equipment" className="font-medium text-blue-700 underline dark:text-blue-300">
          Full 40 CFR 84.54 new-equipment rules for {r.displayName} →
        </Link>
      </p>
    </div>
  );
}

/* ── "US new-equipment rules (40 CFR 84.54)" section ───────────────────── */

export function UsNewEquipmentRules({ r }: { r: Refrigerant }) {
  if (!isRegulated(r)) return null;
  const g8 = Math.round(gwp8464(r));
  const all = restrictions(r);
  const mapped = usSubsectors(r).map((s) => ({ s, st: subsectorStatus(r, s) }));

  // Mapped table = applicable entries in mapped subsectors + derived 84.54(b) rows.
  const mappedApplied: AppliedRestriction[] = mapped.flatMap((m) => m.st.applied);
  const seen = new Set<string>();
  const dedupMapped = mappedApplied.filter((a) => {
    const k = a.para + a.action;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const withDerived = [...dedupMapped, ...derivedSaleRows(dedupMapped)].sort(
    (a, b) => a.effective.localeCompare(b.effective) || a.para.localeCompare(b.para)
  );

  const allowedUntil = mapped.filter((m) => m.st.allowedUntil);
  const notRestricted = mapped.filter((m) => m.st.notRestricted);
  const euRows = euApplies(r) ? eu(r) : [];

  return (
    <section id="us-new-equipment" className="mt-10 scroll-mt-24">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        US new-equipment rules (40 CFR 84.54)
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {r.displayName} is a regulated HFC (AIM Act, 42 U.S.C. 7675). Under 40 CFR 84.64 its blend GWP is <strong>{g8}</strong> (constituent GWP × mass fraction; CFC/HCFC/PFC constituents excluded per 84.64(c)). That value is compared against each 40 CFR 84.54 subsector limit below.
      </p>

      {withDerived.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-3 py-2 font-medium">Effective</th>
                <th className="px-3 py-2 font-medium">Equipment subsector</th>
                <th className="px-3 py-2 font-medium">Limit</th>
                <th className="px-3 py-2 font-medium">Restriction</th>
                <th className="px-3 py-2 font-medium">¶</th>
              </tr>
            </thead>
            <tbody>
              {withDerived.map((a, i) => (
                <tr key={a.para + a.action + i} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-3 py-2 font-mono tabular-nums whitespace-nowrap">{fmtDate(a.effective)}</td>
                  <td className="px-3 py-2">{a.subsector}</td>
                  <td className="px-3 py-2 text-xs">{limitLabel(a)}</td>
                  <td className="px-3 py-2 text-xs">{ACTION_SHORT[a.action] ?? a.action}</td>
                  <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">{a.para}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/40 p-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
          None of {r.displayName}&apos;s mapped equipment subsectors carry a 40 CFR 84.54 limit that its 84.64 GWP ({g8}) meets — no new-equipment restriction currently applies.
        </p>
      )}

      {(allowedUntil.length > 0 || notRestricted.length > 0) && (
        <ul className="mt-3 space-y-1.5 text-sm">
          {allowedUntil.map((m) => (
            <li key={m.s.id} className="flex items-start gap-2">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>Installable in new <strong>{m.s.label.toLowerCase()}</strong> until {fmtDate(m.st.allowedUntil!)}.</span>
            </li>
          ))}
          {notRestricted.map((m) => (
            <li key={m.s.id} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Not restricted in new <strong>{m.s.label.toLowerCase()}</strong>.</span>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-4 rounded-md border border-zinc-200 dark:border-zinc-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
          All 84.54 categories restricting {r.displayName} ({all.length})
        </summary>
        <div className="overflow-x-auto border-t border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-sm">
            <tbody>
              {[...all].sort((a, b) => a.effective.localeCompare(b.effective) || a.para.localeCompare(b.para)).map((a, i) => (
                <tr key={a.para + i} className="border-t border-zinc-100 first:border-t-0 dark:border-zinc-800">
                  <td className="px-3 py-1.5 font-mono tabular-nums whitespace-nowrap text-xs">{fmtDate(a.effective)}</td>
                  <td className="px-3 py-1.5 text-xs">{a.subsector}</td>
                  <td className="px-3 py-1.5 text-xs">{limitLabel(a)}</td>
                  <td className="px-3 py-1.5 font-mono text-xs whitespace-nowrap">{a.para}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <div className="mt-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50/40 p-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Servicing.</strong> 40 CFR 84.54 restricts new manufacture/import, later sale/distribution, and installation. &quot;Installation&quot; is defined in 84.54(e); repairing or servicing existing {r.displayName} equipment is <strong>not</strong> an installation unless it meets 84.54(e), so existing systems can keep being serviced.
        </p>
      </div>

      {euRows.length > 0 && (
        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">EU (retail-food / cold-storage)</p>
          <p className="mt-1">
            Under {EU_FRAMING} (compared against the AR4 headline GWP), {r.displayName} meets:
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {euRows.map((row, i) => (
              <li key={i}>
                {row.kind === "servicing" ? "Art. 13(3)" : `Annex III row ${row.row}`}: {row.product} — GWP ≥ {row.gwpAtLeast}, from {fmtDate(row.date)}.
              </li>
            ))}
          </ul>
          <p className="mt-1 text-xs">
            <a href={EU_URL} className="underline" target="_blank" rel="nofollow noopener">Regulation (EU) No 517/2014</a>.
          </p>
        </div>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        Source:{" "}
        <a href={AIM_SOURCE_URL} className="underline" target="_blank" rel="nofollow noopener">{AIM_SOURCE_LINE}</a>. Installation defined at 40 CFR 84.54(e).
      </p>
    </section>
  );
}
