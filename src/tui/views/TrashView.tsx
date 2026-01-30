import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { HelpBar, type HelpItem } from '../components/HelpBar.js';
import { ConfirmDialog } from '../components/ConfirmDialog.js';
import { AppHeader } from '../components/AppHeader.js';
import { deleteAgent, deleteCommand, deleteSkill, deleteMcp } from '../../actions/delete.js';
import type { ScanResult, ComponentType, ActionResult, McpServer } from '../../types/index.js';

interface DisabledItem {
  id: string;
  type: 'agent' | 'command' | 'skill' | 'mcp';
  name: string;
  filePath?: string;
  scope: string;
  projectPath?: string;
  mcpScope?: McpServer['scope'];
}

interface TrashViewProps {
  data: ScanResult;
  onBack: () => void;
  onQuit: () => void;
  onToggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
  onRefresh: () => void;
}

const DISABLED_HELP: HelpItem[] = [
  { key: 'j/k', label: 'Navigate' },
  { key: 'r', label: 'Restore (re-enable)' },
  { key: 'd', label: 'Delete forever', danger: true },
  { key: 'e', label: 'Delete all', danger: true },
  { key: 'Esc', label: 'Back' },
];

const DISABLED_EMPTY_HELP: HelpItem[] = [
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

function getTypeLabel(type: DisabledItem['type']): string {
  switch (type) {
    case 'agent': return 'Agent';
    case 'command': return 'Command';
    case 'skill': return 'Skill';
    case 'mcp': return 'MCP';
    default: return type;
  }
}

function getScopeLabel(scope: string): string {
  switch (scope) {
    case 'global': return 'Global';
    case 'project': return 'Project';
    case 'user': return 'User';
    default: return scope;
  }
}

export function TrashView({
  data,
  onBack,
  onQuit,
  onToggle,
  onRefresh,
}: TrashViewProps): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'empty' | null>(null);

  const items = useMemo((): DisabledItem[] => {
    const result: DisabledItem[] = [];

    // Disabled agents
    for (const agent of data.agents.filter(a => !a.enabled)) {
      result.push({
        id: agent.filePath,
        type: 'agent',
        name: agent.name,
        filePath: agent.filePath,
        scope: agent.scope,
        projectPath: agent.projectPath,
      });
    }

    // Disabled commands
    for (const command of data.commands.filter(c => !c.enabled)) {
      result.push({
        id: command.filePath,
        type: 'command',
        name: command.name,
        filePath: command.filePath,
        scope: command.scope,
        projectPath: command.projectPath,
      });
    }

    // Disabled skills (excluding plugin skills)
    for (const skill of data.skills.filter(s => !s.enabled && s.scope !== 'plugin')) {
      result.push({
        id: skill.filePath,
        type: 'skill',
        name: skill.name,
        filePath: skill.filePath,
        scope: skill.scope,
        projectPath: skill.projectPath,
      });
    }

    // Disabled MCPs (excluding plugin MCPs)
    for (const mcp of data.mcpServers.filter(m => !m.enabled && m.scope !== 'plugin')) {
      result.push({
        id: `${mcp.scope}:${mcp.projectPath || ''}:${mcp.name}`,
        type: 'mcp',
        name: mcp.name,
        scope: mcp.scope,
        projectPath: mcp.projectPath,
        mcpScope: mcp.scope,
      });
    }

    return result;
  }, [data]);

  const selectedItem = useMemo(() => items[selectedIndex], [items, selectedIndex]);

  const handleRestore = async () => {
    if (!selectedItem || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage({ text: 'Restoring...', color: 'yellow' });

    try {
      const result = await onToggle(selectedItem.type, selectedItem.name, false, selectedItem.projectPath);
      if (result.success) {
        setStatusMessage({ text: `Restored "${selectedItem.name}"`, color: 'green' });
        onRefresh();
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
      let result: ActionResult;

      switch (selectedItem.type) {
        case 'agent':
          result = await deleteAgent(selectedItem.filePath!);
          break;
        case 'command':
          result = await deleteCommand(selectedItem.filePath!);
          break;
        case 'skill':
          result = await deleteSkill(selectedItem.filePath!);
          break;
        case 'mcp':
          result = await deleteMcp(selectedItem.name, selectedItem.mcpScope!, selectedItem.projectPath);
          break;
        default:
          result = { success: false, message: 'Unknown item type' };
      }

      if (result.success) {
        setStatusMessage({ text: result.message, color: 'green' });
        onRefresh();
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

  const handleDeleteAll = async () => {
    if (isProcessing || items.length === 0) return;

    setIsProcessing(true);
    setConfirmAction(null);
    setStatusMessage({ text: 'Deleting all disabled items...', color: 'yellow' });

    let deleted = 0;
    let failed = 0;

    for (const item of items) {
      try {
        let result: ActionResult;

        switch (item.type) {
          case 'agent':
            result = await deleteAgent(item.filePath!);
            break;
          case 'command':
            result = await deleteCommand(item.filePath!);
            break;
          case 'skill':
            result = await deleteSkill(item.filePath!);
            break;
          case 'mcp':
            result = await deleteMcp(item.name, item.mcpScope!, item.projectPath);
            break;
          default:
            result = { success: false, message: 'Unknown item type' };
        }

        if (result.success) {
          deleted++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    onRefresh();
    setSelectedIndex(0);

    if (failed > 0) {
      setStatusMessage({ text: `Deleted ${deleted} items, ${failed} failed`, color: 'yellow' });
    } else {
      setStatusMessage({ text: `Permanently deleted ${deleted} items`, color: 'green' });
    }

    setIsProcessing(false);
    setTimeout(() => setStatusMessage(null), 3000);
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
        <AppHeader breadcrumbPath={['Dashboard', 'Settings', 'Disabled Items']} />
      </Box>

      <Box marginBottom={1}>
        <Text bold color="cyan">
          Disabled Items
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
          <Text dimColor>No disabled items</Text>
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
            <Text dimColor>  {'Type'.padEnd(10)}{'Name'.padEnd(24)}{'Scope'}</Text>
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
                <Text dimColor>{getScopeLabel(item.scope)}</Text>
              </Box>
            );
          })}
        </Box>
      )}

      {selectedItem && items.length > 0 && selectedItem.filePath && (
        <Box marginBottom={1} flexDirection="column">
          <Text dimColor>File path:</Text>
          <Text dimColor>{selectedItem.filePath}</Text>
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
          itemPath={selectedItem.filePath}
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
          title="Delete all disabled items?"
          itemName={`${items.length} items`}
          message="All disabled items will be permanently deleted. This cannot be undone."
          confirmLabel="Delete All"
          cancelLabel="Cancel"
          danger
          onConfirm={handleDeleteAll}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <HelpBar items={items.length > 0 ? DISABLED_HELP : DISABLED_EMPTY_HELP} />
    </Box>
  );
}
