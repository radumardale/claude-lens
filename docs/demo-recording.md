# Demo Recording Notes

## Tool: VHS by Charm

We use [VHS](https://github.com/charmbracelet/vhs) to create terminal GIFs for the README.

### Recording

```bash
vhs assets/demo.tape
```

### Tape file location

`assets/demo.tape`

---

## Hiding Sensitive Information

VHS doesn't have built-in redaction, but here are approaches for hiding project names, paths, or other sensitive data:

### Option 1: Demo Environment (Cleanest)

Create a fake `~/.claude/` directory with sanitized project names and agents, then record from there:

```bash
# Create demo home
mkdir -p /tmp/demo-home/.claude/agents
echo "---\nname: example-agent\n---\n# Example" > /tmp/demo-home/.claude/agents/example.md

# Record with fake home
HOME=/tmp/demo-home vhs assets/demo.tape
```

### Option 2: VHS Hide Command

Temporarily hide terminal output during sensitive operations:

```tape
Hide
Type "sensitive-command"
Enter
Sleep 1s
Show
```

Note: This hides everything, not selective redaction.

### Option 3: Post-Process with ffmpeg

Blur a specific rectangular region of the GIF:

```bash
# Blur region at x=0, y=0, width=200, height=50
ffmpeg -i demo.gif -vf "boxblur=10:1:cr=0:0:200:50" output.gif
```

### Option 4: Temporary Renames

Before recording:
1. Rename agents/projects to generic names
2. Record the demo
3. Rename back to original names

### Option 5: Add --demo Flag (Future)

Could add a `--demo` mode to claude-lens that uses mock/sample data instead of real configuration. This would require code changes.

---

## Current Demo Shows

- Launching TUI with `npx tsx bin/claude-lens.ts` (TUI is now the default)
- Navigating dashboard with vim keys (j/k)
- Browsing Agents list
- Viewing detail view
- Navigating to MCPs
- Quitting with `q`
