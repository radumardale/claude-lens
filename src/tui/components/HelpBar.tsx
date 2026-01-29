import React from 'react';
import { Box, Text } from 'ink';

interface HelpItem {
  key: string;
  label: string;
}

interface HelpBarProps {
  items: HelpItem[];
}

export function HelpBar({ items }: HelpBarProps): React.ReactElement {
  return (
    <Box paddingX={1} marginTop={1}>
      {items.map((item, index) => (
        <Box key={item.key} marginRight={2}>
          <Text color="cyan">{item.key}</Text>
          <Text dimColor> {item.label}</Text>
          {index < items.length - 1 && <Text dimColor>  </Text>}
        </Box>
      ))}
    </Box>
  );
}

export const DASHBOARD_HELP: HelpItem[] = [
  { key: '↑/↓', label: 'Navigate' },
  { key: 'Enter', label: 'Select' },
  { key: 'q', label: 'Quit' },
];

export const LIST_HELP: HelpItem[] = [
  { key: '←/→', label: 'Focus' },
  { key: '↑/↓', label: 'Navigate' },
  { key: '/', label: 'Search' },
  { key: 'Space', label: 'Toggle' },
  { key: 'Enter', label: 'Details' },
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

export const SEARCH_HELP: HelpItem[] = [
  { key: 'Type', label: 'Search' },
  { key: 'Enter', label: 'Confirm' },
  { key: 'Esc', label: 'Cancel' },
];

export const DETAIL_HELP: HelpItem[] = [
  { key: 'Space', label: 'Toggle' },
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

export const DETAIL_READONLY_HELP: HelpItem[] = [
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];
