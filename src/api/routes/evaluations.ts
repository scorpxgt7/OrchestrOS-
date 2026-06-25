import { Router } from 'express';
import { db } from '../../db/index.ts';
import { agents, tasks, auditLogs } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) return res.status(400).json({ error: 'User has no organization' });

    const orgAgents = await db.query.agents.findMany({
      where: eq(agents.organizationId, user.organizationId)
    });
    
    const orgTasks = await db.query.tasks.findMany({
      where: eq(tasks.organizationId, user.organizationId)
    });
    
    const orgAudits = await db.query.auditLogs.findMany({
      where: eq(auditLogs.organizationId, user.organizationId)
    });

    const evaluations: any = {};

    orgAgents.forEach(agent => {
       const agentTasks = orgTasks.filter(t => t.assignedAgentId === agent.id);
       const completed = agentTasks.filter(t => t.status === 'Completed').length;
       const failed = agentTasks.filter(t => t.status === 'Failed').length;
       const completionRate = agentTasks.length > 0 ? (completed / agentTasks.length) * 100 : 85; // Baseline
       
       const agentLogs = orgAudits.filter(a => a.actorAgentId === agent.id);
       const warnings = agentLogs.filter(a => (a.riskScore || 0) > 60).length;
       
       let accuracyScore = 95 - failed * 5;
       if (accuracyScore < 0) accuracyScore = 0;
       
       let policyAdherence = 100 - warnings * 10;
       if (policyAdherence < 0) policyAdherence = 0;

       const overallScore = (completionRate + accuracyScore + policyAdherence + 85) / 4;
       
       evaluations[agent.id] = {
         agentId: agent.id,
         completionRate: Math.round(completionRate),
         accuracyScore: Math.round(accuracyScore),
         costEfficiency: 85,
         policyAdherence: Math.round(policyAdherence),
         overallScore: parseFloat(overallScore.toFixed(1)),
         trend: overallScore > 85 ? 'Up' : overallScore < 70 ? 'Down' : 'Stable',
         recentFeedback: []
       };

       if (warnings > 0) {
         evaluations[agent.id].recentFeedback.push({
           source: 'Overwatch',
           date: new Date().toISOString(),
           message: `Agent generated ${warnings} high-risk warnings recently.`,
           type: 'Warning'
         });
       }
    });

    res.json(evaluations);

  } catch (error) {
    console.error('Failed to evaluate agents:', error);
    res.status(500).json({ error: 'Failed to evaluate agents' });
  }
});

export default router;
