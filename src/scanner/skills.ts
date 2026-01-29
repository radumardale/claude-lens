import { readFile, readdir, lstat, readlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import fg from 'fast-glob';
import { getSkillsDir, getProjectSkillsDir } from '../utils/paths.js';
import { parseYamlFrontmatter } from '../utils/yaml.js';
import type { Skill, SkillMetadata, Plugin } from '../types/index.js';

interface SkillFrontmatter {
  name?: string;
  description?: string;
  metadata?: SkillMetadata;
}

export async function scanSkills(projectPaths: string[] = [], plugins: Plugin[] = []): Promise<Skill[]> {
  const skills: Skill[] = [];

  const linkedSkills = await scanLinkedSkills();
  const pluginSkills = await scanPluginSkills(plugins);

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

async function scanPluginSkills(plugins: Plugin[]): Promise<Skill[]> {
  const skills: Skill[] = [];

  for (const plugin of plugins) {
    const skillsDir = join(plugin.installPath, 'skills');

    if (!existsSync(skillsDir)) {
      continue;
    }

    try {
      const skillFiles = await fg('*/SKILL.md', {
        cwd: skillsDir,
        absolute: true,
      });

      for (const skillPath of skillFiles) {
        const content = await readFile(skillPath, 'utf-8');
        const { frontmatter } = parseYamlFrontmatter<SkillFrontmatter>(content);

        const pathParts = skillPath.split('/');
        const skillsIndex = pathParts.indexOf('skills');
        const skillDirName = pathParts[skillsIndex + 1] ?? 'unknown';

        skills.push({
          name: frontmatter?.name ?? skillDirName,
          description: frontmatter?.description,
          metadata: frontmatter?.metadata,
          source: 'plugin',
          pluginName: plugin.name,
          filePath: skillPath,
          enabled: plugin.enabled,
          scope: 'plugin',
        });
      }
    } catch {
      // Continue with other plugins
    }
  }

  return skills;
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
