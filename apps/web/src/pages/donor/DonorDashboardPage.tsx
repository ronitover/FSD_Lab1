import { CircleCheckBig, Hourglass, Truck, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import type { DonationStatus } from '@replate/shared';
import { EmptyPlateIllustration } from '../../components/illustrations/EmptyStates.tsx';
import { useMe } from '../../auth/context.ts';
import { AnimatedNumber } from '../../components/motion/AnimatedNumber.tsx';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { DonationCard } from '../../features/donations/DonationCard.tsx';
import { useMyDonations } from '../../features/donations/queries.ts';
import { errorMessage } from '../../lib/api.ts';

const STATS: { status: DonationStatus; label: string; icon: LucideIcon; tint: string }[] = [
  {
    status: 'available',
    label: 'Waiting for an NGO',
    icon: Hourglass,
    tint: 'bg-moss/15 text-moss',
  },
  { status: 'claimed', label: 'Awaiting pickup', icon: Truck, tint: 'bg-orange/15 text-orange' },
  {
    status: 'collected',
    label: 'Collected',
    icon: CircleCheckBig,
    tint: 'bg-forest/10 text-forest',
  },
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
      <div className="flex flex-wrap items-end justify-between gap-4 motion-safe:animate-fade-up">
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
          <dl className="stagger mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {STATS.map((stat) => (
              <Link
                key={stat.status}
                to={`/donor/donations?status=${stat.status}`}
                className="group flex flex-col justify-between gap-3 rounded-3xl bg-surface p-4 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-6"
              >
                <span
                  className={`flex size-9 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 sm:size-11 ${stat.tint}`}
                  aria-hidden="true"
                >
                  <stat.icon className="size-4.5 sm:size-5" strokeWidth={2} />
                </span>
                <dt className="min-h-8 text-xs font-semibold text-forest/60 sm:min-h-0 sm:text-sm">
                  {stat.label}
                </dt>
                <dd className="font-display text-3xl text-forest sm:text-4xl">
                  <AnimatedNumber value={count(stat.status)} />
                </dd>
              </Link>
            ))}
          </dl>

          {all.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                illustration={<EmptyPlateIllustration />}
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
                  <div className="stagger mt-4 space-y-3">
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
                  <div className="stagger mt-4 space-y-3">
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
