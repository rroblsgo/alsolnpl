import { db } from '@/src/db';
import { operaciones } from '@/src/db/schema/operaciones';
import { eq, and, inArray, ilike, or, sql, count } from 'drizzle-orm';
import type { SelectOperacion, OperacionStatus } from '@/src/db/schema/operaciones';

const PAGE_SIZE = 50;

export type OperacionesPaginatedResult = {
  rows:       SelectOperacion[];
  total:      number;
  page:       number;
  pageSize:   number;
  pageCount:  number;
};

class OperacionesRepository {
  async findAll(): Promise<SelectOperacion[]> {
    return db.select().from(operaciones).orderBy(operaciones.id);
  }

  async findPaginated(
    page     = 1,
    pageSize = PAGE_SIZE,
    search   = '',
    filters: Partial<Record<string, string>> = {},
  ): Promise<OperacionesPaginatedResult> {
    const offset = (page - 1) * pageSize;

    // Construir condiciones
    const conditions = [];

    if (search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(operaciones.expedienteId,     q),
          ilike(operaciones.prestamoId,       q),
          ilike(operaciones.deudorNombre,     q),
          ilike(operaciones.municipio,        q),
          ilike(operaciones.provincia,        q),
          ilike(operaciones.direccionCompleta,q),
          ilike(operaciones.referenciaCatastral, q),
          ilike(operaciones.propertyId,       q),
          ilike(operaciones.mainKey,          q),
        )
      );
    }

    // Filtros exactos por columna
    if (filters.statusTratamiento) {
      conditions.push(eq(operaciones.statusTratamiento, filters.statusTratamiento as OperacionStatus));
    }
    if (filters.provincia) {
      conditions.push(ilike(operaciones.provincia, filters.provincia));
    }
    if (filters.municipio) {
      conditions.push(ilike(operaciones.municipio, filters.municipio));
    }
    if (filters.comunidadAutonoma) {
      conditions.push(ilike(operaciones.comunidadAutonoma, filters.comunidadAutonoma));
    }
    if (filters.propertyTipo) {
      conditions.push(ilike(operaciones.propertyTipo, filters.propertyTipo));
    }
    if (filters.nplReo) {
      conditions.push(ilike(operaciones.nplReo, filters.nplReo));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db.select().from(operaciones)
        .where(where)
        .orderBy(operaciones.id)
        .limit(pageSize)
        .offset(offset),
      db.select({ total: count() }).from(operaciones).where(where),
    ]);

    return {
      rows,
      total: Number(total),
      page,
      pageSize,
      pageCount: Math.ceil(Number(total) / pageSize),
    };
  }

  async findDistinctValues(column: 'statusTratamiento' | 'provincia' | 'comunidadAutonoma' | 'propertyTipo' | 'nplReo'): Promise<string[]> {
    const col = operaciones[column];
    // statusTratamiento es enum — no se puede comparar con ''
    const whereClause = column === 'statusTratamiento'
      ? sql`${col} IS NOT NULL`
      : sql`${col} IS NOT NULL AND ${col} != ''`;
    const rows = await db
      .selectDistinct({ val: col })
      .from(operaciones)
      .where(whereClause)
      .orderBy(col);
    return rows.map(r => String(r.val)).filter(Boolean);
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

  async updateStatus(id: number, statusTratamiento: OperacionStatus, fechaTratamiento: string, notasTratamiento?: string): Promise<SelectOperacion | undefined> {
    const [row] = await db.update(operaciones)
      .set({ statusTratamiento, fechaTratamiento, notasTratamiento: notasTratamiento ?? null })
      .where(eq(operaciones.id, id)).returning();
    return row;
  }

  async deleteByCartera(carteraId: number): Promise<void> {
    await db.delete(operaciones).where(eq(operaciones.carteraId, carteraId));
  }
}

export const operacionesRepository = new OperacionesRepository();
