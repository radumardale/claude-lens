# claude-lens

A TUI for managing your Claude Code plugins, MCPs, agents, skills, and commands.

**See everything. Control everything. Delete nothing.**

[![npm version](https://img.shields.io/npm/v/claude-lens.svg)](https://www.npmjs.com/package/claude-lens)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

![claude-lens demo](assets/demo.gif)

---

Claude Code's ecosystem grows fast. Plugins, MCP servers, custom agents, skills, commands—you try them, forget about them, and they pile up. Each one quietly consumes context just by existing.

**claude-lens** gives you full visibility into your Claude Code configuration and lets you toggle anything on or off without deleting it. Think of it as `htop` for your Claude Code setup.

## Features

- **Dashboard overview** of everything installed across global and project scopes
- **Interactive TUI** with vim-style keyboard navigation
- **Non-destructive disable/enable** for all component types
- **Project-level awareness** to manage per-project configurations
- **JSON output** for scripting and automation
- **External editor integration** to view and edit configurations

## Quick Start

Requires Node.js 18+.

```bash
npm install -g claude-lens
claude-lens
```

That's it. You'll see an interactive dashboard of your entire Claude Code configuration.

## Usage

### Interactive Mode (default)

```bash
claude-lens              # Launch TUI dashboard
```

### Text Summary

```bash
claude-lens scan         # Text summary of everything
claude-lens scan --json  # Machine-readable JSON output
```

### List specific component types

```bash
claude-lens plugins      # Installed plugins
claude-lens mcps         # MCP server connections
claude-lens agents       # Custom agents
claude-lens skills       # Skills (linked + plugin-embedded)
claude-lens commands     # Custom commands
claude-lens projects     # Projects with Claude configuration
```

All commands support `--json` for scripting:

```bash
claude-lens mcps --json | jq '.[] | select(.enabled == false)'
```

### Toggle components on/off

```bash
# Plugins
claude-lens disable plugin frontend-design
claude-lens enable plugin frontend-design

# Agents
claude-lens disable agent rails-expert
claude-lens enable agent rails-expert

# MCP servers
claude-lens disable mcp rollbar
claude-lens enable mcp rollbar

# Commands and skills work the same way
claude-lens disable command my-command
claude-lens disable skill technical-docs
```

### Project-scoped components

Use `--project` for components in a specific project:

```bash
claude-lens disable mcp sentry --project ~/projects/my-app
claude-lens disable agent custom-helper --project ~/projects/my-app
```

## Interactive Mode

Launch with `claude-lens` for the full TUI experience (this is the default).

### Keyboard Shortcuts

**Navigation (all views)**
| Key | Action |
|-----|--------|
| `j` / `k` | Navigate down / up |
| `h` / `l` | Move left / right |
| `Enter` | Select / drill down |
| `Esc` | Go back |
| `?` | Show all shortcuts |
| `q` | Quit |

**List view**
| Key | Action |
|-----|--------|
| `Space` | Toggle enable/disable |
| `/` | Search |
| `e` / `d` / `a` | Filter: enabled / disabled / all |
| `u` | Undo last toggle |

**Detail view** (agents, commands)
| Key | Action |
|-----|--------|
| `v` | View full content |
| `e` | Open in external editor |
| `Space` | Toggle enable/disable |

## What claude-lens Manages

| Component | What it is | Where it lives |
|-----------|-----------|----------------|
| **Plugins** | Marketplace extensions (e.g., Figma, frontend-design) | `~/.claude/plugins/` |
| **MCPs** | Model Context Protocol servers—connections to external tools | `.mcp.json` files |
| **Agents** | Custom AI personas with specific behaviors | `~/.claude/agents/` or `.claude/agents/` |
| **Skills** | Reusable capabilities, often linked to MCP tools | `~/.claude/skills/` or `.claude/skills/` |
| **Commands** | Prompt templates you can invoke with `/command-name` | `~/.claude/commands/` or `.claude/commands/` |

## How Disable Works

Everything is **non-destructive**. Nothing gets deleted.

| Component | Disable Mechanism |
|-----------|-------------------|
| Plugins | Toggles `enabledPlugins` in `~/.claude/settings.json` |
| Agents | Renames file: `my-agent.md` → `my-agent.md.disabled` |
| Commands | Renames file with `.disabled` suffix |
| Skills | Renames symlink with `.disabled` suffix |
| MCPs | Tracked in `~/.claude-lens/disabled-mcps.json` |

Re-enabling reverses the process. Your configurations stay intact.

## Configuration

### Editor

claude-lens uses your system editor for viewing/editing files:

```bash
export VISUAL=code   # or vim, nano, etc.
export EDITOR=vim    # fallback if VISUAL not set
```

### Data Location

claude-lens stores its own data in `~/.claude-lens/`:

```
~/.claude-lens/
└── disabled-mcps.json   # Registry of disabled MCP servers
```

## Development

```bash
git clone https://github.com/radumardale/claude-lens.git
cd claude-lens
npm install
npm run dev           # Run in development mode
npm run build         # Compile TypeScript
npm run typecheck     # Type checking only
```

## Contributing

Contributions are welcome! Feel free to:

- Open an issue to report bugs or suggest features
- Submit a pull request with improvements

I'm the primary maintainer and review all contributions. Happy to discuss ideas in issues first.

## License

[MIT](LICENSE)

## Author

[@radumardale](https://github.com/radumardale)
