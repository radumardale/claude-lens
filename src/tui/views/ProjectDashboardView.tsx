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
    case 'mcps': {
      // Project-scoped MCPs (from .mcp.json in project)
      const projectItems = data.mcpServers
        .filter((m) => m.scope === 'project' && m.projectPath === projectPath)
        .map((m) => ({
          id: `project:${m.name}`,
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
        }));
      // User MCPs for this specific project (from ~/.claude.json projects)
      const userProjectItems = data.mcpServers
        .filter((m) => m.scope === 'user' && m.projectPath === projectPath)
        .map((m) => ({
          id: `user-project:${m.name}`,
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
        }));
      // Global/system MCPs
      const systemItems = data.mcpServers
        .filter((m) => m.scope === 'global')
        .map((m) => ({
          id: `system:${m.name}`,
          name: m.name,
          enabled: m.enabled,
          detail: m.type || 'server',
          readonly: true,
        }));
      // User-global MCPs (no projectPath)
      const userGlobalItems = data.mcpServers
        .filter((m) => m.scope === 'user' && !m.projectPath)
        .map((m) => ({
          id: `user-global:${m.name}`,
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
          id: `project:${a.name}`,
          name: a.name,
          enabled: a.enabled,
          detail: a.model,
        }));
      const systemItems = data.agents
        .filter((a) => a.scope === 'global')
        .map((a) => ({
          id: `system:${a.name}`,
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
          id: `project:${s.name}`,
          name: s.name,
          enabled: s.enabled,
          detail: s.source,
        }));
      const systemItems = data.skills
        .filter((s) => s.scope === 'global')
        .map((s) => ({
          id: `system:${s.name}`,
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
          id: `project:${c.name}`,
          name: c.name,
          enabled: c.enabled,
        }));
      const systemItems = data.commands
        .filter((c) => c.scope === 'global')
        .map((c) => ({
          id: `system:${c.name}`,
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
          id: `system:${p.id}`,
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
              id: `plugin-mcp:${mcp.configPath}:${mcp.name}`,
              name: `↳ ${mcp.name}`,
              enabled: mcp.enabled,
              detail: 'mcp',
              readonly: true,
              indent: 1,
            });
          }
          for (const skill of pluginSkills) {
            pluginItems.push({
              id: `plugin-skill:${skill.filePath}`,
              name: `↳ ${skill.name}`,
              enabled: skill.enabled,
              detail: 'skill',
              readonly: true,
              indent: 1,
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

export function ProjectDashboardView({
  data,
  projectPath,
  onBack,
  onQuit,
  onToggle,
}: ProjectDashboardViewProps): React.ReactElement {
  const [category, setCategory] = useState<ProjectCategory>('mcps');
  const [focusArea, setFocusArea] = useState<FocusArea>('sidebar');
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
      setStatusMessage({ text: 'System components can only be changed from the main menu', color: 'yellow' });
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
          {items.length === 0 ? (
            <Box paddingX={1} paddingY={1}>
              <Text dimColor>No {category} configured</Text>
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
