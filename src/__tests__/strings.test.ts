import { describe, it, expect } from 'vitest';
import { truncateString, shortenHomePath } from '../utils/strings.js';

describe('truncateString', () => {
  it('returns short strings unchanged', () => {
    expect(truncateString('hello', 10)).toBe('hello');
  });

  it('returns string at exact boundary unchanged', () => {
    expect(truncateString('1234567890', 10)).toBe('1234567890');
  });

  it('truncates strings over the boundary with ellipsis', () => {
    expect(truncateString('12345678901', 10)).toBe('1234567...');
  });

  it('handles maxLength of 3 (minimum for ellipsis)', () => {
    expect(truncateString('hello', 3)).toBe('...');
  });

  it('handles empty string', () => {
    expect(truncateString('', 10)).toBe('');
  });

  it('handles very long strings', () => {
    const longString = 'a'.repeat(100);
    const result = truncateString(longString, 40);
    expect(result.length).toBe(40);
    expect(result.endsWith('...')).toBe(true);
  });

  it('preserves content before truncation point', () => {
    expect(truncateString('abcdefghijk', 8)).toBe('abcde...');
  });
});

describe('shortenHomePath', () => {
  it('shortens /Users/username paths to ~', () => {
    expect(shortenHomePath('/Users/john/projects/app')).toBe('~/projects/app');
  });

  it('shortens paths with different usernames', () => {
    expect(shortenHomePath('/Users/alice/work')).toBe('~/work');
  });

  it('leaves non-home paths unchanged', () => {
    expect(shortenHomePath('/var/log/app.log')).toBe('/var/log/app.log');
  });

  it('leaves relative paths unchanged', () => {
    expect(shortenHomePath('src/index.ts')).toBe('src/index.ts');
  });

  it('handles /Users/ at start but no username after', () => {
    expect(shortenHomePath('/Users/')).toBe('/Users/');
  });

  it('does not replace /Users/ in the middle of path', () => {
    expect(shortenHomePath('/var/Users/test')).toBe('/var/Users/test');
  });

  it('handles path that is just home directory', () => {
    expect(shortenHomePath('/Users/john')).toBe('~');
  });

  it('handles empty string', () => {
    expect(shortenHomePath('')).toBe('');
  });
});
