import { Command } from 'commander';
import ora from 'ora';
import { scanSkills } from '../../scanner/skills.js';
import { formatSkillsTable } from '../../formatters/table.js';
import { formatJson } from '../../formatters/json.js';

export const skillsCommand = new Command('skills')
  .description('List skills (linked and plugin-embedded)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const spinner = ora('Scanning skills...').start();

    try {
      const skills = await scanSkills();
      spinner.stop();
      spinner.clear();

      if (options.json) {
        console.log(formatJson(skills));
      } else {
        console.log(formatSkillsTable(skills));
      }
    } catch (error) {
      spinner.fail('Failed to scan skills');
      console.error(error);
      process.exit(1);
    }
  });
