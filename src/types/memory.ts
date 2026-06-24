export type MemoryCategory = 'user' | 'org' | 'task' | 'agent' | 'governance';

export interface MemoryVersion {
  version: number;
  updatedAt: string;
  author: string;
  changeSummary: string;
  content: string;
}

export interface MemoryPermissions {
  roles: string[];      // e.g., ['Overwatch', 'Main Brain']
  minAutonomy: string;  // e.g., 'Level 3: Conditional'
  owner: string;
}

export interface MemoryIndexing {
  vectorIndex: string;
  graphNodes: string[];
  primaryKey: string;
}

export interface MemoryRecord {
  id: string;
  title: string;
  category: MemoryCategory;
  content: string; // JSON string representing the actual memory payload
  schema: Record<string, string>; // Describes the structural schema
  tags: string[];
  dept: string;
  size: string;
  updated: string;
  version: number;
  permissions: MemoryPermissions;
  versions: MemoryVersion[];
  indexing: MemoryIndexing;
}
