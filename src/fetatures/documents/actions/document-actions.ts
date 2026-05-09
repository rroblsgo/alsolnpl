'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { DocumentInput, DocumentSchema } from '../schemas/documentSchema';
import { documentService } from '../services/DocumentService';

export async function createDocumentAction(input: DocumentInput) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const data = DocumentSchema.safeParse(input);
  if (!data.success) {
    return { success: '', error: 'Revisa los datos del documento' };
  }

  const doc = await documentService.createDocument(data.data, session.user.id);
  return { success: 'Documento añadido correctamente', error: '', doc };
}

export async function updateDocumentAction(
  id: number,
  input: Partial<Pick<DocumentInput, 'titulo' | 'categoria' | 'notas'>>
) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  await documentService.updateDocument(id, input);
  return { success: 'Documento actualizado correctamente', error: '' };
}

export async function deleteDocumentAction(id: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  await documentService.deleteDocument(id);
  return { success: 'Documento eliminado correctamente', error: '' };
}
