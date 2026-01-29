import React from 'react';
import { Box, Text } from 'ink';

export interface HelpItem {
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
  { key: 'j/k', label: 'Navigate' },
  { key: 'l/Enter', label: 'Select' },
  { key: 'q', label: 'Quit' },
];

// Basic help shown in the help bar (compact)
export const LIST_HELP_BASIC: HelpItem[] = [
  { key: 'j/k', label: 'Navigate' },
  { key: 'Space', label: 'Toggle' },
  { key: 'Enter', label: 'Details' },
  { key: 'Esc', label: 'Back' },
  { key: '?', label: 'Help' },
];

// Full help shown in modal
export const LIST_HELP_FULL: HelpItem[] = [
  { key: 'j/k', label: 'Navigate up/down' },
  { key: 'h/l', label: 'Switch focus (sidebar/list)' },
  { key: 'Space', label: 'Toggle enable/disable' },
  { key: 'Enter/l', label: 'View details' },
  { key: 'Esc/h', label: 'Go back' },
  { key: '/', label: 'Search' },
  { key: 'e/d/a', label: 'Filter (enabled/disabled/all)' },
  { key: 'u', label: 'Undo last toggle' },
  { key: 'q', label: 'Quit' },
];

// Keep old LIST_HELP for backwards compatibility
export const LIST_HELP: HelpItem[] = LIST_HELP_BASIC;

export const SEARCH_HELP: HelpItem[] = [
  { key: 'Type', label: 'Search' },
  { key: 'Enter', label: 'Confirm' },
  { key: 'Esc', label: 'Cancel' },
];

export const DETAIL_HELP: HelpItem[] = [
  { key: 'Space', label: 'Toggle' },
  { key: 'h/Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

export const DETAIL_READONLY_HELP: HelpItem[] = [
  { key: 'h/Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

// Project Dashboard - Basic help shown in bar
export const PROJECT_DASHBOARD_HELP_BASIC: HelpItem[] = [
  { key: 'j/k', label: 'Navigate' },
  { key: 'Space', label: 'Toggle' },
  { key: 'Esc', label: 'Back' },
  { key: '?', label: 'Help' },
];

// Project Dashboard - Full help shown in modal
export const PROJECT_DASHBOARD_HELP_FULL: HelpItem[] = [
  { key: 'j/k', label: 'Navigate up/down' },
  { key: 'h/l', label: 'Switch focus (sidebar/list)' },
  { key: 'Space', label: 'Toggle enable/disable' },
  { key: 'Esc/h', label: 'Go back' },
  { key: 'e/d/a', label: 'Filter (enabled/disabled/all)' },
  { key: 'u', label: 'Undo last toggle' },
  { key: 'q', label: 'Quit' },
];

// Plugin Component - Basic help (no toggle, has plugin navigation)
export const PLUGIN_COMPONENT_HELP_BASIC: HelpItem[] = [
  { key: 'j/k', label: 'Navigate' },
  { key: 'p', label: 'Go to plugin' },
  { key: 'Esc', label: 'Back' },
  { key: '?', label: 'Help' },
];

// Plugin Component - Full help
export const PLUGIN_COMPONENT_HELP_FULL: HelpItem[] = [
  { key: 'j/k', label: 'Navigate up/down' },
  { key: 'h/l', label: 'Switch focus (sidebar/list)' },
  { key: 'p', label: 'Go to parent plugin' },
  { key: 'Esc/h', label: 'Go back' },
  { key: 'e/d/a', label: 'Filter (enabled/disabled/all)' },
  { key: 'q', label: 'Quit' },
];

// Keep old names for backwards compatibility
export const PLUGIN_COMPONENT_HELP: HelpItem[] = PLUGIN_COMPONENT_HELP_BASIC;
