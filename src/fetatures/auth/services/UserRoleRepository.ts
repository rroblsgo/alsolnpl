import { db } from '@/src/db';
import { users } from '@/src/db/schema/auth-schema';
import { asc } from 'drizzle-orm';

export type UserRoleItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export async function listUsersForRoleManagement(): Promise<UserRoleItem[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));

  return rows;
}
