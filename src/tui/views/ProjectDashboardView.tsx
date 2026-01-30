import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { ComponentList, type ListItem } from '../components/ComponentList.js';
import {
  HelpBar,
  PLUGIN_COMPONENT_HELP_BASIC,
  PLUGIN_COMPONENT_HELP_FULL,
  PROJECT_DASHBOARD_HELP_BASIC,
  PROJECT_DASHBOARD_HELP_FULL,
} from '../components/HelpBar.js';
import { HelpModal } from '../components/HelpModal.js';
import { AppHeader } from '../components/AppHeader.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';
import type { Category } from './DashboardView.js';

type ProjectCategory = 'mcps' | 'agents' | 'skills' | 'commands' | 'plugins';
type FilterMode = 'all' | 'enabled' | 'disabled';

interface UndoAction {
  type: 'toggle';
  componentType: ComponentType;
  name: string;
  previousEnabled: boolean;
  projectPath?: string;
}

// Reserved keys that should not trigger jump-to-letter
const RESERVED_KEYS = new Set(['q', 'e', 'd', 'a', 'u', 'h', 'j', 'k', 'l', 'p', ' ']);

interface ProjectDashboardViewProps {
  data: ScanResult;
  projectPath: string;
  listIndex: number;
  onListIndexChange: (index: number) => void;
  onBack: () => void;
  onQuit: () => void;
  onToggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
  onSelectItem?: (category: Category, itemId: string) => void;
}

type FocusArea = 'sidebar' | 'list';

const PROJECT_CATEGORIES: { key: ProjectCategory; label: string }[] = [
  { key: 'mcps', label: 'MCP Servers' },
  { key: 'agents', label: 'Agents' },
  { key: 'skills', label: 'Skills' },
  { key: 'commands', label: 'Commands' },
  { key: 'plugins', label: 'Plugins' },
];

// Generate MCP ID matching DetailView's expected format: scope:projectPath:name or scope:name
function getMcpId(mcp: ScanResult['mcpServers'][0]): string {
  if (mcp.projectPath) {
    return `${mcp.scope}:${mcp.projectPath}:${mcp.name}`;
  }
  return `${mcp.scope}:${mcp.name}`;
}

function getProjectCategoryItems(
  data: ScanResult,
  category: ProjectCategory,
  projectPath: string
): ListItem[] {
  switch (category) {
    case 'mcps': {
      // Project-scoped MCPs (from .mcp.json in project)
      const projectItems = data.mcpServers
        .filter((m) => m.scope === 'project' && m.projectPath === projectPath)
        .map((m) => ({
          id: getMcpId(m),
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
        }));
      // User MCPs for this specific project (from ~/.claude.json projects)
      const userProjectItems = data.mcpServers
        .filter((m) => m.scope === 'user' && m.projectPath === projectPath)
        .map((m) => ({
          id: getMcpId(m),
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
        }));
      // Global/system MCPs
      const systemItems = data.mcpServers
        .filter((m) => m.scope === 'global')
        .map((m) => ({
          id: getMcpId(m),
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
          readonly: true,
        }));
      // User-global MCPs (no projectPath)
      const userGlobalItems = data.mcpServers
        .filter((m) => m.scope === 'user' && !m.projectPath)
        .map((m) => ({
          id: getMcpId(m),
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
          readonly: true,
        }));
      return [...projectItems, ...userProjectItems, ...systemItems, ...userGlobalItems];
    }
    case 'agents': {
      const projectItems = data.agents
        .filter((a) => a.scope === 'project' && a.projectPath === projectPath)
        .map((a) => ({
          id: a.filePath,  // DetailView expects filePath
          name: a.name,
          enabled: a.enabled,
          detail: a.model,
        }));
      const systemItems = data.agents
        .filter((a) => a.scope === 'global')
        .map((a) => ({
          id: a.filePath,  // DetailView expects filePath
          name: a.name,
          enabled: a.enabled,
          detail: a.model,
          readonly: true,
        }));
      return [...projectItems, ...systemItems];
    }
    case 'skills': {
      const projectItems = data.skills
        .filter((s) => s.scope === 'project' && s.projectPath === projectPath)
        .map((s) => ({
          id: s.filePath,  // DetailView expects filePath
          name: s.name,
          enabled: s.enabled,
          detail: s.source,
        }));
      const systemItems = data.skills
        .filter((s) => s.scope === 'global')
        .map((s) => ({
          id: s.filePath,  // DetailView expects filePath
          name: s.name,
          enabled: s.enabled,
          detail: s.source,
          readonly: true,
        }));
      return [...projectItems, ...systemItems];
    }
    case 'commands': {
      const projectItems = data.commands
        .filter((c) => c.scope === 'project' && c.projectPath === projectPath)
        .map((c) => ({
          id: c.filePath,  // DetailView expects filePath
          name: c.name,
          enabled: c.enabled,
        }));
      const systemItems = data.commands
        .filter((c) => c.scope === 'global')
        .map((c) => ({
          id: c.filePath,  // DetailView expects filePath
          name: c.name,
          enabled: c.enabled,
          readonly: true,
        }));
      return [...projectItems, ...systemItems];
    }
    case 'plugins': {
      const pluginItems: ListItem[] = [];
      for (const p of data.plugins) {
        pluginItems.push({
          id: p.id,  // DetailView expects plugin.id
          name: p.name,
          enabled: p.enabled,
          detail: p.marketplace,
          readonly: true,
        });

        const pluginMcps = data.mcpServers.filter(
          (m) => m.scope === 'plugin' && m.pluginName === p.name
        );
        const pluginSkills = data.skills.filter(
          (s) => s.scope === 'plugin' && s.pluginName === p.name
        );

        if (pluginMcps.length > 0 || pluginSkills.length > 0) {
          for (const mcp of pluginMcps) {
            pluginItems.push({
              id: getMcpId(mcp),
              name: `↳ ${mcp.name}`,
              enabled: mcp.enabled,
              detail: 'mcp',
              readonly: true,
              indent: 1,
              parentPlugin: p.name,
            });
          }
          for (const skill of pluginSkills) {
            pluginItems.push({
              id: skill.filePath,  // DetailView expects filePath
              name: `↳ ${skill.name}`,
              enabled: skill.enabled,
              detail: 'skill',
              readonly: true,
              indent: 1,
              parentPlugin: p.name,
            });
          }
        }
      }
      return pluginItems;
    }
    default:
      return [];
  }
}

function categoryToComponentType(category: ProjectCategory): ComponentType | null {
  switch (category) {
    case 'mcps':
      return 'mcp';
    case 'agents':
      return 'agent';
    case 'skills':
      return 'skill';
    case 'commands':
      return 'command';
    case 'plugins':
      return null; // Can't toggle project plugins (they're global)
    default:
      return null;
  }
}

function getProjectEmptyMessage(category: ProjectCategory, isFiltered: boolean): string {
  if (isFiltered) {
    return 'No items match your filters';
  }

  const messages: Record<ProjectCategory, string> = {
    mcps: 'No project-specific MCP servers configured',
    agents: 'No project-specific agents. Create one in .claude/agents/',
    skills: 'No project-specific skills. Link one in .claude/skills/',
    commands: 'No project-specific commands. Create one in .claude/commands/',
    plugins: 'No plugins installed',
  };

  return messages[category];
}

export function ProjectDashboardView({
  data,
  projectPath,
  listIndex,
  onListIndexChange,
  onBack,
  onQuit,
  onToggle,
  onSelectItem,
}: ProjectDashboardViewProps): React.ReactElement {
  const [category, setCategory] = useState<ProjectCategory>('mcps');
  const [focusArea, setFocusArea] = useState<FocusArea>('sidebar');
  const setListIndex = onListIndexChange;
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const projectName = projectPath.split('/').pop() || projectPath;
  const categoryIndex = PROJECT_CATEGORIES.findIndex((c) => c.key === category);

  const project = useMemo(
    () => data.projects.find((p) => p.path === projectPath),
    [data.projects, projectPath]
  );

  const allItems = useMemo(
    () => getProjectCategoryItems(data, category, projectPath),
    [data, category, projectPath]
  );

  const items = useMemo(() => {
    if (filterMode === 'enabled') {
      return allItems.filter((item) => item.enabled);
    } else if (filterMode === 'disabled') {
      return allItems.filter((item) => !item.enabled);
    }
    return allItems;
  }, [allItems, filterMode]);

  // Calculate counts for each category (project + system)
  const categoryCounts = useMemo(() => {
    const projectMcpCount = data.mcpServers.filter((m) => m.scope === 'project' && m.projectPath === projectPath).length;
    const userProjectMcpCount = data.mcpServers.filter((m) => m.scope === 'user' && m.projectPath === projectPath).length;
    const globalMcpCount = data.mcpServers.filter((m) => m.scope === 'global').length;
    const userGlobalMcpCount = data.mcpServers.filter((m) => m.scope === 'user' && !m.projectPath).length;

    const counts: Record<ProjectCategory, { project: number; system: number }> = {
      mcps: {
        project: projectMcpCount + userProjectMcpCount,
        system: globalMcpCount + userGlobalMcpCount,
      },
      agents: {
        project: data.agents.filter((a) => a.scope === 'project' && a.projectPath === projectPath).length,
        system: data.agents.filter((a) => a.scope === 'global').length,
      },
      skills: {
        project: data.skills.filter((s) => s.scope === 'project' && s.projectPath === projectPath).length,
        system: data.skills.filter((s) => s.scope === 'global').length,
      },
      commands: {
        project: data.commands.filter((c) => c.scope === 'project' && c.projectPath === projectPath).length,
        system: data.commands.filter((c) => c.scope === 'global').length,
      },
      plugins: {
        project: 0,
        system: data.plugins.length,
      },
    };
    return counts;
  }, [data, projectPath]);

  const handleToggle = async () => {
    if (items.length === 0 || isToggling) return;

    const item = items[listIndex];

    if (item.readonly) {
      const message = item.parentPlugin
        ? `Part of "${item.parentPlugin}" plugin. Press 'p' to view plugin.`
        : 'System components can only be changed from the main menu';
      setStatusMessage({ text: message, color: 'yellow' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const componentType = categoryToComponentType(category);
    if (!componentType) {
      setStatusMessage({ text: 'Cannot toggle this item type', color: 'yellow' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsToggling(true);
    setStatusMessage({ text: 'Toggling...', color: 'yellow' });

    try {
      const result = await onToggle(componentType, item.name, item.enabled, projectPath);
      if (result.success) {
        // Push to undo stack
        setUndoStack((prev) => [
          ...prev,
          {
            type: 'toggle',
            componentType,
            name: item.name,
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
  }, [undoStack, isToggling, onToggle, projectPath]);

  const handleJumpToLetter = useCallback((letter: string) => {
    const lowerLetter = letter.toLowerCase();
    const startIndex = (listIndex + 1) % items.length;
    for (let i = 0; i < items.length; i++) {
      const idx = (startIndex + i) % items.length;
      const item = items[idx];
      const displayName = item.name.replace(/^↳\s*/, '');
      if (displayName.toLowerCase().startsWith(lowerLetter)) {
        setListIndex(idx);
        return;
      }
    }
  }, [items, listIndex]);

  useInput((input, key) => {
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

    // Navigate to parent plugin
    if (input === 'p' && focusArea === 'list') {
      const item = items[listIndex];
      if (item?.parentPlugin) {
        // Switch to plugins category and find the parent plugin
        setCategory('plugins');
        setFilterMode('all');
        // Find the index of the parent plugin in the new items list
        const pluginItems = getProjectCategoryItems(data, 'plugins', projectPath);
        const pluginIndex = pluginItems.findIndex(
          (p) => p.name === item.parentPlugin && !p.indent
        );
        setListIndex(pluginIndex >= 0 ? pluginIndex : 0);
        setStatusMessage({ text: `Navigated to ${item.parentPlugin} plugin`, color: 'green' });
        setTimeout(() => setStatusMessage(null), 2000);
      } else {
        setStatusMessage({ text: 'Not a plugin component', color: 'yellow' });
        setTimeout(() => setStatusMessage(null), 2000);
      }
      return;
    }

    // Back navigation: Esc always goes back
    if (key.escape) {
      onBack();
      return;
    }

    // Left arrow / h: go back if in sidebar, switch to sidebar if in list
    if (key.leftArrow || input === 'h') {
      if (focusArea === 'sidebar') {
        onBack();
      } else {
        setFocusArea('sidebar');
      }
      return;
    }

    // Right arrow / l: switch to list
    if (key.rightArrow || input === 'l') {
      setFocusArea('list');
      return;
    }

    if (focusArea === 'sidebar') {
      // Vim navigation: k = up, j = down
      if (key.upArrow || input === 'k') {
        const newIndex = categoryIndex > 0 ? categoryIndex - 1 : PROJECT_CATEGORIES.length - 1;
        setCategory(PROJECT_CATEGORIES[newIndex].key);
        setListIndex(0);
        setFilterMode('all');
      } else if (key.downArrow || input === 'j') {
        const newIndex = categoryIndex < PROJECT_CATEGORIES.length - 1 ? categoryIndex + 1 : 0;
        setCategory(PROJECT_CATEGORIES[newIndex].key);
        setListIndex(0);
        setFilterMode('all');
      } else if (key.return) {
        setFocusArea('list');
      }
    } else {
      // Vim navigation: k = up, j = down
      if (key.upArrow || input === 'k') {
        setListIndex(listIndex > 0 ? listIndex - 1 : Math.max(0, items.length - 1));
      } else if (key.downArrow || input === 'j') {
        setListIndex(listIndex < items.length - 1 ? listIndex + 1 : 0);
      } else if (key.return && items.length > 0 && onSelectItem) {
        // Navigate to detail view
        const item = items[listIndex];
        // Map ProjectCategory to Category (they're the same names)
        const categoryMap: Record<ProjectCategory, Category> = {
          mcps: 'mcps',
          agents: 'agents',
          skills: 'skills',
          commands: 'commands',
          plugins: 'plugins',
        };
        // For plugin sub-items, navigate to the appropriate category
        if (item.parentPlugin && item.detail === 'mcp') {
          onSelectItem('mcps', item.id);
        } else if (item.parentPlugin && item.detail === 'skill') {
          onSelectItem('skills', item.id);
        } else {
          onSelectItem(categoryMap[category], item.id);
        }
      } else if (input === ' ' && items.length > 0) {
        handleToggle();
      } else if (input && input.length === 1 && /[a-z]/i.test(input) && !RESERVED_KEYS.has(input.toLowerCase())) {
        handleJumpToLetter(input);
      }
    }
  });

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const breadcrumbPath = ['Dashboard', 'Projects', projectName, categoryLabel];
  const filterLabel = filterMode === 'enabled' ? 'enabled only' : filterMode === 'disabled' ? 'disabled only' : null;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1} flexDirection="column">
        <AppHeader breadcrumbPath={breadcrumbPath} />
        <Box>
          {filterLabel && (
            <Text color="yellow">[Filter: {filterLabel}] </Text>
          )}
          {undoStack.length > 0 && (
            <Text dimColor>[{undoStack.length} undoable]</Text>
          )}
        </Box>
        <Text dimColor>─────────────────────────────────────────────────────────</Text>
        <Box>
          <Text>CLAUDE.md: </Text>
          <Text color={project?.hasClaudeMd ? 'green' : 'gray'}>
            {project?.hasClaudeMd ? 'Yes' : 'No'}
          </Text>
          <Text>   Settings: </Text>
          <Text color={project?.hasSettings ? 'green' : 'gray'}>
            {project?.hasSettings ? 'Yes' : 'No'}
          </Text>
          <Text>   Sessions: </Text>
          <Text>{project?.sessionCount ?? 0}</Text>
        </Box>
        <Text dimColor>─────────────────────────────────────────────────────────</Text>
      </Box>

      <Box>
        {/* Project Sidebar */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={focusArea === 'sidebar' ? 'green' : 'gray'}
          paddingX={1}
          width={28}
        >
          {PROJECT_CATEGORIES.map((cat) => {
            const isSelected = cat.key === category;
            const counts = categoryCounts[cat.key];
            const countText = counts.project > 0
              ? `(${counts.project} + ${counts.system} sys)`
              : `(${counts.system} sys)`;
            return (
              <Box key={cat.key}>
                <Text
                  color={isSelected ? 'green' : focusArea === 'sidebar' ? 'white' : 'gray'}
                  bold={isSelected}
                >
                  {isSelected ? '▶ ' : '  '}
                  {cat.label}
                </Text>
                <Text dimColor> {countText}</Text>
              </Box>
            );
          })}
        </Box>

        {/* Item List */}
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
            emptyMessage={getProjectEmptyMessage(category, filterMode !== 'all')}
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

      <HelpBar items={items[listIndex]?.parentPlugin ? PLUGIN_COMPONENT_HELP_BASIC : PROJECT_DASHBOARD_HELP_BASIC} />

      {showHelp && (
        <HelpModal
          items={items[listIndex]?.parentPlugin ? PLUGIN_COMPONENT_HELP_FULL : PROJECT_DASHBOARD_HELP_FULL}
          onClose={() => setShowHelp(false)}
        />
      )}
    </Box>
  );
}
