export interface ParsedComponentFilename {
  name: string;
  enabled: boolean;
  isValid: boolean;
}

export function isMarkdownFile(filename: string): boolean {
  return filename.endsWith('.md') || filename.endsWith('.md.disabled');
}

export function parseMarkdownFilename(filename: string): ParsedComponentFilename {
  if (!isMarkdownFile(filename)) {
    return { name: filename, enabled: true, isValid: false };
  }

  const isDisabled = filename.endsWith('.md.disabled');
  const name = filename.replace('.md.disabled', '').replace('.md', '');

  return { name, enabled: !isDisabled, isValid: true };
}

export function parseSymlinkFilename(filename: string): ParsedComponentFilename {
  const isDisabled = filename.endsWith('.disabled');
  const name = isDisabled ? filename.slice(0, -'.disabled'.length) : filename;

  return { name, enabled: !isDisabled, isValid: true };
}
