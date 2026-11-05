import { ArrowRight, LayoutDashboard, Plus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import type { Donation } from '@replate/shared';
import { Button } from '../../components/ui/Button.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { formatRelative } from '../../lib/dates.ts';
import { DonationCard } from './DonationCard.tsx';

/** Where each dot of the burst flies to, and its colour. */
const DOTS = [
  { x: '-70px', y: '-40px', colour: 'bg-orange' },
  { x: '70px', y: '-45px', colour: 'bg-moss' },
  { x: '-80px', y: '25px', colour: 'bg-amber-400' },
  { x: '78px', y: '30px', colour: 'bg-orange' },
  { x: '-30px', y: '-78px', colour: 'bg-sky-400' },
  { x: '35px', y: '-75px', colour: 'bg-amber-400' },
  { x: '-40px', y: '70px', colour: 'bg-moss' },
  { x: '45px', y: '72px', colour: 'bg-sky-400' },
];

/** Shown straight after a donor posts, so the moment feels finished and the next step is clear. */
export function DonationPosted({
  donation,
  onDonateMore,
}: {
  donation: Donation;
  onDonateMore: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center sm:px-6 sm:py-16">
      <title>Donation listed · RePlate</title>

      <div className="relative mx-auto flex size-24 items-center justify-center" aria-hidden="true">
        {DOTS.map((dot) => (
          <span
            key={`${dot.x}${dot.y}`}
            className={`absolute size-2.5 rounded-full opacity-0 motion-safe:animate-burst ${dot.colour}`}
            style={{ '--x': dot.x, '--y': dot.y } as CSSProperties}
          />
        ))}
        <span className="absolute inset-0 rounded-full bg-moss/15 motion-safe:animate-ping-soft" />
        <span className="relative flex size-24 items-center justify-center rounded-full bg-moss text-white shadow-lift motion-safe:animate-pop">
          <svg viewBox="0 0 24 24" className="size-12" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="30"
              className="motion-safe:animate-draw"
            />
          </svg>
        </span>
      </div>

      <h1
        className="mt-8 font-display text-4xl tracking-tight text-forest motion-safe:animate-fade-up motion-safe:[animation-delay:300ms] sm:text-5xl"
        role="status"
      >
        Your donation is live
      </h1>
      <p className="mx-auto mt-3 max-w-md leading-7 text-forest/70 motion-safe:animate-fade-up motion-safe:[animation-delay:380ms]">
        Verified NGOs nearby can see it now. When one claims it, you'll see who it is and how to
        reach them. It must be collected {formatRelative(donation.expiresAt)}.
      </p>

      <div className="mt-8 text-left motion-safe:animate-fade-up motion-safe:[animation-delay:460ms]">
        <DonationCard donation={donation} />
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 motion-safe:animate-fade-up motion-safe:[animation-delay:540ms] sm:flex-row">
        <Link to={`/donations/${donation.id}`} className={buttonClasses('primary', 'lg')}>
          View donation <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Button variant="secondary" size="lg" onClick={onDonateMore}>
          <Plus className="size-4" aria-hidden="true" /> Donate more
        </Button>
        <Link to="/donor" className={buttonClasses('ghost', 'lg')}>
          <LayoutDashboard className="size-4" aria-hidden="true" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
