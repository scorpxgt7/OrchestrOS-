import { Router } from 'express';
import { db } from '../../db/index.ts';
import { auditLogs, incidents } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

// Evaluate risk (simple mock logic for the MVP)
const evaluateRisk = (action: string, metadata: any) => {
  let riskScore = 10; // Base risk
  const riskDimensions: any = {
    security: 5,
    operational: 10,
    compliance: 5,
  };

  if (action.includes('delete') || action.includes('remove')) {
    riskScore += 30;
    riskDimensions.operational += 20;
  }
  if (action.includes('policy') || action.includes('governance')) {
    riskScore += 20;
    riskDimensions.compliance += 15;
  }
  if (metadata?.riskLevel) {
    riskScore += metadata.riskLevel;
    riskDimensions.security += metadata.riskLevel;
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100);

  return { riskScore, riskDimensions };
};

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const { action, actorUserId, actorAgentId, taskId, metadata, outcome } = req.body;

    const { riskScore, riskDimensions } = evaluateRisk(action, metadata);

    // Insert audit log
    const [auditLog] = await db.insert(auditLogs).values({
      organizationId: user.organizationId,
      action,
      actorUserId: actorUserId || user.id,
      actorAgentId,
      taskId,
      metadata,
      riskScore,
      riskDimensions,
      outcome: outcome || 'success',
      timestamp: new Date(),
    }).returning();

    // If risk is high, create an incident
    if (riskScore > 60) {
      await db.insert(incidents).values({
        organizationId: user.organizationId,
        title: `High Risk Action: ${action}`,
        description: `Action triggered risk score of ${riskScore}. Metadata: ${JSON.stringify(metadata)}`,
        severity: riskScore > 80 ? 'critical' : 'high',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.status(201).json(auditLog);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }

    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.organizationId, user.organizationId),
      orderBy: (auditLogs, { desc }) => [desc(auditLogs.timestamp)],
      limit: 100,
    });

    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
