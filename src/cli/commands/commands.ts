import { Command } from 'commander';
import ora from 'ora';
import { scanCommands } from '../../scanner/commands.js';
import { formatCommandsTable } from '../../formatters/table.js';
import { formatJson } from '../../formatters/json.js';

export const commandsCommand = new Command('commands')
  .description('List custom commands')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Scanning commands...').start();

    try {
      const commands = await scanCommands();
      spinner.stop();

      if (options.json) {
        console.log(formatJson(commands));
      } else {
        console.log(formatCommandsTable(commands));
      }
    } catch (error) {
      spinner.fail('Failed to scan commands');
      console.error(error);
      process.exit(1);
    }
  });
