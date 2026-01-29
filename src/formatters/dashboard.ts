import boxen from 'boxen';
import chalk from 'chalk';
import type { ScanResult } from '../types/index.js';

export function formatDashboard(result: ScanResult): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan('Claude Code Configuration'));
  lines.push('');

  const enabledPlugins = result.plugins.filter((p) => p.enabled).length;
  const disabledPlugins = result.plugins.length - enabledPlugins;
  lines.push(
    `${chalk.bold('Plugins:')} ${enabledPlugins} enabled` +
      (disabledPlugins > 0 ? `, ${disabledPlugins} disabled` : '')
  );

  const enabledAgents = result.agents.filter((a) => a.enabled).length;
  const disabledAgents = result.agents.length - enabledAgents;
  lines.push(
    `${chalk.bold('Agents:')} ${enabledAgents} enabled` +
      (disabledAgents > 0 ? `, ${disabledAgents} disabled` : '')
  );

  const enabledCommands = result.commands.filter((c) => c.enabled).length;
  const disabledCommands = result.commands.length - enabledCommands;
  lines.push(
    `${chalk.bold('Commands:')} ${enabledCommands} enabled` +
      (disabledCommands > 0 ? `, ${disabledCommands} disabled` : '')
  );

  const linkedSkills = result.skills.filter((s) => s.source === 'symlink').length;
  const pluginSkills = result.skills.filter((s) => s.source === 'plugin').length;
  lines.push(
    `${chalk.bold('Skills:')} ${linkedSkills} linked, ${pluginSkills} from plugins`
  );

  const globalMcps = result.mcpServers.filter((m) => m.scope === 'global').length;
  const pluginMcps = result.mcpServers.filter((m) => m.scope === 'plugin').length;
  const projectMcps = result.mcpServers.filter((m) => m.scope === 'project').length;
  const userMcps = result.mcpServers.filter((m) => m.scope === 'user').length;
  lines.push(
    `${chalk.bold('MCP Servers:')} ${globalMcps} global, ${pluginMcps} plugin, ${projectMcps} project, ${userMcps} user`
  );

  const projectsWithMcp = result.projects.filter((p) => p.hasMcp).length;
  const projectsWithMd = result.projects.filter((p) => p.hasClaudeMd).length;
  lines.push(
    `${chalk.bold('Projects:')} ${result.projects.length} total` +
      ` (${projectsWithMcp} with MCP, ${projectsWithMd} with CLAUDE.md)`
  );

  lines.push('');
  lines.push(`${chalk.bold('Marketplaces:')} ${result.marketplaces.length}`);

  const content = lines.join('\n');

  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
  });
}
