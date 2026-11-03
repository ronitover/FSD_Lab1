import { useState, type ReactNode } from 'react';
import type { Donation } from '@replate/shared';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { useToast } from '../../components/ui/toast-context.ts';
import { ApiRequestError, errorMessage } from '../../lib/api.ts';
import { formatDateTime } from '../../lib/dates.ts';
import { formatQuantity } from '../../lib/labels.ts';
import { useDeleteDonation, useDonationAction, type DonationAction } from './queries.ts';

export type ConfirmableAction = DonationAction | 'delete';

/** What the dialogs need to know about a donation. Fits both full and nearby donations. */
type Target = Pick<
  Donation,
  'id' | 'title' | 'quantity' | 'quantityUnit' | 'pickupAddress' | 'expiresAt'
> & {
  status?: Donation['status'];
};

interface ActionCopy {
  title: string;
  body: (donation: Target) => ReactNode;
  confirm: string;
  success: string;
  destructive?: boolean;
}

const COPY: Record<ConfirmableAction, ActionCopy> = {
  claim: {
    title: 'Claim this donation?',
    body: (donation) => (
      <>
        You are committing to collect{' '}
        <strong>{formatQuantity(donation.quantity, donation.quantityUnit)}</strong> from{' '}
        {donation.pickupAddress} by <strong>{formatDateTime(donation.expiresAt)}</strong>. The donor
        will see your organisation's name and phone number.
      </>
    ),
    confirm: 'Claim',
    success: "Claimed. The donor's contact details are on this page.",
  },
  release: {
    title: 'Give this donation back?',
    body: () =>
      'It becomes available to other NGOs again. If you had already spoken to the donor, let them know.',
    confirm: 'Release claim',
    success: 'Released. Other NGOs can now claim it.',
    destructive: true,
  },
  collect: {
    title: 'Mark as collected?',
    body: () => 'Confirm that you have picked up the food. This cannot be undone.',
    confirm: 'Mark collected',
    success: 'Marked as collected. Thank you!',
  },
  cancel: {
    title: 'Cancel this donation?',
    body: (donation) =>
      donation.status === 'claimed'
        ? 'An NGO has already claimed this and may be on the way. Let them know before you cancel.'
        : 'NGOs will no longer see it. You can delete it afterwards.',
    confirm: 'Cancel donation',
    success: 'Donation cancelled.',
    destructive: true,
  },
  delete: {
    title: 'Delete this donation?',
    body: () => 'It will be removed from RePlate for good, along with its history.',
    confirm: 'Delete',
    success: 'Donation deleted.',
    destructive: true,
  },
};

interface Pending {
  action: ConfirmableAction;
  donation: Target;
  onSuccess?: () => void;
}

/**
 * Confirm-then-run for every donation action. `request` opens the dialog; render `dialog` once.
 * Success and failure are reported as toasts.
 */
export function useDonationActions() {
  const toast = useToast();
  const statusChange = useDonationAction();
  const remove = useDeleteDonation();
  const [pending, setPending] = useState<Pending | null>(null);

  async function run({ action, donation, onSuccess }: Pending) {
    try {
      if (action === 'delete') await remove.mutateAsync(donation.id);
      else await statusChange.mutateAsync({ id: donation.id, action });
      toast.show(
        COPY[action].success,
        action === 'collect' || action === 'claim' ? 'success' : 'info',
      );
      onSuccess?.();
    } catch (error) {
      const taken = action === 'claim' && error instanceof ApiRequestError && error.status === 409;
      toast.show(taken ? 'Another NGO claimed this a moment ago.' : errorMessage(error), 'error');
    } finally {
      setPending(null);
    }
  }

  const busy = statusChange.isPending || remove.isPending;
  const copy = pending ? COPY[pending.action] : null;

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={copy?.title ?? ''}
      confirmLabel={copy?.confirm ?? ''}
      destructive={copy?.destructive}
      busy={busy}
      onConfirm={() => pending && void run(pending)}
      onCancel={() => setPending(null)}
    >
      {pending && copy?.body(pending.donation)}
    </ConfirmDialog>
  );

  return {
    request: (action: ConfirmableAction, donation: Target, onSuccess?: () => void) =>
      setPending({ action, donation, onSuccess }),
    dialog,
  };
}
