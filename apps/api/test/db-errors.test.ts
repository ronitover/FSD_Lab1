import type { PostgrestError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { toHttpError, unwrap } from '../src/db/errors.ts';
import { HttpError } from '../src/middleware/errors.ts';

function pgError(code: string, message = 'boom'): PostgrestError {
  return { code, message, details: '', hint: '', name: 'PostgrestError' } as PostgrestError;
}

describe('database error mapping', () => {
  it.each([
    ['42501', 403, 'FORBIDDEN'],
    ['P0002', 409, 'CONFLICT'],
    ['23514', 400, 'VALIDATION_ERROR'],
    ['22P02', 400, 'VALIDATION_ERROR'],
    ['23503', 400, 'VALIDATION_ERROR'],
    ['PGRST116', 404, 'NOT_FOUND'],
  ])('%s becomes HTTP %i', (code, status, httpCode) => {
    const error = toHttpError(pgError(code));
    expect(error).toBeInstanceOf(HttpError);
    expect((error as HttpError).status).toBe(status);
    expect((error as HttpError).code).toBe(httpCode);
  });

  it("keeps the message from RePlate's own functions", () => {
    const error = toHttpError(pgError('P0002', 'This donation is no longer available'));
    expect(error.message).toBe('This donation is no longer available');
  });

  it("hides Postgres' raw permission messages", () => {
    const error = toHttpError(pgError('42501', 'permission denied for table donations'));
    expect(error.message).toBe('You are not allowed to do that.');
  });

  it('treats unknown codes as unexpected (500)', () => {
    const error = toHttpError(pgError('XX000'));
    expect(error).not.toBeInstanceOf(HttpError);
  });

  it('unwrap returns data or throws', () => {
    expect(unwrap({ data: [1], error: null })).toEqual([1]);
    expect(() => unwrap({ data: null, error: pgError('P0002') })).toThrow(HttpError);
  });
});
