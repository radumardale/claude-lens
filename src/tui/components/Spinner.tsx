import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

interface SpinnerProps {
  text?: string;
}

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Spinner({ text }: SpinnerProps): React.ReactElement {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text color="yellow">
      {FRAMES[frameIndex]} {text || 'Loading...'}
    </Text>
  );
}
