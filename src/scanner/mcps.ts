import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getGlobalMcpPath, getUserConfigPath } from '../utils/paths.js';
import { getDisabledMcpsPath, getMcpRegistryKey } from '../actions/mcps.js';
import type { McpServer, McpConfigFile, McpServerConfig, Plugin } from '../types/index.js';

interface UserConfigFile {
  mcpServers?: Record<string, McpServerConfig>;
  projects?: Record<string, {
    mcpServers?: Record<string, McpServerConfig>;
  }>;
}

interface DisabledMcpEntry {
  disabled: true;
  config: McpServerConfig;
  scope: McpServer['scope'];
  projectPath?: string;
  pluginName?: string;
}

type DisabledMcpsRegistry = Record<string, DisabledMcpEntry>;

export async function scanMcps(projectPaths: string[] = [], plugins: Plugin[] = []): Promise<McpServer[]> {
  const servers: McpServer[] = [];

  const globalServers = await scanGlobalMcp();
  const pluginServers = await scanPluginMcps(plugins);
  const projectServers = await scanProjectMcps(projectPaths);
  const userServers = await scanUserMcps(projectPaths);
  const disabledServers = await scanDisabledMcps();

  servers.push(...globalServers, ...pluginServers, ...projectServers, ...userServers, ...disabledServers);

  return servers;
}

async function scanDisabledMcps(): Promise<McpServer[]> {
  const registry = await readDisabledRegistry();
  const servers: McpServer[] = [];

  for (const [key, entry] of Object.entries(registry)) {
    // Extract name from key (format: scope:...:name)
    const parts = key.split(':');
    const name = parts[parts.length - 1];

    servers.push({
      name,
      type: entry.config.type,
      url: entry.config.url,
      command: entry.config.command,
      args: entry.config.args,
      headers: entry.config.headers,
      scope: entry.scope,
      configPath: getDisabledMcpsPath(),
      projectPath: entry.projectPath,
      pluginName: entry.pluginName,
      enabled: false,
    });
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

async function scanUserMcps(projectPaths: string[]): Promise<McpServer[]> {
  const configPath = getUserConfigPath();

  if (!existsSync(configPath)) {
    return [];
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as UserConfigFile;
    const servers: McpServer[] = [];

    // Scan user-global MCPs
    if (config.mcpServers) {
      for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
        if (typeof serverConfig !== 'object' || serverConfig === null) continue;

        servers.push({
          name,
          type: serverConfig.type,
          url: serverConfig.url,
          command: serverConfig.command,
          args: serverConfig.args,
          headers: serverConfig.headers,
          scope: 'user',
          configPath,
          enabled: true,
        });
      }
    }

    // Scan user+project MCPs (only for known projects)
    if (config.projects) {
      for (const projectPath of projectPaths) {
        const projectConfig = config.projects[projectPath];
        if (!projectConfig?.mcpServers) continue;

        for (const [name, serverConfig] of Object.entries(projectConfig.mcpServers)) {
          if (typeof serverConfig !== 'object' || serverConfig === null) continue;

          servers.push({
            name,
            type: serverConfig.type,
            url: serverConfig.url,
            command: serverConfig.command,
            args: serverConfig.args,
            headers: serverConfig.headers,
            scope: 'user',
            configPath,
            projectPath,
            enabled: true,
          });
        }
      }
    }

    return servers;
  } catch {
    return [];
  }
}

async function parseMcpFile(
  filePath: string,
  scope: 'global' | 'project' | 'plugin' | 'user',
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
