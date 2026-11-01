import type { DonationStatus, NgoVerification } from '@replate/shared';
import { STATUS_LABELS, VERIFICATION_LABELS } from '../../lib/labels.ts';

const STATUS_STYLES: Record<DonationStatus, string> = {
  available: 'bg-moss/15 text-moss',
  claimed: 'bg-orange/15 text-orange',
  collected: 'bg-forest/10 text-forest',
  cancelled: 'bg-forest/5 text-forest/55',
  expired: 'bg-danger/10 text-danger',
};

const VERIFICATION_STYLES: Record<NgoVerification, string> = {
  pending: 'bg-orange/15 text-orange',
  verified: 'bg-moss/15 text-moss',
  rejected: 'bg-danger/10 text-danger',
};

function Badge({ className, children }: { className: string; children: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: DonationStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>;
}

export function VerificationBadge({ verification }: { verification: NgoVerification }) {
  return (
    <Badge className={VERIFICATION_STYLES[verification]}>{VERIFICATION_LABELS[verification]}</Badge>
  );
}
