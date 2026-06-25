import { Router } from 'express';
import { db } from '../../db/index.ts';
import { workflows } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const allWorkflows = await db.query.workflows.findMany({
      where: eq(workflows.organizationId, user.organizationId),
    });
    res.json(allWorkflows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const newWorkflow = await db.insert(workflows).values({
      ...req.body,
      organizationId: user.organizationId,
    }).returning();
    res.status(201).json(newWorkflow[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

export default router;
