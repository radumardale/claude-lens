# Future Enhancement: Independent Plugin Skill Toggle

## Summary

Enable users to disable individual skills that come bundled with plugins, without having to disable the entire plugin.

---

## Current Behavior

- Plugin skills are always enabled when their parent plugin is enabled
- The only way to disable a plugin skill is to disable the entire plugin
- This is problematic when a plugin contains multiple skills and the user only wants to disable one

---

## Problem Statement

### User Scenario 1: Skill Conflicts

A plugin provides 5 skills, but one of them conflicts with a user's custom skill or workflow. Currently, the user must choose between:
- Keeping the plugin (and the conflicting skill)
- Disabling the entire plugin (losing all 5 skills)

### User Scenario 2: Reducing Noise

A plugin provides skills the user rarely uses. These skills appear in Claude's available tools, potentially:
- Slowing down response time (more tools to consider)
- Creating confusion (similar-sounding skill names)
- Using up context window space

### User Scenario 3: Testing/Development

A user developing a custom skill wants to temporarily disable a plugin skill with a similar name to ensure Claude uses their version.

---

## Proposed Solution

### Command Syntax

```bash
# Disable a specific plugin skill
claude-lens disable skill <skill-name> --plugin <plugin-name>

# Enable a previously disabled plugin skill
claude-lens enable skill <skill-name> --plugin <plugin-name>

# Examples
claude-lens disable skill "code-connect-components" --plugin figma
claude-lens enable skill "code-connect-components" --plugin figma
```

### Storage

Create a registry file at `~/.claude-lens/disabled-plugin-skills.json`:

```json
{
  "figma:code-connect-components": true,
  "frontend-design:generate-styles": true
}
```

Key format: `<plugin-name>:<skill-name>`

### Integration Points

1. **Scanner Update**: Modify `src/scanner/skills.ts` to:
   - Read the disabled plugin skills registry
   - Mark plugin skills as `enabled: false` when found in registry

2. **Action Module**: Extend `src/actions/skills.ts` to:
   - Accept `--plugin` flag for plugin skills
   - Add/remove entries from the registry file

3. **CLI Update**: Extend enable/disable commands to:
   - Accept `--plugin` flag
   - Route to plugin skill handler when flag is present

---

## UX Considerations

### Discoverability

- When listing skills, show plugin skills with their parent plugin name
- Format: `skill-name (from plugin-name)`

### Error Messages

- If user tries to disable a plugin skill without `--plugin` flag:
  ```
  Skill "generate-styles" is a plugin skill from "frontend-design".
  Use: claude-lens disable skill generate-styles --plugin frontend-design
  ```

### Confirmation

- When disabling the last skill from a plugin, suggest disabling the plugin instead:
  ```
  This is the last enabled skill from plugin "figma".
  Consider disabling the entire plugin instead:
  claude-lens disable plugin figma
  ```

---

## Technical Notes

### Skill Identification

Plugin skills can be uniquely identified by:
- `pluginName` + `skillName` (from scanner data)
- File path pattern: `~/.claude/plugins/cache/*/<plugin>/skills/<skill>/SKILL.md`

### Registry File Location

Use `~/.claude-lens/` directory (same as MCP disable registry) to keep claude-lens data separate from Claude Code's own configuration.

### Backward Compatibility

- No changes to Claude Code's own files
- Registry is purely additive (opt-in disable)
- If registry file doesn't exist, all plugin skills are enabled (current behavior)

---

## Implementation Priority

**Defer to Phase 4+** because:
- Current workaround exists (disable entire plugin)
- Adds complexity to enable/disable logic
- Requires modifying scanner to check registry
- Focus Phase 3 on core enable/disable functionality

---

## Open Questions (for future implementation)

1. Should we allow wildcard disable? (e.g., `--plugin figma --all`)
2. Should disabled plugin skills be visible in scan output with a "disabled" indicator?
3. How should this interact with plugin updates that add new skills?
