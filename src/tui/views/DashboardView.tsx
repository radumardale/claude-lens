import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { HelpBar, DASHBOARD_HELP } from '../components/HelpBar.js';
import { Breadcrumb } from '../components/Breadcrumb.js';
import type { ScanResult } from '../../types/index.js';

const VERSION = '0.1.0';

export type Category = 'plugins' | 'agents' | 'commands' | 'skills' | 'mcps' | 'projects';

interface DashboardViewProps {
  data: ScanResult;
  onSelect: (category: Category) => void;
  onOpenSettings?: () => void;
  onQuit: () => void;
}

interface CategoryInfo {
  key: Category;
  label: string;
  enabled: number;
  disabled: number;
  total: number;
}

type MenuItem =
  | { type: 'category'; info: CategoryInfo }
  | { type: 'settings' }
  | { type: 'separator' };

export function DashboardView({ data, onSelect, onOpenSettings, onQuit }: DashboardViewProps): React.ReactElement {
  const categories: CategoryInfo[] = [
    {
      key: 'mcps',
      label: 'MCP Servers',
      enabled: data.mcpServers.filter((m) => m.enabled).length,
      disabled: data.mcpServers.filter((m) => !m.enabled).length,
      total: data.mcpServers.length,
    },
    {
      key: 'agents',
      label: 'Agents',
      enabled: data.agents.filter((a) => a.enabled).length,
      disabled: data.agents.filter((a) => !a.enabled).length,
      total: data.agents.length,
    },
    {
      key: 'skills',
      label: 'Skills',
      enabled: data.skills.filter((s) => s.enabled).length,
      disabled: data.skills.filter((s) => !s.enabled).length,
      total: data.skills.length,
    },
    {
      key: 'commands',
      label: 'Commands',
      enabled: data.commands.filter((c) => c.enabled).length,
      disabled: data.commands.filter((c) => !c.enabled).length,
      total: data.commands.length,
    },
    {
      key: 'plugins',
      label: 'Plugins',
      enabled: data.plugins.filter((p) => p.enabled).length,
      disabled: data.plugins.filter((p) => !p.enabled).length,
      total: data.plugins.length,
    },
    {
      key: 'projects',
      label: 'Projects',
      enabled: data.projects.length,
      disabled: 0,
      total: data.projects.length,
    },
  ];

  const menuItems: MenuItem[] = [
    ...categories.slice(0, 5).map((info): MenuItem => ({ type: 'category', info })),
    { type: 'separator' },
    { type: 'category', info: categories[5] }, // Projects
    { type: 'separator' },
    { type: 'settings' },
  ];

  const selectableIndices = menuItems
    .map((item, i) => (item.type !== 'separator' ? i : -1))
    .filter((i) => i >= 0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }
    // Vim navigation: k = up, j = down
    if (key.upArrow || input === 'k') {
      const currentIdx = selectableIndices.indexOf(selectedIndex);
      if (currentIdx > 0) {
        setSelectedIndex(selectableIndices[currentIdx - 1]);
      } else {
        setSelectedIndex(selectableIndices[selectableIndices.length - 1]);
      }
    } else if (key.downArrow || input === 'j') {
      const currentIdx = selectableIndices.indexOf(selectedIndex);
      if (currentIdx < selectableIndices.length - 1) {
        setSelectedIndex(selectableIndices[currentIdx + 1]);
      } else {
        setSelectedIndex(selectableIndices[0]);
      }
    } else if (key.return || input === 'l' || key.rightArrow) {
      const item = menuItems[selectedIndex];
      if (item.type === 'category') {
        onSelect(item.info.key);
      } else if (item.type === 'settings' && onOpenSettings) {
        onOpenSettings();
      }
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1} flexDirection="column">
        <Text dimColor>claude-lens v{VERSION}</Text>
        <Breadcrumb path={['Dashboard']} />
      </Box>

      <Box flexDirection="column">
        {menuItems.map((item, index) => {
          if (item.type === 'separator') {
            return (
              <Box key={`sep-${index}`} marginY={0}>
                <Text dimColor>  ─────────────────────────────────</Text>
              </Box>
            );
          }

          const isSelected = index === selectedIndex;
          const prefix = isSelected ? '▶ ' : '  ';

          if (item.type === 'settings') {
            return (
              <Box key="settings">
                <Text color={isSelected ? 'green' : 'gray'} bold={isSelected}>
                  {prefix}Settings       Configure claude-lens
                </Text>
              </Box>
            );
          }

          const cat = item.info;
          const statusText =
            cat.key === 'projects'
              ? `${cat.total} configured`
              : `${cat.enabled} enabled, ${cat.disabled} disabled`;
          const isProjects = cat.key === 'projects';

          return (
            <Box key={cat.key}>
              <Text
                color={isSelected ? 'green' : isProjects ? 'gray' : undefined}
                bold={isSelected}
              >
                {prefix}
                {cat.label.padEnd(14)} {statusText}
              </Text>
            </Box>
          );
        })}
      </Box>

      <HelpBar items={DASHBOARD_HELP} />
    </Box>
  );
}
