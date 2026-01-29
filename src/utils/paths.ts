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

export function getUserConfigPath(): string {
  return join(homedir(), '.claude.json');
}

/**
 * @deprecated This function breaks paths that contain dashes (e.g., "claude-lens").
 * Use extractProjectPath() from scanner/projects.ts instead, which reads the actual
 * path from session data.
 */
export function decodeProjectPath(escapedPath: string): string {
  return escapedPath.replace(/-/g, '/');
}

export function encodeProjectPath(path: string): string {
  return path.replace(/\//g, '-');
}

export function getProjectAgentsDir(projectPath: string): string {
  return join(projectPath, '.claude', 'agents');
}

export function getProjectCommandsDir(projectPath: string): string {
  return join(projectPath, '.claude', 'commands');
}

export function getProjectSkillsDir(projectPath: string): string {
  return join(projectPath, '.claude', 'skills');
}
