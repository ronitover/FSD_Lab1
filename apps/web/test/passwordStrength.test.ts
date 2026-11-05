import { describe, expect, it } from 'vitest';
import { passwordStrength } from '../src/lib/passwordStrength.ts';

describe('passwordStrength', () => {
  it('calls anything under the minimum too short', () => {
    expect(passwordStrength('Ab1!')).toEqual({ score: 0, label: 'Too short' });
  });

  it('rates a long single-kind password as weak', () => {
    expect(passwordStrength('abcdefgh').label).toBe('Weak');
  });

  it('rewards mixing kinds of characters', () => {
    expect(passwordStrength('abcdefg1').label).toBe('Okay');
    expect(passwordStrength('Abcdefg1').label).toBe('Strong');
  });

  it('rates long, mixed passwords as great', () => {
    expect(passwordStrength('Masala-Dosa-2026').label).toBe('Great');
  });
});
