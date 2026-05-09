import { db } from '@/src/db';
import { nplDeudores } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import {
  InsertNplDeudor,
  SelectNplDeudor,
} from '../types/deudor.types';

export interface IDeudorRepository {
  create(data: InsertNplDeudor): Promise<SelectNplDeudor>;
  findById(deudorId: number): Promise<SelectNplDeudor | undefined>;
  listByNpl(nplId: number): Promise<SelectNplDeudor[]>;
  update(deudorId: number, data: Partial<InsertNplDeudor>): Promise<SelectNplDeudor | undefined>;
  remove(deudorId: number): Promise<void>;
  hasPrincipal(nplId: number): Promise<boolean>;
}

class DeudorRepository implements IDeudorRepository {
  async create(data: InsertNplDeudor) {
    const [result] = await db.insert(nplDeudores).values(data).returning();
    return result;
  }

  async findById(deudorId: number) {
    const [result] = await db
      .select()
      .from(nplDeudores)
      .where(eq(nplDeudores.id, deudorId))
      .limit(1);
    return result;
  }

  async listByNpl(nplId: number) {
    return db
      .select()
      .from(nplDeudores)
      .where(eq(nplDeudores.nplId, nplId))
      // Principal primero, luego por fecha de creación
      .orderBy(asc(nplDeudores.esPrincipal), asc(nplDeudores.createdAt));
  }

  async update(deudorId: number, data: Partial<InsertNplDeudor>) {
    const [result] = await db
      .update(nplDeudores)
      .set(data)
      .where(eq(nplDeudores.id, deudorId))
      .returning();
    return result;
  }

  async remove(deudorId: number) {
    await db.delete(nplDeudores).where(eq(nplDeudores.id, deudorId));
  }

  async hasPrincipal(nplId: number) {
    const [result] = await db
      .select({ id: nplDeudores.id })
      .from(nplDeudores)
      .where(eq(nplDeudores.nplId, nplId))
      .limit(1);
    return !!result;
  }
}

export const deudorRepository = new DeudorRepository();
