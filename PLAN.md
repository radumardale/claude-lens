# Claude-Lens: Claude Code Configuration Manager

## Summary

A TypeScript CLI tool to scan, report, and manage Claude Code configuration (MCPs, plugins, skills, agents, commands) across global and project scopes.

---

## Feasibility Assessment

✅ **Fully feasible** with one important caveat:

### What's Possible

- Scanning all configuration (plugins, MCPs, agents, skills, commands, projects)
- Reporting in dashboard/table/JSON formats
- Enable/disable for all component types (with creative workarounds for MCPs)

### What's NOT Possible

- **Usage tracking** - Claude Code doesn't log which MCPs/skills are invoked. There's no reliable way to know "what's being used vs not used."
- The best we can do is show what's _configured_ and let you decide what to keep.

### Scope Clarification

- "System level" and "user level" are the same for Claude Code (everything is in `~/.claude/`)
- Better mental model: **Global** (`~/.claude/`) vs **Project-level** (`.claude/` in each project)

---

## Your Current Setup (from scan)

| Component               | Count                      |
| ----------------------- | -------------------------- |
| Projects with .claude   | 25                         |
| CLAUDE.md files         | 21                         |
| Installed plugins       | 2 (figma, frontend-design) |
| Available plugin skills | 16                         |
| Custom agents           | 7                          |
| Custom commands         | 1                          |
| Linked skills           | 1                          |
| MCP configurations      | 3+ across projects         |

---

## Enable/Disable Strategy

Each component type needs a different approach:

| Component    | Strategy          | How it works                                                    |
| ------------ | ----------------- | --------------------------------------------------------------- |
| **Plugins**  | Native            | `settings.json` already has `enabledPlugins` object             |
| **MCPs**     | Registry          | Store disabled server IDs in `~/.claude-lens/disabled-mcps.json`|
| **Agents**   | Rename            | Add `.disabled` suffix to filename                              |
| **Commands** | Rename            | Add `.disabled` suffix to filename                              |
| **Skills**   | Rename            | Add `.disabled` suffix to symlink name                          |

All strategies are **non-destructive** - nothing gets deleted, just disabled.

---

## Implementation Phases

### Phase 1+2: Scanner + CLI (First Deliverable) ✅ Completed

**Goal**: Build the foundation and a usable CLI tool in one go.

**Files to create**:

```
claude-lens/
├── package.json
├── tsconfig.json
├── bin/claude-lens.ts
├── src/
│   ├── types/index.ts           # All type definitions
│   ├── scanner/
│   │   ├── index.ts             # Main orchestrator
│   │   ├── settings.ts          # Parse settings.json
│   │   ├── plugins.ts           # Scan installed_plugins.json + marketplaces
│   │   ├── agents.ts            # Scan ~/.claude/agents/
│   │   ├── commands.ts          # Scan ~/.claude/commands/
│   │   ├── skills.ts            # Scan ~/.claude/skills/
│   │   ├── mcps.ts              # Scan .mcp.json files
│   │   └── projects.ts          # Find all .claude directories
│   └── utils/
│       ├── paths.ts             # Resolve ~/.claude, find projects
│       └── yaml.ts              # Parse YAML frontmatter from agents/skills
```

**CLI Commands**:

```bash
claude-lens                    # Dashboard summary
claude-lens scan               # Full scan with summary
claude-lens scan --json        # JSON output for scripting
claude-lens plugins            # List plugins (installed + available)
claude-lens agents             # List agents
claude-lens skills             # List skills
claude-lens commands           # List commands
claude-lens mcps               # List MCP servers
claude-lens projects           # List projects with Claude configs
```

**Additional files for CLI**:

```
src/
├── cli/
│   ├── index.ts               # Commander.js setup
│   └── commands/
│       ├── scan.ts
│       ├── plugins.ts
│       ├── agents.ts
│       ├── skills.ts
│       ├── commands.ts
│       ├── mcps.ts
│       └── projects.ts
└── formatters/
    ├── dashboard.ts           # ASCII dashboard with boxes
    ├── table.ts               # Tabular output
    └── json.ts                # JSON formatter
```

**Dependencies**: commander, chalk, ora, boxen, cli-table3

**Deliverable**: Working `claude-lens` CLI that scans and displays all Claude Code configuration.

---

### Phase 3: Enable/Disable Actions ✅ Completed

**Goal**: Toggle components on/off without deleting.

**Commands**:

```bash
claude-lens enable <type> <name>
claude-lens disable <type> <name>

# Examples:
claude-lens disable plugin frontend-design
claude-lens enable agent code-reviewer
claude-lens disable mcp rollbar --project ~/projects/dunder-mifflin
```

**Files added**:

```
src/
├── actions/
│   ├── index.ts               # ActionResult type + shared helpers
│   ├── plugins.ts             # Toggle enabledPlugins in settings.json
│   ├── agents.ts              # Rename with .disabled suffix
│   ├── commands.ts            # Rename with .disabled suffix
│   ├── skills.ts              # Rename symlink with .disabled suffix
│   └── mcps.ts                # Registry-based per-server disable
└── cli/commands/
    ├── enable.ts
    └── disable.ts
docs/
└── future-plugin-skills-toggle.md  # Future enhancement spec
```

**Implementation notes**:
- MCPs use registry at `~/.claude-lens/disabled-mcps.json` for per-server granularity
- Plugin skills inherit enabled state from parent plugin (independent toggle deferred)
- All strategies are non-destructive

---

### Phase 4: Interactive TUI Mode (Ink) ✅ Completed

**Goal**: Browse and manage configuration interactively using Ink (React for CLI).

```bash
claude-lens --interactive      # or just 'claude-lens -i'
```

**Features**:

- Arrow keys to navigate components
- Spacebar to toggle enable/disable
- Enter to view details
- `/` to search/filter
- `q` to quit

**Additional dependencies**: ink, ink-select-input, ink-text-input

**Files to add**:

```
src/tui/
├── App.tsx                    # Main Ink app
├── components/
│   ├── Dashboard.tsx          # Overview screen
│   ├── ComponentList.tsx      # Generic list with enable/disable
│   ├── DetailView.tsx         # View component details
│   └── SearchInput.tsx        # Filter/search
└── hooks/
    └── useConfig.ts           # State management
```

---

### Phase 5: Polish & Distribution ✅ Completed

**Goal**: Ready for open source.

- ✅ npm package setup (`npx claude-lens`)
- ✅ Comprehensive README
- ⏭️ Error handling and edge cases (deferred)
- ✅ Tests (Vitest) - 43 tests covering YAML, settings, components
- ✅ GitHub Actions for CI/CD (Node 18, 20, 22)

---

## Tech Stack

```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "boxen": "^7.1.0",
    "cli-table3": "^0.6.3",
    "inquirer": "^9.2.0",
    "yaml": "^2.3.0",
    "fast-glob": "^3.3.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0",
    "tsx": "^4.0.0"
  }
}
```

---

## Key Files to Parse

| File                                        | Purpose                               |
| ------------------------------------------- | ------------------------------------- |
| `~/.claude/settings.json`                   | Global settings + enabledPlugins      |
| `~/.claude/plugins/installed_plugins.json`  | Installed plugins registry            |
| `~/.claude/plugins/known_marketplaces.json` | Marketplace sources                   |
| `~/.claude/agents/*.md`                     | Custom agents (YAML frontmatter)      |
| `~/.claude/commands/*.md`                   | Custom commands                       |
| `~/.claude/skills/*`                        | Symlinks to skills                    |
| `*/.mcp.json`                               | MCP server configs (global + project) |
| `*/.claude/settings.local.json`             | Project settings                      |

---

## Decisions Made

- ✅ **No usage tracking** - Focus on visibility + enable/disable. User decides what to keep.
- ✅ **TUI with Ink** - Full React-based terminal UI for interactive mode.
- ✅ **Phase 1+2 together** - Build scanner + CLI as one deliverable.

---

## Verification Plan

After each phase:

1. Run `claude-lens scan` and verify it finds all your known components
2. Compare JSON output against manually inspecting the files
3. Test enable/disable by toggling a plugin, then verifying `settings.json` changed
4. Restart Claude Code and confirm the disabled component is no longer available
