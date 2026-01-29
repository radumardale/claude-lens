import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import fg from 'fast-glob';
import { getProjectsDir } from '../utils/paths.js';
import type { Project, ProjectSessionEntry } from '../types/index.js';

interface SessionsIndex {
  version: number;
  entries: ProjectSessionEntry[];
  originalPath?: string | null;
}

export async function scanProjects(): Promise<Project[]> {
  const projectsDir = getProjectsDir();

  if (!existsSync(projectsDir)) {
    return [];
  }

  try {
    const entries = await readdir(projectsDir);
    const projects: Project[] = [];

    for (const entry of entries) {
      if (!entry.startsWith('-')) continue;

      const projectDir = join(projectsDir, entry);
      const projectPath = await extractProjectPath(projectDir);
      if (!projectPath || !existsSync(projectPath)) continue;

      const sessionsIndex = await readSessionIndex(
        join(projectDir, 'sessions-index.json')
      );

      const hasMcp = existsSync(join(projectPath, '.mcp.json'));
      const hasSettings = existsSync(
        join(projectPath, '.claude', 'settings.local.json')
      );
      const hasClaudeMd = existsSync(join(projectPath, 'CLAUDE.md'));

      let lastModified: string | undefined;
      if (sessionsIndex.entries.length > 0) {
        const sorted = sessionsIndex.entries.sort(
          (a, b) =>
            new Date(b.modified).getTime() - new Date(a.modified).getTime()
        );
        lastModified = sorted[0]?.modified;
      }

      projects.push({
        path: projectPath,
        hasMcp,
        hasSettings,
        hasClaudeMd,
        sessionCount: sessionsIndex.entries.length,
        lastModified,
      });
    }

    return projects.sort((a, b) => {
      if (!a.lastModified) return 1;
      if (!b.lastModified) return -1;
      return (
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    });
  } catch {
    return [];
  }
}

async function extractProjectPath(projectDir: string): Promise<string | null> {
  // 1. Try sessions-index.json (preferred source)
  const indexPath = join(projectDir, 'sessions-index.json');
  if (existsSync(indexPath)) {
    try {
      const content = await readFile(indexPath, 'utf-8');
      const data = JSON.parse(content) as SessionsIndex;

      // First try originalPath (top-level field)
      if (data.originalPath) {
        return data.originalPath;
      }

      // Fallback to first entry's projectPath
      if (data.entries?.[0]?.projectPath) {
        return data.entries[0].projectPath;
      }
    } catch {
      // Continue to next fallback
    }
  }

  // 2. Try .jsonl files for cwd field
  const jsonlFiles = await fg('*.jsonl', { cwd: projectDir, absolute: true });
  for (const file of jsonlFiles) {
    const cwd = await extractCwdFromJsonl(file);
    if (cwd) {
      return cwd;
    }
  }

  // 3. Simple decode as last resort (works for paths without dashes in names)
  const folderName = basename(projectDir);
  const decoded = folderName.replace(/-/g, '/');
  if (existsSync(decoded)) {
    return decoded;
  }

  return null;
}

async function extractCwdFromJsonl(filePath: string): Promise<string | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, 10); // Only check first 10 lines

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line);
        if (entry.cwd && typeof entry.cwd === 'string') {
          return entry.cwd;
        }
      } catch {
        // Skip malformed lines
      }
    }
  } catch {
    // File read error
  }
  return null;
}

async function readSessionIndex(indexPath: string): Promise<SessionsIndex> {
  const empty: SessionsIndex = { version: 1, entries: [] };

  if (!existsSync(indexPath)) {
    return empty;
  }

  try {
    const content = await readFile(indexPath, 'utf-8');
    const data = JSON.parse(content);

    // Handle both array format (old) and object format (new)
    if (Array.isArray(data)) {
      return { version: 1, entries: data as ProjectSessionEntry[] };
    }

    return data as SessionsIndex;
  } catch {
    return empty;
  }
}

export function getProjectPaths(projects: Project[]): string[] {
  return projects.map((p) => p.path);
}
