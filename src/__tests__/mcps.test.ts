import { describe, it, expect } from 'vitest';
import { getMcpRegistryKey } from '../actions/mcps.js';
import type { McpServer } from '../types/index.js';

function createMcpServer(overrides: Partial<McpServer>): McpServer {
  return {
    name: 'test-server',
    command: 'node',
    scope: 'global',
    configPath: '/path/to/config.json',
    enabled: true,
    ...overrides,
  };
}

describe('getMcpRegistryKey', () => {
  it('generates key for global scope', () => {
    const server = createMcpServer({ scope: 'global', name: 'my-server' });
    expect(getMcpRegistryKey(server)).toBe('global:my-server');
  });

  it('generates key for project scope with projectPath', () => {
    const server = createMcpServer({
      scope: 'project',
      name: 'db-server',
      projectPath: '/Users/dev/myproject',
    });
    expect(getMcpRegistryKey(server)).toBe('project:/Users/dev/myproject:db-server');
  });

  it('generates key for plugin scope with pluginName', () => {
    const server = createMcpServer({
      scope: 'plugin',
      name: 'api-server',
      pluginName: 'figma-plugin',
    });
    expect(getMcpRegistryKey(server)).toBe('plugin:figma-plugin:api-server');
  });

  it('generates key for user scope with projectPath', () => {
    const server = createMcpServer({
      scope: 'user',
      name: 'custom-server',
      projectPath: '/Users/dev/work',
    });
    expect(getMcpRegistryKey(server)).toBe('user:/Users/dev/work:custom-server');
  });

  it('generates key for user scope without projectPath (global user)', () => {
    const server = createMcpServer({
      scope: 'user',
      name: 'global-user-server',
    });
    expect(getMcpRegistryKey(server)).toBe('user:global:global-user-server');
  });

  it('produces unique keys for same name in different scopes', () => {
    const globalServer = createMcpServer({ scope: 'global', name: 'server' });
    const projectServer = createMcpServer({
      scope: 'project',
      name: 'server',
      projectPath: '/path',
    });
    const pluginServer = createMcpServer({
      scope: 'plugin',
      name: 'server',
      pluginName: 'myplugin',
    });
    const userServer = createMcpServer({ scope: 'user', name: 'server' });

    const keys = [
      getMcpRegistryKey(globalServer),
      getMcpRegistryKey(projectServer),
      getMcpRegistryKey(pluginServer),
      getMcpRegistryKey(userServer),
    ];

    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(4);
  });

  it('produces different keys for same scope but different projects', () => {
    const server1 = createMcpServer({
      scope: 'project',
      name: 'db',
      projectPath: '/project-a',
    });
    const server2 = createMcpServer({
      scope: 'project',
      name: 'db',
      projectPath: '/project-b',
    });

    expect(getMcpRegistryKey(server1)).not.toBe(getMcpRegistryKey(server2));
  });

  it('handles server names with special characters', () => {
    const server = createMcpServer({
      scope: 'global',
      name: 'my-server_v2.0',
    });
    expect(getMcpRegistryKey(server)).toBe('global:my-server_v2.0');
  });
});
