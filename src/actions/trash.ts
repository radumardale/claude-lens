import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, cpSync, symlinkSync, lstatSync, readlinkSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { getClaudeLensDir } from '../utils/settings.js';
import type { TrashItem, TrashManifest, ActionResult, McpServerConfig } from '../types/index.js';
import { success, error } from './index.js';

export function getTrashDir(): string {
  return join(getClaudeLensDir(), 'trash');
}

export function getTrashManifestPath(): string {
  return join(getTrashDir(), 'manifest.json');
}

export function ensureTrashDir(): void {
  const dir = getTrashDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export function loadTrashManifest(): TrashManifest {
  const path = getTrashManifestPath();
  if (!existsSync(path)) {
    return { version: 1, items: [] };
  }

  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as TrashManifest;
  } catch {
    return { version: 1, items: [] };
  }
}

export function saveTrashManifest(manifest: TrashManifest): void {
  ensureTrashDir();
  const path = getTrashManifestPath();
  writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
}

export function listTrash(): TrashItem[] {
  const manifest = loadTrashManifest();
  return manifest.items;
}

export function getTrashCount(): number {
  return listTrash().length;
}

export interface MoveToTrashOptions {
  type: TrashItem['type'];
  name: string;
  originalPath: string;
  scope: TrashItem['scope'];
  projectPath?: string;
  mcpConfig?: McpServerConfig;
}

export async function moveToTrash(options: MoveToTrashOptions): Promise<ActionResult> {
  const { type, name, originalPath, scope, projectPath, mcpConfig } = options;

  ensureTrashDir();

  const id = randomUUID();
  const deletedAt = new Date().toISOString();

  let trashPath: string;
  let isSymlink = false;
  let symlinkTarget: string | undefined;

  if (type === 'mcp') {
    trashPath = join(getTrashDir(), `mcp-${id}.json`);
    writeFileSync(trashPath, JSON.stringify(mcpConfig, null, 2) + '\n', 'utf-8');
  } else if (existsSync(originalPath)) {
    const stats = lstatSync(originalPath);

    if (stats.isSymbolicLink()) {
      isSymlink = true;
      symlinkTarget = readlinkSync(originalPath);
      trashPath = join(getTrashDir(), `${type}-${id}.symlink`);
      writeFileSync(trashPath, symlinkTarget, 'utf-8');
      rmSync(originalPath);
    } else if (stats.isDirectory()) {
      trashPath = join(getTrashDir(), `${type}-${id}`);
      cpSync(originalPath, trashPath, { recursive: true });
      rmSync(originalPath, { recursive: true });
    } else {
      const ext = basename(originalPath).includes('.') ? basename(originalPath).split('.').pop() : 'md';
      trashPath = join(getTrashDir(), `${type}-${id}.${ext}`);
      cpSync(originalPath, trashPath);
      rmSync(originalPath);
    }
  } else {
    return error(`File not found: ${originalPath}`);
  }

  const trashItem: TrashItem = {
    id,
    type,
    name,
    originalPath,
    trashPath,
    deletedAt,
    scope,
    projectPath,
    isSymlink,
    symlinkTarget,
    mcpConfig,
  };

  const manifest = loadTrashManifest();
  manifest.items.push(trashItem);
  saveTrashManifest(manifest);

  return success(`Moved "${name}" to trash`);
}

export async function restoreFromTrash(id: string): Promise<ActionResult> {
  const manifest = loadTrashManifest();
  const itemIndex = manifest.items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return error(`Item not found in trash: ${id}`);
  }

  const item = manifest.items[itemIndex];

  if (existsSync(item.originalPath)) {
    return error(`Cannot restore: file already exists at ${item.originalPath}`);
  }

  const originalDir = dirname(item.originalPath);
  if (!existsSync(originalDir)) {
    mkdirSync(originalDir, { recursive: true });
  }

  try {
    if (item.type === 'mcp') {
      return error('MCP restoration requires special handling - use the MCP restore function');
    } else if (item.isSymlink && item.symlinkTarget) {
      symlinkSync(item.symlinkTarget, item.originalPath);
      rmSync(item.trashPath);
    } else if (existsSync(item.trashPath)) {
      const stats = lstatSync(item.trashPath);
      if (stats.isDirectory()) {
        cpSync(item.trashPath, item.originalPath, { recursive: true });
        rmSync(item.trashPath, { recursive: true });
      } else {
        cpSync(item.trashPath, item.originalPath);
        rmSync(item.trashPath);
      }
    } else {
      return error(`Trash file not found: ${item.trashPath}`);
    }

    manifest.items.splice(itemIndex, 1);
    saveTrashManifest(manifest);

    return success(`Restored "${item.name}" to ${item.originalPath}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to restore: ${msg}`);
  }
}

export async function permanentlyDelete(id: string): Promise<ActionResult> {
  const manifest = loadTrashManifest();
  const itemIndex = manifest.items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return error(`Item not found in trash: ${id}`);
  }

  const item = manifest.items[itemIndex];

  try {
    if (existsSync(item.trashPath)) {
      const stats = lstatSync(item.trashPath);
      if (stats.isDirectory()) {
        rmSync(item.trashPath, { recursive: true });
      } else {
        rmSync(item.trashPath);
      }
    }

    manifest.items.splice(itemIndex, 1);
    saveTrashManifest(manifest);

    return success(`Permanently deleted "${item.name}"`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return error(`Failed to delete: ${msg}`);
  }
}

export async function emptyTrash(): Promise<ActionResult> {
  const manifest = loadTrashManifest();

  if (manifest.items.length === 0) {
    return success('Trash is already empty');
  }

  let deleted = 0;
  let failed = 0;

  for (const item of manifest.items) {
    try {
      if (existsSync(item.trashPath)) {
        const stats = lstatSync(item.trashPath);
        if (stats.isDirectory()) {
          rmSync(item.trashPath, { recursive: true });
        } else {
          rmSync(item.trashPath);
        }
      }
      deleted++;
    } catch {
      failed++;
    }
  }

  manifest.items = [];
  saveTrashManifest(manifest);

  if (failed > 0) {
    return success(`Emptied trash: ${deleted} items deleted, ${failed} failed`);
  }

  return success(`Emptied trash: ${deleted} items permanently deleted`);
}

export function getTrashItem(id: string): TrashItem | null {
  const manifest = loadTrashManifest();
  return manifest.items.find((item) => item.id === id) ?? null;
}
