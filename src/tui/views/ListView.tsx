import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { Sidebar, CATEGORIES } from '../components/Sidebar.js';
import { ComponentList, type ListItem } from '../components/ComponentList.js';
import { SearchInput } from '../components/SearchInput.js';
import type { Category } from './DashboardView.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';

interface ListViewProps {
  data: ScanResult;
  initialCategory: Category;
  onBack: () => void;
  onQuit: () => void;
  onSelectItem: (category: Category, itemId: string) => void;
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
      return data.mcpServers.map((m) => ({
        id: `${m.scope}:${m.projectPath || ''}:${m.name}`,
        name: m.name,
        enabled: m.enabled,
        detail: m.scope,
      }));
    case 'projects':
      return data.projects.map((p) => ({
        id: p.path,
        name: p.path.split('/').pop() || p.path,
        enabled: true,
        detail: `${p.sessionCount || 0} sessions`,
      }));
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

export function ListView({
  data,
  initialCategory,
  onBack,
  onQuit,
  onSelectItem,
  onToggle,
}: ListViewProps): React.ReactElement {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [focusArea, setFocusArea] = useState<FocusArea>('list');
  const [listIndex, setListIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = useMemo(() => getCategoryItems(data, category), [data, category]);
  const items = useMemo(() => {
    if (!searchQuery) return allItems;
    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        (item.detail && item.detail.toLowerCase().includes(query))
    );
  }, [allItems, searchQuery]);

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

    if (input === '/') {
      setSearchMode(true);
      return;
    }

    if (key.escape) {
      if (searchQuery) {
        setSearchQuery('');
        setListIndex(0);
      } else if (focusArea === 'list') {
        onBack();
      } else {
        setFocusArea('list');
      }
      return;
    }

    if (key.leftArrow) {
      setFocusArea('sidebar');
      return;
    }

    if (key.rightArrow) {
      setFocusArea('list');
      return;
    }

    if (focusArea === 'sidebar') {
      if (key.upArrow) {
        const newIndex = categoryIndex > 0 ? categoryIndex - 1 : CATEGORIES.length - 1;
        setCategory(CATEGORIES[newIndex].key);
        setListIndex(0);
        setSearchQuery('');
      } else if (key.downArrow) {
        const newIndex = categoryIndex < CATEGORIES.length - 1 ? categoryIndex + 1 : 0;
        setCategory(CATEGORIES[newIndex].key);
        setListIndex(0);
        setSearchQuery('');
      } else if (key.return) {
        setFocusArea('list');
      }
    } else {
      if (key.upArrow) {
        setListIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
      } else if (key.downArrow) {
        setListIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (key.return && items.length > 0) {
        onSelectItem(category, items[listIndex].id);
      } else if (input === ' ' && items.length > 0) {
        handleToggle();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1}>
        <Text bold color="cyan">
          Claude Lens - {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
        {searchQuery && !searchMode && (
          <Text dimColor> (filtered: {items.length}/{allItems.length})</Text>
        )}
      </Box>

      <SearchInput value={searchQuery} isActive={searchMode} />

      <Box>
        <Sidebar
          selected={category}
          onSelect={(cat) => {
            setCategory(cat);
            setListIndex(0);
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

      <Box marginTop={1} paddingX={1}>
        <Text dimColor>
          {searchMode
            ? 'Type to search   Enter Confirm   Esc Cancel'
            : '←/→ Focus   ↑/↓ Navigate   / Search   Space Toggle   Enter Details   Esc Back   q Quit'}
        </Text>
      </Box>
    </Box>
  );
}
