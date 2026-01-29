import React from 'react';
import { Box, Text } from 'ink';
import type { Category } from '../views/DashboardView.js';

interface SidebarProps {
  selected: Category;
  onSelect: (category: Category) => void;
  focused: boolean;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'plugins', label: 'Plugins' },
  { key: 'agents', label: 'Agents' },
  { key: 'commands', label: 'Commands' },
  { key: 'skills', label: 'Skills' },
  { key: 'mcps', label: 'MCPs' },
  { key: 'projects', label: 'Projects' },
];

export function Sidebar({ selected, onSelect, focused }: SidebarProps): React.ReactElement {
  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? 'green' : 'gray'}
      paddingX={1}
      width={14}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = cat.key === selected;
        return (
          <Box key={cat.key}>
            <Text
              color={isSelected ? 'green' : focused ? 'white' : 'gray'}
              bold={isSelected}
            >
              {isSelected ? '▶ ' : '  '}
              {cat.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}

export { CATEGORIES };
