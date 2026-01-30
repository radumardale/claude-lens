# Claude Lens UI Navigation

## Screen Names Reference

| Internal Name | Display Name | Description |
|---------------|--------------|-------------|
| `dashboard` | **Dashboard** | Main entry point, shows all categories with counts |
| `list` | **List View** | Shows items in a category with sidebar navigation |
| `detail` | **Detail View** | Shows details of a specific component |
| `project-dashboard` | **Project View** | Project-specific components + system components |
| `settings` | **Settings** | App preferences, editor configuration |
| `trash` | **Disabled Items** | Restore or permanently delete disabled components |
| `content` | **Content View** | View file contents (agents/commands) |

---

## Navigation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│   ┌──────────────┐                                                              │
│   │  DASHBOARD   │  Main entry point                                            │
│   │──────────────│                                                              │
│   │ MCP Servers  │◄──────────────────────────────────────┐                      │
│   │ Agents       │                                       │                      │
│   │ Skills       │                                   [Esc/h]                    │
│   │ Commands     │                                       │                      │
│   │ Plugins      │                                       │                      │
│   │ ──────────── │                                       │                      │
│   │ Projects     │                                       │                      │
│   │ ──────────── │                                       │                      │
│   │ Settings ────┼───────────────────────────────────────┼──────────┐           │
│   └──────┬───────┘                                       │          │           │
│          │                                               │          │           │
│      [Enter/l]                                           │      [Enter/l]       │
│          │                                               │          │           │
│          ▼                                               │          ▼           │
│   ┌──────────────────────────────────────┐               │   ┌─────────────┐    │
│   │           LIST VIEW                  │               │   │  SETTINGS   │    │
│   │──────────────────────────────────────│               │   │─────────────│    │
│   │ ┌──────────┐  ┌────────────────────┐ │               │   │ Editor      │    │
│   │ │ Sidebar  │  │   Component List   │ │───────────────┘   │ Display     │    │
│   │ │          │  │                    │ │                   │ ─────────── │    │
│   │ │ ▶ MCPs   │  │  ▶ item-1    ✓     │ │                   │ Disabled ───┼────┼──┐
│   │ │   Agents │  │    item-2    ✗     │ │                   │ Items       │    │  │
│   │ │   Skills │  │    item-3    ✓     │ │                   └──────┬──────┘    │  │
│   │ │   ...    │  │                    │ │                          │           │  │
│   │ └──────────┘  └─────────┬──────────┘ │                      [Esc/h]        │  │
│   └─────────────────────────┼────────────┘                          │           │  │
│                             │                                       ▼           │  │
│            ┌────────────────┴────────────────┐                 DASHBOARD        │  │
│            │                                 │                                   │  │
│        [Enter/l]                         [Enter/l]                              │  │
│      (non-project)                       (project)                              │  │
│            │                                 │                                   │  │
│            ▼                                 ▼                                   │  │
│   ┌─────────────────┐             ┌─────────────────────────────┐               │  │
│   │   DETAIL VIEW   │             │       PROJECT VIEW          │               │  │
│   │─────────────────│             │─────────────────────────────│               │  │
│   │ Plugin: eslint  │             │ Project: my-app             │               │  │
│   │                 │             │ /path/to/my-app             │               │  │
│   │ Status: Enabled │             │ ─────────────────────────── │               │  │
│   │ ┌─────────────┐ │             │ CLAUDE.md: Yes  Sessions: 5 │               │  │
│   │ │ ID: ...     │ │             │ ─────────────────────────── │               │  │
│   │ │ Version: ...│ │             │ ┌────────┐ ┌──────────────┐ │               │  │
│   │ │ Path: ...   │ │             │ │Sidebar │ │  Items List  │ │               │  │
│   │ └─────────────┘ │             │ │        │ │              │ │               │  │
│   │                 │             │ │▶ MCPs  │ │ project-mcp  │ │               │  │
│   │ [v] View ───────┼──┐          │ │ Agents │ │ ──────────── │ │               │  │
│   │ [e] Edit        │  │          │ │ Skills │ │ global-mcp   │ │               │  │
│   │ [Space] Toggle  │  │          │ │ ...    │ │ (system)     │ │               │  │
│   │ [Esc/h] Back    │  │          │ └────────┘ └──────────────┘ │               │  │
│   └────────┬────────┘  │          └──────────────┬──────────────┘               │  │
│            │           │                         │                              │  │
│         [Esc/h]        │                     [Esc/h]                            │  │
│            │           │                         │                              │  │
│            ▼           │                         ▼                              │  │
│       LIST VIEW        │                    LIST VIEW                           │  │
│                        │                                                        │  │
│                        ▼                                                        │  │
│              ┌─────────────────┐                                                │  │
│              │  CONTENT VIEW   │                                                │  │
│              │─────────────────│                                                │  │
│              │ File: agent.md  │                                                │  │
│              │ ─────────────── │                                                │  │
│              │ # My Agent      │                                                │  │
│              │ Description...  │                                                │  │
│              │                 │                                                │  │
│              │ [j/k] Scroll    │                                                │  │
│              │ [e] Edit        │                                                │  │
│              │ [Esc/h] Back    │                                                │  │
│              └────────┬────────┘                                                │  │
│                       │                                                         │  │
│                   [Esc/h]                                                       │  │
│                       │                                                         │  │
│                       ▼                                                         │  │
│                  DETAIL VIEW                                                    │  │
│                                                                                 │  │
│                                                                                 │  │
│              ┌──────────────────┐◄──────────────────────────────────────────────┘  │
│              │  DISABLED ITEMS  │                                                  │
│              │──────────────────│                                                  │
│              │ ▶ agent-1   Agent│                                                  │
│              │   mcp-2     MCP  │                                                  │
│              │   skill-3  Skill │                                                  │
│              │                  │                                                  │
│              │ [r] Restore      │                                                  │
│              │ [d] Delete       │                                                  │
│              │ [e] Empty all    │                                                  │
│              │ [Esc/h] Back     │                                                  │
│              └────────┬─────────┘                                                  │
│                       │                                                            │
│                   [Esc/h]                                                          │
│                       │                                                            │
│                       ▼                                                            │
│                   SETTINGS                                                         │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen Details

### 1. Dashboard

The main entry screen showing all component categories with their counts.

```
claude-lens v0.2.0 › Dashboard

▶ MCP Servers    3 enabled, 1 disabled
  Agents         2 enabled, 0 disabled
  Skills         5 enabled, 2 disabled
  Commands       4 enabled, 1 disabled
  Plugins        2 enabled, 0 disabled
  ─────────────────────────────────
  Projects       6 configured
  ─────────────────────────────────
  Settings

j/k Navigate   Enter Select   s Settings   q Quit
```

**Actions:**
| Key | Action |
|-----|--------|
| `j` / `↓` | Navigate down |
| `k` / `↑` | Navigate up |
| `Enter` / `l` / `→` | Select category |
| `s` | Open Settings |
| `q` | Quit |

---

### 2. List View

Shows all items in a category with a sidebar for switching categories.

```
claude-lens v0.2.0 › MCP Servers

┌──────────────┐ ┌────────────────────────────────────┐
│ ▶ MCP Servers│ │ ▶ rollbar              ☑ enabled   │
│   Agents     │ │   github               ☑ enabled   │
│   Skills     │ │   slack                ☐ disabled  │
│   Commands   │ │                                    │
│   Plugins    │ │                                    │
│   ─────────  │ │                                    │
│   Projects   │ │                                    │
└──────────────┘ └────────────────────────────────────┘

h/l Focus   j/k Nav   Space Toggle   / Search   ? Help   Esc Back
```

**Actions:**
| Key | Action |
|-----|--------|
| `h` / `←` | Focus sidebar |
| `l` / `→` | Focus list |
| `j` / `↓` | Navigate down |
| `k` / `↑` | Navigate up |
| `Enter` | Open Detail/Project View |
| `Space` | Toggle enable/disable |
| `/` | Search |
| `e` | Filter: enabled only |
| `d` | Filter: disabled only |
| `a` | Filter: all (clear filter) |
| `u` | Undo last toggle |
| `?` | Show help |
| `Esc` / `h` (from list) | Back to Dashboard |
| `q` | Quit |

---

### 3. Detail View

Shows detailed information about a specific component.

```
claude-lens v0.2.0 › Plugins › eslint

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

Space Toggle   v View   e Edit   ? Help   Esc Back
```

**Actions:**
| Key | Action |
|-----|--------|
| `Space` | Toggle enable/disable |
| `v` | View full content (agents/commands) |
| `e` | Open in external editor |
| `p` | Go to parent plugin (if from plugin) |
| `?` | Show help |
| `Esc` / `h` / `←` | Back to List View |
| `q` | Quit |

---

### 4. Project View

Shows project-specific configuration plus system-wide components (read-only).

```
claude-lens v0.2.0 › Projects › my-app

Project: my-app
/Users/me/projects/my-app
─────────────────────────────────────────────────────────
CLAUDE.md: Yes   Settings: Yes   Sessions: 12
─────────────────────────────────────────────────────────

┌────────────────────────┐ ┌──────────────────────────────────┐
│ ▶ MCP Servers (1+2 sys)│ │ ▶ project-mcp        ☑ enabled   │
│   Agents      (0+1 sys)│ │   ────────────────────────────── │
│   Skills      (2+3 sys)│ │   global-mcp-1       ☑ system    │
│   Commands    (1+2 sys)│ │   global-mcp-2       ☑ system    │
│   Plugins     (3 sys)  │ │                                  │
└────────────────────────┘ └──────────────────────────────────┘

h/l Focus   j/k Nav   Space Toggle   Esc Back   q Quit
```

**Key Concept:**
- **Project items** (top section) — Can be toggled
- **System items** (below separator, dimmed) — Read-only, shows globally available

**Actions:**
| Key | Action |
|-----|--------|
| `h` / `←` | Focus sidebar |
| `l` / `→` | Focus list |
| `j` / `↓` | Navigate down |
| `k` / `↑` | Navigate up |
| `Enter` | Open Detail View |
| `Space` | Toggle (project items only) |
| `Esc` / `h` | Back to List View |
| `q` | Quit |

---

### 5. Settings View

Configure app preferences.

```
claude-lens v0.2.0 › Settings

Settings

┌────────────────────────────────────────┐
│ EDITOR                                 │
│   Current Editor    code (from $VISUAL)│
│ ▶ Custom Command    (not set)          │
│   Editor Type       ● terminal ○ gui   │
│                                        │
│ DISPLAY                                │
│   Line Numbers      ● On               │
│   Word Wrap         ● On               │
│                                        │
│ DATA                                   │
│   Disabled Items    View →             │
└────────────────────────────────────────┘

j/k Nav   Enter Edit   Space Toggle   r Reset   ? Help   Esc Back
```

**Actions:**
| Key | Action |
|-----|--------|
| `j` / `↓` | Navigate down |
| `k` / `↑` | Navigate up |
| `Enter` / `→` | Edit field / Open Disabled Items |
| `Space` | Toggle setting |
| `r` | Reset to defaults |
| `?` | Show help |
| `Esc` / `h` / `←` | Back to Dashboard |
| `q` | Quit |

---

### 6. Disabled Items View

Manage disabled components — restore or permanently delete.

```
claude-lens v0.2.0 › Settings › Disabled Items

Disabled Items (3 items)

┌────────────────────────────────────────┐
│   Type      Name                 Scope │
│ ▶ Agent     rails-expert        Global │
│   MCP       old-server          Project│
│   Skill     unused-skill        Global │
└────────────────────────────────────────┘

File path:
~/.claude/agents/rails-expert.md.disabled

j/k Nav   r Restore   d Delete   e Empty All   Esc Back
```

**Actions:**
| Key | Action |
|-----|--------|
| `j` / `↓` | Navigate down |
| `k` / `↑` | Navigate up |
| `r` | Restore (re-enable) selected item |
| `d` | Delete forever (with confirmation) |
| `e` | Empty all (delete all, with confirmation) |
| `Esc` / `h` / `←` | Back to Settings |
| `q` | Quit |

---

### 7. Content View

View file contents with scrolling.

```
claude-lens v0.2.0 › Agents › rails-expert › Content

rails-expert.md                              Lines 1-45 of 120

  1 │ # Rails Expert Agent
  2 │
  3 │ You are an expert Ruby on Rails developer...
  4 │
  5 │ ## Capabilities
  6 │ - Building web applications
  7 │ - Implementing Hotwire/Turbo
 ...

j/k Scroll   d/u Page   g/G Top/Bottom   e Edit   ? Help   Esc Back
```

**Actions:**
| Key | Action |
|-----|--------|
| `j` / `↓` | Scroll down one line |
| `k` / `↑` | Scroll up one line |
| `d` | Scroll down half page |
| `u` | Scroll up half page |
| `g` | Go to top |
| `G` | Go to bottom |
| `e` | Open in external editor |
| `?` | Show help |
| `Esc` / `h` | Back to Detail View |
| `q` | Quit |

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
| `Esc` / `h` | Go back to previous screen |
| `j` / `↓` | Navigate/scroll down |
| `k` / `↑` | Navigate/scroll up |
| `l` / `→` | Move right / Select |
| `Enter` | Select / Confirm |
| `Space` | Toggle enable/disable |
| `?` | Show help modal |
