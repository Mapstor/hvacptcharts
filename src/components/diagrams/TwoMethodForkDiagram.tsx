import { useId } from "react";

const FIGCAPTION =
  "TXV / EEV metering: charge by subcooling — general 8–12°F target on the liquid line, OEM nameplate governs. Piston / capillary metering: charge by target superheat — look up the target in the WB × outdoor DB matrix on this page. Same equipment side; opposite charging indicator.";

const DESC =
  "Decision-tree diagram for R-410A charging method selection. Starting from the metering-device question at the top, the diagram forks into two branches: TXV or EEV systems flow to the subcooling-method branch (measured on the liquid line), and piston or capillary-tube systems flow to the target-superheat branch (measured on the suction line). Same equipment side, opposite charging indicator; the choice is determined by which side actively regulates the operating point.";

export function TwoMethodForkDiagram() {
  const titleId = useId();
  const descId = useId();

  return (
    <figure className="my-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
        <svg
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          viewBox="0 0 640 360"
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id={titleId}>R-410A charging method decision fork by metering device</title>
          <desc id={descId}>{DESC}</desc>

          {/* Top decision node */}
          <rect
            x={210}
            y={20}
            width={220}
            height={50}
            rx={8}
            className="fill-zinc-50 stroke-zinc-500 dark:fill-zinc-900 dark:stroke-zinc-400"
            strokeWidth={2}
          />
          <text
            x={320}
            y={50}
            textAnchor="middle"
            className="fill-zinc-800 text-[13px] font-semibold dark:fill-zinc-100"
          >
            What&apos;s the metering device?
          </text>

          {/* Fork lines */}
          <line
            x1={280}
            y1={70}
            x2={140}
            y2={125}
            className="stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth={2}
          />
          <line
            x1={360}
            y1={70}
            x2={500}
            y2={125}
            className="stroke-zinc-500 dark:stroke-zinc-400"
            strokeWidth={2}
          />

          {/* Left branch — TXV/EEV → SUBCOOLING */}
          <rect
            x={40}
            y={125}
            width={200}
            height={40}
            rx={6}
            className="fill-[#fed7aa]/50 stroke-[#f97316] dark:fill-[#7c2d12]/40 dark:stroke-[#fb923c]"
            strokeWidth={2}
          />
          <text
            x={140}
            y={150}
            textAnchor="middle"
            className="fill-[#9a3412] text-[13px] font-semibold dark:fill-[#fb923c]"
          >
            TXV / EEV
          </text>

          <line
            x1={140}
            y1={165}
            x2={140}
            y2={190}
            className="stroke-[#f97316] dark:stroke-[#fb923c]"
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          <a href="#subcooling-chart">
            <rect
              x={20}
              y={190}
              width={240}
              height={100}
              rx={6}
              className="fill-[#fed7aa]/30 stroke-[#f97316] dark:fill-[#7c2d12]/25 dark:stroke-[#fb923c]"
              strokeWidth={2}
            />
            <text
              x={140}
              y={214}
              textAnchor="middle"
              className="fill-[#9a3412] text-[12px] font-semibold dark:fill-[#fb923c]"
            >
              Charge by SUBCOOLING
            </text>
            <text
              x={140}
              y={230}
              textAnchor="middle"
              className="fill-zinc-600 text-[10px] dark:fill-zinc-300"
            >
              (measured on the liquid line)
            </text>

            {/* Mini liquid-line probe sketch */}
            <line
              x1={50}
              y1={265}
              x2={230}
              y2={265}
              className="stroke-[#f97316] dark:stroke-[#fb923c]"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <rect
              x={100}
              y={252}
              width={18}
              height={9}
              rx={2}
              className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
              strokeWidth={1}
            />
            <text
              x={109}
              y={248}
              textAnchor="middle"
              className="fill-zinc-700 font-mono text-[8px] dark:fill-zinc-300"
            >
              T
            </text>
            <circle
              cx={165}
              cy={258}
              r={7}
              className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
              strokeWidth={1}
            />
            <text
              x={165}
              y={261}
              textAnchor="middle"
              className="fill-zinc-700 font-mono text-[7px] dark:fill-zinc-300"
            >
              P
            </text>
            <text
              x={140}
              y={282}
              textAnchor="middle"
              className="fill-[#9a3412] text-[9px] italic underline dark:fill-[#fb923c]"
            >
              jump to subcooling section ↓
            </text>
          </a>

          {/* Right branch — piston/cap → SUPERHEAT */}
          <rect
            x={400}
            y={125}
            width={200}
            height={40}
            rx={6}
            className="fill-[#bfdbfe]/50 stroke-[#3b82f6] dark:fill-[#1e3a8a]/40 dark:stroke-[#60a5fa]"
            strokeWidth={2}
          />
          <text
            x={500}
            y={150}
            textAnchor="middle"
            className="fill-[#1e40af] text-[13px] font-semibold dark:fill-[#60a5fa]"
          >
            Piston / capillary
          </text>

          <line
            x1={500}
            y1={165}
            x2={500}
            y2={190}
            className="stroke-[#3b82f6] dark:stroke-[#60a5fa]"
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          <rect
            x={380}
            y={190}
            width={240}
            height={100}
            rx={6}
            className="fill-[#bfdbfe]/30 stroke-[#3b82f6] dark:fill-[#1e3a8a]/25 dark:stroke-[#60a5fa]"
            strokeWidth={2}
          />
          <text
            x={500}
            y={214}
            textAnchor="middle"
            className="fill-[#1e40af] text-[12px] font-semibold dark:fill-[#60a5fa]"
          >
            Charge by SUPERHEAT
          </text>
          <text
            x={500}
            y={230}
            textAnchor="middle"
            className="fill-zinc-600 text-[10px] dark:fill-zinc-300"
          >
            (measured on the suction line)
          </text>

          <line
            x1={410}
            y1={265}
            x2={590}
            y2={265}
            className="stroke-[#3b82f6] dark:stroke-[#60a5fa]"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <rect
            x={460}
            y={252}
            width={18}
            height={9}
            rx={2}
            className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
            strokeWidth={1}
          />
          <text
            x={469}
            y={248}
            textAnchor="middle"
            className="fill-zinc-700 font-mono text-[8px] dark:fill-zinc-300"
          >
            T
          </text>
          <circle
            cx={525}
            cy={258}
            r={7}
            className="fill-white stroke-zinc-700 dark:fill-zinc-900 dark:stroke-zinc-300"
            strokeWidth={1}
          />
          <text
            x={525}
            y={261}
            textAnchor="middle"
            className="fill-zinc-700 font-mono text-[7px] dark:fill-zinc-300"
          >
            P
          </text>
          <text
            x={500}
            y={282}
            textAnchor="middle"
            className="fill-[#1e40af] text-[9px] italic dark:fill-[#60a5fa]"
          >
            (use the WB × DB matrix below)
          </text>

          {/* Footer note */}
          <text
            x={320}
            y={330}
            textAnchor="middle"
            className="fill-zinc-500 text-[10px] italic dark:fill-zinc-400"
          >
            Same equipment side; opposite charging indicator.
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
        {FIGCAPTION}
      </figcaption>
    </figure>
  );
}
