import { Router } from 'express';
import { db } from '../../db/index.ts';
import { policies } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const orgPolicies = await db.query.policies.findMany({
      where: eq(policies.organizationId, user.organizationId),
      orderBy: (policies, { desc }) => [desc(policies.createdAt)],
    });
    res.json(orgPolicies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch policies' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const newPolicy = await db.insert(policies).values({
      ...req.body,
      organizationId: user.organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    res.status(201).json(newPolicy[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create policy' });
  }
});

router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const updatedPolicy = await db.update(policies).set({
      ...req.body,
      updatedAt: new Date(),
    }).where(eq(policies.id, parseInt(req.params.id))).returning();
    res.json(updatedPolicy[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update policy' });
  }
});

router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    await db.delete(policies).where(eq(policies.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete policy' });
  }
});

export default router;
