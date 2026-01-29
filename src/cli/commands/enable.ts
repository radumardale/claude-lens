import { Command } from 'commander';
import chalk from 'chalk';
import { enablePlugin } from '../../actions/plugins.js';
import { enableAgent } from '../../actions/agents.js';
import { enableCommand as enableCmd } from '../../actions/commands.js';
import { enableSkill } from '../../actions/skills.js';
import { enableMcp } from '../../actions/mcps.js';
import type { ActionResult, ComponentType } from '../../types/index.js';

const VALID_TYPES: ComponentType[] = ['plugin', 'agent', 'command', 'skill', 'mcp'];

export const enableCommand = new Command('enable')
  .description('Enable a disabled component')
  .argument('<type>', `Component type (${VALID_TYPES.join(', ')})`)
  .argument('<name>', 'Component name')
  .option('--project <path>', 'Project path (for project-scoped MCPs)')
  .action(async (type: string, name: string, options) => {
    if (!VALID_TYPES.includes(type as ComponentType)) {
      console.error(chalk.red(`Invalid type: ${type}`));
      console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
      process.exit(1);
    }

    let result: ActionResult;

    switch (type as ComponentType) {
      case 'plugin':
        result = await enablePlugin(name);
        break;
      case 'agent':
        result = await enableAgent(name);
        break;
      case 'command':
        result = await enableCmd(name);
        break;
      case 'skill':
        result = await enableSkill(name);
        break;
      case 'mcp':
        result = await enableMcp(name, options.project);
        break;
    }

    if (result.success) {
      console.log(chalk.green('✓'), result.message);
    } else {
      console.error(chalk.red('✗'), result.message);
      process.exit(1);
    }
  });
