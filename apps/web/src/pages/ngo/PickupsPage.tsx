import {
  CircleCheckBig,
  Clock,
  MapPin,
  Navigation,
  PackageCheck,
  Snowflake,
  Truck,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import type { Donation } from '@replate/shared';
import { AnimatedNumber } from '../../components/motion/AnimatedNumber.tsx';
import { TabHighlight } from '../../components/motion/TabHighlight.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { TiffinIllustration } from '../../components/illustrations/EmptyStates.tsx';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { CategoryTile, FoodTypeLabel } from '../../components/ui/FoodVisuals.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { useClaimedDonations } from '../../features/donations/queries.ts';
import { useDonationActions } from '../../features/donations/useDonationActions.tsx';
import { errorMessage } from '../../lib/api.ts';
import { directionsLink } from '../../lib/contact.ts';
import { formatDateTime, formatRelative } from '../../lib/dates.ts';
import { formatQuantity } from '../../lib/labels.ts';
import { useNow } from '../../lib/useNow.ts';

type Tab = 'claimed' | 'collected' | 'all';

const TABS: { value: Tab; label: string }[] = [
  { value: 'claimed', label: 'To collect' },
  { value: 'collected', label: 'Collected' },
  { value: 'all', label: 'All' },
];

const HOUR_MS = 60 * 60 * 1000;

export function PickupsPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((item) => item.value === params.get('show'))?.value ?? 'claimed';
  // One request for everything, so the tabs can show counts and switch without loading.
  const pickups = useClaimedDonations();
  const actions = useDonationActions();

  const all = pickups.data ?? [];
  const toCollect = all
    .filter((item) => item.status === 'claimed')
    .sort((a, b) => Date.parse(a.expiresAt) - Date.parse(b.expiresAt));
  const collected = all.filter((item) => item.status === 'collected');
  const lists: Record<Tab, Donation[]> = { claimed: toCollect, collected, all };
  const list = lists[tab];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <title>My pickups · RePlate</title>
      <div className="flex flex-wrap items-end justify-between gap-4 motion-safe:animate-fade-up">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-moss uppercase">NGO</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-forest">My pickups</h1>
        </div>
        <Link to="/ngo" className={buttonClasses('secondary')}>
          Find more food
        </Link>
      </div>

      {!pickups.isPending && !pickups.isError && all.length > 0 && (
        <dl className="stagger mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
          <Stat
            icon={Truck}
            tint="bg-orange/15 text-orange"
            label="To collect"
            value={toCollect.length}
          />
          <Stat
            icon={PackageCheck}
            tint="bg-moss/15 text-moss"
            label="Collected so far"
            value={collected.length}
          />
        </dl>
      )}

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Show">
        {TABS.map((item) => {
          const count = lists[item.value].length;
          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={tab === item.value}
              onClick={() =>
                setParams(item.value === 'claimed' ? {} : { show: item.value }, { replace: true })
              }
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.97] ${
                tab === item.value
                  ? 'text-cream'
                  : 'border border-forest/20 text-forest hover:border-forest/50'
              }`}
            >
              {tab === item.value && <TabHighlight group="pickups-tabs" />}
              <span className="relative">{item.label}</span>
              {!pickups.isPending && (
                <span
                  className={`relative rounded-full px-1.5 text-xs ${
                    tab === item.value ? 'bg-cream/20' : 'bg-forest/10'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
            illustration={<TiffinIllustration />}
            title={tab === 'claimed' ? 'Nothing to collect right now' : 'No pickups yet'}
            action={
              <Link to="/ngo" className={buttonClasses()}>
                Find food near you
              </Link>
            }
          >
            Donations you claim appear here until you collect them.
          </EmptyState>
        ) : (
          <div key={tab} className="stagger space-y-3">
            {list.map((donation) =>
              donation.status === 'claimed' ? (
                <ActivePickup
                  key={donation.id}
                  donation={donation}
                  onCollect={() => actions.request('collect', donation)}
                  onRelease={() => actions.request('release', donation)}
                />
              ) : (
                <PastPickup key={donation.id} donation={donation} />
              ),
            )}
          </div>
        )}
      </div>

      {actions.dialog}
    </div>
  );
}

function Stat({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: typeof Truck;
  tint: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-soft">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tint}`}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <div>
        <dt className="text-xs font-semibold text-forest/60">{label}</dt>
        <dd className="font-display text-2xl leading-none text-forest">
          <AnimatedNumber value={value} />
        </dd>
      </div>
    </div>
  );
}

/** A pickup the NGO still has to make: what, where, how long is left, and the actions. */
function ActivePickup({
  donation,
  onCollect,
  onRelease,
}: {
  donation: Donation;
  onCollect: () => void;
  onRelease: () => void;
}) {
  const now = useNow();
  const urgent = new Date(donation.expiresAt).getTime() - now < 2 * HOUR_MS;

  return (
    <article className="rounded-3xl bg-surface p-5 shadow-soft transition duration-300 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <CategoryTile category={donation.category} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <FoodTypeLabel type={donation.dietaryType} />
            <span className="text-xs font-semibold text-forest/70">
              {formatQuantity(donation.quantity, donation.quantityUnit)}
            </span>
          </div>
          <h2 className="mt-1 font-display text-xl break-words text-forest">
            <Link to={`/donations/${donation.id}`} className="hover:underline">
              {donation.title}
            </Link>
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-forest/60">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{donation.pickupAddress}</span>
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
          Collect {formatRelative(donation.expiresAt, now)} · {formatDateTime(donation.expiresAt)}
        </span>
        {donation.needsRefrigeration && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300">
            <Snowflake className="size-3.5" aria-hidden="true" /> Keep cold
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-forest/10 pt-4">
        <Button onClick={onCollect}>
          <CircleCheckBig className="size-4" aria-hidden="true" /> Mark collected
        </Button>
        <a
          href={directionsLink(donation.pickupLat, donation.pickupLng, navigator.userAgent)}
          target="_blank"
          rel="noreferrer"
          className={buttonClasses('secondary')}
        >
          <Navigation className="size-4" aria-hidden="true" /> Directions
        </a>
        <Link to={`/donations/${donation.id}`} className={buttonClasses('ghost')}>
          Contact & details
        </Link>
        <button
          type="button"
          onClick={onRelease}
          className="ml-auto rounded-full px-3 py-2 text-sm font-semibold text-forest/60 transition hover:bg-forest/5 hover:text-forest"
        >
          Can't make it
        </button>
      </div>
    </article>
  );
}

/** A finished pickup, kept short. */
function PastPickup({ donation }: { donation: Donation }) {
  return (
    <article className="relative flex items-center gap-4 rounded-2xl bg-surface/70 p-4 transition hover:bg-surface hover:shadow-soft">
      <CategoryTile category={donation.category} size="sm" />
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold text-forest">
          <Link to={`/donations/${donation.id}`} className="after:absolute after:inset-0">
            {donation.title}
          </Link>
        </h2>
        <p className="text-xs text-forest/60">
          {formatQuantity(donation.quantity, donation.quantityUnit)} ·{' '}
          {donation.collectedAt
            ? `Collected ${formatDateTime(donation.collectedAt)}`
            : `Claimed ${formatDateTime(donation.claimedAt ?? donation.updatedAt)}`}
        </p>
      </div>
      <StatusBadge status={donation.status} />
    </article>
  );
}
