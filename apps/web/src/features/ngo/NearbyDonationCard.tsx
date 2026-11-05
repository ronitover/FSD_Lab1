import { Clock, MapPin, Navigation, Snowflake, Store } from 'lucide-react';
import { Link } from 'react-router';
import type { NearbyDonation } from '@replate/shared';
import { Button } from '../../components/ui/Button.tsx';
import { CategoryTile, FoodTypeLabel } from '../../components/ui/FoodVisuals.tsx';
import { formatRelative } from '../../lib/dates.ts';
import { useNow } from '../../lib/useNow.ts';
import { CATEGORY_LABELS, formatQuantity } from '../../lib/labels.ts';

const HOUR_MS = 60 * 60 * 1000;

interface NearbyDonationCardProps {
  donation: NearbyDonation;
  onClaim: () => void;
}

export function NearbyDonationCard({ donation, onClaim }: NearbyDonationCardProps) {
  const now = useNow();
  const urgent = new Date(donation.expiresAt).getTime() - now < 2 * HOUR_MS;

  return (
    <article className="group flex flex-col rounded-3xl bg-surface p-5 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <CategoryTile
          category={donation.category}
          size="sm"
          className="transition duration-300 group-hover:scale-105"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <FoodTypeLabel type={donation.dietaryType} />
            <span className="text-xs text-forest/55">{CATEGORY_LABELS[donation.category]}</span>
          </div>
          <h3 className="mt-1 font-display text-xl leading-snug break-words text-forest">
            <Link to={`/donations/${donation.id}`} className="hover:underline">
              {donation.title}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-forest/65">
            <Store className="size-3.5 shrink-0" aria-hidden="true" />
            {donation.donorName}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
            urgent ? 'bg-orange/15 text-orange' : 'bg-forest/5 text-forest/80'
          }`}
        >
          <span className="relative flex size-3.5 items-center justify-center">
            {urgent && (
              <span className="absolute inset-0 rounded-full bg-orange/40 motion-safe:animate-ping-soft" />
            )}
            <Clock className="relative size-3.5" aria-hidden="true" />
          </span>
          Collect {formatRelative(donation.expiresAt, now)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/15 px-2.5 py-1 text-moss">
          <Navigation className="size-3.5" aria-hidden="true" />
          {donation.distanceKm} km
        </span>
        {donation.needsRefrigeration && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300">
            <Snowflake className="size-3.5" aria-hidden="true" />
            Keep cold
          </span>
        )}
      </div>

      <p className="mt-4 font-display text-2xl text-forest">
        {formatQuantity(donation.quantity, donation.quantityUnit)}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-forest/60">
        <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{donation.pickupAddress}</span>
      </p>
      {donation.allergens.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Contains allergens">
          {donation.allergens.map((allergen) => (
            <li
              key={allergen}
              className="rounded-full border border-forest/15 px-2 py-0.5 text-[11px] font-medium text-forest/70"
            >
              {allergen}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <Button onClick={onClaim} className="flex-1">
          Claim
        </Button>
        <Link
          to={`/donations/${donation.id}`}
          className="inline-flex items-center rounded-full px-4 text-sm font-semibold text-forest transition hover:bg-forest/5"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
