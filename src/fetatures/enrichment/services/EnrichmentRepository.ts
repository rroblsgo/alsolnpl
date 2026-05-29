import { db } from '@/src/db';
import { operacionEnrichments, enrichmentSources } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import type {
  InsertEnrichment,
  SelectEnrichment,
  InsertEnrichmentSource,
  SelectEnrichmentSource,
} from '@/src/db/schema';

class EnrichmentRepository {
  /** Obtiene el enrichment de una operación, si existe */
  async findByOperacionId(operacionId: number): Promise<SelectEnrichment | undefined> {
    const [row] = await db
      .select()
      .from(operacionEnrichments)
      .where(eq(operacionEnrichments.operacionId, operacionId))
      .limit(1);
    return row;
  }

  async findById(id: number): Promise<SelectEnrichment | undefined> {
    const [row] = await db
      .select()
      .from(operacionEnrichments)
      .where(eq(operacionEnrichments.id, id))
      .limit(1);
    return row;
  }

  /** Crea el registro de enrichment (vacío) al seleccionar la operación */
  async create(data: InsertEnrichment): Promise<SelectEnrichment> {
    const [row] = await db
      .insert(operacionEnrichments)
      .values(data)
      .returning();
    return row;
  }

  /** Actualiza campos del enrichment de forma parcial (guardado por sección) */
  async update(
    id: number,
    data: Partial<InsertEnrichment>
  ): Promise<SelectEnrichment | undefined> {
    const [row] = await db
      .update(operacionEnrichments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(operacionEnrichments.id, id))
      .returning();
    return row;
  }

  /** Vincula el NPL creado tras la promoción */
  async setNplId(
    id: number,
    nplId: number
  ): Promise<SelectEnrichment | undefined> {
    const [row] = await db
      .update(operacionEnrichments)
      .set({ nplId, updatedAt: new Date() })
      .where(eq(operacionEnrichments.id, id))
      .returning();
    return row;
  }

  async delete(id: number): Promise<void> {
    await db
      .delete(operacionEnrichments)
      .where(eq(operacionEnrichments.id, id));
  }

  // ── Sources ──────────────────────────────────────────────────────────────

  async findSourcesByEnrichmentId(
    enrichmentId: number
  ): Promise<SelectEnrichmentSource[]> {
    return db
      .select()
      .from(enrichmentSources)
      .where(eq(enrichmentSources.enrichmentId, enrichmentId));
  }

  async addSource(data: InsertEnrichmentSource): Promise<SelectEnrichmentSource> {
    const [row] = await db
      .insert(enrichmentSources)
      .values(data)
      .returning();
    return row;
  }
}

export const enrichmentRepository = new EnrichmentRepository();
