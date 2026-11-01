import type { Role } from '@replate/shared';

export interface NavItem {
  to: string;
  label: string;
}

/** The main navigation for each role. */
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  donor: [{ to: '/donor', label: 'Dashboard' }],
  ngo: [{ to: '/ngo', label: 'Dashboard' }],
  admin: [{ to: '/admin', label: 'NGO verification' }],
};
