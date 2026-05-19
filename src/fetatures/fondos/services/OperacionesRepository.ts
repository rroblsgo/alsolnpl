import { db } from '@/src/db';
import { operaciones } from '@/src/db/schema/operaciones';
import { eq } from 'drizzle-orm';
import type { SelectOperacion } from '@/src/db/schema/operaciones';

class OperacionesRepository {
  async findByCartera(carteraId: number): Promise<SelectOperacion[]> {
    return db
      .select()
      .from(operaciones)
      .where(eq(operaciones.carteraId, carteraId))
      .orderBy(operaciones.id);
  }

  async findByFondo(fondoId: number): Promise<SelectOperacion[]> {
    return db
      .select()
      .from(operaciones)
      .where(eq(operaciones.fondoId, fondoId))
      .orderBy(operaciones.id);
  }

  async countByCartera(carteraId: number): Promise<number> {
    const result = await db
      .select({ id: operaciones.id })
      .from(operaciones)
      .where(eq(operaciones.carteraId, carteraId));
    return result.length;
  }

  async deleteByCartera(carteraId: number): Promise<void> {
    await db.delete(operaciones).where(eq(operaciones.carteraId, carteraId));
  }
}

export const operacionesRepository = new OperacionesRepository();
