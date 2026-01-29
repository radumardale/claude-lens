import { Command } from 'commander';
import ora from 'ora';
import { scanSettings } from '../../scanner/settings.js';
import { scanPlugins, scanMarketplaces } from '../../scanner/plugins.js';
import { formatPluginsTable, formatMarketplacesTable } from '../../formatters/table.js';
import { formatJson } from '../../formatters/json.js';

export const pluginsCommand = new Command('plugins')
  .description('List installed plugins')
  .option('--json', 'Output as JSON')
  .option('--marketplaces', 'Show marketplaces instead of plugins')
  .action(async (options) => {
    const spinner = ora('Scanning plugins...').start();

    try {
      if (options.marketplaces) {
        const marketplaces = await scanMarketplaces();
        spinner.stop();

        if (options.json) {
          console.log(formatJson(marketplaces));
        } else {
          console.log(formatMarketplacesTable(marketplaces));
        }
      } else {
        const settings = await scanSettings();
        const plugins = await scanPlugins(settings);
        spinner.stop();

        if (options.json) {
          console.log(formatJson(plugins));
        } else {
          console.log(formatPluginsTable(plugins));
        }
      }
    } catch (error) {
      spinner.fail('Failed to scan plugins');
      console.error(error);
      process.exit(1);
    }
  });
