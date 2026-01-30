import { describe, it, expect } from 'vitest';
import {
  getDefaultSettings,
  isTerminalEditor,
  getEditorDisplayName,
} from '../utils/settings.js';
import type { EditorConfig } from '../types/index.js';

describe('getDefaultSettings', () => {
  it('returns default settings object', () => {
    const defaults = getDefaultSettings();

    expect(defaults.version).toBe(1);
    expect(defaults.display).toBeDefined();
    expect(defaults.display?.lineNumbers).toBe(true);
    expect(defaults.display?.wordWrap).toBe(true);
    expect(defaults.editor).toBeUndefined();
  });

  it('returns a new object each call', () => {
    const defaults1 = getDefaultSettings();
    const defaults2 = getDefaultSettings();

    expect(defaults1).not.toBe(defaults2);
    expect(defaults1).toEqual(defaults2);
  });
});

describe('isTerminalEditor', () => {
  it('returns true for terminal type editors', () => {
    const config: EditorConfig = { command: 'vim', type: 'terminal' };
    expect(isTerminalEditor(config)).toBe(true);
  });

  it('returns false for GUI type editors', () => {
    const config: EditorConfig = { command: 'code', type: 'gui' };
    expect(isTerminalEditor(config)).toBe(false);
  });

  it('handles nvim as terminal editor', () => {
    const config: EditorConfig = { command: 'nvim', type: 'terminal' };
    expect(isTerminalEditor(config)).toBe(true);
  });

  it('handles VS Code as GUI editor', () => {
    const config: EditorConfig = {
      command: 'code',
      args: ['--wait'],
      type: 'gui',
    };
    expect(isTerminalEditor(config)).toBe(false);
  });
});

describe('getEditorDisplayName', () => {
  it('extracts name from simple command', () => {
    const config: EditorConfig = { command: 'vim', type: 'terminal' };
    expect(getEditorDisplayName(config)).toBe('vim');
  });

  it('extracts name from full path', () => {
    const config: EditorConfig = {
      command: '/usr/bin/vim',
      type: 'terminal',
    };
    expect(getEditorDisplayName(config)).toBe('vim');
  });

  it('extracts name from nested path', () => {
    const config: EditorConfig = {
      command: '/usr/local/bin/nvim',
      type: 'terminal',
    };
    expect(getEditorDisplayName(config)).toBe('nvim');
  });

  it('handles VS Code path on macOS', () => {
    const config: EditorConfig = {
      command: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
      type: 'gui',
    };
    expect(getEditorDisplayName(config)).toBe('code');
  });

  it('handles command without path', () => {
    const config: EditorConfig = { command: 'nano', type: 'terminal' };
    expect(getEditorDisplayName(config)).toBe('nano');
  });
});
