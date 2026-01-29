import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { HelpBar } from '../components/HelpBar.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';

interface ProjectMcpViewProps {
  data: ScanResult;
  projectPath: string;
  onBack: () => void;
  onQuit: () => void;
  onToggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
}

const PROJECT_MCP_HELP = [
  { key: '↑/↓', label: 'Navigate' },
  { key: 'Space', label: 'Toggle' },
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

export function ProjectMcpView({
  data,
  projectPath,
  onBack,
  onQuit,
  onToggle,
}: ProjectMcpViewProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const projectName = projectPath.split('/').pop() || projectPath;

  const projectMcps = useMemo(
    () => data.mcpServers.filter((m) => m.scope === 'project' && m.projectPath === projectPath),
    [data.mcpServers, projectPath]
  );

  const handleToggle = async () => {
    if (projectMcps.length === 0 || isToggling) return;

    const mcp = projectMcps[selectedIndex];
    setIsToggling(true);
    setStatusMessage({ text: 'Toggling...', color: 'yellow' });

    try {
      const result = await onToggle('mcp', mcp.name, mcp.enabled, projectPath);
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

    if (key.escape) {
      onBack();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : projectMcps.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < projectMcps.length - 1 ? prev + 1 : 0));
    } else if (input === ' ' && projectMcps.length > 0) {
      handleToggle();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Project: {projectName}
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>{projectPath}</Text>
      </Box>
      <Box marginBottom={1}>
        <Text dimColor>────────────────────────────────────────</Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold>MCP Servers ({projectMcps.length})</Text>
      </Box>

      {projectMcps.length === 0 ? (
        <Box paddingX={1}>
          <Text dimColor>No MCP servers configured for this project</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {projectMcps.map((mcp, index) => {
            const isSelected = index === selectedIndex;
            const prefix = isSelected ? '▶ ' : '  ';
            const statusColor = mcp.enabled ? 'green' : 'red';
            const statusText = mcp.enabled ? '✓ enabled' : '✗ disabled';

            return (
              <Box key={mcp.name}>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {prefix}
                  {mcp.name.padEnd(24)}
                </Text>
                <Text color={statusColor}>{statusText}</Text>
              </Box>
            );
          })}
        </Box>
      )}

      {statusMessage && (
        <Box marginTop={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      <HelpBar items={PROJECT_MCP_HELP} />
    </Box>
  );
}
