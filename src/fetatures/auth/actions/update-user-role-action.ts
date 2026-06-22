'use server';

import { db } from '@/src/db';
import { users } from '@/src/db/schema/auth-schema';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES, APP_ROLES, type AppRole } from '@/src/lib/roles';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export type UpdateRoleResult = { success: string; error: string };

export async function updateUserRoleAction(
  userId: string,
  newRole: string
): Promise<UpdateRoleResult> {
  // Solo admin puede ejecutar esta acción
  try {
    await requireRole([ROLES.ADMIN]);
  } catch {
    return { success: '', error: 'No tienes permisos para cambiar roles.' };
  }

  // Validar que el role es uno de los permitidos
  if (!APP_ROLES.includes(newRole as AppRole)) {
    return { success: '', error: `Role '${newRole}' no válido.` };
  }

  if (!userId?.trim()) {
    return { success: '', error: 'ID de usuario no válido.' };
  }

  // Verificar que el usuario existe
  const [target] = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target) {
    return { success: '', error: 'Usuario no encontrado.' };
  }

  if (target.role === newRole) {
    return { success: '', error: `El usuario ya tiene el role '${newRole}'.` };
  }

  await db
    .update(users)
    .set({ role: newRole, updatedAt: new Date() })
    .where(eq(users.id, userId));

  revalidatePath('/dashboard/users/roles');

  return {
    success: `Role de ${target.name ?? target.email} actualizado a '${newRole}' correctamente.`,
    error: '',
  };
}
