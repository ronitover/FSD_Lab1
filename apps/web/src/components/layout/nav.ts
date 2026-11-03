import type { Role } from '@replate/shared';

export interface NavItem {
  to: string;
  label: string;
}

/** The main navigation for each role. */
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  donor: [
    { to: '/donor', label: 'Dashboard' },
    { to: '/donor/donations', label: 'My donations' },
    { to: '/donor/donations/new', label: 'Donate food' },
  ],
  ngo: [
    { to: '/ngo', label: 'Find food' },
    { to: '/ngo/pickups', label: 'My pickups' },
  ],
  admin: [{ to: '/admin', label: 'NGO verification' }],
};
