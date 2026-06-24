export type ActivityType = 'access' | 'permission' | 'ingestion' | 'edit' | 'rollback' | 'playground' | 'delete';
export type ActivitySeverity = 'info' | 'warning' | 'critical' | 'success';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: ActivityType;
  actor: string;
  target: string;
  message: string;
  severity: ActivitySeverity;
  riskScore: number;
}

const STORAGE_KEY = 'agent_os_activity_stream';
const EVENT_NAME = 'activity-stream-updated';

// Some cool pre-populated events
const initialEvents: ActivityEvent[] = [
  {
    id: 'act_init_01',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    type: 'permission',
    actor: 'scorpxgt7@gmail.com (Owner)',
    target: 'Executive Director Override Prefs (scorpxgt7@gmail.com)',
    message: 'Modified auto_approve_caps limit from $100k to $150k, triggering automatic regulatory review.',
    severity: 'warning',
    riskScore: 45
  },
  {
    id: 'act_init_02',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    type: 'access',
    actor: 'Alpha Prime (Main Brain)',
    target: 'Global Brand Guidelines 2026',
    message: 'Authorized reading of Brand Guidelines context block to ground corporate response pipeline.',
    severity: 'info',
    riskScore: 5
  },
  {
    id: 'act_init_03',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    type: 'permission',
    actor: 'Aegis Monitor (Overwatch)',
    target: 'Q3 Financial Ledger Compliance Rules',
    message: 'Escalated minimum autonomy limit for Finance rules to Level 3: Conditional.',
    severity: 'critical',
    riskScore: 80
  },
  {
    id: 'act_init_04',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: 'playground',
    actor: 'QA-Validator (Auditor)',
    target: 'pgvector (task_trace_vec)',
    message: 'Run semantic vector search query: "security vulnerabilities or unapproved API keys in engineering logs".',
    severity: 'info',
    riskScore: 15
  },
  {
    id: 'act_init_05',
    timestamp: new Date(Date.now() - 1000 * 120 * 60).toISOString(),
    type: 'ingestion',
    actor: 'Docu-Scribe (Memory Agent)',
    target: 'Global Brand Guidelines 2026',
    message: 'Successfully parsed and embedded 24 corporate compliance segments into pgvector.',
    severity: 'success',
    riskScore: 0
  },
  {
    id: 'act_init_06',
    timestamp: new Date(Date.now() - 1000 * 200 * 60).toISOString(),
    type: 'edit',
    actor: 'mktg_lead@orchestrator.ai',
    target: 'Global Brand Guidelines 2026',
    message: 'Updated compliance guidelines payload. Appended "black-box-compute" to the restricted vocabulary list.',
    severity: 'info',
    riskScore: 10
  }
];

export function getActivities(): ActivityEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialEvents));
      return initialEvents;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading activity stream from localStorage', e);
    return initialEvents;
  }
}

export function logActivity(
  type: ActivityType,
  actor: string,
  target: string,
  message: string,
  severity: ActivitySeverity = 'info',
  riskScore: number = 0
): ActivityEvent {
  const newEvent: ActivityEvent = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(-4)}`,
    timestamp: new Date().toISOString(),
    type,
    actor,
    target,
    message,
    severity,
    riskScore
  };

  try {
    const current = getActivities();
    const updated = [newEvent, ...current].slice(0, 150); // Keep last 150 events
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch update event to notify open tabs/views
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Error writing activity stream event', e);
  }

  return newEvent;
}

export function clearActivities() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (e) {
    console.error('Error clearing activity stream', e);
  }
}

// Background simulation helper
const backgroundAgents = [
  { name: 'Aegis Monitor', role: 'Overwatch', riskLow: 0, riskHigh: 20 },
  { name: 'Alpha Prime', role: 'Main Brain', riskLow: 0, riskHigh: 15 },
  { name: 'QA-Validator', role: 'Auditor', riskLow: 5, riskHigh: 30 },
  { name: 'Code-Synth V2', role: 'Specialist', riskLow: 10, riskHigh: 50 },
  { name: 'Docu-Scribe', role: 'Memory Agent', riskLow: 0, riskHigh: 5 },
  { name: 'Fin-Analyst', role: 'Specialist', riskLow: 15, riskHigh: 85 }
];

const memoryTargets = [
  'Global Brand Guidelines 2026',
  'Executive Director Override Prefs (scorpxgt7@gmail.com)',
  'Q3 Financial Ledger Compliance Rules',
  'Task Execution Trace: PR #4022 Security Audit',
  'Task Execution Trace: Snowflake warehouse optimizations',
  'Alpha Prime Fine-tune Scratchpad & Instruction Overrides',
  'Code-Synth V2 Code Pattern Cache & Library Context',
  'Overwatch Compliance Rulebook & Ethics Guardrails',
  'Human-in-the-Loop Override Log: Q3 Campaign Signoff'
];

const actionMessages = [
  {
    type: 'access' as ActivityType,
    text: 'Fetched memory cluster details for contextual query validation.',
    severity: 'info' as ActivitySeverity
  },
  {
    type: 'access' as ActivityType,
    text: 'Mounted active memory scope into the localized execution thread.',
    severity: 'info' as ActivitySeverity
  },
  {
    type: 'playground' as ActivityType,
    text: 'Executed semantic HNSW query matching related context tokens.',
    severity: 'info' as ActivitySeverity
  },
  {
    type: 'access' as ActivityType,
    text: 'Scanned permissions envelope to check RBAC role requirements.',
    severity: 'info' as ActivitySeverity
  },
  {
    type: 'permission' as ActivityType,
    text: 'Validated security signatures against Governance Overwatch regulations.',
    severity: 'success' as ActivitySeverity
  }
];

export function simulateAgentActivity(): ActivityEvent {
  const agent = backgroundAgents[Math.floor(Math.random() * backgroundAgents.length)];
  const target = memoryTargets[Math.floor(Math.random() * memoryTargets.length)];
  const action = actionMessages[Math.floor(Math.random() * actionMessages.length)];
  
  const calculatedRisk = Math.floor(Math.random() * (agent.riskHigh - agent.riskLow + 1)) + agent.riskLow;
  let finalSeverity = action.severity;
  if (calculatedRisk > 60) {
    finalSeverity = 'warning';
  }
  if (calculatedRisk > 80) {
    finalSeverity = 'critical';
  }

  const message = `${action.text} (Grounding validation confidence: ${(85 + Math.random() * 14).toFixed(1)}%)`;

  return logActivity(
    action.type,
    `${agent.name} (${agent.role})`,
    target,
    message,
    finalSeverity,
    calculatedRisk
  );
}
