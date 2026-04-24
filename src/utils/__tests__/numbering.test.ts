import { describe, expect, it } from 'vitest';
import { nextNumber } from '../numbering';

describe('nextNumber()', () => {
  it('returns INV-0001 when no previous number', () => {
    expect(nextNumber(undefined)).toBe('INV-0001');
    expect(nextNumber(null)).toBe('INV-0001');
    expect(nextNumber('')).toBe('INV-0001');
  });

  it('bumps a trailing counter with padding preserved', () => {
    expect(nextNumber('INV-0007')).toBe('INV-0008');
    expect(nextNumber('INV-0099')).toBe('INV-0100');
    expect(nextNumber('INV-9999')).toBe('INV-10000');
  });

  it('handles a non-digit suffix after the number', () => {
    expect(nextNumber('A-0099-X')).toBe('A-0100-X');
  });

  it('falls back to suffixing -2 when the input has no digits', () => {
    expect(nextNumber('draft')).toBe('draft-2');
  });

  it('supports custom prefixes and unpadded numbers', () => {
    expect(nextNumber('2026/42')).toBe('2026/43');
    expect(nextNumber('BILL-1')).toBe('BILL-2');
  });
});
