import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import type { ActionResult, McpServer, McpServerConfig } from '../types/index.js';
import { success, error } from './index.js';
import { scanMcps } from '../scanner/mcps.js';
import { scanProjects, getProjectPaths } from '../scanner/projects.js';
import { scanPlugins } from '../scanner/plugins.js';
import { scanSettings } from '../scanner/settings.js';
import { getUserConfigPath, getGlobalMcpPath } from '../utils/paths.js';

interface DisabledMcpEntry {
  disabled: true;
  config: McpServerConfig;
  scope: McpServer['scope'];
  projectPath?: string;
  pluginName?: string;
}

type DisabledMcpsRegistry = Record<string, DisabledMcpEntry>;

interface UserConfigFile {
  mcpServers?: Record<string, McpServerConfig>;
  projects?: Record<string, {
    mcpServers?: Record<string, McpServerConfig>;
  }>;
  [key: string]: unknown;
}

interface McpConfigFile {
  mcpServers?: Record<string, McpServerConfig>;
}

export function getClaudeLensDir(): string {
  return join(homedir(), '.claude-lens');
}

export function getDisabledMcpsPath(): string {
  return join(getClaudeLensDir(), 'disabled-mcps.json');
}

export function getMcpRegistryKey(server: McpServer): string {
  switch (server.scope) {
    case 'global':
      return `global:${server.name}`;
    case 'project':
      return `project:${server.projectPath}:${server.name}`;
    case 'plugin':
      return `plugin:${server.pluginName}:${server.name}`;
    case 'user':
      if (server.projectPath) {
        return `user:${server.projectPath}:${server.name}`;
      }
      return `user:global:${server.name}`;
  }
}

export async function enableMcp(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const registry = await readRegistry();

  // Find the disabled entry in registry
  const key = findDisabledKey(registry, name, projectPath);
  if (!key) {
    return error(`MCP server "${name}" is not disabled or not found`);
  }

  const entry = registry[key];

  // Restore the config to its source
  const restoreResult = await restoreMcpConfig(entry, name);
  if (!restoreResult.success) {
    return restoreResult;
  }

  // Remove from disabled registry
  delete registry[key];
  await writeRegistry(registry);

  return success(`Enabled MCP server: ${name}`);
}

export async function disableMcp(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const settings = await scanSettings();
  const plugins = await scanPlugins(settings);
  const projects = await scanProjects();
  const projectPaths = getProjectPaths(projects);
  const servers = await scanMcps(projectPaths, plugins);

  // Find the server
  const server = findServer(servers, name, projectPath);
  if (!server) {
    const context = projectPath ? ` in project ${projectPath}` : '';
    return error(`MCP server "${name}" not found${context}`);
  }

  // Plugin MCPs cannot be disabled (would break plugin)
  if (server.scope === 'plugin') {
    return error(`Cannot disable plugin MCP "${name}" - disable the plugin instead`);
  }

  const registry = await readRegistry();
  const key = getMcpRegistryKey(server);

  if (registry[key]) {
    return error(`MCP server "${name}" is already disabled`);
  }

  // Get the config and remove from source
  const config = await extractAndRemoveMcpConfig(server);
  if (!config) {
    return error(`Failed to extract config for MCP server "${name}"`);
  }

  // Save to disabled registry
  registry[key] = {
    disabled: true,
    config,
    scope: server.scope,
    projectPath: server.projectPath,
    pluginName: server.pluginName,
  };
  await writeRegistry(registry);

  return success(`Disabled MCP server: ${name}`);
}

function findServer(
  servers: McpServer[],
  name: string,
  projectPath?: string
): McpServer | null {
  for (const server of servers) {
    if (server.name !== name) continue;

    if (projectPath) {
      // Match servers for this specific project
      if ((server.scope === 'project' || server.scope === 'user') &&
          server.projectPath === projectPath) {
        return server;
      }
    } else {
      return server;
    }
  }
  return null;
}

function findDisabledKey(
  registry: DisabledMcpsRegistry,
  name: string,
  projectPath?: string
): string | null {
  for (const [key, entry] of Object.entries(registry)) {
    if (!key.endsWith(`:${name}`)) continue;

    if (projectPath) {
      if (entry.projectPath === projectPath) {
        return key;
      }
    } else {
      return key;
    }
  }
  return null;
}

async function extractAndRemoveMcpConfig(server: McpServer): Promise<McpServerConfig | null> {
  if (server.scope === 'user') {
    return extractAndRemoveUserMcp(server);
  } else if (server.scope === 'project') {
    return extractAndRemoveProjectMcp(server);
  } else if (server.scope === 'global') {
    return extractAndRemoveGlobalMcp(server);
  }
  return null;
}

async function extractAndRemoveUserMcp(server: McpServer): Promise<McpServerConfig | null> {
  const configPath = getUserConfigPath();
  if (!existsSync(configPath)) return null;

  try {
    const content = await readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as UserConfigFile;

    let mcpConfig: McpServerConfig | undefined;

    if (server.projectPath) {
      // Project-specific user MCP
      const projectConfig = config.projects?.[server.projectPath];
      mcpConfig = projectConfig?.mcpServers?.[server.name];
      if (mcpConfig && projectConfig?.mcpServers) {
        delete projectConfig.mcpServers[server.name];
        // Clean up empty objects
        if (Object.keys(projectConfig.mcpServers).length === 0) {
          delete projectConfig.mcpServers;
        }
      }
    } else {
      // Global user MCP
      mcpConfig = config.mcpServers?.[server.name];
      if (mcpConfig && config.mcpServers) {
        delete config.mcpServers[server.name];
      }
    }

    if (mcpConfig) {
      await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
      return mcpConfig;
    }
  } catch {
    return null;
  }

  return null;
}

async function extractAndRemoveProjectMcp(server: McpServer): Promise<McpServerConfig | null> {
  if (!server.projectPath) return null;

  const mcpPath = join(server.projectPath, '.mcp.json');
  if (!existsSync(mcpPath)) return null;

  try {
    const content = await readFile(mcpPath, 'utf-8');
    const config = JSON.parse(content) as McpConfigFile;

    const serversObj = config.mcpServers ?? config;
    const mcpConfig = (serversObj as Record<string, McpServerConfig>)[server.name];

    if (mcpConfig) {
      delete (serversObj as Record<string, McpServerConfig>)[server.name];
      await writeFile(mcpPath, JSON.stringify(config, null, 2) + '\n');
      return mcpConfig;
    }
  } catch {
    return null;
  }

  return null;
}

async function extractAndRemoveGlobalMcp(server: McpServer): Promise<McpServerConfig | null> {
  const mcpPath = getGlobalMcpPath();
  if (!existsSync(mcpPath)) return null;

  try {
    const content = await readFile(mcpPath, 'utf-8');
    const config = JSON.parse(content) as McpConfigFile;

    const serversObj = config.mcpServers ?? config;
    const mcpConfig = (serversObj as Record<string, McpServerConfig>)[server.name];

    if (mcpConfig) {
      delete (serversObj as Record<string, McpServerConfig>)[server.name];
      await writeFile(mcpPath, JSON.stringify(config, null, 2) + '\n');
      return mcpConfig;
    }
  } catch {
    return null;
  }

  return null;
}

async function restoreMcpConfig(entry: DisabledMcpEntry, name: string): Promise<ActionResult> {
  if (entry.scope === 'user') {
    return restoreUserMcp(entry, name);
  } else if (entry.scope === 'project') {
    return restoreProjectMcp(entry, name);
  } else if (entry.scope === 'global') {
    return restoreGlobalMcp(entry, name);
  }
  return error(`Unknown scope: ${entry.scope}`);
}

async function restoreUserMcp(entry: DisabledMcpEntry, name: string): Promise<ActionResult> {
  const configPath = getUserConfigPath();

  try {
    let config: UserConfigFile = {};
    if (existsSync(configPath)) {
      const content = await readFile(configPath, 'utf-8');
      config = JSON.parse(content) as UserConfigFile;
    }

    if (entry.projectPath) {
      // Project-specific user MCP
      if (!config.projects) config.projects = {};
      if (!config.projects[entry.projectPath]) config.projects[entry.projectPath] = {};
      if (!config.projects[entry.projectPath].mcpServers) {
        config.projects[entry.projectPath].mcpServers = {};
      }
      config.projects[entry.projectPath].mcpServers![name] = entry.config;
    } else {
      // Global user MCP
      if (!config.mcpServers) config.mcpServers = {};
      config.mcpServers[name] = entry.config;
    }

    await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
    return success('');
  } catch (e) {
    return error(`Failed to restore user MCP: ${e}`);
  }
}

async function restoreProjectMcp(entry: DisabledMcpEntry, name: string): Promise<ActionResult> {
  if (!entry.projectPath) {
    return error('Project path not found in disabled entry');
  }

  const mcpPath = join(entry.projectPath, '.mcp.json');

  try {
    let config: McpConfigFile = { mcpServers: {} };
    if (existsSync(mcpPath)) {
      const content = await readFile(mcpPath, 'utf-8');
      config = JSON.parse(content) as McpConfigFile;
    }

    if (!config.mcpServers) config.mcpServers = {};
    config.mcpServers[name] = entry.config;

    await writeFile(mcpPath, JSON.stringify(config, null, 2) + '\n');
    return success('');
  } catch (e) {
    return error(`Failed to restore project MCP: ${e}`);
  }
}

async function restoreGlobalMcp(entry: DisabledMcpEntry, name: string): Promise<ActionResult> {
  const mcpPath = getGlobalMcpPath();

  try {
    let config: McpConfigFile = { mcpServers: {} };
    if (existsSync(mcpPath)) {
      const content = await readFile(mcpPath, 'utf-8');
      config = JSON.parse(content) as McpConfigFile;
    }

    if (!config.mcpServers) config.mcpServers = {};
    config.mcpServers[name] = entry.config;

    await writeFile(mcpPath, JSON.stringify(config, null, 2) + '\n');
    return success('');
  } catch (e) {
    return error(`Failed to restore global MCP: ${e}`);
  }
}

async function readRegistry(): Promise<DisabledMcpsRegistry> {
  const registryPath = getDisabledMcpsPath();

  if (!existsSync(registryPath)) {
    return {};
  }

  try {
    const content = await readFile(registryPath, 'utf-8');
    return JSON.parse(content) as DisabledMcpsRegistry;
  } catch {
    return {};
  }
}

async function writeRegistry(registry: DisabledMcpsRegistry): Promise<void> {
  const registryPath = getDisabledMcpsPath();
  const dir = dirname(registryPath);

  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }

  await writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
}

export async function isServerDisabled(name: string, projectPath?: string): Promise<boolean> {
  const registry = await readRegistry();
  const key = findDisabledKey(registry, name, projectPath);
  return key !== null;
}

export async function getDisabledServers(): Promise<DisabledMcpsRegistry> {
  return readRegistry();
}
