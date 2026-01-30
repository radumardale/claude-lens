import React from 'react';
import { Box, Text } from 'ink';

interface BreadcrumbProps {
  path: string[];
}

export function Breadcrumb({ path }: BreadcrumbProps): React.ReactElement {
  if (path.length === 0) {
    return <Box />;
  }

  return (
    <Box>
      {path.map((segment, index) => {
        const isLast = index === path.length - 1;
        if (isLast) {
          return (
            <Text key={index} color="cyan" bold>
              {segment}
            </Text>
          );
        }
        return (
          <React.Fragment key={index}>
            <Text color="gray">{segment}</Text>
            <Text dimColor> › </Text>
          </React.Fragment>
        );
      })}
    </Box>
  );
}
