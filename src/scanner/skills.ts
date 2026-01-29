import { readFile, readdir, lstat, readlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import fg from 'fast-glob';
import { getSkillsDir, getPluginsCachePath, getProjectSkillsDir } from '../utils/paths.js';
import { parseYamlFrontmatter } from '../utils/yaml.js';
import type { Skill, SkillMetadata } from '../types/index.js';

interface SkillFrontmatter {
  name?: string;
  description?: string;
  metadata?: SkillMetadata;
}

export async function scanSkills(projectPaths: string[] = []): Promise<Skill[]> {
  const skills: Skill[] = [];

  const linkedSkills = await scanLinkedSkills();
  const pluginSkills = await scanPluginSkills();

  skills.push(...linkedSkills, ...pluginSkills);

  // Scan project-level skills
  for (const projectPath of projectPaths) {
    const projectSkills = await scanProjectSkills(projectPath);
    skills.push(...projectSkills);
  }

  return skills;
}

async function scanLinkedSkills(): Promise<Skill[]> {
  const skillsDir = getSkillsDir();

  if (!existsSync(skillsDir)) {
    return [];
  }

  try {
    const entries = await readdir(skillsDir);
    const skills: Skill[] = [];

    for (const entry of entries) {
      const entryPath = join(skillsDir, entry);
      const stat = await lstat(entryPath);

      if (!stat.isSymbolicLink()) continue;

      const targetPath = await readlink(entryPath);
      const skillMdPath = join(targetPath, 'SKILL.md');

      let frontmatter: SkillFrontmatter | null = null;
      if (existsSync(skillMdPath)) {
        const content = await readFile(skillMdPath, 'utf-8');
        const parsed = parseYamlFrontmatter<SkillFrontmatter>(content);
        frontmatter = parsed.frontmatter;
      }

      const isDisabled = entry.endsWith('.disabled');
      const cleanName = entry.replace('.disabled', '');

      skills.push({
        name: frontmatter?.name ?? cleanName,
        description: frontmatter?.description,
        metadata: frontmatter?.metadata,
        source: 'symlink',
        filePath: entryPath,
        enabled: !isDisabled,
        scope: 'global',
      });
    }

    return skills;
  } catch {
    return [];
  }
}

async function scanPluginSkills(): Promise<Skill[]> {
  const cachePath = getPluginsCachePath();

  if (!existsSync(cachePath)) {
    return [];
  }

  try {
    const skillFiles = await fg('**/skills/*/SKILL.md', {
      cwd: cachePath,
      absolute: true,
    });

    const skills: Skill[] = [];

    for (const skillPath of skillFiles) {
      const content = await readFile(skillPath, 'utf-8');
      const { frontmatter } = parseYamlFrontmatter<SkillFrontmatter>(content);

      const pathParts = skillPath.split('/');
      const skillsIndex = pathParts.indexOf('skills');
      const skillDirName = pathParts[skillsIndex + 1] ?? 'unknown';

      const cacheIndex = pathParts.indexOf('cache');
      const pluginPath = pathParts.slice(cacheIndex + 1, skillsIndex);
      const pluginName = pluginPath[1] ?? pluginPath[0] ?? 'unknown';

      skills.push({
        name: frontmatter?.name ?? skillDirName,
        description: frontmatter?.description,
        metadata: frontmatter?.metadata,
        source: 'plugin',
        pluginName,
        filePath: skillPath,
        enabled: true,
        scope: 'plugin',
      });
    }

    return skills;
  } catch {
    return [];
  }
}

async function scanProjectSkills(projectPath: string): Promise<Skill[]> {
  const skillsDir = getProjectSkillsDir(projectPath);

  if (!existsSync(skillsDir)) {
    return [];
  }

  try {
    const entries = await readdir(skillsDir);
    const skills: Skill[] = [];

    for (const entry of entries) {
      const entryPath = join(skillsDir, entry);
      const stat = await lstat(entryPath);

      // Project skills can be symlinks or directories with SKILL.md
      if (stat.isSymbolicLink()) {
        const targetPath = await readlink(entryPath);
        const skillMdPath = join(targetPath, 'SKILL.md');

        let frontmatter: SkillFrontmatter | null = null;
        if (existsSync(skillMdPath)) {
          const content = await readFile(skillMdPath, 'utf-8');
          const parsed = parseYamlFrontmatter<SkillFrontmatter>(content);
          frontmatter = parsed.frontmatter;
        }

        const isDisabled = entry.endsWith('.disabled');
        const cleanName = entry.replace('.disabled', '');

        skills.push({
          name: frontmatter?.name ?? cleanName,
          description: frontmatter?.description,
          metadata: frontmatter?.metadata,
          source: 'symlink',
          filePath: entryPath,
          enabled: !isDisabled,
          scope: 'project',
          projectPath,
        });
      } else if (stat.isDirectory()) {
        const skillMdPath = join(entryPath, 'SKILL.md');
        if (existsSync(skillMdPath)) {
          const content = await readFile(skillMdPath, 'utf-8');
          const { frontmatter } = parseYamlFrontmatter<SkillFrontmatter>(content);

          const isDisabled = entry.endsWith('.disabled');
          const cleanName = entry.replace('.disabled', '');

          skills.push({
            name: frontmatter?.name ?? cleanName,
            description: frontmatter?.description,
            metadata: frontmatter?.metadata,
            source: 'symlink',
            filePath: entryPath,
            enabled: !isDisabled,
            scope: 'project',
            projectPath,
          });
        }
      }
    }

    return skills;
  } catch {
    return [];
  }
}
