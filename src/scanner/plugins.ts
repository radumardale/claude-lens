import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  getInstalledPluginsPath,
  getKnownMarketplacesPath,
} from '../utils/paths.js';
import type {
  Plugin,
  Marketplace,
  InstalledPluginsFile,
  PluginMetadata,
  ClaudeSettings,
} from '../types/index.js';

interface RawMarketplaceEntry {
  source: { source: 'github'; repo: string };
  installLocation: string;
  lastUpdated: string;
}

export async function scanMarketplaces(): Promise<Marketplace[]> {
  const marketplacesPath = getKnownMarketplacesPath();

  if (!existsSync(marketplacesPath)) {
    return [];
  }

  try {
    const content = await readFile(marketplacesPath, 'utf-8');
    const raw = JSON.parse(content) as Record<string, RawMarketplaceEntry>;

    return Object.entries(raw).map(([name, entry]) => ({
      name,
      source: entry.source,
      installLocation: entry.installLocation,
      lastUpdated: entry.lastUpdated,
    }));
  } catch {
    return [];
  }
}

export async function scanPlugins(
  settings: ClaudeSettings
): Promise<Plugin[]> {
  const installedPath = getInstalledPluginsPath();

  if (!existsSync(installedPath)) {
    return [];
  }

  try {
    const content = await readFile(installedPath, 'utf-8');
    const data = JSON.parse(content) as InstalledPluginsFile;
    const enabledPlugins = settings.enabledPlugins ?? {};

    const plugins: Plugin[] = [];

    for (const [pluginId, entries] of Object.entries(data.plugins)) {
      const latestEntry = entries[0];
      if (!latestEntry) continue;

      const [pluginName, marketplace] = pluginId.split('@');
      const metadata = await readPluginMetadata(latestEntry.installPath);

      plugins.push({
        id: pluginId,
        name: metadata?.name ?? pluginName ?? pluginId,
        description: metadata?.description,
        version: metadata?.version ?? latestEntry.version,
        marketplace: marketplace ?? 'unknown',
        installPath: latestEntry.installPath,
        installedAt: latestEntry.installedAt,
        lastUpdated: latestEntry.lastUpdated,
        enabled: enabledPlugins[pluginId] ?? true,
      });
    }

    return plugins;
  } catch {
    return [];
  }
}

async function readPluginMetadata(
  installPath: string
): Promise<PluginMetadata | null> {
  const pluginJsonPath = join(installPath, '.claude-plugin', 'plugin.json');

  if (!existsSync(pluginJsonPath)) {
    return null;
  }

  try {
    const content = await readFile(pluginJsonPath, 'utf-8');
    return JSON.parse(content) as PluginMetadata;
  } catch {
    return null;
  }
}
