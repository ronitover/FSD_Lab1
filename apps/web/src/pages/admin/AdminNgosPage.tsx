import {
  BadgeCheck,
  Calendar,
  FileText,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { NGO_VERIFICATIONS, type AdminNgo, type NgoVerification } from '@replate/shared';
import { Avatar } from '../../components/ui/Avatar.tsx';
import { TabHighlight } from '../../components/motion/TabHighlight.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, FullPageError, Spinner } from '../../components/ui/Feedback.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { VerificationBadge } from '../../components/ui/StatusBadge.tsx';
import { useToast } from '../../components/ui/toast-context.ts';
import { useAdminNgos, useSetVerification } from '../../features/admin/queries.ts';
import { errorMessage } from '../../lib/api.ts';
import { telLink } from '../../lib/contact.ts';
import { formatDateTime } from '../../lib/dates.ts';

const TABS: { value: NgoVerification | 'all'; label: string }[] = [
  { value: 'pending', label: 'Waiting' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

interface PendingChange {
  ngo: AdminNgo;
  verification: NgoVerification;
}

export function AdminNgosPage() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.find((item) => item.value === params.get('show'))?.value ?? 'pending';
  const ngos = useAdminNgos(tab === 'all' ? undefined : tab);
  const setVerification = useSetVerification();
  const toast = useToast();
  const [pending, setPending] = useState<PendingChange | null>(null);

  async function apply({ ngo, verification }: PendingChange) {
    try {
      await setVerification.mutateAsync({ id: ngo.id, verification });
      toast.show(
        verification === 'verified'
          ? `${ngo.displayName} is verified and can now claim donations.`
          : verification === 'rejected'
            ? `${ngo.displayName} was rejected.`
            : `${ngo.displayName} is back in the waiting list.`,
        verification === 'verified' ? 'success' : 'info',
      );
    } catch (error) {
      toast.show(errorMessage(error), 'error');
    } finally {
      setPending(null);
    }
  }

  const list = ngos.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <title>NGO verification · RePlate</title>
      <p className="text-xs font-bold tracking-[0.22em] text-moss uppercase">Admin</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight text-forest">NGO verification</h1>
      <p className="mt-2 max-w-2xl text-forest/65">
        Only verified NGOs can see and claim donations. Check each organisation's registration
        before verifying it.
      </p>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Show">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={tab === item.value}
            onClick={() =>
              setParams(item.value === 'pending' ? {} : { show: item.value }, { replace: true })
            }
            className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 active:scale-[0.97] ${
              tab === item.value
                ? 'text-cream'
                : 'border border-forest/20 text-forest hover:border-forest/50'
            }`}
          >
            {tab === item.value && <TabHighlight group="admin-tabs" />}
            <span className="relative">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6" aria-busy={ngos.isFetching}>
        {ngos.isPending ? (
          <div className="grid place-items-center py-20 text-moss">
            <Spinner className="size-8" label="Loading NGOs" />
          </div>
        ) : ngos.isError ? (
          <FullPageError message={errorMessage(ngos.error)} onRetry={() => void ngos.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title={tab === 'pending' ? 'No NGOs waiting' : 'No NGOs here'}
          >
            {tab === 'pending' ? 'New NGO sign-ups will appear here for review.' : undefined}
          </EmptyState>
        ) : (
          <ul
            key={tab}
            className={`stagger space-y-3 ${ngos.isPlaceholderData ? 'opacity-60' : ''}`}
          >
            {list.map((ngo) => (
              <li
                key={ngo.id}
                className="rounded-3xl bg-surface p-5 shadow-soft transition duration-300 hover:shadow-lift"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <Avatar name={ngo.displayName} />
                    <div className="min-w-0">
                      <VerificationBadge verification={ngo.verification} />
                      <h2 className="mt-2 font-display text-xl break-words text-forest">
                        {ngo.displayName}
                      </h2>
                      <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                        <Item icon={FileText} label="Registration number">
                          {ngo.registrationNumber ?? (
                            <span className="text-forest/50">Not given</span>
                          )}
                        </Item>
                        <Item icon={Phone} label="Phone">
                          {ngo.phone ? (
                            <a href={telLink(ngo.phone)} className="font-semibold text-moss">
                              {ngo.phone}
                            </a>
                          ) : (
                            <span className="text-forest/50">Not given</span>
                          )}
                        </Item>
                        <Item icon={MapPin} label="Address">
                          {ngo.address ?? <span className="text-forest/50">Not given</span>}
                        </Item>
                        <Item icon={Calendar} label={ngo.verifiedAt ? 'Verified' : 'Signed up'}>
                          {formatDateTime(ngo.verifiedAt ?? ngo.createdAt)}
                        </Item>
                      </dl>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {NGO_VERIFICATIONS.filter((value) => value !== ngo.verification).map(
                      (verification) => (
                        <Button
                          key={verification}
                          size="sm"
                          variant={
                            verification === 'verified'
                              ? 'primary'
                              : verification === 'rejected'
                                ? 'secondary'
                                : 'ghost'
                          }
                          onClick={() => setPending({ ngo, verification })}
                        >
                          <ActionIcon verification={verification} />
                          {verification === 'verified'
                            ? 'Verify'
                            : verification === 'rejected'
                              ? 'Reject'
                              : 'Move to waiting'}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.verification === 'verified'
            ? `Verify ${pending.ngo.displayName}?`
            : pending?.verification === 'rejected'
              ? `Reject ${pending.ngo.displayName}?`
              : `Move ${pending?.ngo.displayName ?? ''} back to waiting?`
        }
        confirmLabel={
          pending?.verification === 'verified'
            ? 'Verify'
            : pending?.verification === 'rejected'
              ? 'Reject'
              : 'Move to waiting'
        }
        destructive={pending?.verification === 'rejected'}
        busy={setVerification.isPending}
        onConfirm={() => pending && void apply(pending)}
        onCancel={() => setPending(null)}
      >
        {pending?.verification === 'verified'
          ? 'They will be able to see donations near them and claim them straight away.'
          : 'They will no longer be able to see or claim donations. Pickups they have already claimed are not affected.'}
      </ConfirmDialog>
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-forest/40" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-forest/55">{label}</dt>
        <dd className="break-words text-forest">{children}</dd>
      </div>
    </div>
  );
}

const ACTION_ICONS: Record<NgoVerification, LucideIcon> = {
  verified: BadgeCheck,
  rejected: XCircle,
  pending: RotateCcw,
};

function ActionIcon({ verification }: { verification: NgoVerification }) {
  const Icon = ACTION_ICONS[verification];
  return <Icon className="size-3.5" aria-hidden="true" />;
}
