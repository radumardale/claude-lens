import type { ScanResult, Plugin, Agent, Command, Skill, McpServer, Project, Marketplace } from '../types/index.js';

export function formatJson(data: ScanResult | Plugin[] | Agent[] | Command[] | Skill[] | McpServer[] | Project[] | Marketplace[]): string {
  return JSON.stringify(data, null, 2);
}
