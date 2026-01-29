import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { ComponentList, type ListItem } from '../components/ComponentList.js';
import { HelpBar, type HelpItem } from '../components/HelpBar.js';
import type { ScanResult, ComponentType, ActionResult } from '../../types/index.js';

type ProjectCategory = 'mcps' | 'agents' | 'skills' | 'commands' | 'plugins';

interface ProjectDashboardViewProps {
  data: ScanResult;
  projectPath: string;
  onBack: () => void;
  onQuit: () => void;
  onToggle: (type: ComponentType, name: string, enabled: boolean, projectPath?: string) => Promise<ActionResult>;
}

type FocusArea = 'sidebar' | 'list';

const PROJECT_CATEGORIES: { key: ProjectCategory; label: string }[] = [
  { key: 'mcps', label: 'MCP Servers' },
  { key: 'agents', label: 'Agents' },
  { key: 'skills', label: 'Skills' },
  { key: 'commands', label: 'Commands' },
  { key: 'plugins', label: 'Plugins' },
];

const PROJECT_DASHBOARD_HELP: HelpItem[] = [
  { key: '←/→', label: 'Focus' },
  { key: '↑/↓', label: 'Navigate' },
  { key: 'Space', label: 'Toggle' },
  { key: 'Esc', label: 'Back' },
  { key: 'q', label: 'Quit' },
];

function getProjectCategoryItems(
  data: ScanResult,
  category: ProjectCategory,
  projectPath: string
): ListItem[] {
  switch (category) {
    case 'mcps':
      return data.mcpServers
        .filter((m) => m.scope === 'project' && m.projectPath === projectPath)
        .map((m) => ({
          id: m.name,
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
        }));
    case 'agents':
      return data.agents
        .filter((a) => a.scope === 'project' && a.projectPath === projectPath)
        .map((a) => ({
          id: a.name,
          name: a.name,
          enabled: a.enabled,
          detail: a.model,
        }));
    case 'skills':
      return data.skills
        .filter((s) => s.scope === 'project' && s.projectPath === projectPath)
        .map((s) => ({
          id: s.name,
          name: s.name,
          enabled: s.enabled,
          detail: s.source,
        }));
    case 'commands':
      return data.commands
        .filter((c) => c.scope === 'project' && c.projectPath === projectPath)
        .map((c) => ({
          id: c.name,
          name: c.name,
          enabled: c.enabled,
        }));
    case 'plugins':
      // Plugins are global only - show empty list for project view
      return [];
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

export function ProjectDashboardView({
  data,
  projectPath,
  onBack,
  onQuit,
  onToggle,
}: ProjectDashboardViewProps): React.ReactElement {
  const [category, setCategory] = useState<ProjectCategory>('mcps');
  const [focusArea, setFocusArea] = useState<FocusArea>('list');
  const [listIndex, setListIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const projectName = projectPath.split('/').pop() || projectPath;
  const categoryIndex = PROJECT_CATEGORIES.findIndex((c) => c.key === category);

  const project = useMemo(
    () => data.projects.find((p) => p.path === projectPath),
    [data.projects, projectPath]
  );

  const items = useMemo(
    () => getProjectCategoryItems(data, category, projectPath),
    [data, category, projectPath]
  );

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<ProjectCategory, number> = {
      mcps: data.mcpServers.filter((m) => m.scope === 'project' && m.projectPath === projectPath).length,
      agents: data.agents.filter((a) => a.scope === 'project' && a.projectPath === projectPath).length,
      skills: data.skills.filter((s) => s.scope === 'project' && s.projectPath === projectPath).length,
      commands: data.commands.filter((c) => c.scope === 'project' && c.projectPath === projectPath).length,
      plugins: 0, // Global only
    };
    return counts;
  }, [data, projectPath]);

  const handleToggle = async () => {
    if (items.length === 0 || isToggling) return;

    const componentType = categoryToComponentType(category);
    if (!componentType) {
      setStatusMessage({ text: 'Cannot toggle this item type', color: 'yellow' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const item = items[listIndex];
    setIsToggling(true);
    setStatusMessage({ text: 'Toggling...', color: 'yellow' });

    try {
      const result = await onToggle(componentType, item.name, item.enabled, projectPath);
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

    setTimeout(() => setStatusMessage(null), 3000);
  };

  useInput((input, key) => {
    if (input === 'q') {
      onQuit();
      return;
    }

    if (key.escape) {
      onBack();
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
        const newIndex = categoryIndex > 0 ? categoryIndex - 1 : PROJECT_CATEGORIES.length - 1;
        setCategory(PROJECT_CATEGORIES[newIndex].key);
        setListIndex(0);
      } else if (key.downArrow) {
        const newIndex = categoryIndex < PROJECT_CATEGORIES.length - 1 ? categoryIndex + 1 : 0;
        setCategory(PROJECT_CATEGORIES[newIndex].key);
        setListIndex(0);
      } else if (key.return) {
        setFocusArea('list');
      }
    } else {
      if (key.upArrow) {
        setListIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, items.length - 1)));
      } else if (key.downArrow) {
        setListIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
      } else if (input === ' ' && items.length > 0) {
        handleToggle();
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} paddingX={1} flexDirection="column">
        <Text bold color="cyan">
          Project: {projectName}
        </Text>
        <Text dimColor>{projectPath}</Text>
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
          width={18}
        >
          {PROJECT_CATEGORIES.map((cat) => {
            const isSelected = cat.key === category;
            const count = categoryCounts[cat.key];
            return (
              <Box key={cat.key}>
                <Text
                  color={isSelected ? 'green' : focusArea === 'sidebar' ? 'white' : 'gray'}
                  bold={isSelected}
                >
                  {isSelected ? '▶ ' : '  '}
                  {cat.label}
                </Text>
                <Text dimColor> ({count})</Text>
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
          {items.length === 0 ? (
            <Box paddingX={1} paddingY={1}>
              <Text dimColor>
                {category === 'plugins'
                  ? 'Plugins are global only'
                  : `No ${category} configured for this project`}
              </Text>
            </Box>
          ) : (
            <ComponentList
              items={items}
              selectedIndex={listIndex}
              focused={focusArea === 'list'}
            />
          )}
        </Box>
      </Box>

      {statusMessage && (
        <Box paddingX={1} marginTop={1}>
          <Text color={statusMessage.color as 'green' | 'red' | 'yellow'}>
            {statusMessage.text}
          </Text>
        </Box>
      )}

      <HelpBar items={PROJECT_DASHBOARD_HELP} />
    </Box>
  );
}
