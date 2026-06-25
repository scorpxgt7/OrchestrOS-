import { Router } from 'express';
import { db } from '../../db/index.ts';
import { departments } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const allDepartments = await db.query.departments.findMany({
      where: eq(departments.organizationId, user.organizationId)
    });
    res.json(allDepartments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const newDept = await db.insert(departments).values({
      name: req.body.name,
      organizationId: user.organizationId,
    }).returning();
    res.status(201).json(newDept[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    await db.delete(departments).where(eq(departments.id, parseInt(req.params.id)));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
