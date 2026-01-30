import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { HelpBar, type HelpItem } from '../components/HelpBar.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { AppHeader } from '../components/AppHeader.js';
import { listTrash, restoreFromTrash, permanentlyDelete, emptyTrash, getTrashCount } from '../../actions/trash.js';
import type { TrashItem } from '../../types/index.js';

interface TrashViewProps {
  onBack: () => void;
  onQuit: () => void;
}

const TRASH_HELP: HelpItem[] = [
  { key: 'j/k', label: 'Navigate' },
  { key: 'r', label: 'Restore' },
  { key: 'd', label: 'Delete forever', danger: true },
  { key: 'e', label: 'Empty all', danger: true },
  { key: 'Esc', label: 'Back' },
];

const TRASH_EMPTY_HELP: HelpItem[] = [
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

function getTypeLabel(type: TrashItem['type']): string {
  switch (type) {
    case 'agent': return 'Agent';
    case 'command': return 'Command';
    case 'skill': return 'Skill';
    case 'mcp': return 'MCP';
    default: return type;
  }
}

export function TrashView({ onBack, onQuit }: TrashViewProps): React.ReactElement {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'empty' | null>(null);

  useEffect(() => {
    setItems(listTrash());
  }, []);

  const selectedItem = useMemo(() => items[selectedIndex], [items, selectedIndex]);

  const handleRestore = async () => {
    if (!selectedItem || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage({ text: 'Restoring...', color: 'yellow' });

    try {
      const result = await restoreFromTrash(selectedItem.id);
      if (result.success) {
        setStatusMessage({ text: result.message, color: 'green' });
        setItems(listTrash());
        if (selectedIndex >= items.length - 1 && selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        }
      } else {
        setStatusMessage({ text: result.message, color: 'red' });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedItem || isProcessing) return;

    setIsProcessing(true);
    setConfirmAction(null);
    setStatusMessage({ text: 'Permanently deleting...', color: 'yellow' });

    try {
      const result = await permanentlyDelete(selectedItem.id);
      if (result.success) {
        setStatusMessage({ text: result.message, color: 'green' });
        setItems(listTrash());
        if (selectedIndex >= items.length - 1 && selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
        }
      } else {
        setStatusMessage({ text: result.message, color: 'red' });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleEmptyTrash = async () => {
    if (isProcessing || items.length === 0) return;

    setIsProcessing(true);
    setConfirmAction(null);
    setStatusMessage({ text: 'Emptying trash...', color: 'yellow' });

    try {
      const result = await emptyTrash();
      if (result.success) {
        setStatusMessage({ text: result.message, color: 'green' });
        setItems([]);
        setSelectedIndex(0);
      } else {
        setStatusMessage({ text: result.message, color: 'red' });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  useInput((input, key) => {
    if (confirmAction) return;

    if (input === 'q') {
      onQuit();
      return;
    }

    if (key.escape || input === 'h') {
      onBack();
      return;
    }

    if (items.length === 0) return;

    if (input === 'j' || key.downArrow) {
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      return;
    }

    if (input === 'k' || key.upArrow) {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (input === 'r') {
      handleRestore();
      return;
    }

    if (input === 'd') {
      setConfirmAction('delete');
      return;
    }

    if (input === 'e') {
      setConfirmAction('empty');
      return;
    }
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Box marginBottom={1}>
        <AppHeader breadcrumbPath={['Dashboard', 'Settings', 'Trash']} />
      </Box>

      <Box marginBottom={1}>
        <Text bold color="cyan">
          Trash
        </Text>
        <Text dimColor> ({items.length} items)</Text>
      </Box>

      {items.length === 0 ? (
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
          paddingY={1}
          marginBottom={1}
        >
          <Text dimColor>Trash is empty</Text>
        </Box>
      ) : (
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor="gray"
          paddingX={1}
          marginBottom={1}
        >
          <Box>
            <Text dimColor>  {'Type'.padEnd(10)}{'Name'.padEnd(24)}{'Deleted'}</Text>
          </Box>
          {items.map((item, index) => {
            const isSelected = index === selectedIndex;
            const prefix = isSelected ? '▶ ' : '  ';

            return (
              <Box key={item.id}>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {prefix}
                </Text>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {getTypeLabel(item.type).padEnd(10)}
                </Text>
                <Text color={isSelected ? 'cyan' : undefined} bold={isSelected}>
                  {item.name.slice(0, 22).padEnd(24)}
                </Text>
                <Text dimColor>{formatDate(item.deletedAt)}</Text>
              </Box>
            );
          })}
        </Box>
      )}

      {selectedItem && items.length > 0 && (
        <Box marginBottom={1} flexDirection="column">
          <Text dimColor>Original location:</Text>
          <Text dimColor>{selectedItem.originalPath}</Text>
        </Box>
      )}

      {statusMessage && (
        <Box marginBottom={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      {confirmAction === 'delete' && selectedItem && (
        <ConfirmDialog
          title="Permanently delete this item?"
          itemName={selectedItem.name}
          itemPath={selectedItem.originalPath}
          message="This cannot be undone."
          confirmLabel="Delete Forever"
          cancelLabel="Cancel"
          danger
          onConfirm={handlePermanentDelete}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === 'empty' && (
        <ConfirmDialog
          title="Empty all trash?"
          itemName={`${items.length} items`}
          message="All items will be permanently deleted. This cannot be undone."
          confirmLabel="Empty Trash"
          cancelLabel="Cancel"
          danger
          onConfirm={handleEmptyTrash}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <HelpBar items={items.length > 0 ? TRASH_HELP : TRASH_EMPTY_HELP} />
    </Box>
  );
}
