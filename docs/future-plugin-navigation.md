# Future Enhancement: Navigate to Parent Plugin from Detail View

## Summary

When viewing a plugin component (skill/MCP) in DetailView, pressing `p` should navigate directly to the parent plugin's detail view instead of just showing a message.

---

## Current Behavior

- DetailView shows `p Go to plugin` in help bar for plugin components
- Pressing `p` shows message: `Part of "figma" plugin. Use main menu to view plugins.`
- No actual navigation happens

---

## Proposed Solution

### New Callback Prop

Add `onNavigateToPlugin` callback to DetailView:

```typescript
interface DetailViewProps {
  // ... existing props
  onNavigateToPlugin?: (pluginName: string) => void;
}
```

### Update useInput Handler

```typescript
if (input === 'p' && detail?.pluginName) {
  if (onNavigateToPlugin) {
    onNavigateToPlugin(detail.pluginName);
  }
  return;
}
```

### App.tsx Changes

The main App component manages view state. Add handler:

```typescript
const handleNavigateToPlugin = (pluginName: string) => {
  // Find plugin by name
  const plugin = data.plugins.find(p => p.name === pluginName);
  if (plugin) {
    // Switch to plugins category and select the plugin
    setView('detail');
    setCategory('plugins');
    setSelectedItemId(plugin.id);
  }
};
```

Pass to DetailView:

```tsx
<DetailView
  // ... existing props
  onNavigateToPlugin={handleNavigateToPlugin}
/>
```

---

## Implementation Steps

1. **Read App.tsx** to understand current view state management
2. **Add onNavigateToPlugin prop** to DetailViewProps interface
3. **Update useInput** in DetailView to call the callback
4. **Implement handler** in App.tsx that:
   - Finds the plugin by name
   - Updates view state to show plugin detail
5. **Update breadcrumb** to show navigation path correctly

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/tui/views/DetailView.tsx` | Add `onNavigateToPlugin` prop, call it on `p` key |
| `src/tui/App.tsx` | Add navigation handler, pass to DetailView |

---

## Edge Cases

1. **Plugin not found** - Show error message if plugin name doesn't match any plugin
2. **Already viewing a plugin** - `p` key should do nothing or be hidden from help
3. **Navigation history** - Consider if pressing `h`/`Esc` should go back to previous item or just go back one level

---

## Open Questions

1. Should there be a "back" history stack so `h` returns to the previous component?
2. Should the breadcrumb show the navigation path (e.g., `Skills > code-connect > figma plugin`)?
3. Should this also work from ListView (not just DetailView)?
