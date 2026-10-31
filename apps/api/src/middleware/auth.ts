import type { Request, RequestHandler } from 'express';
import type { Role } from '@replate/shared';
import { authClient, createUserClient, type Db } from '../db/supabase.ts';
import { HttpError } from './errors.ts';

export interface AuthContext {
  userId: string;
  email: string | null;
  role: Role;
  /** Supabase client acting as this user. */
  db: Db;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthContext;
  }
}

/**
 * Checks the Supabase access token in the Authorization header and loads the user's role.
 * Signing in, signing up and refreshing tokens happen in the browser through Supabase Auth.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : null;
  if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue.');

  const { data, error } = await authClient.auth.getClaims(token);
  if (error || !data?.claims.sub) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Your session has expired. Sign in again.');
  }

  const db = createUserClient(token);
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', data.claims.sub)
    .maybeSingle();
  if (!profile) {
    // The profile is created at sign-up, so this means the account was deleted.
    throw new HttpError(401, 'UNAUTHENTICATED', 'This account no longer exists.');
  }

  req.auth = {
    userId: data.claims.sub,
    email: typeof data.claims.email === 'string' ? data.claims.email : null,
    role: profile.role,
    db,
  };
  next();
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    const { role } = authOf(req);
    if (!roles.includes(role)) {
      throw new HttpError(
        403,
        'FORBIDDEN',
        `This is only available to ${roles.join(' or ')} accounts.`,
      );
    }
    next();
  };
}

/** The signed-in user for a request that went through requireAuth. */
export function authOf(req: Request): AuthContext {
  if (!req.auth) throw new Error('authOf() used on a route without requireAuth');
  return req.auth;
}
