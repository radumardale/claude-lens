import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { Sidebar, CATEGORIES } from '../components/Sidebar.js';
import { ComponentList, type ListItem } from '../components/ComponentList.js';
import type { Category } from './DashboardView.js';
import type { ScanResult } from '../../types/index.js';

interface ListViewProps {
  data: ScanResult;
  initialCategory: Category;
  onBack: () => void;
  onQuit: () => void;
  onSelectItem: (category: Category, itemId: string) => void;
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

export function ListView({
  data,
  initialCategory,
  onBack,
  onQuit,
  onSelectItem,
}: ListViewProps): React.ReactElement {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [focusArea, setFocusArea] = useState<FocusArea>('list');
  const [listIndex, setListIndex] = useState(0);

  const items = useMemo(() => getCategoryItems(data, category), [data, category]);

  const categoryIndex = CATEGORIES.findIndex((c) => c.key === category);

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }

    if (key.escape) {
      if (focusArea === 'list') {
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
      } else if (key.downArrow) {
        const newIndex = categoryIndex < CATEGORIES.length - 1 ? categoryIndex + 1 : 0;
        setCategory(CATEGORIES[newIndex].key);
        setListIndex(0);
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
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1}>
        <Text bold color="cyan">
          Claude Lens - {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </Box>

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

      <Box marginTop={1} paddingX={1}>
        <Text dimColor>
          ←/→ Switch focus   ↑/↓ Navigate   Enter Select   Esc Back   q Quit
        </Text>
      </Box>
    </Box>
  );
}
