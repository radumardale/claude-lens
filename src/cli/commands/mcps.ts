import { Command } from 'commander';
import ora from 'ora';
import { scanMcps } from '../../scanner/mcps.js';
import { scanProjects, getProjectPaths } from '../../scanner/projects.js';
import { formatMcpsTable } from '../../formatters/table.js';
import { formatJson } from '../../formatters/json.js';

export const mcpsCommand = new Command('mcps')
  .description('List MCP servers')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Scanning MCP servers...').start();

    try {
      const projects = await scanProjects();
      const projectPaths = getProjectPaths(projects);
      const mcps = await scanMcps(projectPaths);
      spinner.stop();

      if (options.json) {
        console.log(formatJson(mcps));
      } else {
        console.log(formatMcpsTable(mcps));
      }
    } catch (error) {
      spinner.fail('Failed to scan MCP servers');
      console.error(error);
      process.exit(1);
    }
  });
