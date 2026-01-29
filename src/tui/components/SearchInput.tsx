import React from 'react';
import { Box, Text } from 'ink';

interface SearchInputProps {
  value: string;
  isActive: boolean;
}

export function SearchInput({ value, isActive }: SearchInputProps): React.ReactElement {
  if (!isActive && !value) {
    return <></>;
  }

  return (
    <Box paddingX={1}>
      <Text color="yellow">/</Text>
      <Text color={isActive ? 'white' : 'gray'}>{value}</Text>
      {isActive && <Text color="cyan">▌</Text>}
    </Box>
  );
}
