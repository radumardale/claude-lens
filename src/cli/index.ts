import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scanCommand } from './commands/scan.js';
import { pluginsCommand } from './commands/plugins.js';
import { agentsCommand } from './commands/agents.js';
import { skillsCommand } from './commands/skills.js';
import { commandsCommand } from './commands/commands.js';
import { mcpsCommand } from './commands/mcps.js';
import { projectsCommand } from './commands/projects.js';
import { enableCommand } from './commands/enable.js';
import { disableCommand } from './commands/disable.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);

export const program = new Command();

program
  .name('claude-lens')
  .description('Scan, report, and manage Claude Code configuration')
  .version(pkg.version);

program.addCommand(scanCommand, { isDefault: true });
program.addCommand(pluginsCommand);
program.addCommand(agentsCommand);
program.addCommand(skillsCommand);
program.addCommand(commandsCommand);
program.addCommand(mcpsCommand);
program.addCommand(projectsCommand);
program.addCommand(enableCommand);
program.addCommand(disableCommand);

export function run(): void {
  program.parse();
}
