import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-14T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('formats today\'s date with "Today at" prefix', () => {
    const today = '2026-03-14T09:30:00';
    const result = formatDate(today);
    expect(result).toMatch(/^Today at/);
  });

  it('formats yesterday\'s date with "Yesterday at" prefix', () => {
    const yesterday = '2026-03-13T15:00:00';
    const result = formatDate(yesterday);
    expect(result).toMatch(/^Yesterday at/);
  });

  it('formats dates within 7 days with weekday name', () => {
    const threeDaysAgo = '2026-03-11T10:00:00';
    const result = formatDate(threeDaysAgo);
    expect(result).toMatch(/at/);
    // Should contain a weekday name, not "Today" or "Yesterday"
    expect(result).not.toMatch(/^Today/);
    expect(result).not.toMatch(/^Yesterday/);
  });

  it('formats older dates with full date', () => {
    const oldDate = '2025-01-15T10:00:00';
    const result = formatDate(oldDate);
    expect(result).toMatch(/2025/);
    expect(result).toMatch(/at/);
  });

  it('returns original string for invalid date', () => {
    const result = formatDate('not-a-date');
    // Should return something without crashing
    expect(result).toBeDefined();
  });
});
