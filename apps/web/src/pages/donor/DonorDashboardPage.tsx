import { Link } from 'react-router';
import type { DonationStatus } from '@replate/shared';
import { useMe } from '../../auth/context.ts';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { DonationCard } from '../../features/donations/DonationCard.tsx';
import { useMyDonations } from '../../features/donations/queries.ts';
import { errorMessage } from '../../lib/api.ts';

const STATS: { status: DonationStatus; label: string }[] = [
  { status: 'available', label: 'Waiting for an NGO' },
  { status: 'claimed', label: 'Awaiting pickup' },
  { status: 'collected', label: 'Collected' },
];

export function DonorDashboardPage() {
  const me = useMe();
  const donations = useMyDonations();

  const all = donations.data ?? [];
  const count = (status: DonationStatus) => all.filter((item) => item.status === status).length;
  const awaitingPickup = all.filter((item) => item.status === 'claimed');
  const recent = all.filter((item) => item.status !== 'claimed').slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <title>Dashboard · RePlate</title>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] text-moss uppercase">Donor</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight text-forest">
            Hello, {me.displayName}
          </h1>
        </div>
        <Link to="/donor/donations/new" className={buttonClasses('accent', 'lg')}>
          Donate food <span aria-hidden="true">→</span>
        </Link>
      </div>

      {donations.isPending ? (
        <div className="grid place-items-center py-20 text-moss">
          <Spinner className="size-8" label="Loading your donations" />
        </div>
      ) : donations.isError ? (
        <FullPageError
          message={errorMessage(donations.error)}
          onRetry={() => void donations.refetch()}
        />
      ) : (
        <>
          <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {STATS.map((stat) => (
              <Link
                key={stat.status}
                to={`/donor/donations?status=${stat.status}`}
                className="flex flex-col justify-between gap-2 rounded-3xl bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 sm:p-6"
              >
                <dt className="text-xs font-semibold text-forest/60 sm:text-sm">{stat.label}</dt>
                <dd className="font-display text-3xl text-forest sm:text-4xl">
                  {count(stat.status)}
                </dd>
              </Link>
            ))}
          </dl>

          {all.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title="No donations yet"
                action={
                  <Link to="/donor/donations/new" className={buttonClasses()}>
                    List your first donation
                  </Link>
                }
              >
                Have surplus food? List it in a minute and verified NGOs nearby will see it.
              </EmptyState>
            </div>
          ) : (
            <>
              {awaitingPickup.length > 0 && (
                <section className="mt-10" aria-labelledby="awaiting-title">
                  <h2 id="awaiting-title" className="font-display text-2xl text-forest">
                    An NGO is on the way
                  </h2>
                  <p className="mt-1 text-sm text-forest/60">
                    Open a donation to see who claimed it and how to reach them.
                  </p>
                  <div className="mt-4 space-y-3">
                    {awaitingPickup.map((donation) => (
                      <DonationCard key={donation.id} donation={donation} />
                    ))}
                  </div>
                </section>
              )}
              {recent.length > 0 && (
                <section className="mt-10" aria-labelledby="recent-title">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 id="recent-title" className="font-display text-2xl text-forest">
                      Recent donations
                    </h2>
                    <Link
                      to="/donor/donations"
                      className="text-sm inline-block py-1 font-semibold text-moss underline-offset-4 hover:underline"
                    >
                      See all
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {recent.map((donation) => (
                      <DonationCard key={donation.id} donation={donation} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
