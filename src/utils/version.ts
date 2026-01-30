import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function findPackageJson(startDir: string): string {
  let dir = startDir;
  while (dir !== dirname(dir)) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      return pkgPath;
    }
    dir = dirname(dir);
  }
  throw new Error('package.json not found');
}

const pkg = JSON.parse(readFileSync(findPackageJson(__dirname), 'utf-8'));

export const APP_VERSION: string = pkg.version;
