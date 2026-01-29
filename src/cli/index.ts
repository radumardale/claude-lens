import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { scanCommand } from './commands/scan.js';

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

export function run(): void {
  program.parse();
}
