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
    const frontmatter = parseSimpleFrontmatter<T>(yamlBlock);
    return { frontmatter, content };
  }
}

function parseSimpleFrontmatter<T>(yamlBlock: string): T | null {
  const result: Record<string, string> = {};
  const lines = yamlBlock.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key && !key.includes(' ')) {
      result[key] = value;
    }
  }

  return Object.keys(result).length > 0 ? (result as T) : null;
}
