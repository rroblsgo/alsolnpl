import { db } from '@/src/db';
import { npl, users } from '@/src/db/schema';
import { desc, eq, max } from 'drizzle-orm';
import {
  InsertNpl,
  NplEstado,
  NplListItem,
  SelectNpl,
} from '../types/npl.types';

export interface INplRepository {
  getLastId(): Promise<number>;
  create(data: InsertNpl): Promise<SelectNpl>;
  findById(nplId: number): Promise<SelectNpl | undefined>;
  listAll(): Promise<NplListItem[]>;
  listByUser(userId: string): Promise<NplListItem[]>;
  listPublicos(): Promise<NplListItem[]>;
  update(nplId: number, data: Partial<InsertNpl>): Promise<SelectNpl | undefined>;
  updateEstado(nplId: number, estado: NplEstado): Promise<SelectNpl | undefined>;
  remove(nplId: number): Promise<void>;
}

// Columnas comunes para selects con join a users
const nplSelectFields = {
  id: npl.id,
  nuestroCodigoNpl: npl.nuestroCodigoNpl,
  tituloOperacion: npl.tituloOperacion,
  referenciaOrigen: npl.referenciaOrigen,
  fondo: npl.fondo,
  direccion: npl.direccion,
  municipio: npl.municipio,
  provincia: npl.provincia,
  codigoPostal: npl.codigoPostal,
  tipoInmueble: npl.tipoInmueble,
  distribucion: npl.distribucion,
  distribucionResumida: npl.distribucionResumida,
  superficieConst: npl.superficieConst,
  superficieParcela: npl.superficieParcela,
  superficieDetalles: npl.superficieDetalles,
  anyConstruccion: npl.anyConstruccion,
  refCatastral: npl.refCatastral,
  fincaRegistral: npl.fincaRegistral,
  datosRegistro: npl.datosRegistro,
  imagenAsociada: npl.imagenAsociada,
  imagenesAdicionales: npl.imagenesAdicionales,
  costeAdquisicionCredito: npl.costeAdquisicionCredito,
  principal: npl.principal,
  intereses: npl.intereses,
  costas: npl.costas,
  fechaCalculada: npl.fechaCalculada,
  impuestosAjd: npl.impuestosAjd,
  costesNotariaRegistro: npl.costesNotariaRegistro,
  gastosDacion: npl.gastosDacion,
  precioMercado: npl.precioMercado,
  precioVentaRapida: npl.precioVentaRapida,
  comisionIntermediacion: npl.comisionIntermediacion,
  pujaProbable: npl.pujaProbable,
  fechaCompra: npl.fechaCompra,
  fechaTerminacion: npl.fechaTerminacion,
  gastosDiversos: npl.gastosDiversos,
  procedimiento: npl.procedimiento,
  numProcedimiento: npl.numProcedimiento,
  juzgado: npl.juzgado,
  ejecutante: npl.ejecutante,
  autoDespachoEjecucion: npl.autoDespachoEjecucion,
  prestamoHipotecaDetalles: npl.prestamoHipotecaDetalles,
  tasacionSubasta: npl.tasacionSubasta,
  actuacionesJudiciales: npl.actuacionesJudiciales,
  actuacionesSeguidas: npl.actuacionesSeguidas,
  riesgosJuridicos: npl.riesgosJuridicos,
  notasInternas: npl.notasInternas,
  informacionInversor: npl.informacionInversor,
  estado: npl.estado,
  esPublico: npl.esPublico,
  createdAt: npl.createdAt,
  updatedAt: npl.updatedAt,
  creatorId: npl.creatorId,
  creatorName: users.name,
};

class NplRepository implements INplRepository {
  async getLastId(): Promise<number> {
    const [result] = await db.select({ maxId: max(npl.id) }).from(npl);
    return result?.maxId ?? 0;
  }

  async create(data: InsertNpl) {
    const [result] = await db.insert(npl).values(data).returning();
    return result;
  }

  async findById(nplId: number) {
    const [result] = await db
      .select(nplSelectFields)
      .from(npl)
      .innerJoin(users, eq(npl.creatorId, users.id))
      .where(eq(npl.id, nplId))
      .limit(1);
    return result;
  }

  async listAll(): Promise<NplListItem[]> {
    return db
      .select(nplSelectFields)
      .from(npl)
      .innerJoin(users, eq(npl.creatorId, users.id))
      .orderBy(desc(npl.createdAt));
  }

  async listByUser(userId: string): Promise<NplListItem[]> {
    return db
      .select(nplSelectFields)
      .from(npl)
      .innerJoin(users, eq(npl.creatorId, users.id))
      .where(eq(npl.creatorId, userId))
      .orderBy(desc(npl.createdAt));
  }

  async listPublicos(): Promise<NplListItem[]> {
    return db
      .select(nplSelectFields)
      .from(npl)
      .innerJoin(users, eq(npl.creatorId, users.id))
      .where(eq(npl.esPublico, true))
      .orderBy(desc(npl.createdAt));
  }

  async update(nplId: number, data: Partial<InsertNpl>) {
    const [result] = await db
      .update(npl)
      .set({ ...data })
      .where(eq(npl.id, nplId))
      .returning();
    return result;
  }

  async updateEstado(nplId: number, estado: NplEstado) {
    const [result] = await db
      .update(npl)
      .set({ estado })
      .where(eq(npl.id, nplId))
      .returning();
    return result;
  }

  async remove(nplId: number) {
    await db.delete(npl).where(eq(npl.id, nplId));
  }
}

export const nplRepository = new NplRepository();
