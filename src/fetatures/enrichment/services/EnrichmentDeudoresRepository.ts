import { db } from '@/src/db';
import { enrichmentDeudores } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import type { InsertEnrichmentDeudor, SelectEnrichmentDeudor } from '@/src/db/schema';

class EnrichmentDeudoresRepository {
  async findByEnrichmentId(enrichmentId: number): Promise<SelectEnrichmentDeudor[]> {
    return db
      .select()
      .from(enrichmentDeudores)
      .where(eq(enrichmentDeudores.enrichmentId, enrichmentId))
      .orderBy(enrichmentDeudores.createdAt);
  }

  async create(data: InsertEnrichmentDeudor): Promise<SelectEnrichmentDeudor> {
    const [row] = await db.insert(enrichmentDeudores).values(data).returning();
    return row;
  }

  async update(
    id: number,
    data: Partial<InsertEnrichmentDeudor>
  ): Promise<SelectEnrichmentDeudor | undefined> {
    const [row] = await db
      .update(enrichmentDeudores)
      .set(data)
      .where(eq(enrichmentDeudores.id, id))
      .returning();
    return row;
  }

  async delete(id: number): Promise<void> {
    await db.delete(enrichmentDeudores).where(eq(enrichmentDeudores.id, id));
  }

  /** Reemplaza todos los deudores de un enrichment (usado en guardado bulk) */
  async replaceAll(
    enrichmentId: number,
    deudores: Omit<InsertEnrichmentDeudor, 'enrichmentId'>[]
  ): Promise<SelectEnrichmentDeudor[]> {
    await db
      .delete(enrichmentDeudores)
      .where(eq(enrichmentDeudores.enrichmentId, enrichmentId));

    if (deudores.length === 0) return [];

    return db
      .insert(enrichmentDeudores)
      .values(deudores.map(d => ({ ...d, enrichmentId })))
      .returning();
  }
}

export const enrichmentDeudoresRepository = new EnrichmentDeudoresRepository();
