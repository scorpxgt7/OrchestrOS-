import { Router } from 'express';
import { db } from '../../db/index.ts';
import { agents } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

// Get all agents for the organization
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const allAgents = await db.query.agents.findMany({
      where: eq(agents.organizationId, user.organizationId),
      with: {
        department: true,
      }
    });
    res.json(allAgents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const newAgent = await db.insert(agents).values({
      ...req.body,
      organizationId: user.organizationId,
    }).returning();
    res.status(201).json(newAgent[0]);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error?.message || 'Failed to create agent' });
  }
});

router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const updatedAgent = await db.update(agents).set({
      ...req.body,
      updatedAt: new Date(),
    }).where(eq(agents.id, parseInt(req.params.id))).returning();
    res.json(updatedAgent[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    await db.delete(agents).where(eq(agents.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;
