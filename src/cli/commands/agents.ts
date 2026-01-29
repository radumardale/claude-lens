import { Command } from 'commander';
import ora from 'ora';
import { scanAgents } from '../../scanner/agents.js';
import { formatAgentsTable } from '../../formatters/table.js';
import { formatJson } from '../../formatters/json.js';

export const agentsCommand = new Command('agents')
  .description('List custom agents')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Scanning agents...').start();

    try {
      const agents = await scanAgents();
      spinner.stop();
      spinner.clear();

      if (options.json) {
        console.log(formatJson(agents));
      } else {
        console.log(formatAgentsTable(agents));
      }
    } catch (error) {
      spinner.fail('Failed to scan agents');
      console.error(error);
      process.exit(1);
    }
  });
