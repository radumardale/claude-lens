# Claude-Lens

A CLI tool to scan, report, and manage Claude Code configuration.

## Development Setup

```bash
# Install dependencies
npm install

# Run the CLI (development mode)
npx tsx bin/claude-lens.ts
```

## Available Commands

```bash
# Dashboard summary (default command)
npx tsx bin/claude-lens.ts

# Full scan with JSON output
npx tsx bin/claude-lens.ts scan --json

# List installed plugins
npx tsx bin/claude-lens.ts plugins

# List plugin marketplaces
npx tsx bin/claude-lens.ts plugins --marketplaces

# List custom agents
npx tsx bin/claude-lens.ts agents

# List skills (linked + plugin-embedded)
npx tsx bin/claude-lens.ts skills

# List custom commands
npx tsx bin/claude-lens.ts commands

# List MCP servers
npx tsx bin/claude-lens.ts mcps

# List known projects
npx tsx bin/claude-lens.ts projects
```

## Enable/Disable Components

Toggle components on/off without deleting them:

```bash
# Disable a plugin
npx tsx bin/claude-lens.ts disable plugin frontend-design

# Enable a plugin
npx tsx bin/claude-lens.ts enable plugin frontend-design

# Disable/enable an agent
npx tsx bin/claude-lens.ts disable agent rails-expert
npx tsx bin/claude-lens.ts enable agent rails-expert

# Disable/enable a command
npx tsx bin/claude-lens.ts disable command my-command
npx tsx bin/claude-lens.ts enable command my-command

# Disable/enable a linked skill
npx tsx bin/claude-lens.ts disable skill technical-docs
npx tsx bin/claude-lens.ts enable skill technical-docs

# Disable/enable an MCP server (use --project for project-scoped MCPs)
npx tsx bin/claude-lens.ts disable mcp rollbar --project ~/path/to/project
npx tsx bin/claude-lens.ts enable mcp rollbar --project ~/path/to/project
```

**How it works:**
- **Plugins**: Toggles `enabledPlugins` in `~/.claude/settings.json`
- **Agents/Commands**: Renames files with `.disabled` suffix
- **Skills**: Renames symlinks with `.disabled` suffix
- **MCPs**: Uses a registry at `~/.claude-lens/disabled-mcps.json`

All commands support `--json` for JSON output:

```bash
npx tsx bin/claude-lens.ts agents --json
npx tsx bin/claude-lens.ts projects --json
```

## Type Checking

```bash
npm run typecheck
```
