# Project-Level Configuration Management Plan ✅ COMPLETED

## Executive Summary

Enable full project-level configuration management in Claude Lens, allowing users to drill into any project and manage its MCPs, agents, commands, skills, view its CLAUDE.md, and see project-specific settings.

**Implementation Status:** ✅ Complete - All phases implemented

---

## What Was Implemented

### Architecture Changes

| Component | Before | After |
|-----------|--------|-------|
| **MCPs** | Global + Project | No change (already supported) |
| **Agents** | Global only | ✅ Global + Project |
| **Commands** | Global only | ✅ Global + Project |
| **Skills** | Global + Plugin | ✅ Global + Plugin + Project |
| **Plugins** | Global only | No change (global only) |

### File Locations Supported

```
~/.claude/                          (Global scope)
├── agents/*.md
├── commands/*.md
├── skills/ (symlinks)
└── .mcp.json

project/.claude/                    (Project scope - NEW)
├── agents/*.md                     ← Now scanned
├── commands/*.md                   ← Now scanned
├── skills/                         ← Now scanned
└── settings.local.json

project/.mcp.json                   (Project MCPs - existing)
```

---

## Implementation Phases

### Phase 1: Type Extensions ✅ Completed

Added `scope` and `projectPath` to Agent, Command, Skill types:

```typescript
interface Agent {
  scope: 'global' | 'project';
  projectPath?: string;
  // ... other fields
}

interface Command {
  scope: 'global' | 'project';
  projectPath?: string;
  // ... other fields
}

interface Skill {
  scope: 'global' | 'project' | 'plugin';
  projectPath?: string;
  // ... other fields
}
```

### Phase 2: Scanner Updates ✅ Completed

- Added `getProjectAgentsDir()`, `getProjectCommandsDir()`, `getProjectSkillsDir()` to paths.ts
- Updated `scanAgents()`, `scanCommands()`, `scanSkills()` to accept `projectPaths[]`
- Scanners now scan both global and project directories

### Phase 3: Action Updates ✅ Completed

- Added `projectPath` parameter to `enableAgent()`, `disableAgent()`
- Added `projectPath` parameter to `enableCommand()`, `disableCommand()`
- Added `projectPath` parameter to `enableSkill()`, `disableSkill()`

### Phase 4: CLI Updates ✅ Completed

Extended `--project` option to all component types:

```bash
claude-lens enable agent myagent --project /path/to/project
claude-lens disable command mycommand --project /path/to/project
claude-lens enable skill myskill --project /path/to/project
```

### Phase 5: TUI - Project Dashboard View ✅ Completed

Created `ProjectDashboardView.tsx` with:
- Category sidebar (MCPs, Agents, Skills, Commands, Plugins)
- Category counts displayed
- Project-scoped items only
- Toggle with Space key

### Phase 6: Project Info Enhancement ✅ Completed

Added `hasAgents`, `hasCommands`, `hasSkills` to Project type.

---

## User Flow

```
Dashboard
  └── System Configuration
        ├── MCP Servers → [list global/plugin MCPs]
        ├── Agents → [list global agents]
        ├── Skills → [list global/plugin skills]
        ├── Commands → [list global commands]
        └── Plugins → [list plugins]

  └── Projects
        └── Select Project
              └── Project Dashboard (NEW)
                    ├── MCP Servers → [list project MCPs]
                    ├── Agents → [list project agents]
                    ├── Skills → [list project skills]
                    ├── Commands → [list project commands]
                    └── Plugins → (empty - global only)
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/types/index.ts` | Added scope/projectPath to Agent, Command, Skill; hasAgents/hasCommands/hasSkills to Project |
| `src/utils/paths.ts` | Added getProjectAgentsDir, getProjectCommandsDir, getProjectSkillsDir |
| `src/scanner/agents.ts` | Scan global + project directories |
| `src/scanner/commands.ts` | Scan global + project directories |
| `src/scanner/skills.ts` | Scan global + project directories |
| `src/scanner/index.ts` | Pass projectPaths to all scanners |
| `src/scanner/projects.ts` | Detect hasAgents/hasCommands/hasSkills |
| `src/actions/agents.ts` | Add projectPath parameter |
| `src/actions/commands.ts` | Add projectPath parameter |
| `src/actions/skills.ts` | Add projectPath parameter |
| `src/cli/commands/enable.ts` | Extend --project to all types |
| `src/cli/commands/disable.ts` | Extend --project to all types |
| `src/tui/App.tsx` | Add project-dashboard view routing |
| `src/tui/views/ProjectDashboardView.tsx` | NEW - Category sidebar + list |
| `src/tui/hooks/useConfig.ts` | Pass projectPath to all toggle actions |

---

## Verification

1. Run `npx tsx bin/claude-lens.ts -i`
2. Navigate to Projects → select a project
3. Project Dashboard shows with 5 categories and counts
4. Each category shows project-scoped items only
5. Toggle an item with Space
6. CLI: `claude-lens disable command mycommand --project /path/to/project`
