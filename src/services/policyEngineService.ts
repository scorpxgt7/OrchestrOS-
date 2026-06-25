import { db } from '../db/index.ts';
import { policies, agents, auditLogs } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';

export interface PolicyCheckRequest {
  organizationId: number;
  agentId?: number | null;
  action: string;
  metadata?: any;
}

export interface PolicyCheckResult {
  allowed: boolean;
  reason?: string;
  riskScore: number;
  requiresApproval?: boolean;
}

export const policyEngine = {
  async evaluateAction(req: PolicyCheckRequest): Promise<PolicyCheckResult> {
    const { organizationId, agentId, action, metadata } = req;

    // Fetch all active policies for the organization
    const activePolicies = await db.query.policies.findMany({
      where: and(
        eq(policies.organizationId, organizationId),
        eq(policies.status, 'Active')
      )
    });

    let riskScore = 0;
    let allowed = true;
    let requiresApproval = false;
    let failReason = '';

    // If an agent is making the action, let's evaluate their autonomy level
    if (agentId) {
      const agent = await db.query.agents.findFirst({
        where: eq(agents.id, agentId)
      });
      
      if (agent) {
        // High risk actions on low autonomy agents should trigger approval
        if (action.includes('Execute') || action.includes('Transfer') || action.includes('Delete')) {
           riskScore += 40;
           if (agent.autonomyLevel < 3) {
             requiresApproval = true;
             failReason = `Agent autonomy level (${agent.autonomyLevel}) is too low for risky action: ${action}`;
           }
        }
      }
    }

    // Evaluate against specific policies
    for (const policy of activePolicies) {
      // Basic rule matching simulation based on text parsing of condition/action
      if (policy.action && action.toLowerCase().includes(policy.action.toLowerCase())) {
         if (policy.severity === 'Critical') {
            riskScore += 50;
            requiresApproval = true;
            if (!failReason) failReason = `Triggered critical policy: ${policy.scope} - ${policy.action}`;
         } else if (policy.severity === 'High') {
            riskScore += 30;
         }
      }
    }

    // If risk score gets too high (>80), we block completely
    if (riskScore >= 80) {
      allowed = false;
      failReason = `Action blocked due to excessive risk score (${riskScore}). ` + failReason;
    }

    return {
      allowed: !requiresApproval && allowed,
      requiresApproval,
      riskScore,
      reason: failReason
    };
  }
};
