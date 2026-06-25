import { Router } from 'express';
import { db } from '../../db/index.ts';
import { users, organizations, departments } from '../../db/schema.ts';

const router = Router();

router.post('/init', async (req, res) => {
  try {
    let org: any = await db.query.organizations.findFirst();
    if (!org) {
      const orgResult = await db.insert(organizations).values({ name: 'Default Organization' }).returning();
      org = orgResult[0];

      await db.insert(departments).values({
        organizationId: org.id as number,
        name: 'General Engineering',
      });
    }

    let user: any = await db.query.users.findFirst();
    if (!user) {
      const result = await db.insert(users).values({
        uid: 'dev-user-uid',
        email: 'dev@example.com',
        organizationId: org.id as number,
      }).returning();
      user = result[0];
    }

    res.json({ message: 'Dev DB initialized', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Init failed' });
  }
});

export default router;
