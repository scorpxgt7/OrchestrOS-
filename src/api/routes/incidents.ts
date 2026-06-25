import { Router } from 'express';
import { db } from '../../db/index.ts';
import { incidents } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) {
      return res.status(400).json({ error: 'User has no organization' });
    }
    const orgIncidents = await db.query.incidents.findMany({
      where: eq(incidents.organizationId, user.organizationId),
      orderBy: (incidents, { desc }) => [desc(incidents.createdAt)],
    });
    res.json(orgIncidents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

export default router;
