import { db } from './index.ts';
import { users, organizations, departments } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  // Check if user exists
  let user: any = await db.query.users.findFirst({
    where: eq(users.uid, uid),
  });

  if (!user) {
    // Check if any organization exists, otherwise create a default one
    let org: any = await db.query.organizations.findFirst();
    if (!org) {
      const orgResult = await db.insert(organizations).values({
        name: 'Default Organization',
      }).returning();
      org = orgResult[0];

      // Create a default department
      await db.insert(departments).values({
        organizationId: org.id as number,
        name: 'General Engineering',
      });
    }

    // Create user
    const result = await db.insert(users)
      .values({
        uid,
        email,
        organizationId: org.id as number,
      })
      .returning();
    user = result[0];
  } else {
    // Update email just in case
    const result = await db.update(users)
      .set({ email })
      .where(eq(users.uid, uid))
      .returning();
    user = result[0];
  }

  return user;
}
