import { Command } from 'commander';
import chalk from 'chalk';
import { disablePlugin } from '../../actions/plugins.js';
import { disableAgent } from '../../actions/agents.js';
import { disableCommand as disableCmd } from '../../actions/commands.js';
import { disableSkill } from '../../actions/skills.js';
import { disableMcp } from '../../actions/mcps.js';
import type { ActionResult, ComponentType } from '../../types/index.js';

const VALID_TYPES: ComponentType[] = ['plugin', 'agent', 'command', 'skill', 'mcp'];

export const disableCommand = new Command('disable')
  .description('Disable a component')
  .argument('<type>', `Component type (${VALID_TYPES.join(', ')})`)
  .argument('<name>', 'Component name')
  .option('--project <path>', 'Project path (for project-scoped components)')
  .action(async (type: string, name: string, options) => {
    if (!VALID_TYPES.includes(type as ComponentType)) {
      console.error(chalk.red(`Invalid type: ${type}`));
      console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
      process.exit(1);
    }

    let result: ActionResult;

    switch (type as ComponentType) {
      case 'plugin':
        result = await disablePlugin(name);
        break;
      case 'agent':
        result = await disableAgent(name, options.project);
        break;
      case 'command':
        result = await disableCmd(name, options.project);
        break;
      case 'skill':
        result = await disableSkill(name, options.project);
        break;
      case 'mcp':
        result = await disableMcp(name, options.project);
        break;
    }

    if (result.success) {
      console.log(chalk.green('✓'), result.message);
    } else {
      console.error(chalk.red('✗'), result.message);
      process.exit(1);
    }
  });
