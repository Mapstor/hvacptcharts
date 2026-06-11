/**
 * Reusable process flow diagram for guide pages. Numbered steps with arrows.
 * Supports linear or branching (with optional alternate paths).
 */

interface ProcessStep {
  number: string | number;
  title: string;
  description: string;
  /** Optional color override (hex). Default cycles through palette. */
  color?: string;
  /** Optional "critical step" emphasis (thicker border, bolder). */
  critical?: boolean;
}

export interface ProcessFlowProps {
  title: string;
  steps: ProcessStep[];
  /** Vertical (default) shows steps stacked top-to-bottom; horizontal shows left-to-right (better for ≤6 steps). */
  orientation?: "vertical" | "horizontal";
  caption?: string;
  width?: number;
}

const PALETTE = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1"];

export function ProcessFlow({ title, steps, orientation = "vertical", caption, width = 640 }: ProcessFlowProps) {
  if (orientation === "horizontal") {
    return <HorizontalFlow title={title} steps={steps} caption={caption} width={width} />;
  }
  return <VerticalFlow title={title} steps={steps} caption={caption} width={width} />;
}

function VerticalFlow({ title, steps, caption, width }: { title: string; steps: ProcessStep[]; caption?: string; width: number }) {
  const stepH = 80;
  const arrowH = 20;
  const padding = { top: 30, right: 20, bottom: 20, left: 20 };
  const height = padding.top + steps.length * stepH + (steps.length - 1) * arrowH + padding.bottom;
  const boxX = padding.left;
  const boxW = width - padding.left - padding.right;

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
        {steps.map((step, i) => {
          const color = step.color ?? PALETTE[i % PALETTE.length];
          const y = padding.top + i * (stepH + arrowH);
          const isCritical = step.critical;
          return (
            <g key={i}>
              {/* Step box */}
              <rect x={boxX} y={y} width={boxW} height={stepH} rx={8} fill="white" stroke={color} strokeWidth={isCritical ? 3 : 2} className="dark:fill-zinc-950" />
              {/* Number bubble */}
              <circle cx={boxX + 40} cy={y + stepH / 2} r={22} fill={color} />
              <text x={boxX + 40} y={y + stepH / 2 + 6} fontSize="18" fontWeight="700" textAnchor="middle" fill="white">{step.number}</text>
              {/* Title + description */}
              <text x={boxX + 80} y={y + 26} fontSize="13" fontWeight="600" fill="#0f172a" className="dark:fill-zinc-100">{step.title}</text>
              <foreignObject x={boxX + 80} y={y + 32} width={boxW - 96} height={stepH - 40}>
                <div className="text-[11px] leading-snug text-zinc-600 dark:text-zinc-300">{step.description}</div>
              </foreignObject>
              {/* Arrow to next step */}
              {i < steps.length - 1 ? (
                <g>
                  <line x1={boxX + 40} y1={y + stepH} x2={boxX + 40} y2={y + stepH + arrowH - 4} stroke="#a1a1aa" strokeWidth="2" className="dark:stroke-zinc-500" />
                  <polygon points={`${boxX + 36},${y + stepH + arrowH - 8} ${boxX + 44},${y + stepH + arrowH - 8} ${boxX + 40},${y + stepH + arrowH - 2}`} fill="#a1a1aa" className="dark:fill-zinc-500" />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      {caption ? <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">{caption}</p> : null}
    </figure>
  );
}

function HorizontalFlow({ title, steps, caption, width }: { title: string; steps: ProcessStep[]; caption?: string; width: number }) {
  const padding = { top: 30, right: 20, bottom: 20, left: 20 };
  const arrowW = 30;
  const stepW = (width - padding.left - padding.right - (steps.length - 1) * arrowW) / steps.length;
  const stepH = 130;
  const height = padding.top + stepH + padding.bottom;

  return (
    <figure>
      <figcaption className="mb-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={title}>
        {steps.map((step, i) => {
          const color = step.color ?? PALETTE[i % PALETTE.length];
          const x = padding.left + i * (stepW + arrowW);
          const isCritical = step.critical;
          return (
            <g key={i}>
              <rect x={x} y={padding.top} width={stepW} height={stepH} rx={8} fill="white" stroke={color} strokeWidth={isCritical ? 3 : 2} className="dark:fill-zinc-950" />
              <circle cx={x + stepW / 2} cy={padding.top + 28} r={18} fill={color} />
              <text x={x + stepW / 2} y={padding.top + 34} fontSize="15" fontWeight="700" textAnchor="middle" fill="white">{step.number}</text>
              <text x={x + stepW / 2} y={padding.top + 66} fontSize="11" fontWeight="600" textAnchor="middle" fill="#0f172a" className="dark:fill-zinc-100">{step.title}</text>
              <foreignObject x={x + 8} y={padding.top + 74} width={stepW - 16} height={stepH - 80}>
                <div className="text-[10px] leading-snug text-center text-zinc-600 dark:text-zinc-300">{step.description}</div>
              </foreignObject>
              {i < steps.length - 1 ? (
                <g>
                  <line x1={x + stepW} y1={padding.top + stepH / 2} x2={x + stepW + arrowW - 6} y2={padding.top + stepH / 2} stroke="#a1a1aa" strokeWidth="2" className="dark:stroke-zinc-500" />
                  <polygon points={`${x + stepW + arrowW - 8},${padding.top + stepH / 2 - 4} ${x + stepW + arrowW - 8},${padding.top + stepH / 2 + 4} ${x + stepW + arrowW - 2},${padding.top + stepH / 2}`} fill="#a1a1aa" className="dark:fill-zinc-500" />
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
      {caption ? <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">{caption}</p> : null}
    </figure>
  );
}
