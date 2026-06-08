import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — generated as a 180x180 PNG via Next.js ImageResponse.
 * Same visual design as the favicon (app/icon.svg) but rendered as PNG
 * because iOS does not consume SVG for apple-touch-icon. Used by iOS
 * Safari's "Add to Home Screen" feature.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#0f172a",
          borderRadius: 32,
          position: "relative",
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          <line x1="34" y1="32" x2="34" y2="150" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="32" y1="148" x2="150" y2="148" stroke="#475569" strokeWidth="4.5" strokeLinecap="round" />
          <path
            d="M 40 140 Q 88 132 110 90 T 148 36"
            stroke="#60a5fa"
            strokeWidth="13"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 40 148 Q 92 142 116 98 T 152 44"
            stroke="#c4b5fd"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="11 8"
            opacity="0.85"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
