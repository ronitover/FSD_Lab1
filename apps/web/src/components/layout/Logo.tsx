import { Link } from 'react-router';

/**
 * The RePlate mark: a plate seen from above whose rim is a turning arrow, so food goes round again,
 * with a serving of food in the middle. Kept to a few thick shapes so it reads at favicon size.
 * public/favicon.svg draws the same shapes.
 */
export function LogoMark({ className = 'size-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="16" className="fill-forest" />
      {/* Rim: most of a circle, open at the top, ending in an arrowhead. */}
      <path
        d="M22.4 8.2A9.6 9.6 0 1 1 9.6 8.2"
        fill="none"
        className="stroke-cream"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6.7 7.4 10.5 7.4 9.7 11.2"
        fill="none"
        className="stroke-cream"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The plate's well and the food on it. */}
      <circle cx="16" cy="17" r="5.6" fill="none" className="stroke-cream/45" strokeWidth="1.3" />
      <path d="M12.6 18.6a3.4 3.4 0 0 1 6.8 0z" className="fill-orange" />
      <circle cx="17.6" cy="14.2" r="0.9" className="fill-orange" />
    </svg>
  );
}

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2.5 rounded-full"
      aria-label="RePlate home"
    >
      <LogoMark className="size-10 transition duration-500 group-hover:-rotate-[25deg]" />
      <span
        className="font-display text-[1.4rem] font-semibold tracking-tight text-forest"
        aria-hidden="true"
      >
        <em className="font-medium text-orange">Re</em>Plate
      </span>
    </Link>
  );
}
