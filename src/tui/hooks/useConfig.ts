import { useState, useEffect, useCallback } from 'react';
import { scan } from '../../scanner/index.js';
import { enablePlugin, disablePlugin } from '../../actions/plugins.js';
import { enableAgent, disableAgent } from '../../actions/agents.js';
import { enableCommand, disableCommand } from '../../actions/commands.js';
import { enableSkill, disableSkill } from '../../actions/skills.js';
import { enableMcp, disableMcp } from '../../actions/mcps.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';

export interface ConfigState {
  data: ScanResult | null;
  loading: boolean;
  error: string | null;
}

export interface UseConfigReturn {
  state: ConfigState;
  refresh: () => Promise<void>;
  toggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
}

export function useConfig(): UseConfigReturn {
  const [state, setState] = useState<ConfigState>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await scan();
      setState({ data: result, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const toggle = useCallback(
    async (
      type: ComponentType,
      name: string,
      enabled: boolean,
      projectPath?: string
    ): Promise<ActionResult> => {
      let result: ActionResult;

      switch (type) {
        case 'plugin':
          result = enabled
            ? await disablePlugin(name)
            : await enablePlugin(name);
          break;
        case 'agent':
          result = enabled
            ? await disableAgent(name, projectPath)
            : await enableAgent(name, projectPath);
          break;
        case 'command':
          result = enabled
            ? await disableCommand(name, projectPath)
            : await enableCommand(name, projectPath);
          break;
        case 'skill':
          result = enabled
            ? await disableSkill(name, projectPath)
            : await enableSkill(name, projectPath);
          break;
        case 'mcp':
          result = enabled
            ? await disableMcp(name, projectPath)
            : await enableMcp(name, projectPath);
          break;
        default:
          result = { success: false, message: `Unknown component type: ${type}` };
      }

      if (result.success) {
        await refresh();
      }

      return result;
    },
    [refresh]
  );

  return { state, refresh, toggle };
}
