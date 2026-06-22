import {
  documentRepository,
  DocumentDashboardItem,
} from './DocumentRepository';
import { DocumentInput } from '../schemas/documentSchema';
import { DocumentEntityType, DocumentListItem } from '../types/document.types';
import { deleteUTFiles } from '@/src/lib/uploadthing-server';

class DocumentService {
  async createDocument(input: DocumentInput, uploadedBy: string) {
    return documentRepository.create({
      ...input,
      notas: input.notas || null,
      nombreArchivo: input.nombreArchivo || null,
      extension: input.extension || null,
      tamano: input.tamano ?? null,
      uploadedBy,
    });
  }

  async listAll(): Promise<DocumentListItem[]> {
    // OFFICE MODE: se devuelven todos los documentos de la oficina
    return documentRepository.listAllWithEntity();
  }

  async listByEntity(
    entityType: DocumentEntityType,
    entityId: number
  ): Promise<DocumentListItem[]> {
    return documentRepository.listByEntity(entityType, entityId);
  }

  async updateDocument(
    id: number,
    data: Partial<Pick<DocumentInput, 'titulo' | 'categoria' | 'notas'>>
  ) {
    return documentRepository.update(id, data);
  }

  async listAllWithEntity(): Promise<DocumentDashboardItem[]> {
    return documentRepository.listAllWithEntity();
  }

  async listUploaders(): Promise<Array<{ id: string; name: string }>> {
    return documentRepository.listUploaders();
  }

  async deleteDocument(id: number) {
    const doc = await documentRepository.findById(id);
    if (!doc) return;

    // Eliminar el archivo de UploadThing
    await deleteUTFiles(doc.url);
    await documentRepository.remove(id);
  }
}

export const documentService = new DocumentService();
