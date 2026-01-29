import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { HelpBar, DETAIL_HELP, DETAIL_READONLY_HELP, type HelpItem } from '../components/HelpBar.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import type { Category } from './DashboardView.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';

interface DetailViewProps {
  data: ScanResult;
  category: Category;
  itemId: string;
  onBack: () => void;
  onQuit: () => void;
  onToggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
}

interface DetailInfo {
  title: string;
  type: ComponentType | null;
  name: string;
  enabled: boolean;
  projectPath?: string;
  pluginName?: string;
  fields: { label: string; value: string }[];
}

const DETAIL_PLUGIN_HELP: HelpItem[] = [
  { key: 'p', label: 'Go to plugin' },
  { key: 'h/Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

function getDetailInfo(
  data: ScanResult,
  category: Category,
  itemId: string
): DetailInfo | null {
  switch (category) {
    case 'plugins': {
      const plugin = data.plugins.find((p) => p.id === itemId);
      if (!plugin) return null;
      return {
        title: 'Plugin',
        type: 'plugin',
        name: plugin.name,
        enabled: plugin.enabled,
        fields: [
          { label: 'ID', value: plugin.id },
          { label: 'Version', value: plugin.version },
          { label: 'Marketplace', value: plugin.marketplace },
          { label: 'Install Path', value: plugin.installPath },
          { label: 'Installed At', value: plugin.installedAt },
          { label: 'Last Updated', value: plugin.lastUpdated },
        ],
      };
    }
    case 'agents': {
      const agent = data.agents.find((a) => a.filePath === itemId);
      if (!agent) return null;
      return {
        title: 'Agent',
        type: 'agent',
        name: agent.name,
        enabled: agent.enabled,
        fields: [
          { label: 'Description', value: agent.description || '(none)' },
          { label: 'Model', value: agent.model || '(default)' },
          { label: 'Color', value: agent.color || '(none)' },
          { label: 'File Path', value: agent.filePath },
        ],
      };
    }
    case 'commands': {
      const command = data.commands.find((c) => c.filePath === itemId);
      if (!command) return null;
      return {
        title: 'Command',
        type: 'command',
        name: command.name,
        enabled: command.enabled,
        fields: [
          { label: 'File Path', value: command.filePath },
          { label: 'Content Preview', value: command.content.slice(0, 100) + (command.content.length > 100 ? '...' : '') },
        ],
      };
    }
    case 'skills': {
      const skill = data.skills.find((s) => s.filePath === itemId);
      if (!skill) return null;
      return {
        title: 'Skill',
        type: skill.scope === 'plugin' ? null : 'skill', // Plugin skills can't be toggled
        name: skill.name,
        enabled: skill.enabled,
        pluginName: skill.pluginName,
        fields: [
          { label: 'Description', value: skill.description || '(none)' },
          { label: 'Source', value: skill.source },
          { label: 'Plugin', value: skill.pluginName || '(none)' },
          { label: 'MCP Server', value: skill.metadata?.mcpServer || '(none)' },
          { label: 'File Path', value: skill.filePath },
        ],
      };
    }
    case 'mcps': {
      const parts = itemId.split(':');
      const scope = parts[0];
      const projectPath = parts[1] || undefined;
      const name = parts[2] || parts[1];
      const mcp = data.mcpServers.find(
        (m) => m.name === name && m.scope === scope && m.projectPath === projectPath
      );
      if (!mcp) return null;
      return {
        title: 'MCP Server',
        type: mcp.scope === 'plugin' ? null : 'mcp', // Plugin MCPs can't be toggled
        name: mcp.name,
        enabled: mcp.enabled,
        projectPath: mcp.projectPath,
        pluginName: mcp.pluginName,
        fields: [
          { label: 'Scope', value: mcp.scope },
          { label: 'Plugin', value: mcp.pluginName || '(none)' },
          { label: 'Type', value: mcp.type || '(unknown)' },
          { label: 'URL', value: mcp.url || '(none)' },
          { label: 'Command', value: mcp.command || '(none)' },
          { label: 'Args', value: mcp.args?.join(' ') || '(none)' },
          { label: 'Config Path', value: mcp.configPath },
          { label: 'Project Path', value: mcp.projectPath || '(global)' },
        ],
      };
    }
    default:
      return null;
  }
}

export function DetailView({
  data,
  category,
  itemId,
  onBack,
  onQuit,
  onToggle,
}: DetailViewProps): React.ReactElement {
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const detail = useMemo(() => getDetailInfo(data, category, itemId), [data, category, itemId]);

  const handleToggle = async () => {
    if (!detail || !detail.type || isToggling) return;

    setIsToggling(true);
    setStatusMessage({ text: 'Toggling...', color: 'yellow' });

    try {
      const result = await onToggle(detail.type, detail.name, detail.enabled, detail.projectPath);
      if (result.success) {
        setStatusMessage({ text: result.message, color: 'green' });
      } else {
        setStatusMessage({ text: result.message, color: 'red' });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setIsToggling(false);
    }

    setTimeout(() => setStatusMessage(null), 3000);
  };

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }
    // Back navigation: Esc, h, or left arrow
    if (key.escape || input === 'h' || key.leftArrow) {
      onBack();
      return;
    }
    // Navigate to parent plugin
    if (input === 'p' && detail?.pluginName) {
      setStatusMessage({ text: `Part of "${detail.pluginName}" plugin. Use main menu to view plugins.`, color: 'cyan' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    if (input === ' ' && detail?.type) {
      handleToggle();
    }
  });

  if (!detail) {
    return (
      <Box padding={1} flexDirection="column">
        <Text color="red">Item not found</Text>
        <Text dimColor>Press Esc to go back</Text>
      </Box>
    );
  }

  const statusColor = detail.enabled ? 'green' : 'red';
  const statusText = detail.enabled ? 'Enabled' : 'Disabled';

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const breadcrumbPath = ['Dashboard', categoryLabel, detail.name];

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} flexDirection="column">
        <Breadcrumb path={breadcrumbPath} />
      </Box>

      <Box marginBottom={1}>
        <Text bold color="cyan">
          {detail.title}: {detail.name}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Status: </Text>
        <Text color={statusColor} bold>
          {statusText}
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        marginBottom={1}
      >
        {detail.fields.map((field) => (
          <Box key={field.label}>
            <Text dimColor>{field.label.padEnd(14)}</Text>
            <Text>{field.value}</Text>
          </Box>
        ))}
      </Box>

      {statusMessage && (
        <Box marginBottom={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      <HelpBar items={detail.pluginName ? DETAIL_PLUGIN_HELP : detail.type ? DETAIL_HELP : DETAIL_READONLY_HELP} />
    </Box>
  );
}
