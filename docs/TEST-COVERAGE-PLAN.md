# Test Coverage Plan

> Generated: 2026-01-30
> Current test count: 88 tests across 7 files
> Target: Comprehensive coverage for public release

## Executive Summary

This document identifies test coverage gaps in claude-lens, prioritized by risk and importance. The codebase has solid coverage in formatters but significant gaps in scanners, actions, and CLI commands.

**Current State:**
- ✅ Well-tested: Formatters (dashboard, table, JSON)
- ⚠️ Partial coverage: Path utilities, YAML parsing
- ❌ No coverage: Scanners, Actions, CLI commands, TUI

---

## Priority Levels

| Priority | Criteria | Action |
|----------|----------|--------|
| **P0** | Destructive operations, data integrity | Must have before v1.0 |
| **P1** | Core functionality, user-facing features | Should have soon |
| **P2** | Supporting utilities, edge cases | Nice to have |
| **P3** | UI components, low-risk code | Can defer |

---

## P0: Critical (Must Have)

### 1. `src/actions/delete.ts` ⚠️ DESTRUCTIVE
**Risk**: Permanently deletes user files
**LOC**: ~80
**Estimated tests**: 15-20

```
Tests needed:
- [ ] deleteDisabledItem() removes correct file for each type (agent, command, skill, mcp)
- [ ] Throws error for unknown component types
- [ ] Throws error when file doesn't exist
- [ ] Handles permission errors gracefully
- [ ] emptyDisabledItems() deletes all items
- [ ] emptyDisabledItems() with empty list is no-op
- [ ] Verify actual file deletion (integration test with temp files)
- [ ] Does not delete non-disabled files (safety check)
```

### 2. `src/scanner/agents.ts`
**Risk**: Incorrect scanning = missing/phantom items in UI
**LOC**: ~60
**Estimated tests**: 12-15

```
Tests needed:
- [ ] Finds .md files in agents directory
- [ ] Identifies .md.disabled files correctly
- [ ] Parses agent name from filename
- [ ] Handles empty directory
- [ ] Handles missing directory gracefully
- [ ] Excludes non-.md files
- [ ] Scans both global (~/.claude/agents) and project-level
- [ ] Handles malformed filenames
```

### 3. `src/scanner/commands.ts`
**Risk**: Same as agents - incorrect scanning
**LOC**: ~55
**Estimated tests**: 10-12

```
Tests needed:
- [ ] Finds .md files in commands directory
- [ ] Identifies .md.disabled files correctly
- [ ] Parses command name and trigger from content
- [ ] Handles empty directory
- [ ] Handles missing directory gracefully
- [ ] Scans both global and project-level
```

### 4. `src/scanner/skills.ts`
**Risk**: Symlink handling complexity
**LOC**: ~70
**Estimated tests**: 12-15

```
Tests needed:
- [ ] Finds skill symlinks in skills directory
- [ ] Identifies .disabled suffix correctly
- [ ] Resolves symlink targets
- [ ] Handles broken symlinks gracefully
- [ ] Detects plugin-provided skills
- [ ] Scans both global and project-level
- [ ] Handles non-symlink files in directory
```

### 5. `src/scanner/mcps.ts`
**Risk**: Complex multi-source scanning
**LOC**: ~120
**Estimated tests**: 18-22

```
Tests needed:
- [ ] Reads global .mcp.json
- [ ] Reads project-level .mcp.json
- [ ] Reads plugin-provided MCPs
- [ ] Merges sources correctly (project overrides global)
- [ ] Checks disabled registry
- [ ] Handles missing .mcp.json files
- [ ] Handles malformed JSON
- [ ] Parses MCP server configuration correctly
- [ ] Handles mcpServers vs servers key variations
```

### 6. `src/scanner/plugins.ts`
**Risk**: Plugin management integrity
**LOC**: ~100
**Estimated tests**: 15-18

```
Tests needed:
- [ ] Reads installed_plugins.json
- [ ] Reads settings.json for enabled plugins
- [ ] Correctly identifies enabled vs disabled
- [ ] Handles missing files gracefully
- [ ] Parses plugin metadata (id, name, version, etc.)
- [ ] Handles corrupted JSON
- [ ] Lists plugin-provided skills and MCPs
```

---

## P1: High Priority (Should Have)

### 7. `src/actions/agents.ts`
**LOC**: ~40
**Estimated tests**: 8-10

```
Tests needed:
- [ ] enableAgent() renames .md.disabled to .md
- [ ] disableAgent() renames .md to .md.disabled
- [ ] Handles already-enabled/disabled state
- [ ] Works for both global and project paths
- [ ] Returns updated agent object
```

### 8. `src/actions/commands.ts`
**LOC**: ~40
**Estimated tests**: 8-10

```
Tests needed:
- [ ] enableCommand() renames correctly
- [ ] disableCommand() renames correctly
- [ ] Handles edge cases
```

### 9. `src/actions/skills.ts`
**LOC**: ~45
**Estimated tests**: 10-12

```
Tests needed:
- [ ] enableSkill() renames symlink
- [ ] disableSkill() renames symlink
- [ ] Preserves symlink target
- [ ] Handles broken symlinks
```

### 10. `src/actions/mcps.ts`
**LOC**: ~80
**Estimated tests**: 12-15

```
Tests needed:
- [ ] enableMcp() removes from disabled registry
- [ ] disableMcp() adds to disabled registry
- [ ] Creates registry file if missing
- [ ] Handles concurrent modifications
- [ ] Works across different MCP sources
```

### 11. `src/actions/plugins.ts`
**LOC**: ~60
**Estimated tests**: 10-12

```
Tests needed:
- [ ] enablePlugin() adds to enabledPlugins in settings
- [ ] disablePlugin() removes from enabledPlugins
- [ ] Creates settings.json if missing
- [ ] Preserves other settings
```

### 12. `src/cli/commands/scan.ts`
**LOC**: ~50
**Estimated tests**: 8-10

```
Tests needed:
- [ ] Default output (dashboard format)
- [ ] --json flag outputs valid JSON
- [ ] --table flag outputs table format
- [ ] Handles empty scan results
- [ ] Handles scan errors gracefully
```

### 13. `src/cli/commands/enable.ts`
**LOC**: ~80
**Estimated tests**: 10-12

```
Tests needed:
- [ ] Enables correct component type
- [ ] Error on unknown type
- [ ] Error on unknown component name
- [ ] Success message format
- [ ] --project flag for project-level
```

### 14. `src/cli/commands/disable.ts`
**LOC**: ~80
**Estimated tests**: 10-12

```
Tests needed:
- [ ] Disables correct component type
- [ ] Error handling
- [ ] Success message format
```

---

## P2: Medium Priority (Nice to Have)

### 15. `src/scanner/projects.ts`
**LOC**: ~90
**Estimated tests**: 10-12

```
Tests needed:
- [ ] Discovers projects from sessions
- [ ] Reads project CLAUDE.md presence
- [ ] Counts sessions per project
- [ ] Handles missing session files
```

### 16. `src/scanner/index.ts` (orchestrator)
**LOC**: ~40
**Estimated tests**: 6-8

```
Tests needed:
- [ ] Calls all individual scanners
- [ ] Aggregates results correctly
- [ ] Handles partial scanner failures
```

### 17. `src/utils/editor.ts`
**LOC**: ~60
**Estimated tests**: 8-10

```
Tests needed:
- [ ] Detects editor from $VISUAL
- [ ] Detects editor from $EDITOR
- [ ] Falls back to default
- [ ] Launches GUI vs terminal editors differently
```

### 18. `src/cli/commands/list.ts`
**LOC**: ~60
**Estimated tests**: 8-10

```
Tests needed:
- [ ] Lists components by type
- [ ] Filters by enabled/disabled
- [ ] --json output format
```

### 19. `src/cli/commands/plugins.ts`
**LOC**: ~50
**Estimated tests**: 6-8

```
Tests needed:
- [ ] Lists installed plugins
- [ ] Shows enabled/disabled status
- [ ] Plugin detail view
```

---

## P3: Lower Priority (Can Defer)

### 20. TUI Views (`src/tui/views/*.tsx`)
**Total LOC**: ~800
**Estimated tests**: 30-40 (if pursued)

TUI testing is complex due to React/Ink. Consider:
- Snapshot testing for render output
- Hook testing for state logic
- E2E testing with ink-testing-library

```
Views to test (by complexity):
- [ ] DashboardView - navigation, counts display
- [ ] ListView - sidebar, filtering, search
- [ ] DetailView - component details, actions
- [ ] SettingsView - preference editing
- [ ] TrashView - restore/delete operations
- [ ] ContentView - file content display
```

### 21. TUI Hooks (`src/tui/hooks/*.ts`)
**Total LOC**: ~200
**Estimated tests**: 15-20

```
- [ ] useConfig - state management, refresh logic
- [ ] useSettings - persistence, defaults
```

### 22. TUI Components (`src/tui/components/*.tsx`)
**Total LOC**: ~300
**Estimated tests**: 10-15

```
- [ ] Sidebar - navigation state
- [ ] HelpBar - key bindings display
- [ ] StatusBadge - enabled/disabled rendering
```

---

## Summary Table

| Priority | Files | Est. Tests | Est. LOC |
|----------|-------|------------|----------|
| P0 | 6 | 82-102 | ~485 |
| P1 | 8 | 76-93 | ~535 |
| P2 | 5 | 38-48 | ~300 |
| P3 | 6+ | 55-75 | ~1,300 |
| **Total** | **25+** | **251-318** | **~2,620** |

---

## Recommended Approach

### Phase 1: P0 Coverage (Critical)
Focus on data integrity and destructive operations.

1. **Start with `delete.ts`** - highest risk, permanent file deletion
2. **Scanners next** - foundation for all features
   - `agents.ts`, `commands.ts` (similar structure)
   - `skills.ts` (symlink complexity)
   - `mcps.ts` (multi-source complexity)
   - `plugins.ts` (settings integration)

### Phase 2: P1 Coverage (Core Features)
Cover the enable/disable actions and CLI commands.

1. **Actions** - `agents.ts`, `commands.ts`, `skills.ts`, `mcps.ts`, `plugins.ts`
2. **CLI commands** - `scan.ts`, `enable.ts`, `disable.ts`

### Phase 3: P2 Coverage (Supporting)
Fill in utilities and secondary features.

### Phase 4: P3 Coverage (Optional)
TUI testing if time/resources permit. Consider E2E tests instead.

---

## Test Infrastructure Notes

### Current Setup
- **Framework**: Vitest
- **Location**: `src/__tests__/`
- **Pattern**: `*.test.ts`

### Recommendations
1. **Use temp directories** for file-based tests (scanners, actions)
2. **Mock fs operations** where appropriate
3. **Create test fixtures** for common scenarios
4. **Add integration tests** for delete operations (safety critical)

### Example Test Structure
```typescript
// src/__tests__/scanner/agents.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { scanAgents } from '../../scanner/agents';

describe('scanAgents', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'claude-lens-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true });
  });

  it('finds .md files in agents directory', async () => {
    // Create test files
    // Call scanner
    // Assert results
  });
});
```

---

## Next Steps

1. Review this plan and adjust priorities if needed
2. Create GitHub issues for each priority tier
3. Start with P0 items (delete.ts, scanners)
4. Track progress in issues

---

*This is a living document. Update as tests are added.*
