import { lstatSync, readlinkSync } from 'node:fs';

export function getSymlinkTarget(filePath: string): string | null {
  try {
    const stats = lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      return readlinkSync(filePath);
    }
  } catch {
    // File doesn't exist or can't be accessed
  }
  return null;
}

export function formatPathWithSymlink(filePath: string): string {
  const target = getSymlinkTarget(filePath);
  if (target) {
    return `${filePath} → ${target}`;
  }
  return filePath;
}
