import { describe, it, expect } from 'vitest';
import { parseYamlFrontmatter } from '../utils/yaml.js';

describe('parseYamlFrontmatter', () => {
  it('parses valid YAML with all fields', () => {
    const content = `---
name: Test Agent
description: A test agent for testing
model: claude-3-opus
color: blue
---
# Agent Content

This is the agent body.`;

    const result = parseYamlFrontmatter<{
      name: string;
      description: string;
      model: string;
      color: string;
    }>(content);

    expect(result.frontmatter).toEqual({
      name: 'Test Agent',
      description: 'A test agent for testing',
      model: 'claude-3-opus',
      color: 'blue',
    });
    expect(result.content).toBe('# Agent Content\n\nThis is the agent body.');
  });

  it('returns null frontmatter when no YAML block exists', () => {
    const content = `# Just Markdown

No frontmatter here.`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter).toBeNull();
    expect(result.content).toBe(content);
  });

  it('returns null frontmatter when opening delimiter is missing', () => {
    const content = `name: Test
---
# Content`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter).toBeNull();
    expect(result.content).toBe(content);
  });

  it('returns null frontmatter when closing delimiter is missing', () => {
    const content = `---
name: Test
# No closing delimiter`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter).toBeNull();
    expect(result.content).toBe(content);
  });

  it('handles empty frontmatter block', () => {
    const content = `---
---
# Content after empty frontmatter`;

    const result = parseYamlFrontmatter(content);

    expect(result.frontmatter).toBeNull();
    expect(result.content).toBe('# Content after empty frontmatter');
  });

  it('preserves content after frontmatter', () => {
    const content = `---
name: Agent
---
Line 1
Line 2
Line 3`;

    const result = parseYamlFrontmatter<{ name: string }>(content);

    expect(result.frontmatter?.name).toBe('Agent');
    expect(result.content).toBe('Line 1\nLine 2\nLine 3');
  });

  it('handles quoted values with special characters', () => {
    const content = `---
name: "Agent: The Special One"
description: 'Contains colons: here'
---
Content`;

    const result = parseYamlFrontmatter<{
      name: string;
      description: string;
    }>(content);

    expect(result.frontmatter?.name).toBe('Agent: The Special One');
    expect(result.frontmatter?.description).toBe('Contains colons: here');
  });

  it('handles multiline YAML values', () => {
    const content = `---
name: Test
description: |
  This is a
  multiline description
---
Body`;

    const result = parseYamlFrontmatter<{
      name: string;
      description: string;
    }>(content);

    expect(result.frontmatter?.name).toBe('Test');
    expect(result.frontmatter?.description).toBe('This is a\nmultiline description\n');
  });

  it('falls back to simple parser on invalid YAML', () => {
    const content = `---
name: Valid
invalid yaml: [unclosed bracket
description: Also Valid
---
Content`;

    const result = parseYamlFrontmatter<{
      name: string;
      description: string;
    }>(content);

    expect(result.frontmatter?.name).toBe('Valid');
    expect(result.frontmatter?.description).toBe('Also Valid');
    expect(result.content).toBe('Content');
  });

  it('simple parser handles basic key: value format', () => {
    const content = `---
name: Simple Agent
description: A simple description
---
Body content`;

    const result = parseYamlFrontmatter<{
      name: string;
      description: string;
    }>(content);

    expect(result.frontmatter?.name).toBe('Simple Agent');
    expect(result.frontmatter?.description).toBe('A simple description');
  });

  it('handles whitespace around content', () => {
    const content = `

---
name: Test
---

Content with surrounding whitespace

`;

    const result = parseYamlFrontmatter<{ name: string }>(content);

    expect(result.frontmatter?.name).toBe('Test');
    expect(result.content).toBe('Content with surrounding whitespace');
  });

  it('handles content with multiple --- separators', () => {
    const content = `---
name: Test
---
Content with --- in the middle
---
More content`;

    const result = parseYamlFrontmatter<{ name: string }>(content);

    expect(result.frontmatter?.name).toBe('Test');
    expect(result.content).toBe('Content with --- in the middle\n---\nMore content');
  });
});
