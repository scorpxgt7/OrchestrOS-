import { fetchApi } from '../lib/api';

export interface AuditEvent {
  action: string;
  actorUserId?: number;
  actorAgentId?: number;
  taskId?: number;
  metadata?: any;
  outcome?: string;
  riskScore?: number;
}

class AuditService {
  async logEvent(event: AuditEvent) {
    try {
      await fetchApi('/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      // Optionally trigger local event for UI updates
      window.dispatchEvent(new CustomEvent('activity-stream-updated', { detail: event }));
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  async getLogs() {
    return await fetchApi('/audit');
  }
}

export const auditService = new AuditService();
