import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { useConfig } from './hooks/useConfig.js';
import { DashboardView, type Category } from './views/DashboardView.js';

type View = 'dashboard' | 'list' | 'detail';

interface ViewState {
  view: View;
  category?: Category;
  selectedItem?: string;
}

export function App(): React.ReactElement {
  const { exit } = useApp();
  const { state } = useConfig();
  const [viewState, setViewState] = useState<ViewState>({ view: 'dashboard' });

  const handleSelectCategory = (category: Category) => {
    setViewState({ view: 'list', category });
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

  // Placeholder for list view (coming in Task 7)
  return (
    <Box padding={1} flexDirection="column">
      <Text bold>
        {viewState.category?.toUpperCase()} (List view coming soon)
      </Text>
      <Text dimColor>Press Esc to go back, q to quit</Text>
    </Box>
  );
}
