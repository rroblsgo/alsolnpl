import { User } from 'better-auth';
import { notFound } from 'next/navigation';
import { ExpedienteNotaInput } from '../schemas/expedienteSchema';
import { expedienteRepository, IExpedienteRepository } from './ExpedienteRepository';
import { ExpedienteNotaListItem, SelectExpedienteNota } from '../types/expediente.types';
import { NotaExpedienteItem } from '@/src/db/schema/expediente_npl';

class ExpedienteService {
  constructor(private readonly repo: IExpedienteRepository) {}

  async listByNpl(nplId: number): Promise<ExpedienteNotaListItem[]> {
    return this.repo.listByNpl(nplId);
  }

  async getNotaOrThrow(id: number): Promise<SelectExpedienteNota> {
    const nota = await this.repo.findById(id);
    if (!nota) notFound();
    return nota;
  }

  // Crea la nota y devuelve el objeto enriquecido con names (para el cliente)
  async createNota(
    nplId: number,
    input: ExpedienteNotaInput,
    creatorId: string
  ): Promise<ExpedienteNotaListItem> {
    const created = await this.repo.create({
      nplId,
      tipoNota:             input.tipoNota,
      relevanciaNota:       input.relevanciaNota,
      statusNota:           input.statusNota,
      usuarioRelacionadoId: input.usuarioRelacionadoId || null,
      notaItems:            input.notaItems as NotaExpedienteItem[],
      creatorId,
    });
    // Recuperar con joins para tener creatorName y usuarioRelacionadoName
    const withNames = await this.repo.findByIdWithNames(created.id);
    return withNames!;
  }

  async updateNota(
    id: number,
    input: ExpedienteNotaInput,
    _user: User
  ): Promise<SelectExpedienteNota | undefined> {
    return this.repo.update(id, {
      tipoNota:             input.tipoNota,
      relevanciaNota:       input.relevanciaNota,
      statusNota:           input.statusNota,
      usuarioRelacionadoId: input.usuarioRelacionadoId || null,
      notaItems:            input.notaItems as NotaExpedienteItem[],
    });
  }

  async deleteNota(id: number, _user: User): Promise<void> {
    await this.repo.remove(id);
  }

  async listUserOptions() {
    return this.repo.listUserOptions();
  }
}

export const expedienteService = new ExpedienteService(expedienteRepository);
