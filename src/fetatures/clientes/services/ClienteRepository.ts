import { db } from '@/src/db';
import { clientes, users } from '@/src/db/schema';
import { desc, asc, eq, ilike, or } from 'drizzle-orm';
import {
  ClienteEstado,
  ClienteListItem,
  InsertCliente,
  SelectCliente,
} from '../types/cliente.types';

export interface IClienteRepository {
  create(data: InsertCliente): Promise<SelectCliente>;
  findById(id: number): Promise<SelectCliente | undefined>;
  listAll(): Promise<ClienteListItem[]>;
  listByUser(userId: string): Promise<ClienteListItem[]>;
  update(
    id: number,
    data: Partial<InsertCliente>
  ): Promise<SelectCliente | undefined>;
  updateEstado(
    id: number,
    estado: ClienteEstado
  ): Promise<SelectCliente | undefined>;
  remove(id: number): Promise<void>;
}

// Campos comunes para los selects de listado
const clienteSelectFields = {
  id: clientes.id,
  nombre: clientes.nombre,
  dni: clientes.dni,
  empresa: clientes.empresa,
  nif: clientes.nif,
  imagen: clientes.imagen,
  direccion: clientes.direccion,
  provincia: clientes.provincia,
  municipio: clientes.municipio,
  codigoPostal: clientes.codigoPostal,
  emails: clientes.emails,
  telefonos: clientes.telefonos,
  contactos: clientes.contactos,
  perfilInversor: clientes.perfilInversor,
  ocupacionPrincipal: clientes.ocupacionPrincipal,
  rangoCapitalInvertir: clientes.rangoCapitalInvertir,
  activosInteresado: clientes.activosInteresado,
  experienciaPreviaDetalle: clientes.experienciaPreviaDetalle,
  informadoNplDetalle: clientes.informadoNplDetalle,
  estado: clientes.estado,
  fuenteCaptacion: clientes.fuenteCaptacion,
  notas: clientes.notas,
  consentimientoRgpd: clientes.consentimientoRgpd,
  fechaConsentimiento: clientes.fechaConsentimiento,
  createdAt: clientes.createdAt,
  updatedAt: clientes.updatedAt,
  creatorId: clientes.creatorId,
  creatorName: users.name,
};

class ClienteRepository implements IClienteRepository {
  async create(data: InsertCliente) {
    const [result] = await db.insert(clientes).values(data).returning();
    return result;
  }

  async findById(id: number) {
    const [result] = await db
      .select()
      .from(clientes)
      .where(eq(clientes.id, id))
      .limit(1);
    return result;
  }

  // OFFICE MODE: devuelve todos los clientes de la oficina
  async listAll(): Promise<ClienteListItem[]> {
    return db
      .select(clienteSelectFields)
      .from(clientes)
      .innerJoin(users, eq(clientes.creatorId, users.id))
      .orderBy(asc(clientes.nombre));
  }

  // Mantenido por compatibilidad; útil cuando se implementen filtros por usuario
  async listByUser(userId: string): Promise<ClienteListItem[]> {
    return db
      .select(clienteSelectFields)
      .from(clientes)
      .innerJoin(users, eq(clientes.creatorId, users.id))
      .where(eq(clientes.creatorId, userId))
      .orderBy(asc(clientes.nombre));
  }

  async update(id: number, data: Partial<InsertCliente>) {
    const [result] = await db
      .update(clientes)
      .set({ ...data })
      .where(eq(clientes.id, id))
      .returning();
    return result;
  }

  async updateEstado(id: number, estado: ClienteEstado) {
    const [result] = await db
      .update(clientes)
      .set({ estado })
      .where(eq(clientes.id, id))
      .returning();
    return result;
  }

  async remove(id: number) {
    await db.delete(clientes).where(eq(clientes.id, id));
  }
}

export const clienteRepository = new ClienteRepository();
