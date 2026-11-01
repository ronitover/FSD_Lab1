import { Link } from 'react-router';
import type { Donation } from '@replate/shared';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { formatRelative } from '../../lib/dates.ts';
import { CATEGORY_LABELS, DIETARY_LABELS, formatQuantity } from '../../lib/labels.ts';

/** One of the donor's donations in a list. The whole card links to its page. */
export function DonationCard({ donation }: { donation: Donation }) {
  const open = donation.status === 'available' || donation.status === 'claimed';
  return (
    <article className="relative flex flex-col gap-3 rounded-3xl bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={donation.status} />
          <span className="text-xs text-forest/55">
            {CATEGORY_LABELS[donation.category]} · {DIETARY_LABELS[donation.dietaryType]}
          </span>
        </div>
        <h3 className="mt-2 truncate font-display text-xl text-forest">
          <Link to={`/donations/${donation.id}`} className="after:absolute after:inset-0">
            {donation.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-sm text-forest/60">{donation.pickupAddress}</p>
      </div>
      <div className="shrink-0 text-sm sm:text-right">
        <p className="font-semibold text-forest">
          {formatQuantity(donation.quantity, donation.quantityUnit)}
        </p>
        <p className="text-xs text-forest/55">
          {open
            ? `Collect by ${formatRelative(donation.expiresAt)}`
            : `Listed ${formatRelative(donation.createdAt)}`}
        </p>
      </div>
    </article>
  );
}
