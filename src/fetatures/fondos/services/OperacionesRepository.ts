import { db } from '@/src/db';
import { operaciones } from '@/src/db/schema/operaciones';
import { eq, and, inArray } from 'drizzle-orm';
import type { SelectOperacion, OperacionStatus } from '@/src/db/schema/operaciones';

class OperacionesRepository {
  async findAll(): Promise<SelectOperacion[]> {
    return db.select().from(operaciones).orderBy(operaciones.id);
  }

  async findByCartera(carteraId: number): Promise<SelectOperacion[]> {
    return db.select().from(operaciones).where(eq(operaciones.carteraId, carteraId)).orderBy(operaciones.id);
  }

  async findByFondo(fondoId: number): Promise<SelectOperacion[]> {
    return db.select().from(operaciones).where(eq(operaciones.fondoId, fondoId)).orderBy(operaciones.id);
  }

  async findById(id: number): Promise<SelectOperacion | undefined> {
    const [row] = await db.select().from(operaciones).where(eq(operaciones.id, id)).limit(1);
    return row;
  }

  /** Devuelve el conjunto de main_key existentes (para deduplicar en carga) */
  async findExistingMainKeys(): Promise<Set<string>> {
    const rows = await db.select({ mainKey: operaciones.mainKey }).from(operaciones);
    return new Set(rows.map(r => r.mainKey).filter(Boolean) as string[]);
  }

  async countByCartera(carteraId: number): Promise<number> {
    const result = await db.select({ id: operaciones.id }).from(operaciones).where(eq(operaciones.carteraId, carteraId));
    return result.length;
  }

  async deleteNuevosByCartera(carteraId: number): Promise<number> {
    const toDelete = await db.select({ id: operaciones.id }).from(operaciones)
      .where(and(eq(operaciones.carteraId, carteraId), eq(operaciones.statusTratamiento, 'nuevo')));
    if (toDelete.length === 0) return 0;
    await db.delete(operaciones)
      .where(and(eq(operaciones.carteraId, carteraId), eq(operaciones.statusTratamiento, 'nuevo')));
    return toDelete.length;
  }

  async deleteByIds(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    await db.delete(operaciones).where(inArray(operaciones.id, ids));
    return ids.length;
  }

  async updateStatus(id: number, statusTratamiento: OperacionStatus, fechaTratamiento: string): Promise<SelectOperacion | undefined> {
    const [row] = await db.update(operaciones)
      .set({ statusTratamiento, fechaTratamiento })
      .where(eq(operaciones.id, id)).returning();
    return row;
  }

  async deleteByCartera(carteraId: number): Promise<void> {
    await db.delete(operaciones).where(eq(operaciones.carteraId, carteraId));
  }
}

export const operacionesRepository = new OperacionesRepository();
