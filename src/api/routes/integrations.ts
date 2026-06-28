import { Router } from 'express';
import { db } from '../../db/index.ts';
import { integrations, organizations } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth.ts';

const router = Router();

// Get all integrations
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) return res.status(400).json({ error: 'No organization' });
    
    const results = await db.query.integrations.findMany({
      where: eq(integrations.organizationId, user.organizationId),
      orderBy: (integrations, { desc }) => [desc(integrations.createdAt)],
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Update integration status
router.put('/:id', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) return res.status(400).json({ error: 'No organization' });

    const { id } = req.params;
    const { status, lastSync } = req.body;
    
    const [updated] = await db.update(integrations)
      .set({ status, lastSync, updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.organizationId, user.organizationId)))
      .returning();
      
    if (!updated) return res.status(404).json({ error: 'Integration not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Add a new integration
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.organizationId) return res.status(400).json({ error: 'No organization' });

    const { id, name, category, status, icon, lastSync } = req.body;
    
    const [newIntegration] = await db.insert(integrations)
      .values({
        id,
        organizationId: user.organizationId,
        name,
        category,
        status,
        icon,
        lastSync
      })
      .returning();
      
    res.json(newIntegration);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create integration' });
  }
});

export default router;
