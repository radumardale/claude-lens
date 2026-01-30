import { describe, it, expect } from 'vitest';
import { findFileByName, success, error } from '../actions/index.js';

describe('findFileByName', () => {
  const files = [
    '/path/to/agents/code-reviewer.md',
    '/path/to/agents/test-runner.md.disabled',
    '/path/to/agents/helper.md',
  ];

  it('finds file with exact extension match', () => {
    const result = findFileByName(files, 'code-reviewer', ['.md']);
    expect(result).toBe('/path/to/agents/code-reviewer.md');
  });

  it('finds disabled file with .md.disabled extension', () => {
    const result = findFileByName(files, 'test-runner', ['.md']);
    expect(result).toBe('/path/to/agents/test-runner.md.disabled');
  });

  it('returns null when no match found', () => {
    const result = findFileByName(files, 'nonexistent', ['.md']);
    expect(result).toBeNull();
  });

  it('tries multiple extensions in order', () => {
    const mixedFiles = [
      '/path/to/file.txt',
      '/path/to/file.md',
    ];
    const result = findFileByName(mixedFiles, 'file', ['.txt', '.md']);
    expect(result).toBe('/path/to/file.txt');
  });

  it('handles files with similar names without false matching', () => {
    const similarFiles = [
      '/path/to/agent.md',
      '/path/to/agent-helper.md',
      '/path/to/my-agent.md',
    ];
    const result = findFileByName(similarFiles, 'agent', ['.md']);
    expect(result).toBe('/path/to/agent.md');
  });

  it('does not match partial names', () => {
    const files = ['/path/to/code-reviewer.md'];
    const result = findFileByName(files, 'code', ['.md']);
    expect(result).toBeNull();
  });

  it('works with files in root directory', () => {
    const rootFiles = ['agent.md', 'command.md.disabled'];
    const result = findFileByName(rootFiles, 'command', ['.md']);
    expect(result).toBe('command.md.disabled');
  });

  it('handles empty file list', () => {
    const result = findFileByName([], 'agent', ['.md']);
    expect(result).toBeNull();
  });

  it('handles empty extensions list', () => {
    const result = findFileByName(files, 'code-reviewer', []);
    expect(result).toBeNull();
  });

  it('handles names with multiple hyphens', () => {
    const hyphenFiles = ['/path/to/my-cool-agent.md'];
    const result = findFileByName(hyphenFiles, 'my-cool-agent', ['.md']);
    expect(result).toBe('/path/to/my-cool-agent.md');
  });

  it('handles names with dots', () => {
    const dottedFiles = ['/path/to/agent.v2.md'];
    const result = findFileByName(dottedFiles, 'agent.v2', ['.md']);
    expect(result).toBe('/path/to/agent.v2.md');
  });
});

describe('success helper', () => {
  it('returns success result with message', () => {
    const result = success('Operation completed');
    expect(result).toEqual({ success: true, message: 'Operation completed' });
  });
});

describe('error helper', () => {
  it('returns error result with message', () => {
    const result = error('Something went wrong');
    expect(result).toEqual({ success: false, message: 'Something went wrong' });
  });
});
