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
}

export function App(): React.ReactElement {
  const { exit } = useApp();
  const { state, toggle, refresh } = useConfig();
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });

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
    setViewState({ view: 'list', category });
  };

  const handleSelectItem = (category: Category, itemId: string) => {
    setViewState({ view: 'detail', category, selectedItem: itemId });
  };

  const handleEnterProject = (projectPath: string) => {
    setViewState({ view: 'project-dashboard', projectPath });
  };

  const handleViewContent = (contentSource: ContentSource) => {
    setViewState((prev) => ({
      ...prev,
      view: 'content',
      contentSource,
    }));
  };

  const handleOpenSettings = () => {
    setViewState({ view: 'settings' });
  };

  const handleBack = () => {
    if (viewState.view === 'settings') {
      setViewState({ view: 'dashboard' });
    } else if (viewState.view === 'content') {
      // Go back to detail view
      setViewState((prev) => ({
        ...prev,
        view: 'detail',
        contentSource: undefined,
      }));
    } else if (viewState.view === 'project-dashboard') {
      // Go back to projects list
      setViewState({ view: 'list', category: 'projects' });
    } else if (viewState.view === 'detail') {
      setViewState({ view: 'list', category: viewState.category });
    } else {
      setViewState({ view: 'dashboard' });
    }
  };

  const handleQuit = () => {
    exit();
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
        onBack={handleBack}
        onQuit={handleQuit}
        onToggle={handleToggle}
      />
    );
  }

  return (
    <Box padding={1}>
      <Text color="red">Unknown view state</Text>
    </Box>
  );
}
