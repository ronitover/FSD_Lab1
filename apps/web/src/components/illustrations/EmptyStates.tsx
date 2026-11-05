/**
 * Small illustrations for empty lists, in the same flat style as the thali on the landing page.
 * All decorative, so hidden from screen readers; the empty state's heading says what is going on.
 */

const PLATE = '#f4f1ea';
const PLATE_EDGE = '#d6cfc1';
const PLATE_WELL = '#fbfaf6';
const STEEL = '#c9c3b6';
const STEEL_DARK = '#a9a293';
const ORANGE = '#e8894f';
const FOREST = '#496a4c';

function Shadow({ cx = 80, cy = 112, rx = 46 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="6" fill="#000" opacity="0.07" />;
}

/** An empty plate between a fork and a spoon: nothing listed yet. */
export function EmptyPlateIllustration({ className = 'w-40' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <Shadow />
      <g className="motion-safe:animate-float-slow">
        <circle cx="80" cy="60" r="42" fill={PLATE} stroke={PLATE_EDGE} strokeWidth="2" />
        <circle cx="80" cy="60" r="29" fill={PLATE_WELL} stroke="#e7e1d4" strokeWidth="1.5" />
        <path
          d="M60 50a22 22 0 0 1 12-12"
          fill="none"
          stroke="#e7e1d4"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      {/* Fork */}
      <g fill={STEEL} stroke={STEEL_DARK} strokeWidth="1">
        <rect x="18" y="44" width="5" height="56" rx="2.5" />
        <path d="M13 22v18a7 7 0 0 0 7 7h1a7 7 0 0 0 7-7V22h-3v16h-2V22h-3v16h-2V22h-2v16h-2V22z" />
      </g>
      {/* Spoon */}
      <g fill={STEEL} stroke={STEEL_DARK} strokeWidth="1">
        <ellipse cx="140" cy="34" rx="8" ry="12" />
        <rect x="137.5" y="44" width="5" height="56" rx="2.5" />
      </g>
      <g fill={ORANGE}>
        <circle
          cx="44"
          cy="20"
          r="2.5"
          className="origin-center [transform-box:fill-box] motion-safe:animate-ping-soft"
        />
        <circle cx="120" cy="14" r="2" />
        <circle cx="128" cy="82" r="1.8" />
      </g>
    </svg>
  );
}

/** A plate under a magnifying glass: a search or filter found nothing. */
export function NoMatchesIllustration({ className = 'w-40' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <Shadow rx={40} />
      <circle cx="70" cy="62" r="36" fill={PLATE} stroke={PLATE_EDGE} strokeWidth="2" />
      <circle cx="70" cy="62" r="25" fill={PLATE_WELL} stroke="#e7e1d4" strokeWidth="1.5" />
      <g className="motion-safe:animate-float">
        <circle
          cx="100"
          cy="46"
          r="22"
          fill="#fff"
          fillOpacity="0.55"
          stroke={FOREST}
          strokeWidth="5"
        />
        <path d="M116 62l18 18" stroke={FOREST} strokeWidth="8" strokeLinecap="round" />
        <path
          d="M90 38a12 12 0 0 1 10-4"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <text
        x="62"
        y="70"
        fontSize="22"
        fontWeight="700"
        fill={PLATE_EDGE}
        fontFamily="Fraunces, Georgia, serif"
      >
        ?
      </text>
    </svg>
  );
}

/** A map pin with rings around it: nothing listed nearby yet. */
export function NothingNearbyIllustration({ className = 'w-40' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <ellipse
        cx="80"
        cy="96"
        rx="58"
        ry="16"
        fill="none"
        stroke={FOREST}
        strokeOpacity="0.15"
        strokeWidth="2"
        strokeDasharray="4 5"
      />
      <ellipse
        cx="80"
        cy="96"
        rx="34"
        ry="9"
        fill="none"
        stroke={FOREST}
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <ellipse
        cx="80"
        cy="96"
        rx="16"
        ry="4.5"
        fill={ORANGE}
        opacity="0.35"
        className="origin-center [transform-box:fill-box] motion-safe:animate-ping-soft"
      />
      <g className="motion-safe:animate-float">
        <path d="M80 92c-2-6-24-28-24-48a24 24 0 0 1 48 0c0 20-22 42-24 48z" fill={ORANGE} />
        <circle cx="80" cy="44" r="10" fill="#fff" />
        <circle cx="80" cy="44" r="4" fill={ORANGE} opacity="0.5" />
      </g>
      <g fill={FOREST} opacity="0.35">
        <circle cx="28" cy="80" r="2.5" />
        <circle cx="136" cy="74" r="2.5" />
        <circle cx="122" cy="104" r="2" />
      </g>
    </svg>
  );
}

/** A steel tiffin carrier: no pickups to make. */
export function TiffinIllustration({ className = 'w-40' }: { className?: string }) {
  const tiers = [38, 60, 82];
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <Shadow rx={38} />
      <g className="motion-safe:animate-float-slow">
        {/* Handle */}
        <path
          d="M58 34V18a6 6 0 0 1 6-6h32a6 6 0 0 1 6 6v16"
          fill="none"
          stroke={STEEL_DARK}
          strokeWidth="5"
          strokeLinecap="round"
        />
        {tiers.map((y) => (
          <g key={y}>
            <rect x="48" y={y - 6} width="64" height="22" rx="6" fill={STEEL} />
            <rect x="48" y={y - 6} width="64" height="5" rx="2.5" fill="#ddd8cd" />
            <rect x="52" y={y + 4} width="22" height="3" rx="1.5" fill="#fff" opacity="0.6" />
          </g>
        ))}
        <rect x="50" y="26" width="60" height="8" rx="4" fill={STEEL_DARK} />
        {/* Side clamps that hold the tiers together, with a latch on each */}
        <rect x="45" y="28" width="6" height="74" rx="3" fill={STEEL_DARK} />
        <rect x="109" y="28" width="6" height="74" rx="3" fill={STEEL_DARK} />
        <rect x="43" y="56" width="10" height="7" rx="2" fill="#8f887a" />
        <rect x="107" y="56" width="10" height="7" rx="2" fill="#8f887a" />
      </g>
      <g fill={ORANGE}>
        <circle
          cx="30"
          cy="40"
          r="2.5"
          className="origin-center [transform-box:fill-box] motion-safe:animate-ping-soft"
        />
        <circle cx="134" cy="30" r="2" />
        <circle cx="128" cy="90" r="1.8" />
      </g>
    </svg>
  );
}
