import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getCommandsDir, getProjectCommandsDir } from '../utils/paths.js';
import type { ActionResult } from '../types/index.js';
import { success, error, renameWithSuffix } from './index.js';

const DISABLED_SUFFIX = '.disabled';

export async function enableCommand(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const filePath = await findCommandFile(name, true, projectPath);
  if (!filePath) {
    return error(`Command "${name}" not found or already enabled`);
  }

  const result = await renameWithSuffix(filePath, DISABLED_SUFFIX, false);
  if (result.success) {
    return success(`Enabled command: ${name}`);
  }
  return result;
}

export async function disableCommand(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const filePath = await findCommandFile(name, false, projectPath);
  if (!filePath) {
    return error(`Command "${name}" not found or already disabled`);
  }

  const result = await renameWithSuffix(filePath, DISABLED_SUFFIX, true);
  if (result.success) {
    return success(`Disabled command: ${name}`);
  }
  return result;
}

async function findCommandFile(
  name: string,
  lookForDisabled: boolean,
  projectPath?: string
): Promise<string | null> {
  const commandsDir = projectPath
    ? getProjectCommandsDir(projectPath)
    : getCommandsDir();

  if (!existsSync(commandsDir)) {
    return null;
  }

  try {
    const files = await readdir(commandsDir);

    const targetFile = lookForDisabled
      ? `${name}.md.disabled`
      : `${name}.md`;

    if (files.includes(targetFile)) {
      return join(commandsDir, targetFile);
    }

    return null;
  } catch {
    return null;
  }
}
