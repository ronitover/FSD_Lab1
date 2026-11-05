import {
  ArrowLeft,
  CircleCheckBig,
  Clock,
  ExternalLink,
  Hourglass,
  MapPin,
  MessageCircle,
  Navigation,
  PackagePlus,
  Phone,
  RotateCcw,
  Snowflake,
  Store,
  TimerOff,
  Truck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { DonationDetail, DonationEvent, DonationStatus } from '@replate/shared';
import { HOME_BY_ROLE, useMe } from '../../auth/context.ts';
import { LocationMap } from '../../components/map/LocationMap.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { FullPageError, FullPageSpinner } from '../../components/ui/Feedback.tsx';
import { CategoryTile, FoodTypeLabel } from '../../components/ui/FoodVisuals.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { useDonation } from '../../features/donations/queries.ts';
import { useDonationActions } from '../../features/donations/useDonationActions.tsx';
import { ApiRequestError, errorMessage } from '../../lib/api.ts';
import { directionsLink, telLink, whatsAppLink } from '../../lib/contact.ts';
import { formatDateTime, formatRelative } from '../../lib/dates.ts';
import { CATEGORY_LABELS, formatQuantity, STATUS_LABELS } from '../../lib/labels.ts';
import { useNow } from '../../lib/useNow.ts';

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
  const actions = useDonationActions();

  const isOwner = donation.donorId === me.id;
  const isClaimer = donation.claimedBy === me.id;
  const canEdit = isOwner && donation.status === 'available';
  const canCancel = isOwner && (donation.status === 'available' || donation.status === 'claimed');
  const canDelete = isOwner && ['available', 'cancelled', 'expired'].includes(donation.status);
  const canClaim = me.role === 'ngo' && donation.status === 'available';
  const canFinish = isClaimer && donation.status === 'claimed';
  const back = isOwner
    ? { to: '/donor/donations', label: 'My donations' }
    : isClaimer
      ? { to: '/ngo/pickups', label: 'My pickups' }
      : { to: HOME_BY_ROLE[me.role], label: me.role === 'ngo' ? 'Find food' : 'Back' };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <title>{`${donation.title} · RePlate`}</title>
      <Link
        to={back.to}
        className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-moss underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {back.label}
      </Link>

      <header className="mt-4 flex flex-col gap-5 motion-safe:animate-fade-up sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <CategoryTile category={donation.category} size="lg" className="hidden sm:inline-flex" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusBadge status={donation.status} />
              <FoodTypeLabel type={donation.dietaryType} />
              <span className="text-sm text-forest/60">{CATEGORY_LABELS[donation.category]}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl tracking-tight break-words text-forest sm:text-4xl">
              {donation.title}
            </h1>
            <p className="mt-2 text-lg font-semibold text-forest/80">
              {formatQuantity(donation.quantity, donation.quantityUnit)}
            </p>
          </div>
        </div>
        {(canEdit || canCancel || canDelete || canClaim || canFinish) && (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {canClaim && (
              <Button size="lg" onClick={() => actions.request('claim', donation)}>
                Claim this donation
              </Button>
            )}
            {canFinish && (
              <>
                <Button onClick={() => actions.request('collect', donation)}>
                  <CircleCheckBig className="size-4" aria-hidden="true" /> Mark collected
                </Button>
                <Button variant="secondary" onClick={() => actions.request('release', donation)}>
                  Release claim
                </Button>
              </>
            )}
            {canEdit && (
              <Link
                to={`/donor/donations/${donation.id}/edit`}
                className={buttonClasses('secondary')}
              >
                Edit
              </Link>
            )}
            {canCancel && (
              <Button variant="secondary" onClick={() => actions.request('cancel', donation)}>
                Cancel donation
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                className="text-danger"
                onClick={() =>
                  actions.request('delete', donation, () =>
                    navigate('/donor/donations', { replace: true }),
                  )
                }
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </header>

      <StatusBanner donation={donation} isOwner={isOwner} isClaimer={isClaimer} />

      <div className="stagger mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {donation.contact && (
            <ContactCard donation={donation} title={isOwner ? 'Claimed by' : 'Donor'} />
          )}

          <Card title="Details">
            {donation.description && (
              <p className="mb-5 leading-7 whitespace-pre-line text-forest/80">
                {donation.description}
              </p>
            )}
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Detail icon={Clock} label="Available from">
                {formatDateTime(donation.pickupFrom)}
              </Detail>
              <Detail icon={Hourglass} label="Collect by">
                {formatDateTime(donation.expiresAt)}
                {(donation.status === 'available' || donation.status === 'claimed') && (
                  <span className="block text-xs text-forest/55">
                    {formatRelative(donation.expiresAt)}
                  </span>
                )}
              </Detail>
              {donation.preparedAt && (
                <Detail icon={Clock} label="Cooked at">
                  {formatDateTime(donation.preparedAt)}
                </Detail>
              )}
              <Detail icon={Snowflake} label="Storage">
                {donation.needsRefrigeration ? 'Needs to stay cold' : 'Room temperature is fine'}
              </Detail>
            </dl>
            <div className="mt-5">
              <p className="text-xs font-semibold text-forest/55">Allergens</p>
              {donation.allergens.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {donation.allergens.map((allergen) => (
                    <li
                      key={allergen}
                      className="rounded-full border border-forest/15 px-2.5 py-0.5 text-xs font-medium text-forest/75"
                    >
                      {allergen}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-0.5 text-sm text-forest">None listed</p>
              )}
            </div>
          </Card>

          <Card title="History">
            <Timeline status={donation.status} events={donation.events} myId={me.id} />
          </Card>
        </div>

        {/* NGOs need the pickup point and directions first, so on phones it moves to the top for them. */}
        <div className={`space-y-6 ${me.role === 'ngo' ? 'order-first lg:order-none' : ''}`}>
          <Card title="Pickup">
            <p className="flex items-start gap-2 text-forest/85">
              <MapPin className="mt-0.5 size-4 shrink-0 text-orange" aria-hidden="true" />
              {donation.pickupAddress}
            </p>
            {donation.pickupNotes && (
              <p className="mt-3 rounded-xl bg-cream px-3 py-2 text-sm whitespace-pre-line text-forest/75">
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
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={directionsLink(donation.pickupLat, donation.pickupLng, navigator.userAgent)}
                target="_blank"
                rel="noreferrer"
                className={buttonClasses('primary', 'sm')}
              >
                <Navigation className="size-3.5" aria-hidden="true" /> Directions
              </a>
              <a
                href={`https://www.openstreetmap.org/?mlat=${donation.pickupLat}&mlon=${donation.pickupLng}#map=17/${donation.pickupLat}/${donation.pickupLng}`}
                target="_blank"
                rel="noreferrer"
                className={buttonClasses('ghost', 'sm')}
              >
                Open map <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
          </Card>
        </div>
      </div>

      {actions.dialog}
    </div>
  );
}

/** One line that says where the donation stands and what happens next, in the status's colour. */
function StatusBanner({
  donation,
  isOwner,
  isClaimer,
}: {
  donation: DonationDetail;
  isOwner: boolean;
  isClaimer: boolean;
}) {
  const now = useNow();
  const urgent = new Date(donation.expiresAt).getTime() - now < 2 * 60 * 60 * 1000;
  const who = donation.contact?.displayName;
  const due = formatRelative(donation.expiresAt, now);

  const banners: Record<DonationStatus, { icon: LucideIcon; tone: string; text: ReactNode }> = {
    available: {
      icon: Hourglass,
      tone: urgent ? 'bg-orange/15 text-orange' : 'bg-moss/15 text-moss',
      text: isOwner
        ? `Waiting for an NGO to claim it. It must be collected ${due}.`
        : `Open to claim. It must be collected ${due}.`,
    },
    claimed: {
      icon: Truck,
      tone: 'bg-orange/15 text-orange',
      text: isClaimer
        ? `You claimed this. Collect it ${due}, then mark it collected.`
        : isOwner
          ? `${who ?? 'An NGO'} claimed it and is on the way. Pickup is due ${due}.`
          : `Claimed by another NGO.`,
    },
    collected: {
      icon: CircleCheckBig,
      tone: 'bg-moss/15 text-moss',
      text: isOwner
        ? `Collected${who ? ` by ${who}` : ''}. Thank you for sharing.`
        : 'Collected. Thank you for picking it up.',
    },
    cancelled: {
      icon: XCircle,
      tone: 'bg-forest/5 text-forest/70',
      text: 'The donor cancelled this donation.',
    },
    expired: {
      icon: TimerOff,
      tone: 'bg-danger/10 text-danger',
      text: 'Nobody collected this before its collect-by time, so it has expired.',
    },
  };
  const { icon: Icon, tone, text } = banners[donation.status];

  return (
    <div
      className={`mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold motion-safe:animate-fade-up ${tone}`}
      role="status"
    >
      <span className="relative flex size-5 shrink-0 items-center justify-center">
        {(donation.status === 'claimed' || (donation.status === 'available' && urgent)) && (
          <span className="absolute inset-0 rounded-full bg-current opacity-25 motion-safe:animate-ping-soft" />
        )}
        <Icon className="relative size-5" aria-hidden="true" />
      </span>
      {text}
    </div>
  );
}

/** The other side of the claim, with one-tap call and WhatsApp. */
function ContactCard({ donation, title }: { donation: DonationDetail; title: string }) {
  const contact = donation.contact!;
  const whatsApp = contact.phone
    ? whatsAppLink(contact.phone, `Hi, this is about the RePlate donation "${donation.title}".`)
    : null;

  return (
    <Card title={title}>
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-moss/15 text-moss">
          <Store className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl break-words text-forest">{contact.displayName}</p>
          {contact.phone ? (
            <p className="text-sm text-forest/65">{contact.phone}</p>
          ) : (
            <p className="text-sm text-forest/60">No phone number on their profile yet.</p>
          )}
        </div>
      </div>
      {contact.address && <p className="mt-3 text-sm text-forest/65">{contact.address}</p>}
      {contact.phone && (
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={telLink(contact.phone)} className={buttonClasses('primary', 'sm')}>
            <Phone className="size-3.5" aria-hidden="true" /> Call
          </a>
          {whatsApp && (
            <a
              href={whatsApp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-3.5 py-1.5 text-xs font-bold text-[#073b1c] transition duration-200 hover:bg-[#25d366]/90 active:scale-[0.97]"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" /> WhatsApp
            </a>
          )}
        </div>
      )}
    </Card>
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

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-forest/40" aria-hidden="true" />
      <div>
        <dt className="text-xs font-semibold text-forest/55">{label}</dt>
        <dd className="mt-0.5 text-sm text-forest">{children}</dd>
      </div>
    </div>
  );
}

const EVENT_STYLES: Record<DonationStatus, { icon: LucideIcon; tone: string }> = {
  available: { icon: PackagePlus, tone: 'bg-moss text-white' },
  claimed: { icon: Truck, tone: 'bg-orange text-white' },
  collected: { icon: CircleCheckBig, tone: 'bg-forest text-cream' },
  cancelled: { icon: XCircle, tone: 'bg-forest/20 text-forest' },
  expired: { icon: TimerOff, tone: 'bg-danger text-white' },
};

/** What would happen next, shown faded at the end of the history. */
const NEXT_STEP: Partial<Record<DonationStatus, string>> = {
  available: 'Waiting for an NGO to claim it',
  claimed: 'Waiting for pickup',
};

function Timeline({
  status,
  events,
  myId,
}: {
  status: DonationStatus;
  events: DonationEvent[];
  myId: string;
}) {
  const who = (event: DonationEvent) =>
    event.actorId === null ? 'automatically' : event.actorId === myId ? 'by you' : null;
  const next = NEXT_STEP[status];

  return (
    <ol className="relative space-y-5">
      <span className="absolute top-2 bottom-2 left-[15px] w-0.5 bg-forest/10" aria-hidden="true" />
      {events.map((event, index) => {
        const relisted = event.status === 'available' && index > 0;
        const { icon: Icon, tone } = relisted
          ? { icon: RotateCcw, tone: 'bg-sky-500 text-white' }
          : EVENT_STYLES[event.status];
        const label =
          event.status === 'available'
            ? relisted
              ? 'Available again'
              : 'Listed'
            : STATUS_LABELS[event.status];
        return (
          <li key={`${event.createdAt}-${index}`} className="relative flex gap-3">
            <span
              className={`relative flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface ${tone}`}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </span>
            <div className="pt-1">
              <p className="text-sm font-semibold text-forest">
                {label}
                {who(event) && <span className="font-normal text-forest/60"> {who(event)}</span>}
              </p>
              <p className="text-xs text-forest/55">{formatDateTime(event.createdAt)}</p>
            </div>
          </li>
        );
      })}
      {next && (
        <li className="relative flex gap-3 opacity-60">
          <span
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-forest/30 bg-surface ring-4 ring-surface"
            aria-hidden="true"
          >
            <Hourglass className="size-3.5 text-forest/50" />
          </span>
          <p className="pt-1.5 text-sm text-forest/70">{next}</p>
        </li>
      )}
    </ol>
  );
}
