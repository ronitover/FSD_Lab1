import { ArrowRight, LayoutDashboard, Plus } from 'lucide-react';
import * as m from 'motion/react-m';
import { Link } from 'react-router';
import type { Donation } from '@replate/shared';
import { rise, staggerParent } from '../../components/motion/variants.ts';
import { Button } from '../../components/ui/Button.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { formatRelative } from '../../lib/dates.ts';
import { DonationCard } from './DonationCard.tsx';

const COLOURS = ['bg-orange', 'bg-moss', 'bg-amber-400', 'bg-sky-400'];

/**
 * Confetti pieces: where each flies to, how it spins, its colour and shape. Worked out once from
 * the index (not at random), so every celebration looks the same and rendering stays pure.
 */
const CONFETTI = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * Math.PI * 2 + (index % 3) * 0.25;
  const distance = 80 + ((index * 37) % 80);
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance - 40,
    rotate: ((index * 53) % 360) - 180,
    colour: COLOURS[index % COLOURS.length],
    shape: index % 3 === 0 ? 'size-2.5 rounded-full' : 'h-3.5 w-2 rounded-sm',
  };
});

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
        {/* Confetti bursts out, then falls away under gravity */}
        {CONFETTI.map((piece, index) => (
          <m.span
            key={index}
            className={`absolute ${piece.shape} ${piece.colour}`}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              x: [0, piece.x, piece.x * 1.1],
              y: [0, piece.y, piece.y + 140],
              opacity: [1, 1, 0],
              scale: [0, 1, 0.8],
              rotate: [0, piece.rotate, piece.rotate * 2],
            }}
            transition={{ duration: 1.8, delay: 0.3, times: [0, 0.35, 1], ease: 'easeOut' }}
          />
        ))}
        <span className="absolute inset-0 rounded-full bg-moss/15 motion-safe:animate-ping-soft" />
        <m.span
          className="relative flex size-24 items-center justify-center rounded-full bg-moss text-white shadow-lift"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15 }}
        >
          <svg viewBox="0 0 24 24" className="size-12" fill="none">
            <m.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </m.span>
      </div>

      <m.div initial="hidden" animate="shown" variants={staggerParent(0.1, 0.4)}>
        <m.h1
          variants={rise}
          className="mt-8 font-display text-4xl tracking-tight text-forest sm:text-5xl"
          role="status"
        >
          Your donation is live
        </m.h1>
        <m.p variants={rise} className="mx-auto mt-3 max-w-md leading-7 text-forest/70">
          Verified NGOs nearby can see it now. When one claims it, you'll see who it is and how to
          reach them. It must be collected {formatRelative(donation.expiresAt)}.
        </m.p>

        <m.div variants={rise} className="mt-8 text-left">
          <DonationCard donation={donation} />
        </m.div>

        <m.div variants={rise} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to={`/donations/${donation.id}`} className={buttonClasses('primary', 'lg')}>
            View donation <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Button variant="secondary" size="lg" onClick={onDonateMore}>
            <Plus className="size-4" aria-hidden="true" /> Donate more
          </Button>
          <Link to="/donor" className={buttonClasses('ghost', 'lg')}>
            <LayoutDashboard className="size-4" aria-hidden="true" /> Dashboard
          </Link>
        </m.div>
      </m.div>
    </div>
  );
}
