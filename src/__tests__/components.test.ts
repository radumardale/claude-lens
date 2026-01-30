import { describe, it, expect } from 'vitest';
import {
  isMarkdownFile,
  parseMarkdownFilename,
  parseSymlinkFilename,
} from '../utils/components.js';

describe('isMarkdownFile', () => {
  it('returns true for .md files', () => {
    expect(isMarkdownFile('agent.md')).toBe(true);
  });

  it('returns true for .md.disabled files', () => {
    expect(isMarkdownFile('agent.md.disabled')).toBe(true);
  });

  it('returns false for non-markdown files', () => {
    expect(isMarkdownFile('agent.txt')).toBe(false);
    expect(isMarkdownFile('agent.json')).toBe(false);
    expect(isMarkdownFile('README')).toBe(false);
  });

  it('returns false for files with .md in the middle', () => {
    expect(isMarkdownFile('agent.md.bak')).toBe(false);
    expect(isMarkdownFile('agent.md.disabled.bak')).toBe(false);
  });
});

describe('parseMarkdownFilename', () => {
  it('parses enabled .md file', () => {
    const result = parseMarkdownFilename('agent.md');
    expect(result).toEqual({ name: 'agent', enabled: true, isValid: true });
  });

  it('parses disabled .md.disabled file', () => {
    const result = parseMarkdownFilename('agent.md.disabled');
    expect(result).toEqual({ name: 'agent', enabled: false, isValid: true });
  });

  it('handles names with hyphens', () => {
    const result = parseMarkdownFilename('my-cool-agent.md');
    expect(result).toEqual({ name: 'my-cool-agent', enabled: true, isValid: true });
  });

  it('handles names with hyphens and disabled', () => {
    const result = parseMarkdownFilename('my-cool-agent.md.disabled');
    expect(result).toEqual({ name: 'my-cool-agent', enabled: false, isValid: true });
  });

  it('handles names with dots', () => {
    const result = parseMarkdownFilename('my.dotted.name.md');
    expect(result).toEqual({ name: 'my.dotted.name', enabled: true, isValid: true });
  });

  it('handles names with dots and disabled', () => {
    const result = parseMarkdownFilename('my.dotted.name.md.disabled');
    expect(result).toEqual({ name: 'my.dotted.name', enabled: false, isValid: true });
  });

  it('returns invalid for non-markdown files', () => {
    const result = parseMarkdownFilename('agent.txt');
    expect(result.isValid).toBe(false);
  });

  it('handles uppercase extensions', () => {
    const result = parseMarkdownFilename('agent.MD');
    expect(result.isValid).toBe(false);
  });

  it('handles empty name', () => {
    const result = parseMarkdownFilename('.md');
    expect(result).toEqual({ name: '', enabled: true, isValid: true });
  });
});

describe('parseSymlinkFilename', () => {
  it('parses enabled symlink', () => {
    const result = parseSymlinkFilename('my-skill');
    expect(result).toEqual({ name: 'my-skill', enabled: true, isValid: true });
  });

  it('parses disabled symlink', () => {
    const result = parseSymlinkFilename('my-skill.disabled');
    expect(result).toEqual({ name: 'my-skill', enabled: false, isValid: true });
  });

  it('handles names with dots', () => {
    const result = parseSymlinkFilename('my.dotted.skill');
    expect(result).toEqual({ name: 'my.dotted.skill', enabled: true, isValid: true });
  });

  it('handles names with dots and disabled', () => {
    const result = parseSymlinkFilename('my.dotted.skill.disabled');
    expect(result).toEqual({ name: 'my.dotted.skill', enabled: false, isValid: true });
  });

  it('handles names with hyphens', () => {
    const result = parseSymlinkFilename('my-cool-skill');
    expect(result).toEqual({ name: 'my-cool-skill', enabled: true, isValid: true });
  });

  it('only removes .disabled suffix, not multiple', () => {
    const result = parseSymlinkFilename('skill.disabled.disabled');
    expect(result).toEqual({ name: 'skill.disabled', enabled: false, isValid: true });
  });

  it('handles empty name', () => {
    const result = parseSymlinkFilename('.disabled');
    expect(result).toEqual({ name: '', enabled: false, isValid: true });
  });
});
