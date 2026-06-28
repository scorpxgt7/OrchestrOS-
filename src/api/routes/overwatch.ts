import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.ts';
import { db } from '../../db/index.ts';
import { agents, tasks, auditLogs, approvalRequests, policies } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { llmService } from '../../services/llmService.ts';

const router = Router();

// Endpoint for Overwatch to monitor system state and trigger alerts
router.post('/scan', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    // Fetch active agents and tasks for scanning
    const activeAgents = await db.query.agents.findMany({
      where: and(
        eq(agents.organizationId, user.organizationId),
        eq(agents.status, 'active')
      )
    });
    
    const activeTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.organizationId, user.organizationId),
        eq(tasks.status, 'In Progress')
      )
    });

    // Fetch active policies
    const activePolicies = await db.query.policies.findMany({
      where: and(
        eq(policies.organizationId, user.organizationId),
        eq(policies.status, 'Enforced')
      )
    });

    let scanResults = [];

    if (llmService.isAvailable()) {
      const policyString = activePolicies.length > 0 
        ? activePolicies.map(p => `- ${p.action} on ${p.subjectType} (${p.condition})`).join('\n')
        : 'No deleting production data. No unauthorized access.';

      // If LLM is available, we can pass agent, task and policy context to have it evaluate risks
      const context = `Active Agents: ${JSON.stringify(activeAgents.map(a => ({ id: a.id, name: a.name, role: a.role })))}\nActive Tasks: ${JSON.stringify(activeTasks.map(t => ({ id: t.id, title: t.title, agentId: t.assignedAgentId })))}\nPolicies:\n${policyString}`;
      
      const evaluation = await llmService.evaluateContext(`Overwatch Scan. Context: ${context}. Detect any hallucination or risk based on the provided policies.`);
      
      if (evaluation.functionCalls && evaluation.functionCalls.length > 0) {
        scanResults.push({
          type: 'llm_alert',
          details: evaluation.functionCalls[0]
        });
      } else {
        scanResults.push({ type: 'llm_scan_ok', details: evaluation.text });
      }
    } else {
      // Fallback simulated scan
      const mockRisks = [
        { severity: 'high', agentId: activeAgents[0]?.id, reason: 'Detected high probability hallucination in task output generation.' },
        { severity: 'high', taskId: activeTasks[0]?.id, reason: 'Task execution attempting to bypass human approval gate for production deployment.' }
      ];

      scanResults = mockRisks.filter(r => r.agentId || r.taskId);
    }

    // Process scan results
    for (const finding of scanResults) {
      // Handle fallback high hallucination finding or LLM alert indicating block
      const isHallucination = finding.reason?.toLowerCase().includes('hallucination') || 
                              (finding.type === 'llm_alert' && finding.details?.name === 'blockWorkflow');
                              
      let targetAgentId = finding.agentId;

      // Extract agentId from LLM details if present
      if (finding.type === 'llm_alert' && finding.details?.args?.targetEntity) {
         const match = finding.details.args.targetEntity.match(/Agent\s*(?:#)?(\d+)/i) || 
                       finding.details.args.targetEntity.match(/(\d+)/);
         if (match) targetAgentId = parseInt(match[1]);
      }

      if (isHallucination && targetAgentId) {
        // Pause the agent
        await db.update(agents)
          .set({ status: 'paused' })
          .where(eq(agents.id, targetAgentId));

        // Create approval request for unpausing
        await db.insert(approvalRequests).values({
          organizationId: user.organizationId,
          resourceType: 'agent',
          resourceId: targetAgentId.toString(),
          action: 'resume_agent',
          reason: finding.reason || (finding.type === 'llm_alert' ? finding.details?.args?.reason : 'High hallucination probability detected.'),
          status: 'pending'
        });
      }
    }

    // Log the scan action
    await db.insert(auditLogs).values({
        organizationId: user.organizationId,
        action: 'Overwatch System Scan',
        actorUserId: user.id,
        metadata: { scannedAgents: activeAgents.length, scannedTasks: activeTasks.length, findings: scanResults.length },
        riskScore: scanResults.length > 0 ? 50 : 10,
        outcome: 'success',
        timestamp: new Date()
    });

    res.json({ message: 'Overwatch scan complete', findings: scanResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Overwatch scan failed.' });
  }
});

export default router;
