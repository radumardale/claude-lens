import React from 'react';
import { Box, Text, useInput, useApp } from 'ink';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps): React.ReactElement {
  const { exit } = useApp();

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }
    if (input === 'r' && onRetry) {
      onRetry();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="red" bold>
          ✗ Error
        </Text>
      </Box>
      <Box marginBottom={1}>
        <Text>{message}</Text>
      </Box>
      <Box>
        <Text dimColor>
          {onRetry ? 'r Retry   ' : ''}q Quit
        </Text>
      </Box>
    </Box>
  );
}
