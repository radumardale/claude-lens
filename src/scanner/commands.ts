import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCommandsDir, getProjectCommandsDir } from '../utils/paths.js';
import { isMarkdownFile, parseMarkdownFilename } from '../utils/components.js';
import type { Command } from '../types/index.js';

async function scanCommandsDir(
  commandsDir: string,
  scope: 'global' | 'project',
  projectPath?: string
): Promise<Command[]> {
  if (!existsSync(commandsDir)) {
    return [];
  }

  try {
    const files = await readdir(commandsDir);
    const mdFiles = files.filter(isMarkdownFile);

    const commands: Command[] = [];

    for (const file of mdFiles) {
      const filePath = join(commandsDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { name: cleanName, enabled } = parseMarkdownFilename(file);

      commands.push({
        name: cleanName,
        content: content.trim(),
        filePath,
        enabled,
        scope,
        projectPath,
      });
    }

    return commands;
  } catch {
    return [];
  }
}

export async function scanCommands(projectPaths: string[] = []): Promise<Command[]> {
  const commands: Command[] = [];

  // Scan global commands
  const globalCommands = await scanCommandsDir(getCommandsDir(), 'global');
  commands.push(...globalCommands);

  // Scan project-level commands
  for (const projectPath of projectPaths) {
    const projectCommandsDir = getProjectCommandsDir(projectPath);
    const projectCommands = await scanCommandsDir(projectCommandsDir, 'project', projectPath);
    commands.push(...projectCommands);
  }

  return commands;
}
