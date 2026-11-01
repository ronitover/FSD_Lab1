import type { ApiError } from '@replate/shared';
import { config } from '../config.ts';
import { auth } from './supabase.ts';

/** An error from the API, carrying its status and code so screens can react to specific cases. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

/** Calls the RePlate API as the signed-in user. `path` is relative to /api, e.g. `/me`. */
export async function api<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}) {
  // getSession refreshes the access token first if it has expired.
  const { data } = await auth.getSession();
  const token = data.session?.access_token;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(`${config.apiUrl}/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiRequestError(0, 'NETWORK', 'Could not reach RePlate. Check your connection.');
  }

  if (res.status === 204) return undefined as T;

  const payload: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (payload as Partial<ApiError> | null)?.error;
    // A rejected token means the session is gone (revoked, or the user was deleted): sign out locally.
    if (res.status === 401 && token) void auth.signOut({ scope: 'local' });
    throw new ApiRequestError(
      res.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? 'Something went wrong. Please try again.',
    );
  }
  return payload as T;
}

/** A message that is safe to show for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) return error.message;
  return 'Something went wrong. Please try again.';
}
