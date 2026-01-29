import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { getSettingsPath, getInstalledPluginsPath } from '../utils/paths.js';
import type { ActionResult, InstalledPluginsFile } from '../types/index.js';
import { success, error } from './index.js';

export async function enablePlugin(name: string): Promise<ActionResult> {
  return togglePlugin(name, true);
}

export async function disablePlugin(name: string): Promise<ActionResult> {
  return togglePlugin(name, false);
}

async function togglePlugin(name: string, enable: boolean): Promise<ActionResult> {
  const pluginId = await findPluginId(name);
  if (!pluginId) {
    return error(`Plugin "${name}" not found`);
  }

  const settingsPath = getSettingsPath();
  let settings: Record<string, unknown> = {};

  if (existsSync(settingsPath)) {
    try {
      const content = await readFile(settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch {
      return error('Failed to read settings.json');
    }
  }

  const enabledPlugins = (settings.enabledPlugins as Record<string, boolean>) ?? {};
  enabledPlugins[pluginId] = enable;
  settings.enabledPlugins = enabledPlugins;

  try {
    await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    const action = enable ? 'Enabled' : 'Disabled';
    return success(`${action} plugin: ${pluginId}`);
  } catch {
    return error('Failed to write settings.json');
  }
}

async function findPluginId(name: string): Promise<string | null> {
  const installedPath = getInstalledPluginsPath();

  if (!existsSync(installedPath)) {
    return null;
  }

  try {
    const content = await readFile(installedPath, 'utf-8');
    const data = JSON.parse(content) as InstalledPluginsFile;

    for (const pluginId of Object.keys(data.plugins)) {
      // Exact match on full ID
      if (pluginId === name) {
        return pluginId;
      }

      // Match on name part (before @)
      const [pluginName] = pluginId.split('@');
      if (pluginName === name) {
        return pluginId;
      }
    }

    return null;
  } catch {
    return null;
  }
}
