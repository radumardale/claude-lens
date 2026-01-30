import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { Sidebar, CATEGORIES } from '../components/Sidebar.js';
import { ComponentList, type ListItem } from '../components/ComponentList.js';
import { SearchInput } from '../components/SearchInput.js';
import { HelpBar, LIST_HELP_BASIC, LIST_HELP_FULL, SEARCH_HELP } from '../components/HelpBar.js';
import { HelpModal } from '../components/HelpModal.js';
import { AppHeader } from '../components/AppHeader.js';
import type { Category } from './DashboardView.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';

type FilterMode = 'all' | 'enabled' | 'disabled';

interface UndoAction {
  type: 'toggle';
  componentType: ComponentType;
  name: string;
  previousEnabled: boolean;
  projectPath?: string;
}

// Reserved keys that should not trigger jump-to-letter
const RESERVED_KEYS = new Set(['q', 'e', 'd', 'a', 'u', 'h', 'j', 'k', 'l', ' ', '/']);

interface ListViewProps {
  data: ScanResult;
  initialCategory: Category;
  listIndex: number;
  onListIndexChange: (category: Category, index: number) => void;
  onBack: () => void;
  onQuit: () => void;
  onSelectItem: (category: Category, itemId: string) => void;
  onEnterProject: (projectPath: string) => void;
  onToggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
}

type FocusArea = 'sidebar' | 'list';

function getCategoryItems(data: ScanResult, category: Category): ListItem[] {
  switch (category) {
    case 'plugins':
      return data.plugins.map((p) => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        detail: p.marketplace,
      }));
    case 'agents':
      return data.agents.map((a) => ({
        id: a.filePath,
        name: a.name,
        enabled: a.enabled,
        detail: a.model,
      }));
    case 'commands':
      return data.commands.map((c) => ({
        id: c.filePath,
        name: c.name,
        enabled: c.enabled,
      }));
    case 'skills':
      return data.skills.map((s) => ({
        id: s.filePath,
        name: s.name,
        enabled: s.enabled,
        detail: s.source,
      }));
    case 'mcps':
      return data.mcpServers
        .filter((m) => m.scope !== 'project')
        .map((m) => {
          const source = m.projectPath
            ? `${m.scope} (${m.projectPath.split('/').pop()})`
            : m.scope;
          const type = m.type || 'stdio';
          return {
            id: `${m.scope}:${m.projectPath || ''}:${m.name}`,
            name: m.name,
            enabled: m.enabled,
            detail: `${source.padEnd(20)} ${type}`,
          };
        });
    case 'projects':
      return data.projects.map((p) => {
        const projectMcps = data.mcpServers.filter(
          (m) => m.scope === 'project' && m.projectPath === p.path
        );
        const mcpCount = projectMcps.length;
        const details: string[] = [];
        if (mcpCount > 0) details.push(`${mcpCount} MCPs`);
        if (p.hasClaudeMd) details.push('CLAUDE.md');
        return {
          id: p.path,
          name: p.path.split('/').pop() || p.path,
          enabled: true,
          detail: details.length > 0 ? details.join(', ') : 'no config',
        };
      });
    default:
      return [];
  }
}

function categoryToComponentType(category: Category): ComponentType | null {
  switch (category) {
    case 'plugins':
      return 'plugin';
    case 'agents':
      return 'agent';
    case 'commands':
      return 'command';
    case 'skills':
      return 'skill';
    case 'mcps':
      return 'mcp';
    case 'projects':
      return null; // Projects cannot be toggled
    default:
      return null;
  }
}

function getEmptyMessage(category: Category, isFiltered: boolean): string {
  if (isFiltered) {
    return 'No items match your filters';
  }

  const messages: Record<Category, string> = {
    plugins: 'No plugins installed',
    agents: 'No agents configured. Create one in ~/.claude/agents/',
    commands: 'No commands configured. Create one in ~/.claude/commands/',
    skills: 'No skills configured. Link one in ~/.claude/skills/',
    mcps: 'No MCP servers configured',
    projects: 'No projects with Claude configuration found',
  };

  return messages[category];
}

export function ListView({
  data,
  initialCategory,
  listIndex,
  onListIndexChange,
  onBack,
  onQuit,
  onSelectItem,
  onEnterProject,
  onToggle,
}: ListViewProps): React.ReactElement {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [focusArea, setFocusArea] = useState<FocusArea>('list');
  const setListIndex = (index: number) => onListIndexChange(category, index);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const allItems = useMemo(() => getCategoryItems(data, category), [data, category]);
  const items = useMemo(() => {
    let filtered = allItems;

    // Apply enabled/disabled filter
    if (filterMode === 'enabled') {
      filtered = filtered.filter((item) => item.enabled);
    } else if (filterMode === 'disabled') {
      filtered = filtered.filter((item) => !item.enabled);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.detail && item.detail.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [allItems, searchQuery, filterMode]);

  const categoryIndex = CATEGORIES.findIndex((c) => c.key === category);

  const handleToggle = async () => {
    if (items.length === 0 || isToggling) return;

    const componentType = categoryToComponentType(category);
    if (!componentType) {
      setStatusMessage({ text: 'Cannot toggle this item type', color: 'yellow' });
      return;
    }

    const item = items[listIndex];
    setIsToggling(true);
    setStatusMessage({ text: 'Toggling...', color: 'yellow' });

    try {
      // For MCPs, parse the projectPath from the id
      let projectPath: string | undefined;
      let name = item.name;
      if (category === 'mcps') {
        const parts = item.id.split(':');
        if (parts[0] === 'project' && parts[1]) {
          projectPath = parts[1];
        }
      }

      const result = await onToggle(componentType, name, item.enabled, projectPath);
      if (result.success) {
        // Push to undo stack
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'toggle',
            componentType,
            name,
            previousEnabled: item.enabled,
            projectPath,
          },
        ]);
        setStatusMessage({ text: result.message, color: 'green' });
      } else {
        setStatusMessage({ text: result.message, color: 'red' });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setIsToggling(false);
    }

    // Clear status message after a delay
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0 || isToggling) {
      setStatusMessage({ text: 'Nothing to undo', color: 'yellow' });
      setTimeout(() => setStatusMessage(null), 2000);
      return;
    }

    const lastAction = undoStack[undoStack.length - 1];
    setIsToggling(true);
    setStatusMessage({ text: 'Undoing...', color: 'yellow' });

    try {
      // Toggle back to previous state (note: we pass !previousEnabled because the current state is the opposite)
      const result = await onToggle(
        lastAction.componentType,
        lastAction.name,
        !lastAction.previousEnabled,
        lastAction.projectPath
      );
      if (result.success) {
        setUndoStack((prev) => prev.slice(0, -1));
        const action = lastAction.previousEnabled ? 're-enabled' : 're-disabled';
        setStatusMessage({ text: `Undid: ${action} ${lastAction.name}`, color: 'green' });
      } else {
        setStatusMessage({ text: `Undo failed: ${result.message}`, color: 'red' });
      }
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Undo failed',
        color: 'red',
      });
    } finally {
      setIsToggling(false);
    }

    setTimeout(() => setStatusMessage(null), 3000);
  }, [undoStack, isToggling, onToggle]);

  const handleJumpToLetter = useCallback((letter: string) => {
    const lowerLetter = letter.toLowerCase();
    // Find the first item that starts with this letter, starting from current position + 1
    const startIndex = (listIndex + 1) % items.length;
    for (let i = 0; i < items.length; i++) {
      const idx = (startIndex + i) % items.length;
      const item = items[idx];
      // Get the display name without the arrow prefix
      const displayName = item.name.replace(/^↳\s*/, '');
      if (displayName.toLowerCase().startsWith(lowerLetter)) {
        setListIndex(idx);
        return;
      }
    }
  }, [items, listIndex]);

  useInput((input, key) => {
    // Search mode handling
    if (searchMode) {
      if (key.escape) {
        setSearchMode(false);
        setSearchQuery('');
        setListIndex(0);
        return;
      }
      if (key.return) {
        setSearchMode(false);
        return;
      }
      if (key.backspace || key.delete) {
        setSearchQuery((prev) => prev.slice(0, -1));
        setListIndex(0);
        return;
      }
      if (input && !key.ctrl && !key.meta) {
        setSearchQuery((prev) => prev + input);
        setListIndex(0);
        return;
      }
      return;
    }

    if (input === 'q') {
      onQuit();
      return;
    }

    // Toggle help modal
    if (input === '?') {
      setShowHelp((prev) => !prev);
      return;
    }

    // If help modal is open, only ? and q work
    if (showHelp) {
      return;
    }

    if (input === '/') {
      setSearchMode(true);
      return;
    }

    // Undo
    if (input === 'u') {
      handleUndo();
      return;
    }

    // Filter toggles
    if (input === 'e') {
      setFilterMode((prev) => (prev === 'enabled' ? 'all' : 'enabled'));
      setListIndex(0);
      return;
    }
    if (input === 'd') {
      setFilterMode((prev) => (prev === 'disabled' ? 'all' : 'disabled'));
      setListIndex(0);
      return;
    }
    if (input === 'a') {
      setFilterMode('all');
      setListIndex(0);
      return;
    }

    // Back navigation: Esc always clears search or goes back
    if (key.escape) {
      if (searchQuery) {
        setSearchQuery('');
        setListIndex(0);
      } else {
        onBack();
      }
      return;
    }

    // Left arrow / h: go back if in sidebar, switch to sidebar if in list
    if (key.leftArrow || input === 'h') {
      if (focusArea === 'sidebar') {
        if (searchQuery) {
          setSearchQuery('');
          setListIndex(0);
        } else {
          onBack();
        }
      } else {
        setFocusArea('sidebar');
      }
      return;
    }

    // Right arrow / l: switch to list or enter detail
    if (key.rightArrow || input === 'l') {
      if (focusArea === 'sidebar') {
        setFocusArea('list');
      } else if (focusArea === 'list' && items.length > 0) {
        // Right arrow or 'l' in list view: enter detail
        if (category === 'projects') {
          onEnterProject(items[listIndex].id);
        } else {
          onSelectItem(category, items[listIndex].id);
        }
      }
      return;
    }

    if (focusArea === 'sidebar') {
      // Vim navigation in sidebar: k = up, j = down
      if (key.upArrow || input === 'k') {
        const newIndex = categoryIndex > 0 ? categoryIndex - 1 : CATEGORIES.length - 1;
        const newCategory = CATEGORIES[newIndex].key;
        setCategory(newCategory);
        onListIndexChange(newCategory, 0); // Pass new category directly
        setSearchQuery('');
        setFilterMode('all');
      } else if (key.downArrow || input === 'j') {
        const newIndex = categoryIndex < CATEGORIES.length - 1 ? categoryIndex + 1 : 0;
        const newCategory = CATEGORIES[newIndex].key;
        setCategory(newCategory);
        onListIndexChange(newCategory, 0); // Pass new category directly
        setSearchQuery('');
        setFilterMode('all');
      } else if (key.return) {
        setFocusArea('list');
      }
    } else {
      // Vim navigation in list: k = up, j = down
      if (key.upArrow || input === 'k') {
        setListIndex(listIndex > 0 ? listIndex - 1 : items.length - 1);
      } else if (key.downArrow || input === 'j') {
        setListIndex(listIndex < items.length - 1 ? listIndex + 1 : 0);
      } else if (key.return && items.length > 0) {
        if (category === 'projects') {
          onEnterProject(items[listIndex].id);
        } else {
          onSelectItem(category, items[listIndex].id);
        }
      } else if (input === ' ' && items.length > 0) {
        handleToggle();
      } else if (input && input.length === 1 && /[a-z]/i.test(input) && !RESERVED_KEYS.has(input.toLowerCase())) {
        // Jump-to-letter: pressing a letter jumps to first item starting with that letter
        handleJumpToLetter(input);
      }
    }
  });

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const breadcrumbPath = ['Dashboard', categoryLabel];

  const filterLabel = filterMode === 'enabled' ? 'enabled only' : filterMode === 'disabled' ? 'disabled only' : null;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1} flexDirection="column">
        <AppHeader breadcrumbPath={breadcrumbPath} />
        <Box>
          {filterLabel && (
            <Text color="yellow">[Filter: {filterLabel}] </Text>
          )}
          {searchQuery && !searchMode && (
            <Text dimColor>(search: {items.length}/{allItems.length})</Text>
          )}
          {undoStack.length > 0 && (
            <Text dimColor> [{undoStack.length} undoable]</Text>
          )}
        </Box>
      </Box>

      <SearchInput value={searchQuery} isActive={searchMode} />

      <Box>
        <Sidebar
          selected={category}
          onSelect={(cat) => {
            setCategory(cat);
            onListIndexChange(cat, 0); // Pass new category directly to avoid closure issue
          }}
          focused={focusArea === 'sidebar'}
        />
        <Box
          flexDirection="column"
          flexGrow={1}
          borderStyle="single"
          borderColor={focusArea === 'list' ? 'green' : 'gray'}
        >
          <ComponentList
            items={items}
            selectedIndex={listIndex}
            focused={focusArea === 'list'}
            emptyMessage={getEmptyMessage(category, !!searchQuery || filterMode !== 'all')}
            header={category === 'mcps' ? 'Source               Type' : undefined}
          />
        </Box>
      </Box>

      {statusMessage && (
        <Box paddingX={1} marginTop={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      <HelpBar items={searchMode ? SEARCH_HELP : LIST_HELP_BASIC} />

      {showHelp && (
        <HelpModal
          items={LIST_HELP_FULL}
          onClose={() => setShowHelp(false)}
        />
      )}
    </Box>
  );
}
