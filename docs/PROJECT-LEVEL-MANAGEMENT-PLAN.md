# Project-Level Configuration Management Plan

## Executive Summary

Enable full project-level configuration management in Claude Lens, allowing users to drill into any project and manage its MCPs, view its CLAUDE.md, and see project-specific settings.

**Current State:** Backend fully supports project-scoped MCPs. TUI shows project MCP counts but can't manage them directly.

**Goal:** When selecting a project, enter a "Project Mode" where you can browse and toggle that project's MCPs.

---

## Architecture Overview

### What's Already Working ✅

| Layer | Status | Details |
|-------|--------|---------|
| **Data Model** | ✅ Complete | `McpServer.scope`, `McpServer.projectPath` |
| **Scanner** | ✅ Complete | Three-level MCP scanning (global/plugin/project) |
| **Actions** | ✅ Complete | `enableMcp(name, projectPath)`, `disableMcp(name, projectPath)` |
| **CLI** | ✅ Complete | `--project <path>` option on enable/disable |
| **TUI Toggle** | ✅ Complete | Passes `projectPath` through entire chain |

### What Needs Building 🔨

| Feature | Priority | Complexity |
|---------|----------|------------|
| Project Detail → MCP List navigation | P0 | Medium |
| Project-scoped MCP list view | P0 | Medium |
| Batch enable/disable all project MCPs | P1 | Low |
| Filter MCPs by scope in main view | P2 | Low |
| Project CLAUDE.md viewer | P2 | Low |

---

## Implementation Phases

### Phase 1: Project Drill-Down (Core Feature)

**Goal:** When you press Enter on a project, show that project's MCPs in a new view where you can toggle them.

#### Changes Required

**1. New View: `ProjectMcpView.tsx`**
- Shows only MCPs for the selected project
- Allows toggling each MCP
- Shows project path in header
- Esc goes back to Projects list

**2. Update `App.tsx` View Routing**
- Add new view state: `'project-mcps'`
- Track selected project path in state
- Route from project detail to project MCP view

**3. Update `DetailView.tsx` for Projects**
- Add "Press Enter to manage MCPs" hint
- Or replace detail view entirely with MCP list for projects

#### User Flow
```
Dashboard → Projects → [Select Project] → Project MCPs
                                              ↓
                                    [Toggle with Space]
                                    [Esc to go back]
```

#### Files to Modify
- `src/tui/App.tsx` - Add view state and routing
- `src/tui/views/DetailView.tsx` - Add navigation hint OR
- `src/tui/views/ProjectMcpView.tsx` (new) - Project-specific MCP list

---

### Phase 2: Batch Operations

**Goal:** Enable/disable all MCPs in a project at once.

#### Changes Required

**1. New Action: `batchToggleProjectMcps()`**
- Takes project path and target state (enable/disable)
- Loops through all project MCPs
- Returns summary result

**2. TUI Keyboard Shortcut**
- `a` = Enable all project MCPs
- `d` = Disable all project MCPs
- Show confirmation before batch action

#### Files to Modify
- `src/actions/mcps.ts` - Add batch functions
- `src/tui/views/ProjectMcpView.tsx` - Add keyboard handlers

---

### Phase 3: Enhanced Filtering

**Goal:** Filter MCPs by scope in the main MCP view.

#### Changes Required

**1. Add Scope Filter to ListView**
- Tabs or toggle: All | Global | Project | Plugin
- Remember filter preference

**2. CLI Enhancement**
- `claude-lens mcps --scope project`
- `claude-lens mcps --scope global`

#### Files to Modify
- `src/tui/views/ListView.tsx` - Add filter state and UI
- `src/cli/commands/mcps.ts` - Add `--scope` option

---

### Phase 4: Project Content Viewer

**Goal:** View project's CLAUDE.md content from the TUI.

#### Changes Required

**1. CLAUDE.md Viewer**
- Read and display CLAUDE.md content
- Scrollable view for long files
- Syntax highlighting (optional)

**2. Project Settings Viewer**
- Show `settings.local.json` content
- Display as formatted JSON

#### Files to Modify
- `src/tui/views/ProjectContentView.tsx` (new)
- `src/scanner/projects.ts` - Add content reading

---

## Detailed Phase 1 Implementation

### Task 1.1: Add View State for Project MCPs

**File:** `src/tui/App.tsx`

```typescript
type View = 'dashboard' | 'list' | 'detail' | 'project-mcps';

interface ViewState {
  view: View;
  category?: Category;
  selectedItem?: string;
  projectPath?: string;  // NEW: Track selected project
}
```

**Commit:** `feat(tui): add project-mcps view state`

---

### Task 1.2: Create ProjectMcpView Component

**File:** `src/tui/views/ProjectMcpView.tsx` (new)

Features:
- Header showing project name
- List of project MCPs with enable/disable status
- Space to toggle, Esc to go back
- Shows "No MCPs configured" if empty

**Commit:** `feat(tui): add ProjectMcpView for project MCP management`

---

### Task 1.3: Update Navigation Flow

**File:** `src/tui/App.tsx`

- When viewing project detail and pressing Enter → navigate to project-mcps view
- Pass `projectPath` to new view
- Handle back navigation

**Commit:** `feat(tui): wire up project detail to MCP management`

---

### Task 1.4: Update Project Detail View

**File:** `src/tui/views/DetailView.tsx`

- Add instruction: "Press Enter to manage project MCPs"
- Or make Enter navigate to project MCPs from detail

**Commit:** `feat(tui): add MCP management hint to project detail`

---

## UI Mockups

### Project MCP View
```
┌─────────────────────────────────────────────────────────┐
│  Project: mixbook_editors                               │
│  Path: /Users/bamse/MIXBOOK/mixbook_editors             │
│  ───────────────────────────────────────────────────    │
│                                                         │
│  MCP Servers (3)                                        │
│  ▶ rollbar                    ✓ enabled                 │
│    sentry                     ✓ enabled                 │
│    datadog                    ✗ disabled                │
│                                                         │
│  Space Toggle   Esc Back   q Quit                       │
└─────────────────────────────────────────────────────────┘
```

### Project Detail (Updated)
```
┌─────────────────────────────────────────────────────────┐
│  Project: mixbook_editors                               │
│  ─────────────────────────────────────────────────────  │
│  Path           /Users/bamse/MIXBOOK/mixbook_editors    │
│  MCPs           3 configured (2 enabled, 1 disabled)    │
│  Has CLAUDE.md  Yes                                     │
│  Has Settings   No                                      │
│  Sessions       26                                      │
│                                                         │
│  Enter Manage MCPs   Esc Back   q Quit                  │
└─────────────────────────────────────────────────────────┘
```

---

## Verification Plan

### Phase 1 Testing
1. `npx tsx bin/claude-lens.ts -i`
2. Navigate to Projects
3. Select a project with MCPs
4. Press Enter → should see project MCP list
5. Toggle an MCP with Space
6. Verify `.claude-lens/disabled-mcps.json` updated with project key
7. Esc back to project list
8. Re-enter project → verify toggle persisted

### CLI Verification
```bash
# List all MCPs (should show project scope)
claude-lens mcps

# Disable a project MCP via CLI
claude-lens disable mcp rollbar --project /path/to/project

# Re-run TUI and verify state
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| User confusion about scope | Clear labels: "Project MCPs" vs "System MCPs" |
| Accidental batch disable | Confirmation prompt before batch operations |
| Project path encoding issues | Use existing composite ID pattern |
| State sync after toggle | Already handled by `refresh()` in useConfig |

---

## Timeline Estimate

| Phase | Tasks | Effort |
|-------|-------|--------|
| Phase 1 | 4 tasks | ~2-3 hours |
| Phase 2 | 2 tasks | ~1 hour |
| Phase 3 | 2 tasks | ~1 hour |
| Phase 4 | 2 tasks | ~1-2 hours |

**Recommendation:** Start with Phase 1 to deliver core value quickly.

---

## Design Decisions (Confirmed)

1. **Scope display:** Project MCPs only (clean, focused view)
2. **Navigation flow:** Projects → Detail View → Enter → Project MCPs
3. **Batch operations:** Require confirmation before batch enable/disable
