import { describe, it, expect } from 'vitest';
import { formatDashboard } from '../formatters/dashboard.js';
import type { ScanResult, Plugin, Agent, Command, Skill, McpServer, Project } from '../types/index.js';

function createMockScanResult(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    settings: {},
    plugins: [],
    marketplaces: [],
    agents: [],
    commands: [],
    skills: [],
    mcpServers: [],
    projects: [],
    ...overrides,
  };
}

function createPlugin(overrides: Partial<Plugin> = {}): Plugin {
  return {
    id: 'test-plugin@marketplace',
    name: 'test-plugin',
    version: '1.0.0',
    marketplace: 'marketplace',
    installPath: '/path/to/plugin',
    installedAt: '2024-01-01T00:00:00Z',
    lastUpdated: '2024-01-01T00:00:00Z',
    enabled: true,
    ...overrides,
  };
}

function createAgent(overrides: Partial<Agent> = {}): Agent {
  return {
    name: 'test-agent',
    filePath: '/path/to/agent.md',
    enabled: true,
    scope: 'global',
    ...overrides,
  };
}

function createCommand(overrides: Partial<Command> = {}): Command {
  return {
    name: 'test-command',
    content: 'command content',
    filePath: '/path/to/command.md',
    enabled: true,
    scope: 'global',
    ...overrides,
  };
}

function createSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    name: 'test-skill',
    source: 'symlink',
    filePath: '/path/to/skill',
    enabled: true,
    scope: 'global',
    ...overrides,
  };
}

function createMcpServer(overrides: Partial<McpServer> = {}): McpServer {
  return {
    name: 'test-mcp',
    command: 'node',
    scope: 'global',
    configPath: '/path/to/config.json',
    enabled: true,
    ...overrides,
  };
}

function createProject(overrides: Partial<Project> = {}): Project {
  return {
    path: '/path/to/project',
    hasMcp: false,
    hasSettings: false,
    hasClaudeMd: false,
    hasAgents: false,
    hasCommands: false,
    hasSkills: false,
    sessionCount: 0,
    ...overrides,
  };
}

describe('formatDashboard', () => {
  it('handles empty scan result', () => {
    const result = createMockScanResult();
    const output = formatDashboard(result);

    expect(output).toContain('Plugins:');
    expect(output).toContain('0 enabled');
    expect(output).toContain('Agents:');
    expect(output).toContain('Commands:');
    expect(output).toContain('Skills:');
    expect(output).toContain('MCP Servers:');
    expect(output).toContain('Projects:');
  });

  it('counts enabled and disabled plugins correctly', () => {
    const result = createMockScanResult({
      plugins: [
        createPlugin({ enabled: true }),
        createPlugin({ enabled: true }),
        createPlugin({ enabled: false }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('2 enabled');
    expect(output).toContain('1 disabled');
  });

  it('counts enabled and disabled agents correctly', () => {
    const result = createMockScanResult({
      agents: [
        createAgent({ enabled: true }),
        createAgent({ enabled: false }),
        createAgent({ enabled: false }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('Agents:');
    expect(output).toMatch(/Agents:.*1 enabled.*2 disabled/);
  });

  it('counts enabled and disabled commands correctly', () => {
    const result = createMockScanResult({
      commands: [
        createCommand({ enabled: true }),
        createCommand({ enabled: true }),
        createCommand({ enabled: true }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('Commands:');
    expect(output).toMatch(/Commands:.*3 enabled/);
    expect(output).not.toMatch(/Commands:.*disabled/);
  });

  it('counts skills by source type', () => {
    const result = createMockScanResult({
      skills: [
        createSkill({ source: 'symlink' }),
        createSkill({ source: 'symlink' }),
        createSkill({ source: 'plugin' }),
        createSkill({ source: 'plugin' }),
        createSkill({ source: 'plugin' }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('Skills:');
    expect(output).toContain('2 linked');
    expect(output).toContain('3 from plugins');
  });

  it('counts MCP servers by scope', () => {
    const result = createMockScanResult({
      mcpServers: [
        createMcpServer({ scope: 'global' }),
        createMcpServer({ scope: 'global' }),
        createMcpServer({ scope: 'plugin' }),
        createMcpServer({ scope: 'project' }),
        createMcpServer({ scope: 'project' }),
        createMcpServer({ scope: 'project' }),
        createMcpServer({ scope: 'user' }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('MCP Servers:');
    expect(output).toContain('2 global');
    expect(output).toContain('1 plugin');
    expect(output).toContain('3 project');
    expect(output).toContain('1 user');
  });

  it('counts projects with MCP and CLAUDE.md', () => {
    const result = createMockScanResult({
      projects: [
        createProject({ hasMcp: true, hasClaudeMd: true }),
        createProject({ hasMcp: true, hasClaudeMd: false }),
        createProject({ hasMcp: false, hasClaudeMd: true }),
        createProject({ hasMcp: false, hasClaudeMd: false }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('Projects:');
    expect(output).toContain('4 total');
    expect(output).toContain('2 with MCP');
    expect(output).toContain('2 with CLAUDE.md');
  });

  it('counts marketplaces', () => {
    const result = createMockScanResult({
      marketplaces: [
        { name: 'official', source: { source: 'github', repo: 'org/repo' }, installLocation: '/path', lastUpdated: '2024-01-01' },
        { name: 'custom', source: { source: 'github', repo: 'org/repo2' }, installLocation: '/path2', lastUpdated: '2024-01-01' },
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('Marketplaces:');
    expect(output).toContain('2');
  });

  it('does not show disabled count when all are enabled', () => {
    const result = createMockScanResult({
      plugins: [
        createPlugin({ enabled: true }),
        createPlugin({ enabled: true }),
      ],
    });
    const output = formatDashboard(result);

    expect(output).toContain('2 enabled');
    expect(output).not.toMatch(/Plugins:.*disabled/);
  });
});
