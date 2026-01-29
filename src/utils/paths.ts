import { homedir } from 'node:os';
import { join } from 'node:path';

export function getClaudeHome(): string {
  return join(homedir(), '.claude');
}

export function getPluginsDir(): string {
  return join(getClaudeHome(), 'plugins');
}

export function getAgentsDir(): string {
  return join(getClaudeHome(), 'agents');
}

export function getCommandsDir(): string {
  return join(getClaudeHome(), 'commands');
}

export function getSkillsDir(): string {
  return join(getClaudeHome(), 'skills');
}

export function getProjectsDir(): string {
  return join(getClaudeHome(), 'projects');
}

export function getSettingsPath(): string {
  return join(getClaudeHome(), 'settings.json');
}

export function getInstalledPluginsPath(): string {
  return join(getPluginsDir(), 'installed_plugins.json');
}

export function getKnownMarketplacesPath(): string {
  return join(getPluginsDir(), 'known_marketplaces.json');
}

export function getPluginsCachePath(): string {
  return join(getPluginsDir(), 'cache');
}

export function getGlobalMcpPath(): string {
  return join(getClaudeHome(), '.mcp.json');
}

export function decodeProjectPath(escapedPath: string): string {
  return escapedPath.replace(/-/g, '/');
}

export function encodeProjectPath(path: string): string {
  return path.replace(/\//g, '-');
}
