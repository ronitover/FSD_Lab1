import { Link } from 'react-router';
import type { NearbyDonation } from '@replate/shared';
import { Button } from '../../components/ui/Button.tsx';
import { formatRelative } from '../../lib/dates.ts';
import { useNow } from '../../lib/useNow.ts';
import { CATEGORY_LABELS, DIETARY_LABELS, formatQuantity } from '../../lib/labels.ts';

const HOUR_MS = 60 * 60 * 1000;

interface NearbyDonationCardProps {
  donation: NearbyDonation;
  onClaim: () => void;
}

export function NearbyDonationCard({ donation, onClaim }: NearbyDonationCardProps) {
  const now = useNow();
  const urgent = new Date(donation.expiresAt).getTime() - now < 2 * HOUR_MS;

  return (
    <article className="rounded-3xl bg-surface p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-forest/55">
            {CATEGORY_LABELS[donation.category]} · {DIETARY_LABELS[donation.dietaryType]}
            {donation.needsRefrigeration && ' · Keep cold'}
          </p>
          <h3 className="mt-1 font-display text-xl break-words text-forest">
            <Link to={`/donations/${donation.id}`} className="hover:underline">
              {donation.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-forest/65">from {donation.donorName}</p>
        </div>
        <span className="shrink-0 rounded-full bg-moss/15 px-2.5 py-1 text-xs font-bold text-moss">
          {donation.distanceKm} km
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-forest/55">Quantity</dt>
          <dd className="font-semibold text-forest">
            {formatQuantity(donation.quantity, donation.quantityUnit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-forest/55">Collect by</dt>
          <dd className={`font-semibold ${urgent ? 'text-orange' : 'text-forest'}`}>
            {formatRelative(donation.expiresAt, now)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 truncate text-sm text-forest/60">{donation.pickupAddress}</p>
      {donation.allergens.length > 0 && (
        <p className="mt-1 text-xs text-forest/55">Contains: {donation.allergens.join(', ')}</p>
      )}

      <div className="mt-4 flex gap-2">
        <Button onClick={onClaim} className="flex-1">
          Claim
        </Button>
        <Link
          to={`/donations/${donation.id}`}
          className="inline-flex items-center rounded-full px-4 text-sm font-semibold text-forest hover:bg-forest/5"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
