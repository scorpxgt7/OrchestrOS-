import { Router } from 'express';
import { db } from '../../db/index.ts';
import { memoryRecords } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const records = await db.query.memoryRecords.findMany({
      where: eq(memoryRecords.organizationId, user.organizationId),
      orderBy: (memoryRecords, { desc }) => [desc(memoryRecords.createdAt)],
    });
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch memory records' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const newRecord = await db.insert(memoryRecords).values({
      ...req.body,
      organizationId: user.organizationId,
    }).returning();
    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create memory record' });
  }
});

router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const updatedRecord = await db.update(memoryRecords).set({
      ...req.body,
      updatedAt: new Date(),
    }).where(eq(memoryRecords.id, parseInt(req.params.id))).returning();
    res.json(updatedRecord[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update memory record' });
  }
});

router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    await db.delete(memoryRecords).where(eq(memoryRecords.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete memory record' });
  }
});

export default router;
