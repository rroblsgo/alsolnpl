import { User } from 'better-auth';
import { notFound } from 'next/navigation';
import { ClienteInput } from '../schemas/clienteSchema';
import { ClientePolicy } from '../policies/ClientePolicy';
import { IClienteRepository, clienteRepository } from './ClienteRepository';
import {
  ClienteEstado,
  ClienteListItem,
  SelectCliente,
} from '../types/cliente.types';

class ClienteService {
  constructor(private repo: IClienteRepository) {}

  async createCliente(
    data: ClienteInput,
    creatorId: string
  ): Promise<SelectCliente> {
    return this.repo.create({
      ...data,
      fechaConsentimiento: data.fechaConsentimiento
        ? new Date(data.fechaConsentimiento)
        : null,
      creatorId,
    });
  }

  async getCliente(id: number): Promise<SelectCliente> {
    const current = await this.repo.findById(id);
    if (!current) notFound();
    return current;
  }

  async getClienteForEdit(id: number, user: User): Promise<SelectCliente> {
    const current = await this.getCliente(id);
    if (!ClientePolicy.canEdit(user, current)) {
      throw new Error('No tienes permisos para editar este cliente');
    }
    return current;
  }

  async listUserClientes(_userId: string): Promise<ClienteListItem[]> {
    // OFFICE MODE: se devuelven todos los clientes de la oficina
    return this.repo.listAll();
  }

  async updateCliente(
    id: number,
    data: ClienteInput,
    user: User
  ): Promise<SelectCliente> {
    const current = await this.getCliente(id);
    if (!ClientePolicy.canEdit(user, current)) {
      throw new Error('No tienes permisos para editar este cliente');
    }
    const result = await this.repo.update(id, {
      ...data,
      fechaConsentimiento: data.fechaConsentimiento
        ? new Date(data.fechaConsentimiento)
        : null,
    });
    if (!result) notFound();
    return result;
  }

  async updateEstado(
    id: number,
    estado: ClienteEstado,
    user: User
  ): Promise<SelectCliente> {
    const current = await this.getCliente(id);
    if (!ClientePolicy.canEdit(user, current)) {
      throw new Error(
        'No tienes permisos para cambiar el estado de este cliente'
      );
    }
    const result = await this.repo.updateEstado(id, estado);
    if (!result) notFound();
    return result;
  }

  async deleteCliente(id: number, user: User): Promise<void> {
    const current = await this.getCliente(id);
    if (!ClientePolicy.canDelete(user, current)) {
      throw new Error('No tienes permisos para eliminar este cliente');
    }
    await this.repo.remove(id);
  }
}

export const clienteService = new ClienteService(clienteRepository);
