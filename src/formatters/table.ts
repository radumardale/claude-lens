import Table from 'cli-table3';
import chalk from 'chalk';
import type { Plugin, Agent, Command, Skill, McpServer, Project, Marketplace } from '../types/index.js';

export function formatPluginsTable(plugins: Plugin[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Version'),
      chalk.cyan('Marketplace'),
      chalk.cyan('Enabled'),
    ],
  });

  for (const plugin of plugins) {
    table.push([
      plugin.name,
      plugin.version,
      plugin.marketplace,
      plugin.enabled ? chalk.green('Yes') : chalk.red('No'),
    ]);
  }

  return table.toString();
}

export function formatAgentsTable(agents: Agent[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Model'),
      chalk.cyan('Color'),
      chalk.cyan('Enabled'),
    ],
  });

  for (const agent of agents) {
    table.push([
      agent.name,
      agent.model ?? '-',
      agent.color ?? '-',
      agent.enabled ? chalk.green('Yes') : chalk.red('No'),
    ]);
  }

  return table.toString();
}

export function formatCommandsTable(commands: Command[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Preview'),
      chalk.cyan('Enabled'),
    ],
  });

  for (const command of commands) {
    const preview = command.content.slice(0, 50) + (command.content.length > 50 ? '...' : '');
    table.push([
      command.name,
      preview,
      command.enabled ? chalk.green('Yes') : chalk.red('No'),
    ]);
  }

  return table.toString();
}

export function formatSkillsTable(skills: Skill[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Source'),
      chalk.cyan('Plugin'),
      chalk.cyan('Enabled'),
    ],
  });

  for (const skill of skills) {
    table.push([
      skill.name,
      skill.source,
      skill.pluginName ?? '-',
      skill.enabled ? chalk.green('Yes') : chalk.red('No'),
    ]);
  }

  return table.toString();
}

export function formatMcpsTable(mcps: McpServer[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Type'),
      chalk.cyan('Scope'),
      chalk.cyan('URL/Command'),
    ],
  });

  for (const mcp of mcps) {
    const endpoint = mcp.url ?? mcp.command ?? '-';
    const truncated = endpoint.length > 40 ? endpoint.slice(0, 37) + '...' : endpoint;
    table.push([
      mcp.name,
      mcp.type ?? '-',
      mcp.scope,
      truncated,
    ]);
  }

  return table.toString();
}

export function formatProjectsTable(projects: Project[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Path'),
      chalk.cyan('MCP'),
      chalk.cyan('CLAUDE.md'),
      chalk.cyan('Sessions'),
    ],
  });

  for (const project of projects) {
    const shortPath = project.path.replace(/^\/Users\/[^/]+/, '~');
    table.push([
      shortPath,
      project.hasMcp ? chalk.green('Yes') : '-',
      project.hasClaudeMd ? chalk.green('Yes') : '-',
      project.sessionCount?.toString() ?? '-',
    ]);
  }

  return table.toString();
}

export function formatMarketplacesTable(marketplaces: Marketplace[]): string {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Repository'),
      chalk.cyan('Last Updated'),
    ],
  });

  for (const marketplace of marketplaces) {
    table.push([
      marketplace.name,
      marketplace.source.repo,
      new Date(marketplace.lastUpdated).toLocaleDateString(),
    ]);
  }

  return table.toString();
}
