"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { diagnose, type FlagSeverity, type SystemType } from "@/lib/diagnostic";
import { RefrigerantSelector } from "./shared/RefrigerantSelector";

const SEVERITY_CLASSES: Record<FlagSeverity, string> = {
  alarm: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
  concern: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  caution: "border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-100",
  info: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
};

const SEVERITY_LABEL: Record<FlagSeverity, string> = {
  alarm: "ALARM",
  concern: "CONCERN",
  caution: "CAUTION",
  info: "OK",
};

const SYSTEM_TYPES: Array<{ id: SystemType; label: string }> = [
  { id: "txv-residential", label: "Residential AC — TXV" },
  { id: "fixed-orifice-residential", label: "Residential AC — fixed orifice" },
  { id: "exv-residential", label: "Residential AC — EXV" },
  { id: "commercial-refrig-medium", label: "Commercial refrigeration — medium temp" },
  { id: "commercial-refrig-low", label: "Commercial refrigeration — low temp" },
];

export function SystemPressureDiagnostic() {
  const [slug, setSlug] = useState("r-410a");
  const [systemType, setSystemType] = useState<SystemType>("txv-residential");
  const [ambient, setAmbient] = useState("95");
  const [returnAir, setReturnAir] = useState("75");
  const [suctionP, setSuctionP] = useState("130");
  const [suctionT, setSuctionT] = useState("60");
  const [liquidP, setLiquidP] = useState("380");
  const [liquidT, setLiquidT] = useState("100");

  const result = useMemo(() => {
    const inputs = {
      slug,
      ambientF: Number(ambient),
      returnAirF: Number(returnAir),
      suctionPsig: Number(suctionP),
      suctionLineF: Number(suctionT),
      liquidPsig: Number(liquidP),
      liquidLineF: Number(liquidT),
      systemType,
    };
    const numeric = [inputs.ambientF, inputs.returnAirF, inputs.suctionPsig, inputs.suctionLineF, inputs.liquidPsig, inputs.liquidLineF];
    if (numeric.some((n) => !Number.isFinite(n))) return null;
    return diagnose(inputs);
  }, [slug, systemType, ambient, returnAir, suctionP, suctionT, liquidP, liquidT]);

  return (
    <div className="space-y-5">
      {/* System config */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="diag-refrig" className="block text-xs uppercase tracking-wide text-zinc-500">Refrigerant</label>
          <RefrigerantSelector id="diag-refrig" value={slug} onChange={setSlug} className="mt-1 w-full" />
        </div>
        <div>
          <label htmlFor="diag-system" className="block text-xs uppercase tracking-wide text-zinc-500">System type</label>
          <select
            id="diag-system"
            value={systemType}
            onChange={(e) => setSystemType(e.target.value as SystemType)}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {SYSTEM_TYPES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ambient + load */}
      <div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-3 text-sm font-semibold">Operating conditions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="diag-amb" label="Outdoor ambient temp" unit="°F" value={ambient} onChange={setAmbient} step={1} />
          <FormField id="diag-ret" label="Indoor return-air temp" unit="°F" value={returnAir} onChange={setReturnAir} step={1} />
        </div>
      </div>

      {/* Low side */}
      <div className="rounded-md border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
        <h3 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">Low side — suction</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="diag-sp" label="Suction pressure" unit="PSIG" value={suctionP} onChange={setSuctionP} step={0.1} />
          <FormField id="diag-st" label="Suction-line temp" unit="°F" value={suctionT} onChange={setSuctionT} step={0.1} />
        </div>
      </div>

      {/* High side */}
      <div className="rounded-md border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
        <h3 className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-100">High side — liquid line</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="diag-lp" label="Discharge/liquid pressure" unit="PSIG" value={liquidP} onChange={setLiquidP} step={0.1} />
          <FormField id="diag-lt" label="Liquid-line temp" unit="°F" value={liquidT} onChange={setLiquidT} step={0.1} />
        </div>
      </div>

      {/* Derived values */}
      {result ? (
        <div className="rounded-md border border-zinc-300 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
          <h3 className="mb-3 text-sm font-semibold">Derived values</h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
            <Derived label="Superheat" value={result.derived.superheatF} unit="°F" target={result.targets.superheatF} />
            <Derived label="Subcooling" value={result.derived.subcoolingF} unit="°F" target={result.targets.subcoolingF} />
            <Derived label="Suction sat T" value={result.derived.suctionSatF} unit="°F" />
            <Derived label="Discharge sat T" value={result.derived.dischargeSatF} unit="°F" />
            <Derived label="Condenser approach" value={result.derived.condenserApproachF} unit="°F" target={result.targets.condenserApproachF} />
            <Derived label="Evaporator approach" value={result.derived.evaporatorApproachF} unit="°F" />
          </dl>
        </div>
      ) : null}

      {/* Flags */}
      {result && result.flags.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-base font-semibold">Diagnostic findings</h3>
          {result.flags.map((flag, i) => (
            <div key={i} className={`rounded-md border px-4 py-3 ${SEVERITY_CLASSES[flag.severity]}`}>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide dark:bg-zinc-900/60">
                  {SEVERITY_LABEL[flag.severity]}
                </span>
                <strong className="text-base font-semibold">{flag.label}</strong>
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {flag.evidence.map((e, j) => <li key={j}>{e}</li>)}
              </ul>
              {flag.recommendations.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide opacity-75">Recommended actions</div>
                  <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm">
                    {flag.recommendations.map((r, j) => <li key={j}>{r}</li>)}
                  </ol>
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      <p className="text-xs text-zinc-500">
        Diagnostic flags surface patterns in the measurement combination. They are decision-support, not a substitute
        for hands-on equipment verification and the equipment OEM service literature. See{" "}
        <Link href="/high-head-pressure-causes/" className="underline">high head pressure causes</Link> and{" "}
        <Link href="/superheat-subcooling-fundamentals/" className="underline">superheat &amp; subcooling fundamentals</Link>{" "}
        for the underlying diagnostic patterns and the procedures behind the recommendations.
      </p>
    </div>
  );
}

function FormField({ id, label, unit, value, onChange, step }: { id: string; label: string; unit: string; value: string; onChange: (v: string) => void; step: number }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-wide text-zinc-500">
        {label} ({unit})
      </label>
      <input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}

function Derived({ label, value, unit, target }: { label: string; value: number | null; unit: string; target?: [number, number] }) {
  const inRange = value !== null && target ? value >= target[0] && value <= target[1] : null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5 font-mono">
        {value === null ? <span className="text-zinc-400">—</span> : (
          <>
            <span className={`font-semibold ${inRange === false ? "text-amber-700 dark:text-amber-300" : ""}`}>{value.toFixed(1)}</span>
            <span className="ml-1 text-xs text-zinc-500">{unit}</span>
          </>
        )}
        {target ? (
          <div className="text-[10px] text-zinc-500">target {target[0]}–{target[1]}{unit}</div>
        ) : null}
      </dd>
    </div>
  );
}
