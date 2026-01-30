import React from 'react';
import { Box, Text } from 'ink';
import { Breadcrumb } from './Breadcrumb.js';

const VERSION = '0.1.0';

interface AppHeaderProps {
  breadcrumbPath: string[];
}

export function AppHeader({ breadcrumbPath }: AppHeaderProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Text dimColor>claude-lens v{VERSION}</Text>
      <Breadcrumb path={breadcrumbPath} />
    </Box>
  );
}
