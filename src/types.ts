export type AutonomyLevel = 'Level 0: Manual' | 'Level 1: Suggested' | 'Level 2: Assisted' | 'Level 3: Conditional' | 'Level 4: Managed' | 'Level 5: Full Autonomous';

export type AgentRole = 'Main Brain' | 'Overwatch' | 'Executive Director' | 'Department Manager' | 'Supervisor' | 'Specialist' | 'Worker' | 'Auditor' | 'Memory Agent' | 'Security Agent';

export type AgentStatus = 'Active' | 'Busy' | 'Idle' | 'Offline' | 'Reviewing' | 'Halted';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  department: string;
  autonomyLevel: AutonomyLevel;
  status: AgentStatus;
  tasksCompleted: number;
  memoryAccess: string[];
  avatarContext?: string;
}

export type TaskStatus = 'Backlog' | 'In Progress' | 'Reviewing' | 'Awaiting Approval' | 'Blocked' | 'Completed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  title: string;
  assigneeId: string | null;
  department: string;
  status: TaskStatus;
  priority: Priority;
  riskLevel: number; // 0-100
  lastAction?: string;
  dueDate?: string;
}

export type LogType = 'Info' | 'Warning' | 'Error' | 'Approval' | 'Decision';

export interface AuditLog {
  id: string;
  timestamp: string;
  sourceId: string;
  type: LogType;
  message: string;
  decision?: string;
  riskScore?: number;
}
