import { Agent, Task, AuditLog } from '../types';

export const mockAgents: Agent[] = [
  { id: 'a1', name: 'Alpha Prime', role: 'Main Brain', department: 'Executive', autonomyLevel: 'Level 5: Full Autonomous', status: 'Active', tasksCompleted: 14502, memoryAccess: ['Global', 'Strategic', 'Historical'] },
  { id: 'a2', name: 'Aegis Monitor', role: 'Overwatch', department: 'Security & Compliance', autonomyLevel: 'Level 5: Full Autonomous', status: 'Active', tasksCompleted: 8930, memoryAccess: ['Global', 'Audit Logs'] },
  { id: 'a3', name: 'Exec-Ops 1', role: 'Executive Director', department: 'Operations', autonomyLevel: 'Level 4: Managed', status: 'Idle', tasksCompleted: 342, memoryAccess: ['Ops', 'Finance'] },
  { id: 'a4', name: 'Mktg-Lead', role: 'Department Manager', department: 'Marketing', autonomyLevel: 'Level 3: Conditional', status: 'Busy', tasksCompleted: 890, memoryAccess: ['Marketing', 'Public Data'] },
  { id: 'a5', name: 'Code-Synth V2', role: 'Specialist', department: 'Engineering', autonomyLevel: 'Level 3: Conditional', status: 'Busy', tasksCompleted: 2104, memoryAccess: ['Repo', 'Docs'] },
  { id: 'a6', name: 'Docu-Scribe', role: 'Memory Agent', department: 'Knowledge Management', autonomyLevel: 'Level 4: Managed', status: 'Active', tasksCompleted: 5600, memoryAccess: ['Global Memory'] },
  { id: 'a7', name: 'QA-Validator', role: 'Auditor', department: 'Engineering', autonomyLevel: 'Level 2: Assisted', status: 'Reviewing', tasksCompleted: 420, memoryAccess: ['Temp PRs', 'Test Logs'] },
  { id: 'a8', name: 'Fin-Analyst', role: 'Specialist', department: 'Finance', autonomyLevel: 'Level 2: Assisted', status: 'Halted', tasksCompleted: 156, memoryAccess: ['Financials_Q3'] },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Draft Q3 Marketing Strategy', assigneeId: 'a4', department: 'Marketing', status: 'In Progress', priority: 'High', riskLevel: 25 },
  { id: 't2', title: 'Review PR #4022 for unauthorized API access', assigneeId: 'a7', department: 'Engineering', status: 'Reviewing', priority: 'Critical', riskLevel: 85 },
  { id: 't3', title: 'Generate Executive Summary for Board Meeting', assigneeId: 'a1', department: 'Executive', status: 'Awaiting Approval', priority: 'High', riskLevel: 10 },
  { id: 't4', title: 'Optimize Snowflake Warehouse Queries', assigneeId: 'a5', department: 'Engineering', status: 'In Progress', priority: 'Medium', riskLevel: 45 },
  { id: 't5', title: 'Audit Vendor Invoices - September', assigneeId: 'a8', department: 'Finance', status: 'Blocked', priority: 'High', riskLevel: 60, lastAction: 'Policy violation detected: missing human signature.' },
  { id: 't6', title: 'Archive stale memory clusters', assigneeId: 'a6', department: 'Knowledge Management', status: 'Completed', priority: 'Low', riskLevel: 5 },
];

export const mockLogs: AuditLog[] = [
  { id: 'l1', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), sourceId: 'a2', type: 'Warning', message: 'Detected unusually high cost usage by Code-Synth V2 in last hour.', riskScore: 65 },
  { id: 'l2', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), sourceId: 'a4', type: 'Approval', message: 'Requested human approval for Q3 Campaign budget allocation.', decision: 'Pending Human Review', riskScore: 40 },
  { id: 'l3', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), sourceId: 'a1', type: 'Decision', message: 'Re-routed 50 low-priority customer support tickets to Local LLM pool to save costs.' },
  { id: 'l4', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), sourceId: 'a8', type: 'Error', message: 'Halted execution. Policy violation: Attempted to process payment without dual-authorization.', riskScore: 95 },
  { id: 'l5', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), sourceId: 'a6', type: 'Info', message: 'Successfully indexed 1,204 new organizational documents.' },
];
