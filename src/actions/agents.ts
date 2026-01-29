import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getAgentsDir, getProjectAgentsDir } from '../utils/paths.js';
import type { ActionResult } from '../types/index.js';
import { success, error, renameWithSuffix } from './index.js';

const DISABLED_SUFFIX = '.disabled';

export async function enableAgent(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const filePath = await findAgentFile(name, true, projectPath);
  if (!filePath) {
    return error(`Agent "${name}" not found or already enabled`);
  }

  const result = await renameWithSuffix(filePath, DISABLED_SUFFIX, false);
  if (result.success) {
    return success(`Enabled agent: ${name}`);
  }
  return result;
}

export async function disableAgent(
  name: string,
  projectPath?: string
): Promise<ActionResult> {
  const filePath = await findAgentFile(name, false, projectPath);
  if (!filePath) {
    return error(`Agent "${name}" not found or already disabled`);
  }

  const result = await renameWithSuffix(filePath, DISABLED_SUFFIX, true);
  if (result.success) {
    return success(`Disabled agent: ${name}`);
  }
  return result;
}

async function findAgentFile(
  name: string,
  lookForDisabled: boolean,
  projectPath?: string
): Promise<string | null> {
  const agentsDir = projectPath
    ? getProjectAgentsDir(projectPath)
    : getAgentsDir();

  if (!existsSync(agentsDir)) {
    return null;
  }

  try {
    const files = await readdir(agentsDir);

    // When enabling, look for .md.disabled file
    // When disabling, look for .md file (not .disabled)
    const targetFile = lookForDisabled
      ? `${name}.md.disabled`
      : `${name}.md`;

    if (files.includes(targetFile)) {
      return join(agentsDir, targetFile);
    }

    return null;
  } catch {
    return null;
  }
}
