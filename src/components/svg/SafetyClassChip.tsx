import { Flame, Shield, Skull, type LucideIcon } from "lucide-react";
import type { SafetyClass } from "@/data/refrigerants";
import { SAFETY_CLASS_VAR } from "@/lib/svg-tokens";

type ChipVariant = "chip" | "card";
type ChipSize = "sm" | "md" | "lg";

export interface SafetyClassChipProps {
  safetyClass: SafetyClass;
  size?: ChipSize;
  variant?: ChipVariant;
  className?: string;
}

interface ClassInfo {
  label: string;
  shortDescription: string;
  longDescription: string;
  flammability: string;
  toxicity: string;
  /** Whether the class's color is dark enough that white text is needed. */
  darkBg: boolean;
  Icon: LucideIcon;
  /** Optional secondary icon for combined toxic + flammable classes. */
  SecondaryIcon?: LucideIcon;
}

const CLASS_INFO: Record<SafetyClass, ClassInfo> = {
  A1: {
    label: "Non-flammable",
    shortDescription: "Lower toxicity, no flame propagation. The safest ASHRAE designation.",
    longDescription:
      "Lower toxicity (Occupational Exposure Limit ≥ 400 ppm). No flame propagation in air at standard atmospheric pressure and 60°C. R-134a, R-22, R-410A, R-404A, R-744 (CO2) are A1.",
    flammability: "None (no flame propagation)",
    toxicity: "Lower (OEL ≥ 400 ppm)",
    darkBg: true,
    Icon: Shield,
  },
  A2L: {
    label: "Mildly flammable",
    shortDescription: "Lower toxicity, low burning velocity (≤ 10 cm/s).",
    longDescription:
      "Lower toxicity. Flame propagates in air at 60°C, but with a low burning velocity (≤ 10 cm/s) and a heat of combustion < 19,000 kJ/kg. Requires A2L-rated equipment, leak detection, and charge limits per UL 60335-2-40 and ASHRAE 15. R-32, R-454B, R-1234yf, R-1234ze(E), R-452B, R-454C, R-455A, R-516A are A2L.",
    flammability: "Low (burning velocity ≤ 10 cm/s)",
    toxicity: "Lower (OEL ≥ 400 ppm)",
    darkBg: false,
    Icon: Flame,
  },
  A2: {
    label: "Flammable",
    shortDescription: "Lower toxicity, flammable (10–100 cm/s burning velocity).",
    longDescription:
      "Lower toxicity. Flame propagates in air at 60°C with a burning velocity between 10 and 100 cm/s. Less common in HVAC. R-152a and R-365mfc are A2.",
    flammability: "Yes (10 ≤ burning velocity ≤ 100 cm/s)",
    toxicity: "Lower",
    darkBg: false,
    Icon: Flame,
  },
  A3: {
    label: "Highly flammable",
    shortDescription: "Lower toxicity, highly flammable. Hydrocarbon class.",
    longDescription:
      "Lower toxicity. High burning velocity (> 100 cm/s) or high heat of combustion. Includes hydrocarbons R-290 (propane), R-600a (isobutane), R-1150 (ethylene), R-1270 (propylene). EPA charge limits, HC-rated equipment design, sealed systems, and leak detection are mandatory.",
    flammability: "High (burning velocity > 100 cm/s)",
    toxicity: "Lower",
    darkBg: true,
    Icon: Flame,
  },
  B1: {
    label: "Toxic, non-flammable",
    shortDescription: "Higher toxicity, no flame propagation.",
    longDescription:
      "Higher toxicity (Occupational Exposure Limit < 400 ppm). No flame propagation. R-123, R-245fa, R-514A are B1. Centrifugal-chiller machine rooms require ventilation, refrigerant leak detection, and emergency egress per ASHRAE Standard 15.",
    flammability: "None",
    toxicity: "Higher (OEL < 400 ppm)",
    darkBg: true,
    Icon: Skull,
  },
  B2L: {
    label: "Toxic + mildly flammable",
    shortDescription: "Higher toxicity, low burning velocity. Ammonia class.",
    longDescription:
      "Higher toxicity. Flame propagates with low burning velocity (≤ 10 cm/s). R-717 (ammonia) is the predominant member. NIOSH IDLH for ammonia is 300 ppm. Industrial-refrigeration regulations (IIAR standards, EPA RMP, OSHA PSM) apply at charges above ~10,000 lb.",
    flammability: "Low (≤ 10 cm/s)",
    toxicity: "Higher",
    darkBg: true,
    Icon: Skull,
    SecondaryIcon: Flame,
  },
  B2: {
    label: "Toxic, flammable",
    shortDescription: "Higher toxicity, flammable.",
    longDescription:
      "Higher toxicity. Flame propagates in air with burning velocity between 10 and 100 cm/s. Rare in HVAC; specialty industrial applications only.",
    flammability: "Yes",
    toxicity: "Higher",
    darkBg: true,
    Icon: Skull,
    SecondaryIcon: Flame,
  },
  B3: {
    label: "Toxic, highly flammable",
    shortDescription: "Highest-hazard category.",
    longDescription:
      "Higher toxicity. High burning velocity (> 100 cm/s) or high heat of combustion. Very rare in HVAC; specialty applications under strict regulatory regimes.",
    flammability: "High",
    toxicity: "Higher",
    darkBg: true,
    Icon: Skull,
    SecondaryIcon: Flame,
  },
};

const SIZE_CLASSES: Record<ChipSize, { chip: string; iconPx: number }> = {
  sm: { chip: "text-xs px-2 py-0.5", iconPx: 12 },
  md: { chip: "text-sm px-2.5 py-1", iconPx: 14 },
  lg: { chip: "text-base px-3 py-1.5", iconPx: 16 },
};

function chipStyle(c: SafetyClass): React.CSSProperties {
  return {
    backgroundColor: `var(${SAFETY_CLASS_VAR[c]})`,
  };
}

export function SafetyClassChip({
  safetyClass,
  size = "md",
  variant = "chip",
  className = "",
}: SafetyClassChipProps) {
  const info = CLASS_INFO[safetyClass];
  const sizing = SIZE_CLASSES[size];
  const textColor = info.darkBg ? "text-white" : "text-zinc-900";

  if (variant === "chip") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-tight ${sizing.chip} ${textColor} ${className}`}
        style={chipStyle(safetyClass)}
        title={`ASHRAE 34 class ${safetyClass}: ${info.shortDescription}`}
        aria-label={`ASHRAE 34 safety class ${safetyClass}: ${info.label}. ${info.shortDescription}`}
      >
        <info.Icon size={sizing.iconPx} aria-hidden="true" strokeWidth={2.25} />
        {info.SecondaryIcon ? <info.SecondaryIcon size={sizing.iconPx} aria-hidden="true" strokeWidth={2.25} /> : null}
        <span className="font-mono">{safetyClass}</span>
        <span>{info.label}</span>
      </span>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 ${className}`}
      aria-label={`ASHRAE 34 safety class ${safetyClass}: ${info.label}. ${info.shortDescription}`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 ${textColor}`}
        style={chipStyle(safetyClass)}
      >
        <info.Icon size={28} aria-hidden="true" strokeWidth={2.25} />
        {info.SecondaryIcon ? <info.SecondaryIcon size={24} aria-hidden="true" strokeWidth={2.25} /> : null}
        <div>
          <div className="font-mono text-xl font-bold tracking-tight">{safetyClass}</div>
          <div className="text-sm leading-tight">{info.label}</div>
        </div>
      </div>
      <div className="space-y-2 px-4 py-3 text-sm">
        <p>{info.longDescription}</p>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 pt-1 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Flammability</dt>
            <dd>{info.flammability}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Toxicity</dt>
            <dd>{info.toxicity}</dd>
          </div>
        </dl>
        <p className="pt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Classification per ANSI/ASHRAE Standard 34-2022.{" "}
          <a className="underline hover:no-underline" href="/refrigerant-safety-classifications/">
            See full reference
          </a>
          .
        </p>
      </div>
    </div>
  );
}
