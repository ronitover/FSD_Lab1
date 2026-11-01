import { Link, useSearchParams } from 'react-router';
import type { Donation, DonationStatus } from '@replate/shared';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { useClaimedDonations } from '../../features/donations/queries.ts';
import { useDonationActions } from '../../features/donations/useDonationActions.tsx';
import { errorMessage } from '../../lib/api.ts';
import { formatDateTime, formatRelative } from '../../lib/dates.ts';
import { formatQuantity } from '../../lib/labels.ts';

const TABS: { value: DonationStatus | 'all'; label: string }[] = [
  { value: 'claimed', label: 'To collect' },
  { value: 'collected', label: 'Collected' },
  { value: 'all', label: 'All' },
];

export function PickupsPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((item) => item.value === params.get('show'))?.value ?? 'claimed';
  const pickups = useClaimedDonations(tab === 'all' ? undefined : tab);
  const actions = useDonationActions();
  const list = pickups.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <title>My pickups · RePlate</title>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl tracking-tight text-forest">My pickups</h1>
        <Link to="/ngo" className={buttonClasses('secondary')}>
          Find more food
        </Link>
      </div>

      <div className="mt-6 flex gap-2" role="group" aria-label="Show">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={tab === item.value}
            onClick={() =>
              setParams(item.value === 'claimed' ? {} : { show: item.value }, { replace: true })
            }
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.value
                ? 'bg-forest text-cream'
                : 'border border-forest/20 text-forest hover:border-forest/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {pickups.isPending ? (
          <div className="grid place-items-center py-20 text-moss">
            <Spinner className="size-8" label="Loading your pickups" />
          </div>
        ) : pickups.isError ? (
          <FullPageError
            message={errorMessage(pickups.error)}
            onRetry={() => void pickups.refetch()}
          />
        ) : list.length === 0 ? (
          <EmptyState
            title={tab === 'claimed' ? 'Nothing to collect' : 'No pickups yet'}
            action={
              <Link to="/ngo" className={buttonClasses()}>
                Find food near you
              </Link>
            }
          >
            Donations you claim appear here until you collect them.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {list.map((donation) => (
              <PickupCard
                key={donation.id}
                donation={donation}
                onCollect={() => actions.request('collect', donation)}
                onRelease={() => actions.request('release', donation)}
              />
            ))}
          </div>
        )}
      </div>

      {actions.dialog}
    </div>
  );
}

function PickupCard({
  donation,
  onCollect,
  onRelease,
}: {
  donation: Donation;
  onCollect: () => void;
  onRelease: () => void;
}) {
  const active = donation.status === 'claimed';
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={donation.status} />
          <span className="text-xs text-forest/55">
            {formatQuantity(donation.quantity, donation.quantityUnit)}
          </span>
        </div>
        <h2 className="mt-2 font-display text-xl break-words text-forest">
          <Link to={`/donations/${donation.id}`} className="hover:underline">
            {donation.title}
          </Link>
        </h2>
        <p className="mt-1 truncate text-sm text-forest/60">{donation.pickupAddress}</p>
        <p className="mt-1 text-xs text-forest/55">
          {active
            ? `Collect by ${formatDateTime(donation.expiresAt)} (${formatRelative(donation.expiresAt)})`
            : donation.collectedAt
              ? `Collected ${formatDateTime(donation.collectedAt)}`
              : `Claimed ${formatDateTime(donation.claimedAt ?? donation.updatedAt)}`}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link to={`/donations/${donation.id}`} className={buttonClasses('ghost')}>
          Contact & map
        </Link>
        {active && (
          <>
            <Button variant="secondary" onClick={onRelease}>
              Release
            </Button>
            <Button onClick={onCollect}>Mark collected</Button>
          </>
        )}
      </div>
    </article>
  );
}
