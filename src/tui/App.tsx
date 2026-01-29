import React, { useState, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
import { useConfig } from './hooks/useConfig.js';
import { DashboardView, type Category } from './views/DashboardView.js';
import { ListView } from './views/ListView.js';
import { DetailView } from './views/DetailView.js';
import { ProjectDashboardView } from './views/ProjectDashboardView.js';
import { Spinner } from './components/Spinner.js';
import { ErrorMessage } from './components/ErrorMessage.js';
import type { ComponentType, ActionResult } from '../types/index.js';

type View = 'dashboard' | 'list' | 'detail' | 'project-dashboard';

interface ViewState {
  view: View;
  category?: Category;
  selectedItem?: string;
  projectPath?: string;
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

  const handleBack = () => {
    if (viewState.view === 'project-dashboard') {
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

  if (viewState.view === 'dashboard') {
    return (
      <DashboardView
        data={state.data}
        onSelect={handleSelectCategory}
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
