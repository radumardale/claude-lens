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

All commands support `--json` for JSON output:

```bash
npx tsx bin/claude-lens.ts agents --json
npx tsx bin/claude-lens.ts projects --json
```

## Type Checking

```bash
npm run typecheck
```
