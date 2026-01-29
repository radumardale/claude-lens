import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { getSettingsPath } from '../utils/paths.js';
import type { ClaudeSettings } from '../types/index.js';

export async function scanSettings(): Promise<ClaudeSettings> {
  const settingsPath = getSettingsPath();

  if (!existsSync(settingsPath)) {
    return {};
  }

  try {
    const content = await readFile(settingsPath, 'utf-8');
    const settings = JSON.parse(content) as ClaudeSettings;
    return settings;
  } catch {
    return {};
  }
}
