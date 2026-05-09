'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { DeudorInput, DeudorSchema } from '../schemas/deudorSchema';
import { deudorService } from '../services/DeudorService';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';

export async function createDeudorAction(input: DeudorInput, nplId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const data = DeudorSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información del formulario' };

  const npl = await nplService.getNpl(nplId);
  await deudorService.createDeudor(data.data, nplId, npl, session.user);
  return { success: 'Deudor añadido correctamente', error: '' };
}

export async function editDeudorAction(input: DeudorInput, deudorId: number, nplId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const data = DeudorSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información del formulario' };

  const npl = await nplService.getNpl(nplId);
  await deudorService.updateDeudor(deudorId, data.data, npl, session.user);
  return { success: 'Deudor actualizado correctamente', error: '' };
}

export async function deleteDeudorAction(deudorId: number, nplId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const npl = await nplService.getNpl(nplId);
  await deudorService.deleteDeudor(deudorId, npl, session.user);
  return { success: 'Deudor eliminado correctamente', error: '' };
}
