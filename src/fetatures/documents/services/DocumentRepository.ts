import { db } from '@/src/db';
import { document, users, npl, task, expedienteNotas } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  InsertDocument,
  SelectDocument,
  DocumentEntityType,
  DocumentListItem,
} from '../types/document.types';

export interface IDocumentRepository {
  create(data: InsertDocument): Promise<SelectDocument>;
  findById(id: number): Promise<SelectDocument | undefined>;
  listByEntity(
    entityType: DocumentEntityType,
    entityId: number
  ): Promise<DocumentListItem[]>;
  update(
    id: number,
    data: Partial<Pick<SelectDocument, 'titulo' | 'categoria' | 'notas'>>
  ): Promise<SelectDocument | undefined>;
  remove(id: number): Promise<void>;
  listAllWithEntity(): Promise<DocumentDashboardItem[]>;
  listUploaders(): Promise<Array<{ id: string; name: string }>>;
}

export type DocumentDashboardItem = DocumentListItem & {
  entityTitle: string | null;
  entityEditUrl: string;
};

class DocumentRepository implements IDocumentRepository {
  async create(data: InsertDocument) {
    const [result] = await db.insert(document).values(data).returning();
    return result;
  }

  async findById(id: number) {
    const [result] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .limit(1);
    return result;
  }

  async findByIdWithUploader(id: number): Promise<DocumentListItem | undefined> {
    const [result] = await db
      .select({
        id: document.id,
        titulo: document.titulo,
        url: document.url,
        nombreArchivo: document.nombreArchivo,
        extension: document.extension,
        tamano: document.tamano,
        categoria: document.categoria,
        notas: document.notas,
        entityType: document.entityType,
        entityId: document.entityId,
        uploadedBy: document.uploadedBy,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        uploaderName: users.name,
      })
      .from(document)
      .leftJoin(users, eq(document.uploadedBy, users.id))
      .where(eq(document.id, id))
      .limit(1);
    return result;
  }

  async listByEntity(entityType: DocumentEntityType, entityId: number) {
    const rows = await db
      .select({
        id: document.id,
        titulo: document.titulo,
        url: document.url,
        nombreArchivo: document.nombreArchivo,
        extension: document.extension,
        tamano: document.tamano,
        categoria: document.categoria,
        notas: document.notas,
        entityType: document.entityType,
        entityId: document.entityId,
        uploadedBy: document.uploadedBy,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        uploaderName: users.name,
      })
      .from(document)
      .leftJoin(users, eq(document.uploadedBy, users.id))
      .where(
        and(
          eq(document.entityType, entityType),
          eq(document.entityId, entityId)
        )
      )
      .orderBy(document.createdAt);

    return rows;
  }

  async update(
    id: number,
    data: Partial<Pick<SelectDocument, 'titulo' | 'categoria' | 'notas'>>
  ) {
    const [result] = await db
      .update(document)
      .set(data)
      .where(eq(document.id, id))
      .returning();
    return result;
  }

  async listAll(userId: string): Promise<DocumentListItem[]> {
    const rows = await db
      .select({
        id: document.id,
        titulo: document.titulo,
        url: document.url,
        nombreArchivo: document.nombreArchivo,
        extension: document.extension,
        tamano: document.tamano,
        categoria: document.categoria,
        notas: document.notas,
        entityType: document.entityType,
        entityId: document.entityId,
        uploadedBy: document.uploadedBy,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        uploaderName: users.name,
      })
      .from(document)
      .leftJoin(users, eq(document.uploadedBy, users.id))
      .where(eq(document.uploadedBy, userId))
      .orderBy(document.createdAt);
    return rows;
  }

  async listAllWithEntity(): Promise<DocumentDashboardItem[]> {
    const rows = await db
      .select({
        id: document.id,
        titulo: document.titulo,
        url: document.url,
        nombreArchivo: document.nombreArchivo,
        extension: document.extension,
        tamano: document.tamano,
        categoria: document.categoria,
        notas: document.notas,
        entityType: document.entityType,
        entityId: document.entityId,
        uploadedBy: document.uploadedBy,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        uploaderName: users.name,
        nplTitle:       npl.tituloOperacion,
        taskTitle:      task.title,
        // Título de la nota del expediente: primer item del array JSONB
        expedienteNotaTitulo: sql<string | null>`${expedienteNotas.notaItems}->0->>'titulo'`,
        // nplId del NPL al que pertenece la nota (para construir la URL de edición)
        expedienteNotaNplId: expedienteNotas.nplId,
      })
      .from(document)
      .leftJoin(users,           eq(document.uploadedBy, users.id))
      .leftJoin(npl,             and(eq(document.entityType, 'NPL'),             eq(document.entityId, npl.id)))
      .leftJoin(task,            and(eq(document.entityType, 'TASK'),            eq(document.entityId, task.id)))
      .leftJoin(expedienteNotas, and(eq(document.entityType, 'EXPEDIENTE_NOTA'), eq(document.entityId, expedienteNotas.id)))
      .orderBy(desc(document.createdAt));

    return rows.map((row) => {
      let entityTitle: string | null = null;
      let entityEditUrl = '';

      if (row.entityType === 'NPL') {
        entityTitle   = row.nplTitle ?? null;
        entityEditUrl = `/dashboard/npl/${row.entityId}/edit`;
      } else if (row.entityType === 'TASK') {
        entityTitle   = row.taskTitle ?? null;
        entityEditUrl = `/dashboard/tasks/${row.entityId}/edit`;
      } else if (row.entityType === 'EXPEDIENTE_NOTA') {
        // Título: "Expediente · <primer titulo del item>"
        entityTitle   = row.expedienteNotaTitulo
          ? `Expediente · ${row.expedienteNotaTitulo}`
          : `Nota expediente #${row.entityId}`;
        // Enlace al NPL al que pertenece la nota, tab E
        entityEditUrl = row.expedienteNotaNplId
          ? `/dashboard/npl/${row.expedienteNotaNplId}/edit`
          : '';
      }

      return {
        ...row,
        entityTitle,
        entityEditUrl,
      };
    });
  }

  /**
   * Devuelve los usuarios que han subido al menos un documento,
   * ordenados por nombre — para poblar el select de filtro.
   */
  async listUploaders(): Promise<Array<{ id: string; name: string }>> {
    const rows = await db
      .selectDistinct({ id: users.id, name: users.name })
      .from(document)
      .innerJoin(users, eq(document.uploadedBy, users.id))
      .orderBy(users.name);
    return rows.map((r) => ({ id: r.id, name: r.name ?? r.id }));
  }

  async remove(id: number) {
    await db.delete(document).where(eq(document.id, id));
  }
}

export const documentRepository = new DocumentRepository();
