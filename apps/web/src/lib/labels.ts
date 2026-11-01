import type { DonationStatus, NgoVerification, Role } from '@replate/shared';

export const ROLE_LABELS: Record<Role, string> = {
  donor: 'Donor',
  ngo: 'NGO',
  admin: 'Admin',
};

export const STATUS_LABELS: Record<DonationStatus, string> = {
  available: 'Available',
  claimed: 'Claimed',
  collected: 'Collected',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const VERIFICATION_LABELS: Record<NgoVerification, string> = {
  pending: 'Awaiting verification',
  verified: 'Verified',
  rejected: 'Rejected',
};
