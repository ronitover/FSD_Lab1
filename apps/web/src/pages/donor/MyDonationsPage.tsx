import { AnimatePresence } from 'motion/react';
import { ListItem } from '../../components/motion/ListItem.tsx';
import { Link, useSearchParams } from 'react-router';
import { DONATION_STATUSES, type DonationStatus } from '@replate/shared';
import {
  EmptyPlateIllustration,
  NoMatchesIllustration,
} from '../../components/illustrations/EmptyStates.tsx';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { SearchBar } from '../../components/ui/SearchBar.tsx';
import { SelectField } from '../../components/ui/SelectField.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { DonationCard } from '../../features/donations/DonationCard.tsx';
import { useMyDonations } from '../../features/donations/queries.ts';
import { errorMessage } from '../../lib/api.ts';
import { optionsFrom, STATUS_LABELS } from '../../lib/labels.ts';

const STATUS_OPTIONS = optionsFrom(STATUS_LABELS);

function parseStatus(value: string | null): DonationStatus | undefined {
  return DONATION_STATUSES.find((status) => status === value);
}

export function MyDonationsPage() {
  // Search and filter live in the URL, so they survive a reload and the back button.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = parseStatus(params.get('status'));
  const donations = useMyDonations({ q: q || undefined, status });

  function setParam(key: 'q' | 'status', value: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  const filtered = Boolean(q || status);
  const list = donations.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <title>My donations · RePlate</title>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl tracking-tight text-forest">My donations</h1>
        <Link to="/donor/donations/new" className={buttonClasses('accent')}>
          Donate food
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_14rem] sm:items-end">
        <SearchBar
          label="Search your donations"
          placeholder="Search by title, description or address"
          value={q}
          onSearch={(value) => setParam('q', value)}
        />
        <SelectField
          label="Status"
          className="[&_label]:sr-only"
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          value={status ?? ''}
          onChange={(value) => setParam('status', value)}
        />
      </div>

      <div className="mt-6" aria-busy={donations.isFetching}>
        {donations.isPending ? (
          <div className="grid place-items-center py-20 text-moss">
            <Spinner className="size-8" label="Loading your donations" />
          </div>
        ) : donations.isError ? (
          <FullPageError
            message={errorMessage(donations.error)}
            onRetry={() => void donations.refetch()}
          />
        ) : list.length === 0 ? (
          filtered ? (
            <EmptyState
              illustration={<NoMatchesIllustration />}
              title="No matching donations"
              action={
                <button
                  type="button"
                  className={buttonClasses('secondary')}
                  onClick={() => setParams({}, { replace: true })}
                >
                  Clear filters
                </button>
              }
            >
              Try a different word or status.
            </EmptyState>
          ) : (
            <EmptyState
              illustration={<EmptyPlateIllustration />}
              title="No donations yet"
              action={
                <Link to="/donor/donations/new" className={buttonClasses()}>
                  List your first donation
                </Link>
              }
            >
              Donations you list will appear here.
            </EmptyState>
          )
        ) : (
          <>
            <p className="mb-3 text-sm text-forest/60" role="status">
              {list.length} {list.length === 1 ? 'donation' : 'donations'}
              {filtered && ' found'}
            </p>
            <div
              className={`space-y-3 transition-opacity ${donations.isPlaceholderData ? 'opacity-60' : ''}`}
            >
              {/* Cards fade and slide into place as searches and filters change the list. */}
              <AnimatePresence mode="popLayout">
                {list.map((donation, index) => (
                  <ListItem key={donation.id} index={index}>
                    <DonationCard donation={donation} />
                  </ListItem>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
