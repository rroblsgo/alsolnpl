import { User } from 'better-auth';
import { notFound } from 'next/navigation';
import { DeudorInput } from '../schemas/deudorSchema';
import { DeudorPolicy } from '../policies/DeudorPolicy';
import { IDeudorRepository, deudorRepository } from './DeudorRepository';
import { SelectNplDeudor } from '../types/deudor.types';
import { SelectNpl } from '@/src/fetatures/gestion_npl/types/npl.types';

class DeudorService {
  constructor(private deudorRepository: IDeudorRepository) {}

  async listByNpl(nplId: number): Promise<SelectNplDeudor[]> {
    return this.deudorRepository.listByNpl(nplId);
  }

  async getDeudor(deudorId: number): Promise<SelectNplDeudor> {
    const deudor = await this.deudorRepository.findById(deudorId);
    if (!deudor) notFound();
    return deudor;
  }

  async createDeudor(
    data: DeudorInput,
    nplId: number,
    npl: SelectNpl,
    user: User
  ): Promise<SelectNplDeudor> {
    if (!DeudorPolicy.canCreate(user, npl)) {
      throw new Error('No tienes permisos para añadir deudores a este NPL');
    }

    // Si se marca como principal, verificar que no haya ya uno
    if (data.esPrincipal) {
      const deudores = await this.deudorRepository.listByNpl(nplId);
      const principalExistente = deudores.find((d) => d.esPrincipal);
      if (principalExistente) {
        throw new Error(
          'Ya existe un deudor principal. Edítalo o desmárcalo antes de crear uno nuevo.'
        );
      }
    }

    return this.deudorRepository.create({ ...data, nplId });
  }

  async updateDeudor(
    deudorId: number,
    data: DeudorInput,
    npl: SelectNpl,
    user: User
  ): Promise<SelectNplDeudor> {
    if (!DeudorPolicy.canEdit(user, npl)) {
      throw new Error('No tienes permisos para editar este deudor');
    }

    await this.getDeudor(deudorId); // verifica que existe

    // Si se intenta marcar como principal, verificar que no haya otro
    if (data.esPrincipal) {
      const deudores = await this.deudorRepository.listByNpl(npl.id);
      const principalExistente = deudores.find(
        (d) => d.esPrincipal && d.id !== deudorId
      );
      if (principalExistente) {
        throw new Error(
          'Ya existe un deudor principal. Edítalo o desmárcalo antes de cambiar este.'
        );
      }
    }

    const result = await this.deudorRepository.update(deudorId, data);
    if (!result) notFound();
    return result;
  }

  async deleteDeudor(
    deudorId: number,
    npl: SelectNpl,
    user: User
  ): Promise<void> {
    if (!DeudorPolicy.canDelete(user, npl)) {
      throw new Error('No tienes permisos para eliminar este deudor');
    }
    await this.getDeudor(deudorId); // verifica que existe
    await this.deudorRepository.remove(deudorId);
  }
}

export const deudorService = new DeudorService(deudorRepository);
