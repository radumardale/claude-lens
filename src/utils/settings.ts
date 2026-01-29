import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import type { ClaudeLensSettings, EditorConfig } from '../types/index.js';

const KNOWN_EDITORS: Record<string, EditorConfig> = {
  vim: { command: 'vim', type: 'terminal' },
  nvim: { command: 'nvim', type: 'terminal' },
  nano: { command: 'nano', type: 'terminal' },
  micro: { command: 'micro', type: 'terminal' },
  emacs: { command: 'emacs', type: 'terminal' },
  code: { command: 'code', args: ['--wait'], type: 'gui' },
  subl: { command: 'subl', args: ['--wait'], type: 'gui' },
  atom: { command: 'atom', args: ['--wait'], type: 'gui' },
  zed: { command: 'zed', args: ['--wait'], type: 'gui' },
};

const TERMINAL_EDITORS = ['vim', 'nvim', 'nano', 'micro', 'emacs', 'vi'];

export function getClaudeLensDir(): string {
  return join(homedir(), '.claude-lens');
}

export function getClaudeLensSettingsPath(): string {
  return join(getClaudeLensDir(), 'settings.json');
}

export function ensureClaudeLensDir(): void {
  const dir = getClaudeLensDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function getDefaultSettings(): ClaudeLensSettings {
  return {
    version: 1,
    display: {
      lineNumbers: true,
      wordWrap: true,
    },
  };
}

export function loadSettings(): ClaudeLensSettings {
  const path = getClaudeLensSettingsPath();
  if (!existsSync(path)) {
    return getDefaultSettings();
  }

  try {
    const content = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(content) as Partial<ClaudeLensSettings>;
    const defaults = getDefaultSettings();
    return {
      version: 1,
      editor: parsed.editor,
      display: {
        lineNumbers: parsed.display?.lineNumbers ?? defaults.display!.lineNumbers,
        wordWrap: parsed.display?.wordWrap ?? defaults.display!.wordWrap,
      },
    };
  } catch {
    return getDefaultSettings();
  }
}

export function saveSettings(settings: ClaudeLensSettings): void {
  ensureClaudeLensDir();
  const path = getClaudeLensSettingsPath();
  writeFileSync(path, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function detectDefaultEditor(): EditorConfig | null {
  const visual = process.env.VISUAL;
  if (visual) {
    const editorName = visual.split('/').pop() ?? visual;
    const known = KNOWN_EDITORS[editorName];
    if (known) return known;
    const isTerminal = TERMINAL_EDITORS.some((e) => editorName.includes(e));
    return { command: visual, type: isTerminal ? 'terminal' : 'gui' };
  }

  const editor = process.env.EDITOR;
  if (editor) {
    const editorName = editor.split('/').pop() ?? editor;
    const known = KNOWN_EDITORS[editorName];
    if (known) return known;
    const isTerminal = TERMINAL_EDITORS.some((e) => editorName.includes(e));
    return { command: editor, type: isTerminal ? 'terminal' : 'gui' };
  }

  const preferredOrder = ['code', 'nvim', 'vim', 'nano'];
  for (const cmd of preferredOrder) {
    if (commandExists(cmd)) {
      return KNOWN_EDITORS[cmd];
    }
  }

  return null;
}

export function getEditorConfig(settings: ClaudeLensSettings): EditorConfig | null {
  if (settings.editor) {
    return settings.editor;
  }
  return detectDefaultEditor();
}

export function getEditorDisplayName(config: EditorConfig): string {
  const name = config.command.split('/').pop() ?? config.command;
  return name;
}

export function isTerminalEditor(config: EditorConfig): boolean {
  return config.type === 'terminal';
}
