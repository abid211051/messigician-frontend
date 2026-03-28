interface MessigicianLogoProps {
  width?: number | string;
  className?: string;
  /** "full" = icon + wordmark stacked, "icon" = mark only */
  variant?: "full" | "icon";
}

const IconMark = () => (
  <>
    {/* Building roof band */}
    <rect x="7" y="8" width="24" height="4" rx="1.5" fill="#3B82F6" />

    {/* Building body */}
    <rect
      x="7"
      y="11"
      width="24"
      height="25"
      rx="1.5"
      fill="white"
      stroke="#3B82F6"
      strokeWidth="1.8"
    />

    {/* Windows 2×2 */}
    <rect x="10" y="15" width="6" height="4" rx="1" fill="#DBEAFE" />
    <rect x="20" y="15" width="6" height="4" rx="1" fill="#DBEAFE" />
    <rect x="10" y="22" width="6" height="4" rx="1" fill="#DBEAFE" />
    <rect x="20" y="22" width="6" height="4" rx="1" fill="#DBEAFE" />

    {/* Door */}
    <rect
      x="14"
      y="27"
      width="7"
      height="9"
      rx="1"
      fill="#DBEAFE"
      stroke="#3B82F6"
      strokeWidth="1.2"
    />

    {/* Clipboard body */}
    <rect
      x="27"
      y="19"
      width="18"
      height="22"
      rx="3"
      fill="white"
      stroke="#3B82F6"
      strokeWidth="1.8"
    />

    {/* Clipboard tab */}
    <rect x="33" y="14.5" width="8" height="5" rx="1.5" fill="#3B82F6" />
    <rect x="34.5" y="15.5" width="5" height="2" rx="0.8" fill="#DBEAFE" />

    {/* Row 1 — checked */}
    <polyline
      points="30,25 30.8,26.5 35.5,23"
      stroke="#3B82F6"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line
      x1="37"
      y1="25"
      x2="43"
      y2="25"
      stroke="#BFDBFE"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Row 2 — checked */}
    <polyline
      points="30,31 30.8,32.5 35.5,29"
      stroke="#3B82F6"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line
      x1="37"
      y1="31"
      x2="43"
      y2="31"
      stroke="#BFDBFE"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Row 3 — pending */}
    <circle
      cx="32"
      cy="37"
      r="1.8"
      fill="none"
      stroke="#93C5FD"
      strokeWidth="1.3"
    />
    <line
      x1="37"
      y1="37"
      x2="43"
      y2="37"
      stroke="#BFDBFE"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Coin — bottom-left of building */}
    <circle
      cx="12"
      cy="36"
      r="7"
      fill="white"
      stroke="#3B82F6"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="36" r="4.5" fill="#DBEAFE" />
    <line
      x1="12"
      y1="33"
      x2="12"
      y2="39"
      stroke="#3B82F6"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <line
      x1="9.8"
      y1="35"
      x2="14.2"
      y2="35"
      stroke="#3B82F6"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <line
      x1="9.8"
      y1="37"
      x2="14.2"
      y2="37"
      stroke="#3B82F6"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </>
);

export default function MessigicianLogo({
  width = 160,
  className = "",
  variant = "full",
}: MessigicianLogoProps) {
  if (variant === "icon") {
    return (
      <svg
        width={width}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Messigician"
      >
        <g transform="translate(-1, -1)">
          <IconMark />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={width}
      viewBox="0 0 100 74"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Messigician"
    >
      <g transform="translate(25, 2)">
        <IconMark />
      </g>
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.3"
        fill="#1E3A5F"
      >
        Messi<tspan fill="#3B82F6">gician</tspan>
      </text>
    </svg>
  );
}
