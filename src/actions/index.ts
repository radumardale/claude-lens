import { rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

export interface ActionResult {
  success: boolean;
  message: string;
}

export type ComponentType = 'plugin' | 'agent' | 'command' | 'skill' | 'mcp';

export function success(message: string): ActionResult {
  return { success: true, message };
}

export function error(message: string): ActionResult {
  return { success: false, message };
}

export async function renameWithSuffix(
  filePath: string,
  suffix: string,
  add: boolean
): Promise<ActionResult> {
  if (!existsSync(filePath)) {
    return error(`File not found: ${filePath}`);
  }

  const dir = dirname(filePath);
  const name = basename(filePath);

  let newName: string;
  if (add) {
    newName = `${name}${suffix}`;
  } else {
    if (!name.endsWith(suffix)) {
      return error(`File does not have ${suffix} suffix: ${filePath}`);
    }
    newName = name.slice(0, -suffix.length);
  }

  const newPath = join(dir, newName);

  if (existsSync(newPath)) {
    return error(`Target already exists: ${newPath}`);
  }

  try {
    await rename(filePath, newPath);
    return success(`Renamed ${name} → ${newName}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to rename: ${msg}`);
  }
}

export function findFileByName(
  files: string[],
  name: string,
  extensions: string[]
): string | null {
  for (const ext of extensions) {
    const match = files.find(
      (f) =>
        basename(f, ext) === name ||
        basename(f, `${ext}.disabled`) === name
    );
    if (match) return match;
  }
  return null;
}
