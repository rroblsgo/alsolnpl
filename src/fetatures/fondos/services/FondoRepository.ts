import { db } from '@/src/db';
import { fondos, carteras, users } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import { FondoListItem, InsertFondo, SelectFondo, InsertCartera, SelectCartera } from '../types/fondo.types';

const fondoSelectFields = {
  id:            fondos.id,
  nombre:        fondos.nombre,
  dni:           fondos.dni,
  empresa:       fondos.empresa,
  nif:           fondos.nif,
  imagen:        fondos.imagen,
  direccion:     fondos.direccion,
  municipio:     fondos.municipio,
  provincia:     fondos.provincia,
  codigoPostal:  fondos.codigoPostal,
  emails:        fondos.emails,
  telefonos:     fondos.telefonos,
  contactos:     fondos.contactos,
  comisionGestion: fondos.comisionGestion,
  notas:         fondos.notas,
  createdAt:     fondos.createdAt,
  updatedAt:     fondos.updatedAt,
  creatorId:     fondos.creatorId,
  creatorName:   users.name,
};

class FondoRepository {
  async create(data: InsertFondo): Promise<SelectFondo> {
    const [result] = await db.insert(fondos).values(data).returning();
    return result;
  }

  async findById(id: number): Promise<SelectFondo | undefined> {
    const [result] = await db.select().from(fondos).where(eq(fondos.id, id)).limit(1);
    return result;
  }

  async listAll(): Promise<FondoListItem[]> {
    return db
      .select(fondoSelectFields)
      .from(fondos)
      .innerJoin(users, eq(fondos.creatorId, users.id))
      .orderBy(asc(fondos.nombre));
  }

  async update(id: number, data: Partial<InsertFondo>): Promise<SelectFondo | undefined> {
    const [result] = await db.update(fondos).set(data).where(eq(fondos.id, id)).returning();
    return result;
  }

  async remove(id: number): Promise<void> {
    await db.delete(fondos).where(eq(fondos.id, id));
  }

  // ─── Carteras ────────────────────────────────────────────────────────────
  async createCartera(data: InsertCartera): Promise<SelectCartera> {
    const [result] = await db.insert(carteras).values(data).returning();
    return result;
  }

  async findCarterasByFondo(fondoId: number): Promise<SelectCartera[]> {
    return db.select().from(carteras).where(eq(carteras.fondoId, fondoId)).orderBy(asc(carteras.carteraName));
  }

  async findCarteraById(id: number): Promise<SelectCartera | undefined> {
    const [result] = await db.select().from(carteras).where(eq(carteras.id, id)).limit(1);
    return result;
  }

  async updateCartera(id: number, data: Partial<InsertCartera>): Promise<SelectCartera | undefined> {
    const [result] = await db.update(carteras).set(data).where(eq(carteras.id, id)).returning();
    return result;
  }

  async removeCartera(id: number): Promise<void> {
    await db.delete(carteras).where(eq(carteras.id, id));
  }
}

export const fondoRepository = new FondoRepository();
