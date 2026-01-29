import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getGlobalMcpPath } from '../utils/paths.js';
import { getDisabledMcpsPath, getMcpRegistryKey } from '../actions/mcps.js';
import type { McpServer, McpConfigFile, McpServerConfig, Plugin } from '../types/index.js';

type DisabledMcpsRegistry = Record<string, boolean>;

export async function scanMcps(projectPaths: string[] = [], plugins: Plugin[] = []): Promise<McpServer[]> {
  const servers: McpServer[] = [];
  const disabledRegistry = await readDisabledRegistry();

  const globalServers = await scanGlobalMcp();
  const pluginServers = await scanPluginMcps(plugins);
  const projectServers = await scanProjectMcps(projectPaths);

  servers.push(...globalServers, ...pluginServers, ...projectServers);

  // Apply disabled status from registry
  for (const server of servers) {
    const key = getMcpRegistryKey(server);
    server.enabled = !disabledRegistry[key];
  }

  return servers;
}

async function readDisabledRegistry(): Promise<DisabledMcpsRegistry> {
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

async function scanGlobalMcp(): Promise<McpServer[]> {
  const mcpPath = getGlobalMcpPath();

  if (!existsSync(mcpPath)) {
    return [];
  }

  return parseMcpFile(mcpPath, 'global');
}

async function scanPluginMcps(plugins: Plugin[]): Promise<McpServer[]> {
  const servers: McpServer[] = [];

  for (const plugin of plugins) {
    const mcpPath = join(plugin.installPath, '.mcp.json');

    if (!existsSync(mcpPath)) {
      continue;
    }

    try {
      const pluginServers = await parseMcpFile(mcpPath, 'plugin', undefined, plugin.name);
      for (const server of pluginServers) {
        server.enabled = plugin.enabled;
      }
      servers.push(...pluginServers);
    } catch {
      // Continue with other plugins
    }
  }

  return servers;
}

async function scanProjectMcps(projectPaths: string[]): Promise<McpServer[]> {
  const servers: McpServer[] = [];

  for (const projectPath of projectPaths) {
    const mcpPath = join(projectPath, '.mcp.json');

    if (!existsSync(mcpPath)) continue;

    const projectServers = await parseMcpFile(mcpPath, 'project', projectPath);
    servers.push(...projectServers);
  }

  return servers;
}

async function parseMcpFile(
  filePath: string,
  scope: 'global' | 'project' | 'plugin',
  projectPath?: string,
  pluginName?: string
): Promise<McpServer[]> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const config = JSON.parse(content) as McpConfigFile;

    const serversConfig = config.mcpServers ?? config;
    const servers: McpServer[] = [];

    for (const [name, serverConfig] of Object.entries(serversConfig)) {
      if (typeof serverConfig !== 'object' || serverConfig === null) continue;

      const cfg = serverConfig as McpServerConfig;
      servers.push({
        name,
        type: cfg.type,
        url: cfg.url,
        command: cfg.command,
        args: cfg.args,
        headers: cfg.headers,
        scope,
        configPath: filePath,
        projectPath,
        pluginName,
        enabled: true, // Will be updated by scanMcps based on registry
      });
    }

    return servers;
  } catch {
    return [];
  }
}
