import React from 'react';
import { Box, Text } from 'ink';

export interface ListItem {
  id: string;
  name: string;
  enabled: boolean;
  detail?: string;
}

interface ComponentListProps {
  items: ListItem[];
  selectedIndex: number;
  focused: boolean;
}

export function ComponentList({
  items,
  selectedIndex,
  focused,
}: ComponentListProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <Box paddingX={1}>
        <Text dimColor>No items found</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      {items.map((item, index) => {
        const isSelected = index === selectedIndex && focused;
        const prefix = isSelected ? '▶ ' : '  ';
        const statusColor = item.enabled ? 'green' : 'red';
        const statusText = item.enabled ? '✓' : '✗';

        return (
          <Box key={item.id}>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {prefix}
            </Text>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {item.name.padEnd(28)}
            </Text>
            <Text color={statusColor}>{statusText}</Text>
            {item.detail && (
              <Text dimColor> {item.detail}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
