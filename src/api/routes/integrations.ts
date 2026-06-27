import { Router } from 'express';
import { db } from '../../db';
import { integrations, organizations } from '../../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all integrations
router.get('/', async (req, res) => {
  try {
    const defaultOrg = await db.query.organizations.findFirst();
    if (!defaultOrg) return res.json([]);
    
    const results = await db.query.integrations.findMany({
      where: eq(integrations.organizationId, defaultOrg.id as number),
      orderBy: (integrations, { desc }) => [desc(integrations.createdAt)],
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Update integration status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lastSync } = req.body;
    
    const [updated] = await db.update(integrations)
      .set({ status, lastSync, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
      
    if (!updated) return res.status(404).json({ error: 'Integration not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Add a new integration
router.post('/', async (req, res) => {
  try {
    const { id, name, category, status, icon, lastSync } = req.body;
    const defaultOrg = await db.query.organizations.findFirst();
    if (!defaultOrg) return res.status(400).json({ error: 'No organization found' });
    
    const [newIntegration] = await db.insert(integrations)
      .values({
        id,
        organizationId: defaultOrg.id as number,
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
