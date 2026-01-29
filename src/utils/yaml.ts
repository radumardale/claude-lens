import { parse } from 'yaml';

export interface FrontmatterResult<T = Record<string, unknown>> {
  frontmatter: T | null;
  content: string;
}

export function parseYamlFrontmatter<T = Record<string, unknown>>(
  fileContent: string
): FrontmatterResult<T> {
  const trimmed = fileContent.trim();

  if (!trimmed.startsWith('---')) {
    return { frontmatter: null, content: fileContent };
  }

  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    return { frontmatter: null, content: fileContent };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const content = trimmed.slice(endIndex + 3).trim();

  try {
    const frontmatter = parse(yamlBlock) as T;
    return { frontmatter, content };
  } catch {
    return { frontmatter: null, content: fileContent };
  }
}
