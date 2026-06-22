'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { ExpedienteNotaInput, ExpedienteNotaSchema } from '../schemas/expedienteSchema';
import { expedienteService } from '../services/ExpedienteService';

export async function createExpedienteNotaAction(
  nplId: number,
  input: ExpedienteNotaInput
) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado', nota: null };

  const data = ExpedienteNotaSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa los datos del formulario', nota: null };
  }

  try {
    // createNota ya devuelve el objeto con creatorName y usuarioRelacionadoName
    const nota = await expedienteService.createNota(nplId, data.data, session.user.id);
    return { success: 'Nota creada correctamente', error: '', nota };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al crear la nota';
    return { success: '', error: msg, nota: null };
  }
}

export async function updateExpedienteNotaAction(
  notaId: number,
  input: ExpedienteNotaInput
) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const data = ExpedienteNotaSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa los datos del formulario' };
  }

  try {
    await expedienteService.updateNota(notaId, data.data, session.user);
    return { success: 'Nota actualizada correctamente', error: '' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al actualizar la nota';
    return { success: '', error: msg };
  }
}

export async function deleteExpedienteNotaAction(notaId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  try {
    await expedienteService.deleteNota(notaId, session.user);
    return { success: 'Nota eliminada correctamente', error: '' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al eliminar la nota';
    return { success: '', error: msg };
  }
}
