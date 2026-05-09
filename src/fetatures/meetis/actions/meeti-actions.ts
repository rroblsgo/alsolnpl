'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { MeetiInput, MeetiSchema } from '../schemas/meetiSchema';
import { meetiService } from '../services/MeetiService';

export async function createMeetiAction(input: MeetiInput) {
  const { session } = await requireAuth();
  if (!session) {
    return {
      error: 'No autenticado',
      success: '',
    };
  }
  const data = MeetiSchema.safeParse(input);
  if (!data.success) {
    return {
      error: 'Hubo un error',
      success: '',
    };
  }
  await meetiService.createMeeti(data.data, session.user);
  return {
    error: '',
    success: 'Meeti creado correctamente',
  };
}

export async function editMeetiAction(input: MeetiInput, meetiId: string) {
  const { session } = await requireAuth();
  if (!session) {
    return {
      error: 'No autenticado',
      success: '',
    };
  }
  const data = MeetiSchema.safeParse(input);
  if (!data.success) {
    return {
      error: 'Hubo un error',
      success: '',
    };
  }
  await meetiService.updateMeeti(meetiId, data.data, session.user);
  return {
    error: '',
    success: 'Meeti actualizado correctamente',
  };
}

export async function deleteMeetiAction(meetiId: string) {
  const { session } = await requireAuth();
  if (!session) {
    return {
      error: 'No autenticado',
      success: '',
    };
  }
  const response = await meetiService.deleteMeeti(meetiId, session.user);
  return response;
}
