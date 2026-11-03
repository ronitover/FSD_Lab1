export const ROLES = ['donor', 'ngo', 'admin'] as const;

export type Role = (typeof ROLES)[number];
