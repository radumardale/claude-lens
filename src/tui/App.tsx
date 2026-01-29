import React, { useState, useCallback } from 'react';
import { Box, Text, useApp } from 'ink';
import { useConfig } from './hooks/useConfig.js';
import { DashboardView, type Category } from './views/DashboardView.js';
import { ListView } from './views/ListView.js';
import { DetailView } from './views/DetailView.js';
import type { ComponentType, ActionResult } from '../types/index.js';

type View = 'dashboard' | 'list' | 'detail';

interface ViewState {
  view: View;
  category?: Category;
  selectedItem?: string;
}

export function App(): React.ReactElement {
  const { exit } = useApp();
  const { state, toggle } = useConfig();
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

  const handleBack = () => {
    if (viewState.view === 'detail') {
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
        <Text color="yellow">Loading configuration...</Text>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box padding={1} flexDirection="column">
        <Text color="red">Error: {state.error}</Text>
        <Text dimColor>Press q to quit</Text>
      </Box>
    );
  }

  if (!state.data) {
    return (
      <Box padding={1}>
        <Text color="red">No data available</Text>
      </Box>
    );
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

  return (
    <Box padding={1}>
      <Text color="red">Unknown view state</Text>
    </Box>
  );
}
