# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev           # Run CLI in development mode (tsx)
npm run build         # Compile TypeScript to dist/
npm run typecheck     # Type check without emitting
```

Run specific commands in dev:
```bash
npm run dev -- scan --json          # Full scan as JSON
npm run dev -- -i                   # Launch TUI
npm run dev -- disable agent foo    # Disable an agent
```

## Architecture

**Entry flow**: `bin/claude-lens.ts` → `src/cli/index.ts` → routes to command or TUI

```
src/
├── cli/commands/     # CLI command handlers (scan, plugins, enable, disable, etc.)
├── scanner/          # Discovers components by reading Claude Code config files
├── actions/          # Enable/disable operations for each component type
├── tui/              # React/Ink interactive terminal UI
│   ├── views/        # Full-screen views (Dashboard, List, Detail, Settings)
│   ├── components/   # Reusable UI components
│   └── hooks/        # useConfig (main state), useSettings (editor prefs)
├── formatters/       # Output formatting (dashboard, table, json)
├── types/            # All TypeScript interfaces
└── utils/            # Path helpers, settings I/O, YAML parsing, editor launch
```

**Data flow**:
1. Scanner reads Claude Code files (`~/.claude/`, project `.claude/`, `.mcp.json`)
2. Returns typed data structures (Plugin[], Agent[], McpServer[], etc.)
3. CLI formats and outputs; TUI renders with React/Ink
4. Actions modify files/settings; scanner re-runs to refresh state

## Component Types

| Type | Scanned From | Disable Method |
|------|--------------|----------------|
| Plugins | `~/.claude/plugins/installed_plugins.json` | Toggle `enabledPlugins` in settings.json |
| MCPs | `.mcp.json` files (global, project, plugin) | Registry at `~/.claude-lens/disabled-mcps.json` |
| Agents | `~/.claude/agents/*.md` | Rename to `.md.disabled` |
| Commands | `~/.claude/commands/*.md` | Rename to `.md.disabled` |
| Skills | Symlinks in `~/.claude/skills/` | Rename symlink with `.disabled` suffix |
| Projects | Session data in `~/.claude/sessions/` | Read-only (no toggle) |

**Key principle**: All disabling is non-destructive. Nothing is deleted.

## Key Patterns

**Path helpers** (`src/utils/paths.ts`): Always use these instead of hardcoding paths:
```typescript
getClaudeHome()         // ~/.claude
getAgentsDir()          // ~/.claude/agents
getProjectAgentsDir(p)  // <project>/.claude/agents
```

**Scanners are async and fail gracefully**: They return empty arrays on error, never throw.

**TUI state**: `useConfig` hook in `src/tui/hooks/useConfig.ts` is the single source of truth. It calls scanners on mount and after every toggle action.

## Adding Features

**New CLI command**:
1. Create `src/cli/commands/mycommand.ts` exporting a Commander Command
2. Import and add in `src/cli/index.ts` via `program.addCommand()`

**New scanner**:
1. Create `src/scanner/mycomponent.ts` with async scan function
2. Add types to `src/types/index.ts`
3. Call from `src/scanner/index.ts` orchestrator

**New action** (enable/disable):
1. Create `src/actions/mycomponent.ts` with enable/disable functions
2. Wire into `useConfig` hook's toggle switch statement
3. Add cases to `src/cli/commands/enable.ts` and `disable.ts`
