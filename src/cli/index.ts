import { Command } from 'commander';
import { scanCommand } from './commands/scan.js';
import { pluginsCommand } from './commands/plugins.js';
import { agentsCommand } from './commands/agents.js';
import { skillsCommand } from './commands/skills.js';
import { commandsCommand } from './commands/commands.js';
import { mcpsCommand } from './commands/mcps.js';
import { projectsCommand } from './commands/projects.js';
import { enableCommand } from './commands/enable.js';
import { disableCommand } from './commands/disable.js';
import { APP_VERSION } from '../utils/version.js';

export const program = new Command();

program
  .name('claude-lens')
  .description('Scan, report, and manage Claude Code configuration')
  .version(APP_VERSION)
  .option('-i, --interactive', 'Launch interactive TUI mode (default)');

program.addCommand(scanCommand, { isDefault: true });
program.addCommand(pluginsCommand);
program.addCommand(agentsCommand);
program.addCommand(skillsCommand);
program.addCommand(commandsCommand);
program.addCommand(mcpsCommand);
program.addCommand(projectsCommand);
program.addCommand(enableCommand);
program.addCommand(disableCommand);

export async function run(): Promise<void> {
  const args = process.argv.slice(2);

  // Launch TUI by default (no args), or if -i/--interactive is passed without a command
  const hasCommand = args.some((arg) => !arg.startsWith('-'));
  const wantsInteractive = args.includes('-i') || args.includes('--interactive');

  if (args.length === 0 || (wantsInteractive && !hasCommand)) {
    const { startTui } = await import('../tui/index.js');
    await startTui();
    return;
  }

  program.parse();
}
