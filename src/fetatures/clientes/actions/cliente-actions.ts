'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { ClienteInput, ClienteSchema } from '../schemas/clienteSchema';
import { clienteService } from '../services/ClienteService';

export async function createClienteAction(input: ClienteInput) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const data = ClienteSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información del formulario' };

  await clienteService.createCliente(data.data, session.user.id);
  return { success: 'Cliente creado correctamente', error: '' };
}

export async function editClienteAction(input: ClienteInput, id: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const data = ClienteSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información del formulario' };

  await clienteService.updateCliente(id, data.data, session.user);
  return { success: 'Cliente actualizado correctamente', error: '' };
}

export async function deleteClienteAction(id: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  await clienteService.deleteCliente(id, session.user);
  return { success: 'Cliente eliminado correctamente', error: '' };
}
