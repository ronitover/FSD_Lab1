import { describe, expect, it } from 'vitest';
import { newPasswordSchema, signUpSchema } from '../src/auth.ts';

const valid = {
  role: 'ngo',
  displayName: '  Annapurna Trust ',
  email: ' Team@Annapurna.ORG ',
  password: 'correct horse',
  phone: '',
  registrationNumber: ' ',
};

describe('signUpSchema', () => {
  it('normalises text and turns blank optional fields into null', () => {
    expect(signUpSchema.parse(valid)).toEqual({
      role: 'ngo',
      displayName: 'Annapurna Trust',
      email: 'team@annapurna.org',
      password: 'correct horse',
      phone: null,
      registrationNumber: null,
    });
  });

  it('does not allow signing up as an admin', () => {
    expect(signUpSchema.safeParse({ ...valid, role: 'admin' }).success).toBe(false);
  });

  it('rejects short passwords, bad emails and bad phone numbers', () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: 'short',
      email: 'not-an-email',
      phone: 'call me',
    });
    expect(result.success).toBe(false);
    const fields = result.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(expect.arrayContaining(['password', 'email', 'phone']));
  });
});

describe('newPasswordSchema', () => {
  it('requires the confirmation to match', () => {
    const result = newPasswordSchema.safeParse({
      password: 'correct horse',
      confirmPassword: 'correct horses',
    });
    expect(result.error?.issues[0]?.path).toEqual(['confirmPassword']);
  });
});
