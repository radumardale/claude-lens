# Claude Lens UI Navigation

## Screen Names Reference

| Internal Name | Display Name | Description |
|---------------|--------------|-------------|
| `dashboard` | **Dashboard** | Main entry point, shows all categories with counts |
| `list` | **List View** | Shows items in a category with sidebar navigation |
| `detail` | **Detail View** | Shows details of a specific component |
| `project-dashboard` | **Project View** | Project-specific components + system components |

---

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌──────────────┐                                                          │
│   │  DASHBOARD   │  Main entry point                                        │
│   │──────────────│                                                          │
│   │ MCP Servers  │◄────────────────────────────────────────┐                │
│   │ Agents       │                                         │                │
│   │ Skills       │                                         │                │
│   │ Commands     │                                     [Esc]                │
│   │ Plugins      │                                         │                │
│   │ ──────────── │                                         │                │
│   │ Projects     │                                         │                │
│   └──────┬───────┘                                         │                │
│          │                                                 │                │
│      [Enter]                                               │                │
│          │                                                 │                │
│          ▼                                                 │                │
│   ┌──────────────────────────────────────┐                 │                │
│   │           LIST VIEW                  │                 │                │
│   │──────────────────────────────────────│                 │                │
│   │ ┌──────────┐  ┌────────────────────┐ │                 │                │
│   │ │ Sidebar  │  │   Component List   │ │─────────────────┘                │
│   │ │          │  │                    │ │                                  │
│   │ │ ▶ MCPs   │  │  ▶ item-1    ✓     │ │                                  │
│   │ │   Agents │  │    item-2    ✗     │ │                                  │
│   │ │   Skills │  │    item-3    ✓     │ │                                  │
│   │ │   ...    │  │                    │ │                                  │
│   │ └──────────┘  └─────────┬──────────┘ │                                  │
│   └─────────────────────────┼────────────┘                                  │
│                             │                                               │
│            ┌────────────────┴────────────────┐                              │
│            │                                 │                              │
│        [Enter]                           [Enter]                            │
│      (non-project)                      (project)                           │
│            │                                 │                              │
│            ▼                                 ▼                              │
│   ┌─────────────────┐             ┌─────────────────────────────┐           │
│   │   DETAIL VIEW   │             │       PROJECT VIEW          │           │
│   │─────────────────│             │─────────────────────────────│           │
│   │ Plugin: eslint  │             │ Project: my-app             │           │
│   │                 │             │ /path/to/my-app             │           │
│   │ Status: Enabled │             │ ─────────────────────────── │           │
│   │ ┌─────────────┐ │             │ CLAUDE.md: Yes  Sessions: 5 │           │
│   │ │ ID: ...     │ │             │ ─────────────────────────── │           │
│   │ │ Version: ...│ │             │ ┌────────┐ ┌──────────────┐ │           │
│   │ │ Path: ...   │ │             │ │Sidebar │ │  Items List  │ │           │
│   │ └─────────────┘ │             │ │        │ │              │ │           │
│   │                 │             │ │▶ MCPs  │ │ project-mcp  │ │           │
│   │ [Space] Toggle  │             │ │ Agents │ │ ──────────── │ │           │
│   │ [Esc] Back      │             │ │ Skills │ │ global-mcp   │ │           │
│   └────────┬────────┘             │ │ ...    │ │ (system)     │ │           │
│            │                      │ └────────┘ └──────────────┘ │           │
│         [Esc]                     └──────────────┬──────────────┘           │
│            │                                     │                          │
│            │                                  [Esc]                         │
│            │                                     │                          │
│            ▼                                     ▼                          │
│   ┌──────────────────────────────────────────────────────────┐              │
│   │                      LIST VIEW                           │              │
│   │              (returns to same category)                  │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen Details

### 1. Dashboard

The main entry screen showing all component categories with their counts.

```
╔═══════════════════════════════════════╗
║    Claude Lens - System Configuration ║
╚═══════════════════════════════════════╝

▶ MCP Servers    3 enabled, 1 disabled
  Agents         2 enabled, 0 disabled
  Skills         5 enabled, 2 disabled
  Commands       4 enabled, 1 disabled
  Plugins        2 enabled, 0 disabled
  ─────────────────────────────────
  Projects       6 configured

↑/↓ Navigate   Enter Select   q Quit
```

**Actions:**
- `↑/↓` - Navigate between categories
- `Enter` - Open List View for selected category
- `q` - Quit application

---

### 2. List View

Shows all items in a category with a sidebar for switching categories.

```
Claude Lens - MCP Servers

/ Search...

┌──────────────┐ ┌────────────────────────────────────┐
│ ▶ MCP Servers│ │ ▶ rollbar              ✓ enabled   │
│   Agents     │ │   github               ✓ enabled   │
│   Skills     │ │   slack                ✗ disabled  │
│   Commands   │ │                                    │
│   Plugins    │ │                                    │
│   ─────────  │ │                                    │
│   Projects   │ │                                    │
└──────────────┘ └────────────────────────────────────┘

←/→ Focus   ↑/↓ Navigate   Space Toggle   / Search   Esc Back   q Quit
```

**Actions:**
- `←/→` - Switch focus between sidebar and list
- `↑/↓` - Navigate items
- `Enter` - Open Detail View (or Project View for projects)
- `Space` - Toggle enable/disable
- `/` - Enter search mode
- `Esc` - Back to Dashboard
- `q` - Quit

---

### 3. Detail View

Shows detailed information about a specific component.

```
Plugin: eslint

Status: Enabled

┌────────────────────────────────────────┐
│ ID            eslint-plugin            │
│ Version       1.2.3                    │
│ Marketplace   anthropic                │
│ Install Path  ~/.claude/plugins/...    │
│ Installed At  2024-01-15               │
│ Last Updated  2024-01-20               │
└────────────────────────────────────────┘

Space Toggle   Esc Back   q Quit
```

**Actions:**
- `Space` - Toggle enable/disable
- `Esc` - Back to List View
- `q` - Quit

---

### 4. Project View

Shows project-specific configuration plus system-wide components (read-only).

```
Project: my-app
/Users/me/projects/my-app
─────────────────────────────────────────────────────────
CLAUDE.md: Yes   Settings: Yes   Sessions: 12
─────────────────────────────────────────────────────────

┌────────────────────────┐ ┌──────────────────────────────────┐
│ ▶ MCP Servers (1+2 sys)│ │ ▶ project-mcp        ✓ enabled   │
│   Agents      (0+1 sys)│ │   ────────────────────────────── │
│   Skills      (2+3 sys)│ │   global-mcp-1       ✓ system    │
│   Commands    (1+2 sys)│ │   global-mcp-2       ✓ system    │
│   Plugins     (3 sys)  │ │                                  │
└────────────────────────┘ └──────────────────────────────────┘

←/→ Focus   ↑/↓ Navigate   Space Toggle   Esc Back   q Quit
```

**Key Concept:**
- **Project items** (top section) - Can be toggled
- **System items** (below separator, dimmed) - Read-only, shows what's available globally

**Actions:**
- `←/→` - Switch focus between sidebar and list
- `↑/↓` - Navigate items/categories
- `Space` - Toggle (project items only; system items show "change from main menu" message)
- `Esc` - Back to List View (Projects category)
- `q` - Quit

---

## Categories

| Category | Scope | Notes |
|----------|-------|-------|
| MCP Servers | Global + Project | Model Context Protocol servers |
| Agents | Global + Project | Custom agent definitions |
| Skills | Global + Project | Slash command skills |
| Commands | Global + Project | Custom slash commands |
| Plugins | Global only | Installed plugins |
| Projects | N/A | Discovered Claude Code projects |

---

## Keyboard Shortcuts (Global)

| Key | Action |
|-----|--------|
| `q` | Quit application (from any screen) |
| `Esc` | Go back to previous screen |
| `↑/↓` | Navigate up/down |
| `Enter` | Select/open item |
| `Space` | Toggle enable/disable |
| `/` | Search (in List View) |
| `←/→` | Switch panel focus (in views with sidebar) |
