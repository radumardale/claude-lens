import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getProjectsDir, decodeProjectPath } from '../utils/paths.js';
import type { Project, ProjectSessionEntry } from '../types/index.js';

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

      const projectPath = decodeProjectPath(entry);
      if (!existsSync(projectPath)) continue;

      const sessionIndex = await readSessionIndex(
        join(projectsDir, entry, 'sessions-index.json')
      );

      const hasMcp = existsSync(join(projectPath, '.mcp.json'));
      const hasSettings = existsSync(
        join(projectPath, '.claude', 'settings.local.json')
      );
      const hasClaudeMd = existsSync(join(projectPath, 'CLAUDE.md'));

      let lastModified: string | undefined;
      if (sessionIndex.length > 0) {
        const sorted = sessionIndex.sort(
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
        sessionCount: sessionIndex.length,
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

async function readSessionIndex(
  indexPath: string
): Promise<ProjectSessionEntry[]> {
  if (!existsSync(indexPath)) {
    return [];
  }

  try {
    const content = await readFile(indexPath, 'utf-8');
    return JSON.parse(content) as ProjectSessionEntry[];
  } catch {
    return [];
  }
}

export function getProjectPaths(projects: Project[]): string[] {
  return projects.map((p) => p.path);
}
