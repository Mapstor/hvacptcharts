interface LogoProps {
  /** Pixel size of the icon (the icon is square). */
  size?: number;
  className?: string;
  /** Optional aria-label. Hidden if the parent already labels the link. */
  ariaLabel?: string;
}

/**
 * Site brand mark: a refrigerant PT saturation curve on a dark slate
 * background. Two curves (bubble + dew dashed) reflect the site's signature
 * — handling zeotropic blends correctly. Inline SVG so the same source
 * drives the favicon (app/icon.svg), Apple touch icon (app/apple-icon.svg),
 * and the header logo.
 */
export function Logo({ size = 28, className = "", ariaLabel }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <rect width="32" height="32" rx="7" fill="#0f172a" />
      <line x1="6" y1="6" x2="6" y2="26.5" stroke="#475569" strokeWidth="0.9" strokeLinecap="round" />
      <line x1="5.5" y1="26" x2="26" y2="26" stroke="#475569" strokeWidth="0.9" strokeLinecap="round" />
      <path
        d="M 7 24.5 Q 15 23.5 19 16 T 25.5 6.5"
        stroke="#60a5fa"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 7 25.5 Q 16 24.5 20 17 T 26 7.5"
        stroke="#c4b5fd"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 1.5"
        opacity="0.85"
      />
    </svg>
  );
}
