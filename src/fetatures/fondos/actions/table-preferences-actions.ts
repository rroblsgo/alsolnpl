'use server';

import { db } from '@/src/db';
import { userTablePreferences, DEFAULT_OPERACIONES_ORDER } from '@/src/db/schema/user_table_preferences';
import type { TablePreferences } from '@/src/db/schema/user_table_preferences';
import { and, eq } from 'drizzle-orm';
import { requireDashboard } from '@/src/lib/auth-server';

const TABLE_KEY = 'operaciones';

export async function getTablePreferencesAction(): Promise<TablePreferences> {
  const session = await requireDashboard();
  const userId = session.user.id;

  const [row] = await db
    .select()
    .from(userTablePreferences)
    .where(and(
      eq(userTablePreferences.userId, userId),
      eq(userTablePreferences.tableKey, TABLE_KEY),
    ))
    .limit(1);

  if (row) return row.prefs;

  // Default: orden predefinido, todo visible
  return {
    columnOrder:      ['_sel', '_id', ...DEFAULT_OPERACIONES_ORDER],
    columnVisibility: {},
  };
}

export async function saveTablePreferencesAction(prefs: TablePreferences): Promise<void> {
  const session = await requireDashboard();
  const userId = session.user.id;

  // Upsert
  const [existing] = await db
    .select({ id: userTablePreferences.id })
    .from(userTablePreferences)
    .where(and(
      eq(userTablePreferences.userId, userId),
      eq(userTablePreferences.tableKey, TABLE_KEY),
    ))
    .limit(1);

  if (existing) {
    await db
      .update(userTablePreferences)
      .set({ prefs })
      .where(eq(userTablePreferences.id, existing.id));
  } else {
    await db
      .insert(userTablePreferences)
      .values({ userId, tableKey: TABLE_KEY, prefs });
  }
}
