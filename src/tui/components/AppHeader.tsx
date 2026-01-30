import React from 'react';
import { Box, Text } from 'ink';
import { Breadcrumb } from './Breadcrumb.js';
import { APP_VERSION } from '../../utils/version.js';

interface AppHeaderProps {
  breadcrumbPath: string[];
}

export function AppHeader({ breadcrumbPath }: AppHeaderProps): React.ReactElement {
  return (
    <Box flexDirection="column">
      <Text dimColor>claude-lens v{APP_VERSION}</Text>
      <Breadcrumb path={breadcrumbPath} />
    </Box>
  );
}
