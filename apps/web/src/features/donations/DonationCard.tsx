import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import type { Donation } from '@replate/shared';
import { CategoryTile, FoodTypeLabel } from '../../components/ui/FoodVisuals.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { formatRelative } from '../../lib/dates.ts';
import { CATEGORY_LABELS, formatQuantity } from '../../lib/labels.ts';

/** One of the donor's donations in a list. The whole card links to its page. */
export function DonationCard({ donation }: { donation: Donation }) {
  const open = donation.status === 'available' || donation.status === 'claimed';
  return (
    <article className="group relative flex items-center gap-4 rounded-3xl bg-surface p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <CategoryTile
        category={donation.category}
        className="transition duration-300 group-hover:scale-105"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge status={donation.status} />
            <FoodTypeLabel type={donation.dietaryType} />
            <span className="hidden text-xs text-forest/55 sm:inline">
              {CATEGORY_LABELS[donation.category]}
            </span>
          </div>
          <h3 className="mt-1.5 truncate font-display text-xl text-forest">
            <Link to={`/donations/${donation.id}`} className="after:absolute after:inset-0">
              {donation.title}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-forest/60">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{donation.pickupAddress}</span>
          </p>
        </div>
        <div className="shrink-0 text-sm sm:text-right">
          <p className="font-bold text-forest">
            {formatQuantity(donation.quantity, donation.quantityUnit)}
          </p>
          <p className="flex items-center gap-1 text-xs text-forest/55 sm:justify-end">
            <Clock className="size-3" aria-hidden="true" />
            {open
              ? `Collect ${formatRelative(donation.expiresAt)}`
              : `Listed ${formatRelative(donation.createdAt)}`}
          </p>
        </div>
      </div>
    </article>
  );
}
