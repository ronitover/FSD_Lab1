import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { DonationDetail, DonationEvent } from '@replate/shared';
import { HOME_BY_ROLE, useMe } from '../../auth/context.ts';
import { LocationMap } from '../../components/map/LocationMap.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { FullPageError, FullPageSpinner } from '../../components/ui/Feedback.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { useToast } from '../../components/ui/toast-context.ts';
import {
  useDeleteDonation,
  useDonation,
  useDonationAction,
} from '../../features/donations/queries.ts';
import { ApiRequestError, errorMessage } from '../../lib/api.ts';
import { formatDateTime, formatRelative } from '../../lib/dates.ts';
import {
  CATEGORY_LABELS,
  DIETARY_LABELS,
  formatQuantity,
  STATUS_LABELS,
} from '../../lib/labels.ts';

type PendingAction = 'cancel' | 'delete' | null;

export function DonationDetailPage() {
  const { id = '' } = useParams();
  const me = useMe();
  const donation = useDonation(id);

  if (donation.isPending) return <FullPageSpinner />;
  if (donation.isError) {
    if (donation.error instanceof ApiRequestError && donation.error.status === 404) {
      return (
        <div className="mx-auto grid max-w-md gap-4 px-4 py-16 text-center">
          <title>Donation not found · RePlate</title>
          <h1 className="font-display text-2xl text-forest">Donation not found</h1>
          <p className="text-sm text-forest/70">
            It may have been deleted, or it is no longer open to you.
          </p>
          <Link to={HOME_BY_ROLE[me.role]} className={`${buttonClasses()} justify-self-center`}>
            Back to your dashboard
          </Link>
        </div>
      );
    }
    return (
      <FullPageError
        message={errorMessage(donation.error)}
        onRetry={() => void donation.refetch()}
      />
    );
  }

  return <DonationDetailView donation={donation.data} />;
}

function DonationDetailView({ donation }: { donation: DonationDetail }) {
  const me = useMe();
  const navigate = useNavigate();
  const toast = useToast();
  const action = useDonationAction();
  const remove = useDeleteDonation();
  const [pending, setPending] = useState<PendingAction>(null);

  const isOwner = donation.donorId === me.id;
  const canEdit = isOwner && donation.status === 'available';
  const canCancel = isOwner && (donation.status === 'available' || donation.status === 'claimed');
  const canDelete = isOwner && ['available', 'cancelled', 'expired'].includes(donation.status);
  const backTo = isOwner ? '/donor/donations' : HOME_BY_ROLE[me.role];

  async function confirmPending() {
    try {
      if (pending === 'cancel') {
        await action.mutateAsync({ id: donation.id, action: 'cancel' });
        toast.show('Donation cancelled.', 'info');
      } else if (pending === 'delete') {
        await remove.mutateAsync(donation.id);
        toast.show('Donation deleted.', 'info');
        void navigate('/donor/donations', { replace: true });
      }
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <title>{`${donation.title} · RePlate`}</title>
      <Link
        to={backTo}
        className="text-sm font-semibold text-moss underline-offset-4 hover:underline"
      >
        <span aria-hidden="true">←</span> {isOwner ? 'My donations' : 'Back'}
      </Link>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={donation.status} />
            <span className="text-sm text-forest/60">
              {CATEGORY_LABELS[donation.category]} · {DIETARY_LABELS[donation.dietaryType]}
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl tracking-tight break-words text-forest sm:text-4xl">
            {donation.title}
          </h1>
          <p className="mt-2 text-lg font-semibold text-forest/80">
            {formatQuantity(donation.quantity, donation.quantityUnit)}
          </p>
        </div>
        {(canEdit || canCancel || canDelete) && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {canEdit && (
              <Link
                to={`/donor/donations/${donation.id}/edit`}
                className={buttonClasses('secondary')}
              >
                Edit
              </Link>
            )}
            {canCancel && (
              <Button variant="secondary" onClick={() => setPending('cancel')}>
                Cancel donation
              </Button>
            )}
            {canDelete && (
              <Button variant="ghost" className="text-danger" onClick={() => setPending('delete')}>
                Delete
              </Button>
            )}
          </div>
        )}
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {donation.contact && (
            <Card title={isOwner ? 'Claimed by' : 'Donor'}>
              <p className="font-display text-xl text-forest">{donation.contact.displayName}</p>
              {donation.contact.phone && (
                <a
                  href={`tel:${donation.contact.phone.replace(/[^\d+]/g, '')}`}
                  className="mt-1 inline-block font-semibold text-moss underline-offset-4 hover:underline"
                >
                  {donation.contact.phone}
                </a>
              )}
              {donation.contact.address && (
                <p className="mt-1 text-sm text-forest/65">{donation.contact.address}</p>
              )}
              {!donation.contact.phone && (
                <p className="mt-1 text-sm text-forest/60">No phone number on their profile yet.</p>
              )}
            </Card>
          )}

          <Card title="Details">
            {donation.description && (
              <p className="mb-5 leading-7 whitespace-pre-line text-forest/80">
                {donation.description}
              </p>
            )}
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail label="Available from">{formatDateTime(donation.pickupFrom)}</Detail>
              <Detail label="Collect by">
                {formatDateTime(donation.expiresAt)}
                {(donation.status === 'available' || donation.status === 'claimed') && (
                  <span className="block text-xs text-forest/55">
                    {formatRelative(donation.expiresAt)}
                  </span>
                )}
              </Detail>
              {donation.preparedAt && (
                <Detail label="Prepared at">{formatDateTime(donation.preparedAt)}</Detail>
              )}
              <Detail label="Storage">
                {donation.needsRefrigeration ? 'Needs refrigeration' : 'Room temperature is fine'}
              </Detail>
              <Detail label="Allergens">
                {donation.allergens.length > 0 ? donation.allergens.join(', ') : 'None listed'}
              </Detail>
            </dl>
          </Card>

          <Card title="History">
            <Timeline events={donation.events} myId={me.id} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Pickup">
            <p className="text-forest/85">{donation.pickupAddress}</p>
            {donation.pickupNotes && (
              <p className="mt-2 text-sm whitespace-pre-line text-forest/65">
                {donation.pickupNotes}
              </p>
            )}
            <div className="mt-4">
              <LocationMap
                lat={donation.pickupLat}
                lng={donation.pickupLng}
                label={donation.pickupAddress}
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${donation.pickupLat}&mlon=${donation.pickupLng}#map=17/${donation.pickupLat}/${donation.pickupLng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-moss underline-offset-4 hover:underline"
            >
              Open in OpenStreetMap <span aria-hidden="true">↗</span>
            </a>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={pending === 'cancel'}
        title="Cancel this donation?"
        confirmLabel="Cancel donation"
        destructive
        busy={action.isPending}
        onConfirm={() => void confirmPending()}
        onCancel={() => setPending(null)}
      >
        {donation.status === 'claimed'
          ? 'An NGO has already claimed this and may be on the way. Let them know before you cancel.'
          : 'NGOs will no longer see it. You can delete it afterwards.'}
      </ConfirmDialog>
      <ConfirmDialog
        open={pending === 'delete'}
        title="Delete this donation?"
        confirmLabel="Delete"
        destructive
        busy={remove.isPending}
        onConfirm={() => void confirmPending()}
        onCancel={() => setPending(null)}
      >
        It will be removed from RePlate for good, along with its history.
      </ConfirmDialog>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-soft sm:p-6">
      <h2 className="mb-4 text-xs font-bold tracking-[0.18em] text-moss uppercase">{title}</h2>
      {children}
    </section>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-forest/55">{label}</dt>
      <dd className="mt-0.5 text-sm text-forest">{children}</dd>
    </div>
  );
}

function Timeline({ events, myId }: { events: DonationEvent[]; myId: string }) {
  const who = (event: DonationEvent) =>
    event.actorId === null ? 'automatically' : event.actorId === myId ? 'by you' : null;

  return (
    <ol className="space-y-4 border-l-2 border-forest/10 pl-5">
      {events.map((event, index) => (
        <li key={`${event.createdAt}-${index}`} className="relative">
          <span
            className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-surface bg-moss"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-forest">
            {event.status === 'available'
              ? index === 0
                ? 'Listed'
                : 'Available again'
              : STATUS_LABELS[event.status]}
            {who(event) && <span className="font-normal text-forest/60"> {who(event)}</span>}
          </p>
          <p className="text-xs text-forest/55">{formatDateTime(event.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
