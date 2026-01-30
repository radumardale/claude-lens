import React from 'react';
import { Box, Text, useInput } from 'ink';

interface ConfirmDialogProps {
  title: string;
  itemName: string;
  itemPath?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  itemName,
  itemPath,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): React.ReactElement {
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') {
      onConfirm();
    } else if (input === 'n' || input === 'N' || key.escape) {
      onCancel();
    }
  });

  const borderColor = danger ? 'red' : 'yellow';
  const titleColor = danger ? 'red' : 'yellow';

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={borderColor}
      paddingX={2}
      paddingY={1}
      marginTop={1}
    >
      <Box marginBottom={1}>
        <Text bold color={titleColor}>
          ⚠ {title}
        </Text>
      </Box>

      <Box marginBottom={1} flexDirection="column">
        <Text bold>"{itemName}"</Text>
        {itemPath && (
          <Text dimColor>{itemPath}</Text>
        )}
      </Box>

      <Box marginBottom={1}>
        <Text>{message}</Text>
      </Box>

      <Box>
        <Text color="cyan">[y]</Text>
        <Text> {confirmLabel}    </Text>
        <Text color="cyan">[n]</Text>
        <Text> {cancelLabel}</Text>
      </Box>
    </Box>
  );
}
