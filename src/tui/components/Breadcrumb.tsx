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
        return (
          <React.Fragment key={index}>
            <Text color={isLast ? 'cyan' : 'gray'} bold={isLast}>
              {segment}
            </Text>
            {!isLast && <Text dimColor> › </Text>}
          </React.Fragment>
        );
      })}
    </Box>
  );
}
