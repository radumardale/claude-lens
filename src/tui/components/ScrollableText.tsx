import React from 'react';
import { Box, Text, useInput } from 'ink';

interface ScrollableTextProps {
  content: string;
  height: number;
  showLineNumbers?: boolean;
  wordWrap?: boolean;
  scrollOffset: number;
  onScroll: (offset: number) => void;
  isActive?: boolean;
}

export function ScrollableText({
  content,
  height,
  showLineNumbers = true,
  wordWrap = true,
  scrollOffset,
  onScroll,
  isActive = true,
}: ScrollableTextProps): React.ReactElement {
  const lines = content.split('\n');
  const totalLines = lines.length;
  const maxScroll = Math.max(0, totalLines - height);
  const lineNumberWidth = String(totalLines).length;

  useInput(
    (input, key) => {
      if (!isActive) return;

      if (input === 'j' || key.downArrow) {
        onScroll(Math.min(scrollOffset + 1, maxScroll));
      } else if (input === 'k' || key.upArrow) {
        onScroll(Math.max(scrollOffset - 1, 0));
      } else if (input === 'd') {
        const halfPage = Math.floor(height / 2);
        onScroll(Math.min(scrollOffset + halfPage, maxScroll));
      } else if (input === 'u') {
        const halfPage = Math.floor(height / 2);
        onScroll(Math.max(scrollOffset - halfPage, 0));
      } else if (input === 'g') {
        onScroll(0);
      } else if (input === 'G') {
        onScroll(maxScroll);
      }
    },
    { isActive }
  );

  const visibleLines = lines.slice(scrollOffset, scrollOffset + height);
  const hasMoreAbove = scrollOffset > 0;
  const hasMoreBelow = scrollOffset < maxScroll;

  return (
    <Box flexDirection="column">
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
      >
        {visibleLines.map((line, index) => {
          const lineNumber = scrollOffset + index + 1;
          return (
            <Box key={index}>
              {showLineNumbers && (
                <Text dimColor>
                  {String(lineNumber).padStart(lineNumberWidth, ' ')}│{' '}
                </Text>
              )}
              <Text wrap={wordWrap ? 'wrap' : 'truncate'}>{line}</Text>
            </Box>
          );
        })}
      </Box>

      <Box justifyContent="flex-end" paddingRight={1}>
        <Text dimColor>
          {scrollOffset + 1}-{Math.min(scrollOffset + height, totalLines)}/{totalLines}
          {hasMoreAbove && ' ↑'}
          {hasMoreBelow && ' ↓'}
        </Text>
      </Box>
    </Box>
  );
}

export function useScrollableText(totalLines: number, visibleHeight: number) {
  const [scrollOffset, setScrollOffset] = React.useState(0);
  const maxScroll = Math.max(0, totalLines - visibleHeight);

  const scrollTo = React.useCallback(
    (offset: number) => {
      setScrollOffset(Math.max(0, Math.min(offset, maxScroll)));
    },
    [maxScroll]
  );

  const scrollToTop = React.useCallback(() => {
    setScrollOffset(0);
  }, []);

  const scrollToBottom = React.useCallback(() => {
    setScrollOffset(maxScroll);
  }, [maxScroll]);

  return {
    scrollOffset,
    setScrollOffset: scrollTo,
    scrollToTop,
    scrollToBottom,
    canScrollUp: scrollOffset > 0,
    canScrollDown: scrollOffset < maxScroll,
  };
}
