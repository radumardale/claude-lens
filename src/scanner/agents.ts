import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { getAgentsDir } from '../utils/paths.js';
import { parseYamlFrontmatter } from '../utils/yaml.js';
import type { Agent } from '../types/index.js';

interface AgentFrontmatter {
  name?: string;
  description?: string;
  model?: string;
  color?: string;
}

export async function scanAgents(): Promise<Agent[]> {
  const agentsDir = getAgentsDir();

  if (!existsSync(agentsDir)) {
    return [];
  }

  try {
    const files = await readdir(agentsDir);
    const mdFiles = files.filter(
      (f) => f.endsWith('.md') || f.endsWith('.md.disabled')
    );

    const agents: Agent[] = [];

    for (const file of mdFiles) {
      const filePath = join(agentsDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { frontmatter } = parseYamlFrontmatter<AgentFrontmatter>(content);

      const isDisabled = file.endsWith('.disabled');
      const cleanName = file
        .replace('.md.disabled', '')
        .replace('.md', '');

      agents.push({
        name: frontmatter?.name ?? cleanName,
        description: frontmatter?.description,
        model: frontmatter?.model,
        color: frontmatter?.color,
        filePath,
        enabled: !isDisabled,
      });
    }

    return agents;
  } catch {
    return [];
  }
}
