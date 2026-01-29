import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
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

// Find package.json by traversing up from current directory
function findPackageJson(startDir: string): string {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      return pkgPath;
    }
    dir = dirname(dir);
  }
  throw new Error('package.json not found');
}

const pkg = JSON.parse(readFileSync(findPackageJson(__dirname), 'utf-8'));

export const program = new Command();

program
  .name('claude-lens')
  .description('Scan, report, and manage Claude Code configuration')
  .version(pkg.version)
  .option('-i, --interactive', 'Launch interactive TUI mode');

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
  // Check for interactive flag before Commander processes default command
  const args = process.argv.slice(2);
  if (args.includes('-i') || args.includes('--interactive')) {
    const { startTui } = await import('../tui/index.js');
    await startTui();
    return;
  }

  program.parse();
}
