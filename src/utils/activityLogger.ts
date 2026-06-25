import { auditService } from '../services/auditService';

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

export function getActivities(): ActivityEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading activity stream from localStorage', e);
    return [];
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
    
    // Also push to persistent DB via auditService
    auditService.logEvent({
      action: `${type}: ${target}`,
      metadata: { message, severity, riskScore, actor },
      outcome: severity === 'critical' ? 'failure' : 'success'
    });

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
