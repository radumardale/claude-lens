import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { HelpBar, SETTINGS_HELP_BASIC, SETTINGS_HELP_FULL } from '../components/HelpBar.js';
import { HelpModal } from '../components/HelpModal.js';
import { AppHeader } from '../components/AppHeader.js';
import { useSettings, useEditorInfo } from '../hooks/useSettings.js';

interface SettingsViewProps {
  onBack: () => void;
  onQuit: () => void;
  onOpenTrash?: () => void;
}

type SettingItem =
  | { type: 'header'; label: string }
  | { type: 'display'; id: string; label: string; value: string }
  | { type: 'toggle'; id: string; label: string; value: boolean }
  | { type: 'radio'; id: string; label: string; value: string; options: string[] }
  | { type: 'text'; id: string; label: string; value: string; placeholder?: string }
  | { type: 'action'; id: string; label: string; value: string };

export function SettingsView({ onBack, onQuit, onOpenTrash }: SettingsViewProps): React.ReactElement {
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const editorInfo = useEditorInfo();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);

  const items: SettingItem[] = useMemo(() => {
    const editorSource = editorInfo.source === 'settings' ? '(configured)'
      : editorInfo.source === '$VISUAL' ? '(from $VISUAL)'
      : editorInfo.source === '$EDITOR' ? '(from $EDITOR)'
      : editorInfo.source === 'auto' ? '(auto-detected)'
      : '(not set)';

    return [
      { type: 'header', label: 'EDITOR' },
      {
        type: 'display',
        id: 'editor-detected',
        label: 'Current Editor',
        value: editorInfo.detectedName ? `${editorInfo.detectedName} ${editorSource}` : 'Not configured',
      },
      {
        type: 'text',
        id: 'editor-command',
        label: 'Custom Command',
        value: settings.editor?.command ?? '',
        placeholder: 'e.g., vim, code, nano',
      },
      {
        type: 'radio',
        id: 'editor-type',
        label: 'Editor Type',
        value: settings.editor?.type ?? 'terminal',
        options: ['terminal', 'gui'],
      },
      { type: 'header', label: 'DISPLAY' },
      {
        type: 'toggle',
        id: 'line-numbers',
        label: 'Line Numbers',
        value: settings.display?.lineNumbers ?? true,
      },
      {
        type: 'toggle',
        id: 'word-wrap',
        label: 'Word Wrap',
        value: settings.display?.wordWrap ?? true,
      },
      { type: 'header', label: 'DATA' },
      {
        type: 'action',
        id: 'disabled-items',
        label: 'Disabled Items',
        value: 'View',
      },
    ];
  }, [settings, editorInfo]);

  const selectableItems = items.filter((item) => item.type !== 'header' && item.type !== 'display');
  const selectableIndices = items
    .map((item, i) => (item.type !== 'header' && item.type !== 'display' ? i : -1))
    .filter((i) => i >= 0);

  const handleAction = (id: string) => {
    if (id === 'disabled-items' && onOpenTrash) {
      onOpenTrash();
    }
  };

  const handleSave = () => {
    if (!editingField) return;

    const newSettings = { ...settings };

    if (editingField === 'editor-command') {
      if (editValue.trim()) {
        newSettings.editor = {
          command: editValue.trim(),
          type: settings.editor?.type ?? 'terminal',
        };
      } else {
        delete newSettings.editor;
      }
    }

    updateSettings(newSettings);
    setEditingField(null);
    setEditValue('');
    setStatusMessage({ text: 'Settings saved', color: 'green' });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleToggle = (id: string) => {
    const newSettings = { ...settings };

    if (id === 'line-numbers') {
      newSettings.display = {
        ...newSettings.display,
        lineNumbers: !(settings.display?.lineNumbers ?? true),
        wordWrap: settings.display?.wordWrap ?? true,
      };
    } else if (id === 'word-wrap') {
      newSettings.display = {
        ...newSettings.display,
        lineNumbers: settings.display?.lineNumbers ?? true,
        wordWrap: !(settings.display?.wordWrap ?? true),
      };
    } else if (id === 'editor-type') {
      const currentType = settings.editor?.type ?? 'terminal';
      const newType = currentType === 'terminal' ? 'gui' : 'terminal';
      if (settings.editor) {
        newSettings.editor = { ...settings.editor, type: newType };
      }
    }

    updateSettings(newSettings);
  };

  const handleReset = () => {
    resetToDefaults();
    setStatusMessage({ text: 'Settings reset to defaults', color: 'green' });
    setTimeout(() => setStatusMessage(null), 2000);
  };

  useInput(
    (input, key) => {
      if (showHelp) return;

      if (editingField) {
        if (key.escape) {
          setEditingField(null);
          setEditValue('');
          return;
        }
        if (key.return) {
          handleSave();
          return;
        }
        if (key.backspace || key.delete) {
          setEditValue((v) => v.slice(0, -1));
          return;
        }
        if (input && !key.ctrl && !key.meta) {
          setEditValue((v) => v + input);
        }
        return;
      }

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

      if (input === 'r') {
        handleReset();
        return;
      }

      if (input === 'j' || key.downArrow) {
        const currentSelectableIdx = selectableIndices.indexOf(selectedIndex);
        if (currentSelectableIdx < selectableIndices.length - 1) {
          setSelectedIndex(selectableIndices[currentSelectableIdx + 1]);
        }
        return;
      }

      if (input === 'k' || key.upArrow) {
        const currentSelectableIdx = selectableIndices.indexOf(selectedIndex);
        if (currentSelectableIdx > 0) {
          setSelectedIndex(selectableIndices[currentSelectableIdx - 1]);
        }
        return;
      }

      const currentItem = items[selectedIndex];
      if (!currentItem || currentItem.type === 'header' || currentItem.type === 'display') return;

      if (input === ' ') {
        if (currentItem.type === 'toggle' || currentItem.type === 'radio') {
          handleToggle(currentItem.id);
        }
        return;
      }

      if (key.return) {
        if (currentItem.type === 'text') {
          setEditingField(currentItem.id);
          setEditValue(currentItem.value);
        } else if (currentItem.type === 'toggle' || currentItem.type === 'radio') {
          handleToggle(currentItem.id);
        } else if (currentItem.type === 'action') {
          handleAction(currentItem.id);
        }
        return;
      }
    },
    { isActive: !showHelp }
  );

  if (showHelp) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <HelpModal
          title="Settings Help"
          items={SETTINGS_HELP_FULL}
          onClose={() => setShowHelp(false)}
        />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <AppHeader breadcrumbPath={['Dashboard', 'Settings']} />
      </Box>

      <Box marginBottom={1}>
        <Text bold color="cyan">
          Settings
        </Text>
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        paddingX={1}
        marginBottom={1}
      >
        {items.map((item, index) => {
          if (item.type === 'header') {
            return (
              <Box key={item.label} marginTop={index > 0 ? 1 : 0} marginBottom={0}>
                <Text bold dimColor>
                  {item.label}
                </Text>
              </Box>
            );
          }

          const isSelected = selectedIndex === index;
          const prefix = isSelected ? '▶ ' : '  ';

          if (item.type === 'display') {
            return (
              <Box key={item.id}>
                <Text dimColor>{prefix}</Text>
                <Text dimColor>{item.label.padEnd(16)}</Text>
                <Text dimColor>{item.value}</Text>
              </Box>
            );
          }

          if (item.type === 'toggle') {
            return (
              <Box key={item.id}>
                <Text color={isSelected ? 'cyan' : undefined}>{prefix}</Text>
                <Text color={isSelected ? 'cyan' : undefined}>{item.label.padEnd(16)}</Text>
                <Text color={item.value ? 'green' : 'red'}>
                  {item.value ? '● On' : '○ Off'}
                </Text>
              </Box>
            );
          }

          if (item.type === 'radio') {
            return (
              <Box key={item.id}>
                <Text color={isSelected ? 'cyan' : undefined}>{prefix}</Text>
                <Text color={isSelected ? 'cyan' : undefined}>{item.label.padEnd(16)}</Text>
                {item.options.map((opt, i) => (
                  <Text key={opt}>
                    <Text color={item.value === opt ? 'green' : 'gray'}>
                      {item.value === opt ? '●' : '○'} {opt}
                    </Text>
                    {i < item.options.length - 1 && <Text>  </Text>}
                  </Text>
                ))}
              </Box>
            );
          }

          if (item.type === 'text') {
            const isEditing = editingField === item.id;
            const displayValue = isEditing ? editValue : (item.value || item.placeholder || '');
            return (
              <Box key={item.id}>
                <Text color={isSelected ? 'cyan' : undefined}>{prefix}</Text>
                <Text color={isSelected ? 'cyan' : undefined}>{item.label.padEnd(16)}</Text>
                {isEditing ? (
                  <Text>
                    <Text color="yellow">{displayValue}</Text>
                    <Text color="yellow">▊</Text>
                  </Text>
                ) : (
                  <Text dimColor={!item.value}>{displayValue}</Text>
                )}
              </Box>
            );
          }

          if (item.type === 'action') {
            return (
              <Box key={item.id}>
                <Text color={isSelected ? 'cyan' : undefined}>{prefix}</Text>
                <Text color={isSelected ? 'cyan' : undefined}>{item.label.padEnd(16)}</Text>
                <Text dimColor>{item.value} →</Text>
              </Box>
            );
          }

          return null;
        })}
      </Box>

      {statusMessage && (
        <Box marginBottom={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      <HelpBar items={SETTINGS_HELP_BASIC} />
    </Box>
  );
}
