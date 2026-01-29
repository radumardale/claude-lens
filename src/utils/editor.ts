import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import type { EditorConfig } from '../types/index.js';

export interface OpenEditorResult {
  success: boolean;
  message: string;
}

export function openInEditor(
  filePath: string,
  config: EditorConfig,
  options?: {
    onSuspend?: () => void;
    onResume?: () => void;
  }
): OpenEditorResult {
  if (!existsSync(filePath)) {
    return { success: false, message: `File not found: ${filePath}` };
  }

  const args = [...(config.args ?? []), filePath];

  if (config.type === 'terminal') {
    options?.onSuspend?.();

    const result = spawnSync(config.command, args, {
      stdio: 'inherit',
      shell: true,
    });

    options?.onResume?.();

    if (result.error) {
      return { success: false, message: `Failed to open editor: ${result.error.message}` };
    }

    if (result.status !== 0) {
      return { success: false, message: `Editor exited with code ${result.status}` };
    }

    return { success: true, message: 'Editor closed' };
  }

  const child = spawn(config.command, args, {
    stdio: 'ignore',
    detached: true,
    shell: true,
  });

  child.unref();

  child.on('error', () => {
    // Silently ignore - GUI editors may not report errors back
  });

  return { success: true, message: `Opened in ${config.command}` };
}

export function checkEditorExists(config: EditorConfig): boolean {
  try {
    const result = spawnSync('which', [config.command], { stdio: 'pipe' });
    return result.status === 0;
  } catch {
    return false;
  }
}
