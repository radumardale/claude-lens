import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAgentsDir, getProjectAgentsDir } from '../utils/paths.js';
import { parseYamlFrontmatter } from '../utils/yaml.js';
import { isMarkdownFile, parseMarkdownFilename } from '../utils/components.js';
import type { Agent } from '../types/index.js';

interface AgentFrontmatter {
  name?: string;
  description?: string;
  model?: string;
  color?: string;
}

async function scanAgentsDir(
  agentsDir: string,
  scope: 'global' | 'project',
  projectPath?: string
): Promise<Agent[]> {
  if (!existsSync(agentsDir)) {
    return [];
  }

  try {
    const files = await readdir(agentsDir);
    const mdFiles = files.filter(isMarkdownFile);

    const agents: Agent[] = [];

    for (const file of mdFiles) {
      const filePath = join(agentsDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { frontmatter } = parseYamlFrontmatter<AgentFrontmatter>(content);
      const { name: cleanName, enabled } = parseMarkdownFilename(file);

      agents.push({
        name: frontmatter?.name ?? cleanName,
        description: frontmatter?.description,
        model: frontmatter?.model,
        color: frontmatter?.color,
        filePath,
        enabled,
        scope,
        projectPath,
      });
    }

    return agents;
  } catch {
    return [];
  }
}

export async function scanAgents(projectPaths: string[] = []): Promise<Agent[]> {
  const agents: Agent[] = [];

  // Scan global agents
  const globalAgents = await scanAgentsDir(getAgentsDir(), 'global');
  agents.push(...globalAgents);

  // Scan project-level agents
  for (const projectPath of projectPaths) {
    const projectAgentsDir = getProjectAgentsDir(projectPath);
    const projectAgents = await scanAgentsDir(projectAgentsDir, 'project', projectPath);
    agents.push(...projectAgents);
  }

  return agents;
}
