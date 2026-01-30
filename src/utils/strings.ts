export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength - 3) + '...';
}

export function shortenHomePath(path: string): string {
  return path.replace(/^\/Users\/[^/]+/, '~');
}
