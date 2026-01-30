import { existsSync, rmSync, lstatSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import type { ActionResult, McpServer, McpServerConfig } from '../types/index.js';
import { success, error } from './index.js';
import { getAgentsDir, getSkillsDir } from '../utils/paths.js';
import { getDisabledMcpsPath } from './mcps.js';

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

  try {
    rmSync(filePath);
    return success(`Permanently deleted agent: ${name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete agent: ${msg}`);
  }
}

export async function deleteCommand(filePath: string): Promise<ActionResult> {
  if (!existsSync(filePath)) {
    return error(`Command file not found: ${filePath}`);
  }

  const name = basename(filePath).replace(/\.md(\.disabled)?$/, '');

  try {
    rmSync(filePath);
    return success(`Permanently deleted command: ${name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete command: ${msg}`);
  }
}

export async function deleteSkill(filePath: string): Promise<ActionResult> {
  if (!existsSync(filePath)) {
    return error(`Skill not found: ${filePath}`);
  }

  const name = basename(filePath).replace(/\.disabled$/, '');

  try {
    const stats = lstatSync(filePath);
    if (stats.isDirectory()) {
      rmSync(filePath, { recursive: true });
    } else {
      rmSync(filePath);
    }
    return success(`Permanently deleted skill: ${name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete skill: ${msg}`);
  }
}

export async function deleteMcp(
  name: string,
  scope: McpServer['scope'],
  projectPath?: string
): Promise<ActionResult> {
  if (scope === 'plugin') {
    return error(`Cannot delete plugin MCP "${name}" - delete the plugin instead`);
  }

  const registryPath = getDisabledMcpsPath();
  if (!existsSync(registryPath)) {
    return error('Disabled MCPs registry not found');
  }

  try {
    const content = await readFile(registryPath, 'utf-8');
    const registry = JSON.parse(content) as DisabledMcpsRegistry;

    let foundKey: string | null = null;

    for (const [key, entry] of Object.entries(registry)) {
      if (!key.endsWith(`:${name}`)) continue;

      if (entry.scope === scope) {
        if (projectPath && entry.projectPath === projectPath) {
          foundKey = key;
          break;
        } else if (!projectPath && !entry.projectPath) {
          foundKey = key;
          break;
        } else if (!projectPath) {
          foundKey = key;
          break;
        }
      }
    }

    if (foundKey) {
      delete registry[foundKey];
      await writeFile(registryPath, JSON.stringify(registry, null, 2) + '\n');
      return success(`Permanently deleted MCP: ${name}`);
    }

    return error(`MCP "${name}" not found in disabled registry`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete MCP: ${msg}`);
  }
}
