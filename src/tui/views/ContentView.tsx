import React, { useState } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { ScrollableText } from '../components/ScrollableText.js';
import { HelpBar, CONTENT_HELP_BASIC, CONTENT_HELP_FULL } from '../components/HelpBar.js';
import { HelpModal } from '../components/HelpModal.js';
import { AppHeader } from '../components/AppHeader.js';
import { useSettings } from '../hooks/useSettings.js';

interface ContentViewProps {
  title: string;
  content: string;
  filePath: string;
  breadcrumbPath: string[];
  onBack: () => void;
  onQuit: () => void;
}

export function ContentView({
  title,
  content,
  filePath,
  breadcrumbPath,
  onBack,
  onQuit,
}: ContentViewProps): React.ReactElement {
  const { stdout } = useStdout();
  const terminalHeight = stdout?.rows ?? 24;
  const contentHeight = Math.max(8, terminalHeight - 12);

  const [scrollOffset, setScrollOffset] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);

  const { settings, openFile, editorName, editorAvailable, editorConfig } = useSettings();
  const showLineNumbers = settings.display?.lineNumbers ?? true;
  const wordWrap = settings.display?.wordWrap ?? true;

  const handleOpenEditor = () => {
    if (!editorConfig) {
      setStatusMessage({ text: 'No editor configured. Add to Settings.', color: 'yellow' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (!editorAvailable) {
      setStatusMessage({ text: `Editor "${editorName}" not found`, color: 'red' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    if (editorConfig.type === 'terminal') {
      setStatusMessage({ text: `Opening in ${editorName}...`, color: 'cyan' });
    }

    const result = openFile(filePath, {
      onSuspend: () => {
        // Terminal editor will take over
      },
      onResume: () => {
        setStatusMessage({ text: 'Editor closed', color: 'green' });
        setTimeout(() => setStatusMessage(null), 3000);
      },
    });

    if (!result.success) {
      setStatusMessage({ text: result.message, color: 'red' });
      setTimeout(() => setStatusMessage(null), 3000);
    } else if (editorConfig.type === 'gui') {
      setStatusMessage({ text: `Opened in ${editorName}`, color: 'green' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  useInput(
    (input, key) => {
      if (showHelp) return;

      if (input === 'q') {
        onQuit();
        return;
      }

      if (key.escape || input === 'h') {
        onBack();
        return;
      }

      if (input === '?') {
        setShowHelp(true);
        return;
      }

      if (input === 'e') {
        handleOpenEditor();
        return;
      }
    },
    { isActive: !showHelp }
  );

  if (showHelp) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <HelpModal
          title="Content Viewer Help"
          items={CONTENT_HELP_FULL}
          onClose={() => setShowHelp(false)}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <AppHeader breadcrumbPath={breadcrumbPath} />
      </Box>

      <Box marginBottom={1}>
        <Text bold color="cyan">
          {title}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text dimColor>File: {filePath}</Text>
      </Box>

      <ScrollableText
        content={content}
        height={contentHeight}
        showLineNumbers={showLineNumbers}
        wordWrap={wordWrap}
        scrollOffset={scrollOffset}
        onScroll={setScrollOffset}
        isActive={!showHelp}
      />

      {statusMessage && (
        <Box marginTop={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow' | 'cyan'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      <HelpBar items={CONTENT_HELP_BASIC} />
    </Box>
  );
}
