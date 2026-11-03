import { Link } from 'react-router';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-full" aria-label="RePlate home">
      <span
        className="flex size-10 items-center justify-center rounded-full bg-forest text-cream"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth="1.8">
          <path d="M12 20c0-6.6 1.1-11 6.8-15.5.3 6.5-1.8 10.3-6.8 12.2M12 20C8.8 15.4 6.6 12.2 2.8 11c.8 4.8 3.3 7.9 9.2 9Z" />
          <path d="M12 20V9" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-forest">RePlate</span>
    </Link>
  );
}
