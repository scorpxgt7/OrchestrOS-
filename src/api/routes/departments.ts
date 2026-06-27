import { Router } from 'express';
import { db } from '../../db/index.ts';
import { departments, agents, policies, tasks } from '../../db/schema.ts';
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
      description: req.body.description || null,
      region: req.body.region || null,
      organizationId: user.organizationId,
    }).returning();
    res.status(201).json(newDept[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const updated = await db.update(departments)
      .set({ 
        name: req.body.name,
        description: req.body.description !== undefined ? req.body.description : undefined,
        region: req.body.region !== undefined ? req.body.region : undefined,
      })
      .where(eq(departments.id, parseInt(req.params.id)))
      .returning();
    if (!updated.length) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(updated[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const deptId = parseInt(req.params.id);

    // Nullify references in dependent tables to prevent foreign key constraint violations
    await db.update(agents).set({ departmentId: null }).where(eq(agents.departmentId, deptId));
    await db.update(policies).set({ departmentId: null }).where(eq(policies.departmentId, deptId));
    await db.update(tasks).set({ departmentId: null }).where(eq(tasks.departmentId, deptId));

    await db.delete(departments).where(eq(departments.id, deptId));
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

export default router;
