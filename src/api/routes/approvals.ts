import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { db } from '../../db/index.js';
import { approvalRequests, tasks, agents, auditLogs } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const requests = await db.query.approvalRequests.findMany({
      where: eq(approvalRequests.organizationId, user.organizationId)
    });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch approval requests.' });
  }
});

router.post('/:id/approve', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    const request = await db.query.approvalRequests.findFirst({
      where: and(
        eq(approvalRequests.id, parseInt(id)),
        eq(approvalRequests.organizationId, user.organizationId)
      )
    });

    if (!request) return res.status(404).json({ error: 'Approval request not found.' });

    await db.update(approvalRequests)
      .set({ status: 'approved', decidedBy: user.id, decidedAt: new Date() })
      .where(eq(approvalRequests.id, parseInt(id)));

    // Handle agent resumption
    if (request.resourceType === 'agent' && request.action === 'resume_agent') {
      await db.update(agents)
        .set({ status: 'active' })
        .where(eq(agents.id, parseInt(request.resourceId)));
    }

    await db.insert(auditLogs).values({
        organizationId: user.organizationId,
        action: 'Approval Request Granted',
        actorUserId: user.id,
        metadata: { requestId: id, resourceType: request.resourceType, resourceId: request.resourceId },
        riskScore: 5,
        outcome: 'success',
        timestamp: new Date()
    });

    res.json({ message: 'Request approved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to approve request.' });
  }
});

router.post('/:id/deny', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    const request = await db.query.approvalRequests.findFirst({
      where: and(
        eq(approvalRequests.id, parseInt(id)),
        eq(approvalRequests.organizationId, user.organizationId)
      )
    });

    if (!request) return res.status(404).json({ error: 'Approval request not found.' });

    await db.update(approvalRequests)
      .set({ status: 'denied', decidedBy: user.id, decidedAt: new Date() })
      .where(eq(approvalRequests.id, parseInt(id)));

    await db.insert(auditLogs).values({
        organizationId: user.organizationId,
        action: 'Approval Request Denied',
        actorUserId: user.id,
        metadata: { requestId: id, resourceType: request.resourceType, resourceId: request.resourceId },
        riskScore: 10,
        outcome: 'success',
        timestamp: new Date()
    });

    res.json({ message: 'Request denied successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to deny request.' });
  }
});

export default router;
