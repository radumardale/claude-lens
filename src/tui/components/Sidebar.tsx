import React from 'react';
import { Box, Text } from 'ink';
import type { Category } from '../views/DashboardView.js';

interface SidebarProps {
  selected: Category;
  onSelect: (category: Category) => void;
  focused: boolean;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'mcps', label: 'MCP Servers' },
  { key: 'agents', label: 'Agents' },
  { key: 'skills', label: 'Skills' },
  { key: 'commands', label: 'Commands' },
  { key: 'plugins', label: 'Plugins' },
  { key: 'projects', label: 'Projects' },
];

export function Sidebar({ selected, onSelect, focused }: SidebarProps): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? 'green' : 'gray'}
      paddingX={1}
      width={16}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = cat.key === selected;
        const isProjects = cat.key === 'projects';
        return (
          <React.Fragment key={cat.key}>
            {isProjects && (
              <Box>
                <Text dimColor>───────────</Text>
              </Box>
            )}
            <Box>
              <Text
                color={isSelected ? 'green' : isProjects ? 'gray' : focused ? 'white' : 'gray'}
                bold={isSelected}
              >
                {isSelected ? '▶ ' : '  '}
                {cat.label}
              </Text>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
}

export { CATEGORIES };
