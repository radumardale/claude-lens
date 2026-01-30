import React from 'react';
import { Box, Text } from 'ink';

export interface ListItem {
  id: string;
  name: string;
  enabled: boolean;
  detail?: string;
  readonly?: boolean;
  hideCheckbox?: boolean;
  indent?: number;
  isGroupHeader?: boolean;
  parentPlugin?: string;
}

interface ComponentListProps {
  items: ListItem[];
  selectedIndex: number;
  focused: boolean;
  emptyMessage?: string;
  header?: string;
}

export function ComponentList({
  items,
  selectedIndex,
  focused,
  emptyMessage = 'No items found',
  header,
}: ComponentListProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <Box paddingX={1}>
        <Text dimColor>{emptyMessage}</Text>
      </Box>
    );
  }

  const firstSystemIndex = items.findIndex((item) => item.readonly);
  const hasProjectItems = firstSystemIndex !== 0;
  const hasSystemItems = firstSystemIndex !== -1;

  return (
    <Box flexDirection="column" paddingX={1}>
      {header && (
        <Box>
          <Text dimColor>  {'Name'.padEnd(28)}  {header}</Text>
        </Box>
      )}
      {items.map((item, index) => {
        const isSelected = index === selectedIndex && focused;
        const indentSpaces = '  '.repeat(item.indent || 0);
        const prefix = isSelected ? '▶ ' : '  ';
        const showSeparator = hasProjectItems && hasSystemItems && index === firstSystemIndex;
        const nameWidth = 28 - (item.indent || 0) * 2;

        if (item.isGroupHeader) {
          return (
            <Box key={item.id}>
              <Text dimColor>
                {indentSpaces}{item.name}
              </Text>
            </Box>
          );
        }

        if (item.readonly) {
          return (
            <React.Fragment key={item.id}>
              {showSeparator && (
                <Box>
                  <Text dimColor>  ────────────────────────────────</Text>
                </Box>
              )}
              <Box>
                <Text dimColor>
                  {indentSpaces}{prefix}
                  {item.name.padEnd(Math.max(1, nameWidth))}
                </Text>
                <Text dimColor>[{item.enabled ? '✓' : ' '}]</Text>
                {item.detail && (
                  <Text dimColor> {item.detail}</Text>
                )}
              </Box>
            </React.Fragment>
          );
        }

        const checkboxColor = item.enabled ? 'green' : 'red';
        const checkboxContent = item.enabled ? '✓' : ' ';

        return (
          <Box key={item.id}>
            <Text dimColor>{indentSpaces}</Text>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {prefix}
            </Text>
            <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
              {item.name.padEnd(Math.max(1, nameWidth))}
            </Text>
            {!item.hideCheckbox && (
              <Text color={checkboxColor}>[{checkboxContent}]</Text>
            )}
            {item.detail && (
              <Text dimColor> {item.detail}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
