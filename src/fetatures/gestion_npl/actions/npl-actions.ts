'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { NplInput, NplSchema, UpdateNplEstadoInput, UpdateNplEstadoSchema } from '../schemas/nplSchema';
import { nplService } from '../services/NplService';

export async function createNplAction(input: NplInput) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  const data = NplSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa la información del formulario' };
  }

  await nplService.createNpl(data.data, session.user.id);
  return { success: 'NPL creado correctamente', error: '' };
}

export async function editNplAction(input: NplInput, id: number) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  const data = NplSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa la información del formulario' };
  }

  await nplService.updateNpl(id, data.data, session.user);
  return { success: 'NPL actualizado correctamente', error: '' };
}

export async function updateNplEstadoAction(input: UpdateNplEstadoInput, id: number) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  const data = UpdateNplEstadoSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Estado no válido' };
  }

  await nplService.updateNplEstado(id, data.data.estado, session.user);
  return { success: 'Estado actualizado correctamente', error: '' };
}

export async function deleteNplAction(id: number) {
  const { session } = await requireAuth();
  if (!session) {
    return { success: '', error: 'No estás autenticado' };
  }

  await nplService.deleteNpl(id, session.user);
  return { success: 'NPL eliminado correctamente', error: '' };
}
