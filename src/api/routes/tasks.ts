import { Router } from 'express';
import { db } from '../../db/index.ts';
import { tasks, auditLogs } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';
import { policyEngine } from '../../services/policyEngineService.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const allTasks = await db.query.tasks.findMany({
      where: eq(tasks.organizationId, user.organizationId),
      with: {
        assignedAgent: true,
        workflow: true,
        department: true,
      }
    });
    res.json(allTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const newTask = await db.insert(tasks).values({
      ...req.body,
      organizationId: user.organizationId,
      ownerUserId: user.id,
    }).returning();
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const updatedTask = await db.update(tasks).set({
      ...req.body,
      updatedAt: new Date(),
    }).where(eq(tasks.id, parseInt(req.params.id))).returning();
    res.json(updatedTask[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.post('/:id/execute', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) return res.status(400).json({ error: 'User has no organization' });

    const taskId = parseInt(req.params.id);
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: { assignedAgent: true }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const agentId = task.assignedAgentId || null;
    
    // Check Policy Engine
    const policyCheck = await policyEngine.evaluateAction({
      organizationId: user.organizationId,
      agentId,
      action: `Execute Task: ${task.title}`,
      metadata: { taskId: task.id }
    });

    if (!policyCheck.allowed) {
      if (policyCheck.requiresApproval) {
         const level = policyCheck.riskScore > 75 ? 'critical' : policyCheck.riskScore > 50 ? 'high' : policyCheck.riskScore > 25 ? 'medium' : 'low';
         await db.update(tasks).set({ status: 'Awaiting Approval', riskLevel: level }).where(eq(tasks.id, taskId));
         
         await db.insert(auditLogs).values({
           organizationId: user.organizationId,
           actorUserId: user.id,
           actorAgentId: agentId,
           action: 'Task Execution Blocked (Requires Approval)',
           metadata: { taskId, reason: policyCheck.reason },
           riskScore: policyCheck.riskScore,
           outcome: 'blocked',
           timestamp: new Date()
         });

         return res.json({ status: 'Awaiting Approval', reason: policyCheck.reason, riskScore: policyCheck.riskScore });
      }
      
      // Blocked completely
      const level = policyCheck.riskScore > 75 ? 'critical' : policyCheck.riskScore > 50 ? 'high' : policyCheck.riskScore > 25 ? 'medium' : 'low';
      await db.update(tasks).set({ status: 'Failed', riskLevel: level }).where(eq(tasks.id, taskId));
      
      await db.insert(auditLogs).values({
        organizationId: user.organizationId,
        actorUserId: user.id,
        actorAgentId: agentId,
        action: 'Task Execution Rejected',
        metadata: { taskId, reason: policyCheck.reason },
        riskScore: policyCheck.riskScore,
        outcome: 'failed',
        timestamp: new Date()
      });

      return res.status(403).json({ error: 'Action blocked by policy engine', reason: policyCheck.reason, riskScore: policyCheck.riskScore });
    }

    // Execution allowed
    await db.update(tasks).set({ status: 'In Progress' }).where(eq(tasks.id, taskId));
    
    await db.insert(auditLogs).values({
      organizationId: user.organizationId,
      actorUserId: user.id,
      actorAgentId: agentId,
      action: 'Task Execution Started',
      metadata: { taskId },
      riskScore: policyCheck.riskScore,
      outcome: 'success',
      timestamp: new Date()
    });

    res.json({ status: 'In Progress', riskScore: policyCheck.riskScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute task' });
  }
});

export default router;
