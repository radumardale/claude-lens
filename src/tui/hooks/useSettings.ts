import { useState, useEffect, useCallback } from 'react';
import {
  loadSettings,
  saveSettings,
  getDefaultSettings,
  getEditorConfig,
  detectDefaultEditor,
  getEditorDisplayName,
} from '../../utils/settings.js';
import { checkEditorExists, openInEditor } from '../../utils/editor.js';
import type { ClaudeLensSettings, EditorConfig } from '../../types/index.js';

export interface UseSettingsReturn {
  settings: ClaudeLensSettings;
  updateSettings: (partial: Partial<ClaudeLensSettings>) => void;
  resetToDefaults: () => void;
  editorConfig: EditorConfig | null;
  editorName: string | null;
  editorAvailable: boolean;
  openFile: (
    filePath: string,
    callbacks?: { onSuspend?: () => void; onResume?: () => void }
  ) => { success: boolean; message: string };
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<ClaudeLensSettings>(() => loadSettings());

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSettings = useCallback((partial: Partial<ClaudeLensSettings>) => {
    setSettings((prev) => {
      const updated: ClaudeLensSettings = {
        ...prev,
        ...partial,
        display: partial.display
          ? { ...prev.display, ...partial.display }
          : prev.display,
      };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    saveSettings(defaults);
  }, []);

  const editorConfig = getEditorConfig(settings);
  const editorName = editorConfig ? getEditorDisplayName(editorConfig) : null;
  const editorAvailable = editorConfig ? checkEditorExists(editorConfig) : false;

  const openFile = useCallback(
    (
      filePath: string,
      callbacks?: { onSuspend?: () => void; onResume?: () => void }
    ) => {
      if (!editorConfig) {
        return { success: false, message: 'No editor configured' };
      }

      if (!editorAvailable) {
        return { success: false, message: `Editor "${editorName}" not found` };
      }

      return openInEditor(filePath, editorConfig, callbacks);
    },
    [editorConfig, editorAvailable, editorName]
  );

  return {
    settings,
    updateSettings,
    resetToDefaults,
    editorConfig,
    editorName,
    editorAvailable,
    openFile,
  };
}

export function useEditorInfo(): {
  detected: EditorConfig | null;
  detectedName: string | null;
  source: 'settings' | '$VISUAL' | '$EDITOR' | 'auto' | 'none';
} {
  const settings = loadSettings();

  if (settings.editor) {
    return {
      detected: settings.editor,
      detectedName: getEditorDisplayName(settings.editor),
      source: 'settings',
    };
  }

  if (process.env.VISUAL) {
    const config = detectDefaultEditor();
    return {
      detected: config,
      detectedName: config ? getEditorDisplayName(config) : null,
      source: '$VISUAL',
    };
  }

  if (process.env.EDITOR) {
    const config = detectDefaultEditor();
    return {
      detected: config,
      detectedName: config ? getEditorDisplayName(config) : null,
      source: '$EDITOR',
    };
  }

  const config = detectDefaultEditor();
  if (config) {
    return {
      detected: config,
      detectedName: getEditorDisplayName(config),
      source: 'auto',
    };
  }

  return {
    detected: null,
    detectedName: null,
    source: 'none',
  };
}
