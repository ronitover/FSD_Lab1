import type { PostgrestError } from '@supabase/supabase-js';
import { HttpError } from '../middleware/errors.ts';

/**
 * Turns a database error into the HTTP error the client should see.
 * The SQLSTATE codes here are the ones the migrations raise on purpose (see donation_workflow),
 * plus the constraint violations Postgres raises for bad data that got past validation.
 * Anything else is unexpected and surfaces as a 500.
 */
export function toHttpError(error: PostgrestError): Error {
  switch (error.code) {
    case '42501':
      return new HttpError(403, 'FORBIDDEN', permissionMessage(error));
    case 'P0002':
      return new HttpError(409, 'CONFLICT', error.message);
    case '23514':
    case '23502':
    case '22P02':
    case '22007':
    case '22008':
      return new HttpError(400, 'VALIDATION_ERROR', 'Some of the details are not valid.');
    case '23503':
      return new HttpError(400, 'VALIDATION_ERROR', 'A referenced record does not exist.');
    case 'PGRST116':
      return new HttpError(404, 'NOT_FOUND', 'Not found.');
    default:
      return Object.assign(new Error(`Database error ${error.code}: ${error.message}`), {
        cause: error,
      });
  }
}

// Messages raised by our own functions are written for users; Postgres' own
// "permission denied for table ..." is not, so it gets a generic one.
function permissionMessage(error: PostgrestError) {
  return error.message.startsWith('permission denied')
    ? 'You are not allowed to do that.'
    : error.message;
}

/** Returns the data from a Supabase call, or throws the matching HTTP error. */
export function unwrap<R extends { data: unknown; error: PostgrestError | null }>(
  result: R,
): Extract<R, { error: null }>['data'] {
  if (result.error) throw toHttpError(result.error);
  return result.data;
}
