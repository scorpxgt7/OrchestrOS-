import { Router } from 'express';
import { db } from '../../db/index.ts';
import { organizations } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/current', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, user.organizationId)
    });
    res.json(org);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

router.patch('/current', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const updatedOrg = await db.update(organizations).set({
      ...req.body,
      updatedAt: new Date(),
    }).where(eq(organizations.id, user.organizationId)).returning();
    res.json(updatedOrg[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

export default router;
