import { readdir, lstat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getSkillsDir } from '../utils/paths.js';
import type { ActionResult } from '../types/index.js';
import { success, error, renameWithSuffix } from './index.js';

const DISABLED_SUFFIX = '.disabled';

export async function enableSkill(name: string): Promise<ActionResult> {
  const filePath = await findSkillSymlink(name, true);
  if (!filePath) {
    return error(`Skill "${name}" not found or already enabled`);
  }

  const result = await renameWithSuffix(filePath, DISABLED_SUFFIX, false);
  if (result.success) {
    return success(`Enabled skill: ${name}`);
  }
  return result;
}

export async function disableSkill(name: string): Promise<ActionResult> {
  const filePath = await findSkillSymlink(name, false);
  if (!filePath) {
    return error(`Skill "${name}" not found or already disabled`);
  }

  const result = await renameWithSuffix(filePath, DISABLED_SUFFIX, true);
  if (result.success) {
    return success(`Disabled skill: ${name}`);
  }
  return result;
}

async function findSkillSymlink(
  name: string,
  lookForDisabled: boolean
): Promise<string | null> {
  const skillsDir = getSkillsDir();

  if (!existsSync(skillsDir)) {
    return null;
  }

  try {
    const entries = await readdir(skillsDir);

    const targetName = lookForDisabled
      ? `${name}${DISABLED_SUFFIX}`
      : name;

    if (!entries.includes(targetName)) {
      return null;
    }

    const entryPath = join(skillsDir, targetName);
    const stat = await lstat(entryPath);

    if (!stat.isSymbolicLink()) {
      return null;
    }

    return entryPath;
  } catch {
    return null;
  }
}
