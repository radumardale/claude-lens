import { scanSettings } from './settings.js';
import { scanPlugins, scanMarketplaces } from './plugins.js';
import { scanAgents } from './agents.js';
import { scanCommands } from './commands.js';
import { scanSkills } from './skills.js';
import { scanMcps } from './mcps.js';
import { scanProjects, getProjectPaths } from './projects.js';
import type { ScanResult } from '../types/index.js';

export async function scan(): Promise<ScanResult> {
  const settings = await scanSettings();
  const plugins = await scanPlugins(settings);
  const marketplaces = await scanMarketplaces();
  const agents = await scanAgents();
  const commands = await scanCommands();
  const skills = await scanSkills();
  const projects = await scanProjects();
  const projectPaths = getProjectPaths(projects);
  const mcpServers = await scanMcps(projectPaths);

  return {
    settings,
    plugins,
    marketplaces,
    agents,
    commands,
    skills,
    mcpServers,
    projects,
  };
}

export { scanSettings } from './settings.js';
export { scanPlugins, scanMarketplaces } from './plugins.js';
export { scanAgents } from './agents.js';
export { scanCommands } from './commands.js';
export { scanSkills } from './skills.js';
export { scanMcps } from './mcps.js';
export { scanProjects, getProjectPaths } from './projects.js';
