import { db } from './index.ts';
import { users, organizations, departments } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  // Check if user exists
  let user: any = await db.query.users.findFirst({
    where: eq(users.uid, uid),
  });

  if (!user) {
    // Create a new organization for this user to ensure multi-tenancy
    const orgName = email ? `${email.split('@')[0]}'s Organization` : 'My Organization';
    const orgResult = await db.insert(organizations).values({
      name: orgName,
    }).returning();
    const org = orgResult[0];

    // Create a default department
    await db.insert(departments).values({
      organizationId: org.id as number,
      name: 'General Engineering',
    });

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
