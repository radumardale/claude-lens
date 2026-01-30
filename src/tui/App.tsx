import React, { useState, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
import { useConfig } from './hooks/useConfig.js';
import { DashboardView, type Category } from './views/DashboardView.js';
import { ListView } from './views/ListView.js';
import { DetailView } from './views/DetailView.js';
import { ProjectDashboardView } from './views/ProjectDashboardView.js';
import { ContentView } from './views/ContentView.js';
import { SettingsView } from './views/SettingsView.js';
import { Spinner } from './components/Spinner.js';
import { ErrorMessage } from './components/ErrorMessage.js';
import type { ComponentType, ActionResult } from '../types/index.js';

type View = 'dashboard' | 'list' | 'detail' | 'project-dashboard' | 'content' | 'settings';

interface ContentSource {
  title: string;
  content: string;
  filePath: string;
  breadcrumbPath: string[];
}

interface ViewState {
  view: View;
  category?: Category;
  selectedItem?: string;
  projectPath?: string;
  contentSource?: ContentSource;
  listIndices: Record<Category, number>;
  projectListIndex: number;
}

export function App(): React.ReactElement {
  const { exit } = useApp();
  const { state, toggle, refresh } = useConfig();
  const [viewState, setViewState] = useState<ViewState>({
    view: 'dashboard',
    listIndices: { plugins: 0, agents: 0, commands: 0, skills: 0, mcps: 0, projects: 0 },
    projectListIndex: 0,
  });

  const handleToggle = useCallback(
    async (
      type: ComponentType,
      name: string,
      enabled: boolean,
      projectPath?: string
    ): Promise<ActionResult> => {
      return toggle(type, name, enabled, projectPath);
    },
    [toggle]
  );

  const handleSelectCategory = (category: Category) => {
    setViewState((prev) => ({ ...prev, view: 'list', category }));
  };

  const handleSelectItem = (category: Category, itemId: string) => {
    setViewState((prev) => ({
      ...prev,
      view: 'detail',
      category,
      selectedItem: itemId,
      projectPath: undefined,
    }));
  };

  const handleSelectItemFromProject = (category: Category, itemId: string) => {
    // Preserve projectPath so back navigation returns to project dashboard
    setViewState((prev) => ({
      ...prev,
      view: 'detail',
      category,
      selectedItem: itemId,
    }));
  };

  const handleEnterProject = (projectPath: string) => {
    setViewState((prev) => ({ ...prev, view: 'project-dashboard', projectPath, projectListIndex: 0 }));
  };

  const handleViewContent = (contentSource: ContentSource) => {
    setViewState((prev) => ({
      ...prev,
      view: 'content',
      contentSource,
    }));
  };

  const handleOpenSettings = () => {
    setViewState((prev) => ({ ...prev, view: 'settings' }));
  };

  const handleBack = () => {
    if (viewState.view === 'settings') {
      setViewState((prev) => ({ ...prev, view: 'dashboard' }));
    } else if (viewState.view === 'content') {
      // Go back to detail view
      setViewState((prev) => ({
        ...prev,
        view: 'detail',
        contentSource: undefined,
      }));
    } else if (viewState.view === 'project-dashboard') {
      // Go back to projects list
      setViewState((prev) => ({ ...prev, view: 'list', category: 'projects' }));
    } else if (viewState.view === 'detail') {
      // If we came from project-dashboard, go back there
      if (viewState.projectPath) {
        setViewState((prev) => ({ ...prev, view: 'project-dashboard', projectPath: viewState.projectPath }));
      } else {
        setViewState((prev) => ({ ...prev, view: 'list', category: viewState.category }));
      }
    } else {
      setViewState((prev) => ({ ...prev, view: 'dashboard' }));
    }
  };

  const handleQuit = () => {
    exit();
  };

  const handleListIndexChange = (cat: Category, index: number) => {
    setViewState((prev) => ({
      ...prev,
      category: cat, // Keep viewState.category in sync with ListView's current category
      listIndices: { ...prev.listIndices, [cat]: index },
    }));
  };

  const handleProjectListIndexChange = (index: number) => {
    setViewState((prev) => ({ ...prev, projectListIndex: index }));
  };

  if (state.loading) {
    return (
      <Box padding={1}>
        <Spinner text="Scanning Claude Code configuration..." />
      </Box>
    );
  }

  if (state.error) {
    return <ErrorMessage message={state.error} onRetry={refresh} />;
  }

  if (!state.data) {
    return <ErrorMessage message="No data available" onRetry={refresh} />;
  }

  if (viewState.view === 'settings') {
    return (
      <SettingsView
        onBack={handleBack}
        onQuit={handleQuit}
      />
    );
  }

  if (viewState.view === 'content' && viewState.contentSource) {
    return (
      <ContentView
        title={viewState.contentSource.title}
        content={viewState.contentSource.content}
        filePath={viewState.contentSource.filePath}
        breadcrumbPath={viewState.contentSource.breadcrumbPath}
        onBack={handleBack}
        onQuit={handleQuit}
      />
    );
  }

  if (viewState.view === 'dashboard') {
    return (
      <DashboardView
        data={state.data}
        onSelect={handleSelectCategory}
        onOpenSettings={handleOpenSettings}
        onQuit={handleQuit}
      />
    );
  }

  if (viewState.view === 'list' && viewState.category) {
    return (
      <ListView
        data={state.data}
        initialCategory={viewState.category}
        listIndex={viewState.listIndices[viewState.category]}
        onListIndexChange={handleListIndexChange}
        onBack={handleBack}
        onQuit={handleQuit}
        onSelectItem={handleSelectItem}
        onEnterProject={handleEnterProject}
        onToggle={handleToggle}
      />
    );
  }

  // Detail view
  if (viewState.view === 'detail' && viewState.category && viewState.selectedItem) {
    return (
      <DetailView
        data={state.data}
        category={viewState.category}
        itemId={viewState.selectedItem}
        onBack={handleBack}
        onQuit={handleQuit}
        onToggle={handleToggle}
        onViewContent={handleViewContent}
      />
    );
  }

  // Project Dashboard view
  if (viewState.view === 'project-dashboard' && viewState.projectPath) {
    return (
      <ProjectDashboardView
        data={state.data}
        projectPath={viewState.projectPath}
        listIndex={viewState.projectListIndex}
        onListIndexChange={handleProjectListIndexChange}
        onBack={handleBack}
        onQuit={handleQuit}
        onToggle={handleToggle}
        onSelectItem={handleSelectItemFromProject}
      />
    );
  }

  return (
    <Box padding={1}>
      <Text color="red">Unknown view state</Text>
    </Box>
  );
}
