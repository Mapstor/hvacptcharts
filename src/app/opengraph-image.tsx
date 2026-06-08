import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "HVAC PT Charts — Verified saturation data for 61 refrigerants";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          padding: "80px 96px",
          color: "#f8fafc",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative PT-curve mark, top-right */}
        <svg
          width="380"
          height="380"
          viewBox="0 0 380 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", top: 80, right: 60, opacity: 0.55 }}
        >
          <line x1="60" y1="30" x2="60" y2="340" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <line x1="56" y1="336" x2="350" y2="336" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M 70 320 Q 165 305 210 200 T 335 50"
            stroke="#60a5fa"
            strokeWidth="13"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 70 332 Q 175 320 220 210 T 345 60"
            stroke="#c4b5fd"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 8"
            opacity="0.85"
          />
        </svg>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 22,
            color: "#94a3b8",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 36,
          }}
        >
          hvacptcharts.com
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            maxWidth: 720,
            marginBottom: 28,
          }}
        >
          HVAC PT Charts
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.3,
            color: "#cbd5e1",
            maxWidth: 700,
          }}
        >
          Verified saturation pressure-temperature data for 61 refrigerants
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 64,
            left: 96,
            fontSize: 22,
            color: "#64748b",
            fontWeight: 500,
          }}
        >
          CoolProp 7.2.0 · ASHRAE 34 · manufacturer datasheets
        </div>
      </div>
    ),
    { ...size },
  );
}
