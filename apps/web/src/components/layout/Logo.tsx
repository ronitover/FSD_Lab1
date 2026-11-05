import { Link } from 'react-router';

/**
 * The RePlate mark: a plate rim that turns into an arrow (food going round again) around a serving
 * of food. Two shapes only, so it stays clean at favicon size. public/favicon.svg draws the same.
 */
export function LogoMark({
  className = 'size-9',
  tone = 'default',
}: {
  className?: string;
  /** "light" for dark backgrounds. */
  tone?: 'default' | 'light';
}) {
  const rim = tone === 'light' ? 'stroke-[#f7f5ef]' : 'stroke-forest';
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <g className={rim} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23.07 7.57A11 11 0 1 1 8.93 7.57" />
        <path d="M5.5 6.6h4.6l-.8 4.6" />
      </g>
      <circle cx="16" cy="16" r="5" className="fill-orange" />
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
      <LogoMark className="size-9 transition duration-500 group-hover:-rotate-45" />
      <span
        className="font-display text-[1.45rem] font-semibold tracking-tight text-forest"
        aria-hidden="true"
      >
        RePlate
      </span>
    </Link>
  );
}
