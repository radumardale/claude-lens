import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import type { ActionResult, McpServer } from '../types/index.js';
import { success, error } from './index.js';
import { scanMcps } from '../scanner/mcps.js';
import { scanProjects, getProjectPaths } from '../scanner/projects.js';

type DisabledMcpsRegistry = Record<string, boolean>;

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
  }
}

export async function enableMcp(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const server = await findMcpServer(name, projectPath);
  if (!server) {
    const context = projectPath ? ` in project ${projectPath}` : '';
    return error(`MCP server "${name}" not found${context}`);
  }

  const registry = await readRegistry();
  const key = getMcpRegistryKey(server);

  if (!registry[key]) {
    return error(`MCP server "${name}" is already enabled`);
  }

  delete registry[key];
  await writeRegistry(registry);

  return success(`Enabled MCP server: ${name}`);
}

export async function disableMcp(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const server = await findMcpServer(name, projectPath);
  if (!server) {
    const context = projectPath ? ` in project ${projectPath}` : '';
    return error(`MCP server "${name}" not found${context}`);
  }

  const registry = await readRegistry();
  const key = getMcpRegistryKey(server);

  if (registry[key]) {
    return error(`MCP server "${name}" is already disabled`);
  }

  registry[key] = true;
  await writeRegistry(registry);

  return success(`Disabled MCP server: ${name}`);
}

async function findMcpServer(
  name: string,
  projectPath?: string
): Promise<McpServer | null> {
  const projects = await scanProjects();
  const projectPaths = getProjectPaths(projects);
  const servers = await scanMcps(projectPaths);

  for (const server of servers) {
    if (server.name !== name) continue;

    // If projectPath specified, only match project-scoped servers
    if (projectPath) {
      if (server.scope === 'project' && server.projectPath === projectPath) {
        return server;
      }
    } else {
      // Return first match (prefer global, then plugin, then project)
      return server;
    }
  }

  return null;
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

export async function isServerDisabled(server: McpServer): Promise<boolean> {
  const registry = await readRegistry();
  const key = getMcpRegistryKey(server);
  return !!registry[key];
}
