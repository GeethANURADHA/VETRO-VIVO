import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('combines class names', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('handles conditional class names', () => {
    expect(cn('bg-red-500', true && 'text-white', false && 'hidden')).toBe('bg-red-500 text-white');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('px-2 py-1 bg-red-500', 'p-4')).toBe('bg-red-500 p-4');
  });
});
