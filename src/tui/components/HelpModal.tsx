import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { HelpItem } from './HelpBar.js';

interface HelpModalProps {
  title?: string;
  items: HelpItem[];
  onClose: () => void;
}

export function HelpModal({ title = 'Keyboard Shortcuts', items, onClose }: HelpModalProps): React.ReactElement {
  useInput((input, key) => {
    if (key.escape || input === '?') {
      onClose();
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor="cyan"
      paddingX={2}
      paddingY={1}
      marginTop={1}
    >
      <Box marginBottom={1}>
        <Text bold color="cyan">{title}</Text>
      </Box>

      <Box flexDirection="column">
        {items.map((item) => (
          <Box key={item.key}>
            <Text color="cyan">{item.key.padEnd(12)}</Text>
            <Text>{item.label}</Text>
          </Box>
        ))}
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press ? or Esc to close</Text>
      </Box>
    </Box>
  );
}
