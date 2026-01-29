import { Command } from 'commander';
import ora from 'ora';
import { scan } from '../../scanner/index.js';
import { formatDashboard } from '../../formatters/dashboard.js';
import { formatJson } from '../../formatters/json.js';

export const scanCommand = new Command('scan')
  .description('Scan all Claude Code configuration')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Scanning Claude Code configuration...').start();

    try {
      const result = await scan();
      spinner.stop();

      if (options.json) {
        console.log(formatJson(result));
      } else {
        console.log(formatDashboard(result));
      }
    } catch (error) {
      spinner.fail('Failed to scan configuration');
      console.error(error);
      process.exit(1);
    }
  });
