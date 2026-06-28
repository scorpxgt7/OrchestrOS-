import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: Partial<DecodedIdToken> & { id: number; organizationId: number | null; email?: string; uid?: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (token === 'dummy_dev_token') {
    // For local dev without Firebase, just use the first user
    const dbUsers = await db.query.users.findMany({ limit: 1 });
    if (dbUsers.length > 0) {
      req.user = {
        id: dbUsers[0].id,
        organizationId: dbUsers[0].organizationId,
        uid: dbUsers[0].uid,
        email: dbUsers[0].email,
      };
      return next();
    } else {
      return res.status(401).json({ error: 'No users found for dev token' });
    }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Find the user in our database
    const dbUsers = await db.query.users.findMany({
      where: eq(users.uid, decodedToken.uid),
      limit: 1,
    });
    
    if (dbUsers.length > 0) {
      req.user = {
        ...decodedToken,
        id: dbUsers[0].id,
        organizationId: dbUsers[0].organizationId,
      };
      next();
    } else if (req.path === '/sync' || req.originalUrl === '/api/auth/sync') {
      // Allow the sync route to proceed so it can create the user
      req.user = {
        ...decodedToken,
        id: 0,
        organizationId: null,
      };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized: User not found in database' });
    }
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};
