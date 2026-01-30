import { existsSync, lstatSync, readlinkSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import type { ActionResult, McpServer, McpServerConfig } from '../types/index.js';
import { success, error } from './index.js';
import { moveToTrash } from './trash.js';
import { getAgentsDir, getCommandsDir, getSkillsDir, getProjectAgentsDir, getProjectCommandsDir, getProjectSkillsDir, getUserConfigPath, getGlobalMcpPath } from '../utils/paths.js';
import { getDisabledMcpsPath } from './mcps.js';

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

interface DisabledMcpEntry {
  disabled: true;
  config: McpServerConfig;
  scope: McpServer['scope'];
  projectPath?: string;
  pluginName?: string;
}

type DisabledMcpsRegistry = Record<string, DisabledMcpEntry>;

export async function deleteAgent(filePath: string): Promise<ActionResult> {
  if (!existsSync(filePath)) {
    return error(`Agent file not found: ${filePath}`);
  }

  const name = basename(filePath).replace(/\.md(\.disabled)?$/, '');
  const isGlobal = filePath.startsWith(getAgentsDir());

  let projectPath: string | undefined;
  if (!isGlobal) {
    const parts = filePath.split('/.claude/agents/');
    if (parts.length > 1) {
      projectPath = parts[0];
    }
  }

  return moveToTrash({
    type: 'agent',
    name,
    originalPath: filePath,
    scope: isGlobal ? 'global' : 'project',
    projectPath,
  });
}

export async function deleteCommand(filePath: string): Promise<ActionResult> {
  if (!existsSync(filePath)) {
    return error(`Command file not found: ${filePath}`);
  }

  const name = basename(filePath).replace(/\.md(\.disabled)?$/, '');
  const isGlobal = filePath.startsWith(getCommandsDir());

  let projectPath: string | undefined;
  if (!isGlobal) {
    const parts = filePath.split('/.claude/commands/');
    if (parts.length > 1) {
      projectPath = parts[0];
    }
  }

  return moveToTrash({
    type: 'command',
    name,
    originalPath: filePath,
    scope: isGlobal ? 'global' : 'project',
    projectPath,
  });
}

export async function deleteSkill(filePath: string): Promise<ActionResult> {
  if (!existsSync(filePath)) {
    return error(`Skill not found: ${filePath}`);
  }

  const name = basename(filePath).replace(/\.disabled$/, '');
  const isGlobal = filePath.startsWith(getSkillsDir());

  let projectPath: string | undefined;
  if (!isGlobal) {
    const parts = filePath.split('/.claude/skills/');
    if (parts.length > 1) {
      projectPath = parts[0];
    }
  }

  return moveToTrash({
    type: 'skill',
    name,
    originalPath: filePath,
    scope: isGlobal ? 'global' : 'project',
    projectPath,
  });
}

export async function deleteMcp(
  name: string,
  scope: McpServer['scope'],
  projectPath?: string,
  isDisabled?: boolean
): Promise<ActionResult> {
  if (scope === 'plugin') {
    return error(`Cannot delete plugin MCP "${name}" - delete the plugin instead`);
  }

  let mcpConfig: McpServerConfig | null = null;
  let configPath: string = '';

  if (isDisabled) {
    const result = await extractAndRemoveFromDisabledRegistry(name, scope, projectPath);
    if (!result.success) {
      return result;
    }
    mcpConfig = result.config!;
    configPath = 'disabled-mcps.json';
  } else {
    const result = await extractAndRemoveMcpConfig(name, scope, projectPath);
    if (!result.success) {
      return result;
    }
    mcpConfig = result.config!;
    configPath = result.configPath!;
  }

  return moveToTrash({
    type: 'mcp',
    name,
    originalPath: configPath,
    scope: scope === 'user' ? 'user' : scope === 'project' ? 'project' : 'global',
    projectPath,
    mcpConfig,
  });
}

interface ExtractResult extends ActionResult {
  config?: McpServerConfig;
  configPath?: string;
}

async function extractAndRemoveMcpConfig(
  name: string,
  scope: McpServer['scope'],
  projectPath?: string
): Promise<ExtractResult> {
  if (scope === 'user') {
    return extractAndRemoveUserMcp(name, projectPath);
  } else if (scope === 'project') {
    return extractAndRemoveProjectMcp(name, projectPath);
  } else if (scope === 'global') {
    return extractAndRemoveGlobalMcp(name);
  }
  return { ...error(`Unknown scope: ${scope}`) };
}

async function extractAndRemoveUserMcp(name: string, projectPath?: string): Promise<ExtractResult> {
  const configPath = getUserConfigPath();
  if (!existsSync(configPath)) {
    return { ...error(`User config not found`) };
  }

  try {
    const content = await readFile(configPath, 'utf-8');
    const config = JSON.parse(content) as UserConfigFile;

    let mcpConfig: McpServerConfig | undefined;

    if (projectPath) {
      const projectConfig = config.projects?.[projectPath];
      mcpConfig = projectConfig?.mcpServers?.[name];
      if (mcpConfig && projectConfig?.mcpServers) {
        delete projectConfig.mcpServers[name];
        if (Object.keys(projectConfig.mcpServers).length === 0) {
          delete projectConfig.mcpServers;
        }
      }
    } else {
      mcpConfig = config.mcpServers?.[name];
      if (mcpConfig && config.mcpServers) {
        delete config.mcpServers[name];
      }
    }

    if (mcpConfig) {
      await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
      return { success: true, message: '', config: mcpConfig, configPath };
    }

    return { ...error(`MCP "${name}" not found in user config`) };
  } catch (e) {
    return { ...error(`Failed to read user config: ${e}`) };
  }
}

async function extractAndRemoveProjectMcp(name: string, projectPath?: string): Promise<ExtractResult> {
  if (!projectPath) {
    return { ...error('Project path required for project-scoped MCP') };
  }

  const mcpPath = join(projectPath, '.mcp.json');
  if (!existsSync(mcpPath)) {
    return { ...error(`Project MCP config not found: ${mcpPath}`) };
  }

  try {
    const content = await readFile(mcpPath, 'utf-8');
    const config = JSON.parse(content) as McpConfigFile;

    const serversObj = config.mcpServers ?? config;
    const mcpConfig = (serversObj as Record<string, McpServerConfig>)[name];

    if (mcpConfig) {
      delete (serversObj as Record<string, McpServerConfig>)[name];
      await writeFile(mcpPath, JSON.stringify(config, null, 2) + '\n');
      return { success: true, message: '', config: mcpConfig, configPath: mcpPath };
    }

    return { ...error(`MCP "${name}" not found in project config`) };
  } catch (e) {
    return { ...error(`Failed to read project config: ${e}`) };
  }
}

async function extractAndRemoveGlobalMcp(name: string): Promise<ExtractResult> {
  const mcpPath = getGlobalMcpPath();
  if (!existsSync(mcpPath)) {
    return { ...error('Global MCP config not found') };
  }

  try {
    const content = await readFile(mcpPath, 'utf-8');
    const config = JSON.parse(content) as McpConfigFile;

    const serversObj = config.mcpServers ?? config;
    const mcpConfig = (serversObj as Record<string, McpServerConfig>)[name];

    if (mcpConfig) {
      delete (serversObj as Record<string, McpServerConfig>)[name];
      await writeFile(mcpPath, JSON.stringify(config, null, 2) + '\n');
      return { success: true, message: '', config: mcpConfig, configPath: mcpPath };
    }

    return { ...error(`MCP "${name}" not found in global config`) };
  } catch (e) {
    return { ...error(`Failed to read global config: ${e}`) };
  }
}

async function extractAndRemoveFromDisabledRegistry(
  name: string,
  scope: McpServer['scope'],
  projectPath?: string
): Promise<ExtractResult> {
  const registryPath = getDisabledMcpsPath();
  if (!existsSync(registryPath)) {
    return { ...error('Disabled MCPs registry not found') };
  }

  try {
    const content = await readFile(registryPath, 'utf-8');
    const registry = JSON.parse(content) as DisabledMcpsRegistry;

    let foundKey: string | null = null;
    let foundEntry: DisabledMcpEntry | null = null;

    for (const [key, entry] of Object.entries(registry)) {
      if (!key.endsWith(`:${name}`)) continue;

      if (entry.scope === scope) {
        if (projectPath && entry.projectPath === projectPath) {
          foundKey = key;
          foundEntry = entry;
          break;
        } else if (!projectPath && !entry.projectPath) {
          foundKey = key;
          foundEntry = entry;
          break;
        } else if (!projectPath) {
          foundKey = key;
          foundEntry = entry;
          break;
        }
      }
    }

    if (foundKey && foundEntry) {
      delete registry[foundKey];
      await writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
      return { success: true, message: '', config: foundEntry.config, configPath: registryPath };
    }

    return { ...error(`MCP "${name}" not found in disabled registry`) };
  } catch (e) {
    return { ...error(`Failed to read disabled registry: ${e}`) };
  }
}
