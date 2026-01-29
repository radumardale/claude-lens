import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ScanResult } from '../../types/index.js';

export type Category = 'plugins' | 'agents' | 'commands' | 'skills' | 'mcps' | 'projects';

interface DashboardViewProps {
  data: ScanResult;
  onSelect: (category: Category) => void;
  onQuit: () => void;
}

interface CategoryInfo {
  key: Category;
  label: string;
  enabled: number;
  disabled: number;
  total: number;
}

export function DashboardView({ data, onSelect, onQuit }: DashboardViewProps): React.ReactElement {
  const categories: CategoryInfo[] = [
    {
      key: 'plugins',
      label: 'Plugins',
      enabled: data.plugins.filter((p) => p.enabled).length,
      disabled: data.plugins.filter((p) => !p.enabled).length,
      total: data.plugins.length,
    },
    {
      key: 'agents',
      label: 'Agents',
      enabled: data.agents.filter((a) => a.enabled).length,
      disabled: data.agents.filter((a) => !a.enabled).length,
      total: data.agents.length,
    },
    {
      key: 'commands',
      label: 'Commands',
      enabled: data.commands.filter((c) => c.enabled).length,
      disabled: data.commands.filter((c) => !c.enabled).length,
      total: data.commands.length,
    },
    {
      key: 'skills',
      label: 'Skills',
      enabled: data.skills.filter((s) => s.enabled).length,
      disabled: data.skills.filter((s) => !s.enabled).length,
      total: data.skills.length,
    },
    {
      key: 'mcps',
      label: 'MCP Servers',
      enabled: data.mcpServers.filter((m) => m.enabled).length,
      disabled: data.mcpServers.filter((m) => !m.enabled).length,
      total: data.mcpServers.length,
    },
    {
      key: 'projects',
      label: 'Projects',
      enabled: data.projects.length,
      disabled: 0,
      total: data.projects.length,
    },
  ];

  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : categories.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < categories.length - 1 ? prev + 1 : 0));
    } else if (key.return) {
      onSelect(categories[selectedIndex].key);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          ╔═══════════════════════════════════════╗
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          ║      Claude Lens Configuration        ║
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text bold color="cyan">
          ╚═══════════════════════════════════════╝
        </Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        {categories.map((cat, index) => {
          const isSelected = index === selectedIndex;
          const prefix = isSelected ? '▶ ' : '  ';
          const statusText =
            cat.key === 'projects'
              ? `${cat.total} configured`
              : `${cat.enabled} enabled, ${cat.disabled} disabled`;

          return (
            <Box key={cat.key}>
              <Text
                color={isSelected ? 'green' : undefined}
                bold={isSelected}
              >
                {prefix}
                {cat.label.padEnd(14)} {statusText}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={2} flexDirection="column">
        <Text dimColor>
          ↑/↓ Navigate   Enter Select   q Quit
        </Text>
      </Box>
    </Box>
  );
}
