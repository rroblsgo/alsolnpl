import { db } from '@/src/db';
import { expedienteNotas, users } from '@/src/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  InsertExpedienteNota,
  SelectExpedienteNota,
  ExpedienteNotaListItem,
} from '../types/expediente.types';

export interface IExpedienteRepository {
  create(data: InsertExpedienteNota): Promise<SelectExpedienteNota>;
  findById(id: number): Promise<SelectExpedienteNota | undefined>;
  findByIdWithNames(id: number): Promise<ExpedienteNotaListItem | undefined>;
  listByNpl(nplId: number): Promise<ExpedienteNotaListItem[]>;
  update(id: number, data: Partial<InsertExpedienteNota>): Promise<SelectExpedienteNota | undefined>;
  remove(id: number): Promise<void>;
  listUserOptions(): Promise<Array<{ id: string; name: string; email: string }>>;
}

const buildSelectWithNames = (
  creator: ReturnType<typeof alias>,
  usuarioRel: ReturnType<typeof alias>,
) => ({
  id:                     expedienteNotas.id,
  nplId:                  expedienteNotas.nplId,
  tipoNota:               expedienteNotas.tipoNota,
  relevanciaNota:         expedienteNotas.relevanciaNota,
  statusNota:             expedienteNotas.statusNota,
  notaItems:              expedienteNotas.notaItems,
  usuarioRelacionadoId:   expedienteNotas.usuarioRelacionadoId,
  creatorId:              expedienteNotas.creatorId,
  createdAt:              expedienteNotas.createdAt,
  updatedAt:              expedienteNotas.updatedAt,
  creatorName:            creator.name,
  usuarioRelacionadoName: usuarioRel.name,
});

class ExpedienteRepository implements IExpedienteRepository {
  async create(data: InsertExpedienteNota) {
    const [result] = await db.insert(expedienteNotas).values(data).returning();
    return result;
  }

  async findById(id: number) {
    const [result] = await db
      .select().from(expedienteNotas).where(eq(expedienteNotas.id, id)).limit(1);
    return result;
  }

  async findByIdWithNames(id: number): Promise<ExpedienteNotaListItem | undefined> {
    const creator    = alias(users, 'exp_creator');
    const usuarioRel = alias(users, 'exp_usuario_rel');
    const [result]   = await db
      .select(buildSelectWithNames(creator, usuarioRel))
      .from(expedienteNotas)
      .innerJoin(creator,   eq(expedienteNotas.creatorId, creator.id))
      .leftJoin(usuarioRel, eq(expedienteNotas.usuarioRelacionadoId, usuarioRel.id))
      .where(eq(expedienteNotas.id, id))
      .limit(1);
    return result as ExpedienteNotaListItem | undefined;
  }

  async listByNpl(nplId: number): Promise<ExpedienteNotaListItem[]> {
    const creator    = alias(users, 'exp_creator');
    const usuarioRel = alias(users, 'exp_usuario_rel');
    return db
      .select(buildSelectWithNames(creator, usuarioRel))
      .from(expedienteNotas)
      .innerJoin(creator,   eq(expedienteNotas.creatorId, creator.id))
      .leftJoin(usuarioRel, eq(expedienteNotas.usuarioRelacionadoId, usuarioRel.id))
      .where(eq(expedienteNotas.nplId, nplId))
      .orderBy(sql`${expedienteNotas.notaItems}->0->>'fecha' DESC NULLS LAST`) as Promise<ExpedienteNotaListItem[]>;
  }

  async update(id: number, data: Partial<InsertExpedienteNota>) {
    const [result] = await db
      .update(expedienteNotas).set(data).where(eq(expedienteNotas.id, id)).returning();
    return result;
  }

  async remove(id: number) {
    await db.delete(expedienteNotas).where(eq(expedienteNotas.id, id));
  }

  async listUserOptions() {
    return db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users).orderBy(asc(users.name));
  }
}

export const expedienteRepository = new ExpedienteRepository();
