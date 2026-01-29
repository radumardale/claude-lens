import { Command } from 'commander';
import ora from 'ora';
import { scanProjects } from '../../scanner/projects.js';
import { formatProjectsTable } from '../../formatters/table.js';
import { formatJson } from '../../formatters/json.js';

export const projectsCommand = new Command('projects')
  .description('List projects with Claude configuration')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Scanning projects...').start();

    try {
      const projects = await scanProjects();
      spinner.stop();
      spinner.clear();

      if (options.json) {
        console.log(formatJson(projects));
      } else {
        console.log(formatProjectsTable(projects));
      }
    } catch (error) {
      spinner.fail('Failed to scan projects');
      console.error(error);
      process.exit(1);
    }
  });
