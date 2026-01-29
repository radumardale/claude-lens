import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCommandsDir } from '../utils/paths.js';
import type { Command } from '../types/index.js';

export async function scanCommands(): Promise<Command[]> {
  const commandsDir = getCommandsDir();

  if (!existsSync(commandsDir)) {
    return [];
  }

  try {
    const files = await readdir(commandsDir);
    const mdFiles = files.filter(
      (f) => f.endsWith('.md') || f.endsWith('.md.disabled')
    );

    const commands: Command[] = [];

    for (const file of mdFiles) {
      const filePath = join(commandsDir, file);
      const content = await readFile(filePath, 'utf-8');

      const isDisabled = file.endsWith('.disabled');
      const cleanName = file
        .replace('.md.disabled', '')
        .replace('.md', '');

      commands.push({
        name: cleanName,
        content: content.trim(),
        filePath,
        enabled: !isDisabled,
      });
    }

    return commands;
  } catch {
    return [];
  }
}
