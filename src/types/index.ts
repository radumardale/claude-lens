export interface ClaudeSettings {
  includeCoAuthoredBy?: boolean;
  alwaysThinkingEnabled?: boolean;
  enabledPlugins?: Record<string, boolean>;
  statusLine?: StatusLineConfig;
}

export interface StatusLineConfig {
  type: 'command';
  command: string;
}

export interface InstalledPluginEntry {
  scope: 'user' | 'project';
  installPath: string;
  version: string;
  installedAt: string;
  lastUpdated: string;
  gitCommitSha: string;
}

export interface InstalledPluginsFile {
  version: number;
  plugins: Record<string, InstalledPluginEntry[]>;
}

export interface PluginMetadata {
  name: string;
  description: string;
  version: string;
  author?: { name: string; email?: string };
}

export interface Plugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  marketplace: string;
  installPath: string;
  installedAt: string;
  lastUpdated: string;
  enabled: boolean;
}

export interface MarketplaceSource {
  source: 'github';
  repo: string;
}

export interface Marketplace {
  name: string;
  source: MarketplaceSource;
  installLocation: string;
  lastUpdated: string;
}

export interface Agent {
  name: string;
  description?: string;
  model?: string;
  color?: string;
  filePath: string;
  enabled: boolean;
}

export interface Command {
  name: string;
  content: string;
  filePath: string;
  enabled: boolean;
}

export interface SkillMetadata {
  mcpServer?: string;
}

export interface Skill {
  name: string;
  description?: string;
  metadata?: SkillMetadata;
  source: 'symlink' | 'plugin';
  pluginName?: string;
  filePath: string;
  enabled: boolean;
}

export interface McpServerConfig {
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
}

export interface McpServer {
  name: string;
  type?: string;
  url?: string;
  command?: string;
  args?: string[];
  headers?: Record<string, string>;
  scope: 'global' | 'project' | 'plugin';
  configPath: string;
  projectPath?: string;
  pluginName?: string;
  enabled: boolean;
}

export interface McpConfigFile {
  mcpServers?: Record<string, McpServerConfig>;
}

export interface ProjectSessionEntry {
  sessionId: string;
  projectPath: string;
  gitBranch?: string;
  messageCount: number;
  created: string;
  modified: string;
  isSidechain?: boolean;
}

export interface Project {
  path: string;
  hasMcp: boolean;
  hasSettings: boolean;
  hasClaudeMd: boolean;
  sessionCount?: number;
  lastModified?: string;
}

export interface ScanResult {
  settings: ClaudeSettings;
  plugins: Plugin[];
  marketplaces: Marketplace[];
  agents: Agent[];
  commands: Command[];
  skills: Skill[];
  mcpServers: McpServer[];
  projects: Project[];
}

export interface ActionResult {
  success: boolean;
  message: string;
}

export type ComponentType = 'plugin' | 'agent' | 'command' | 'skill' | 'mcp';
