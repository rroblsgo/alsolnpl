import { User } from 'better-auth';
import { notFound } from 'next/navigation';
import { NplInput } from '../schemas/nplSchema';
import { NplPolicy } from '../policies/NplPolicy';
import { INplRepository, nplRepository } from './NplRepository';
import { NplEstado, NplListItem, SelectNpl } from '../types/npl.types';
import { calcularRentabilidad } from '../utils/npl-calc';
export { calcularRentabilidad };

// ── Utilidad: construye el código NPL ─────────────────────────────────────────
// Formato: F + SS(sede) + AA(año 2 dígitos) + nnnnn(contador 5 dígitos, 0-padded)
export function generarCodigoNpl(ultimoId: number): string {
  const sede = '05';
  const anyo = new Date().getFullYear().toString().slice(-2);
  const contador = String(ultimoId + 1).padStart(5, '0');
  return `F${sede}${anyo}${contador}`;
}

// ── Mapeador de campos del form → DB ──────────────────────────────────────────
function mapInputToDb(data: NplInput) {
  return {
    ...data,
    superficieConst: data.superficieConst || null,
    superficieParcela: data.superficieParcela || null,
    anyConstruccion: data.anyConstruccion ? parseInt(data.anyConstruccion) : null,
    tasacionSubasta: data.tasacionSubasta || null,
    costeAdquisicionCredito: data.costeAdquisicionCredito || null,
    principal: data.principal || null,
    intereses: data.intereses || null,
    costas: data.costas || null,
    fechaCalculada: data.fechaCalculada || null,
    impuestosAjd: data.impuestosAjd || null,
    costesNotariaRegistro: data.costesNotariaRegistro || null,
    gastosDacion: data.gastosDacion || null,
    precioMercado: data.precioMercado || null,
    precioVentaRapida: data.precioVentaRapida || null,
    comisionIntermediacion: data.comisionIntermediacion || null,
    pujaProbable: data.pujaProbable || null,
    fechaCompra: data.fechaCompra || null,
    fechaTerminacion: data.fechaTerminacion || null,
    numProcedimiento: data.numProcedimiento || null,
    autoDespachoEjecucion: data.autoDespachoEjecucion || null,
    actuacionesJudiciales: data.actuacionesJudiciales ?? [],
    riesgosJuridicos: data.riesgosJuridicos || null,
    notasInternas: data.notasInternas || null,
    informacionInversor: data.informacionInversor || null,
    fondo: data.fondo || null,
    nuestroCodigoNpl: data.nuestroCodigoNpl || null,
  };
}

class NplService {
  constructor(private nplRepository: INplRepository) {}

  async createNpl(data: NplInput, creatorId: string): Promise<SelectNpl> {
    // Obtener el último ID para generar el código
    const ultimoId = await this.nplRepository.getLastId();
    const nuestroCodigoNpl = generarCodigoNpl(ultimoId);

    return this.nplRepository.create({
      ...mapInputToDb(data),
      nuestroCodigoNpl,
      creatorId,
    });
  }

  async getNpl(nplId: number): Promise<SelectNpl> {
    const current = await this.nplRepository.findById(nplId);
    if (!current) notFound();
    return current;
  }

  async getNplForEdit(nplId: number, user: User): Promise<SelectNpl> {
    const current = await this.getNpl(nplId);
    if (!NplPolicy.canEdit(user, current)) {
      throw new Error('No tienes permisos para editar este NPL');
    }
    return current;
  }

  async listUserNpls(_userId: string): Promise<NplListItem[]> {
    // OFFICE MODE: se devuelven todos los NPLs de la oficina
    return this.nplRepository.listAll();
  }

  async listPublicNpls(): Promise<NplListItem[]> {
    return this.nplRepository.listPublicos();
  }

  async updateNpl(nplId: number, data: NplInput, user: User): Promise<SelectNpl> {
    const current = await this.getNpl(nplId);
    if (!NplPolicy.canEdit(user, current)) {
      throw new Error('No tienes permisos para editar este NPL');
    }

    // Preservar el código generado originalmente
    const result = await this.nplRepository.update(nplId, {
      ...mapInputToDb(data),
      nuestroCodigoNpl: current.nuestroCodigoNpl, // no se modifica
    });
    if (!result) notFound();
    return result;
  }

  async updateNplEstado(nplId: number, estado: NplEstado, user: User): Promise<SelectNpl> {
    const current = await this.getNpl(nplId);
    if (!NplPolicy.canChangeEstado(user, current)) {
      throw new Error('No tienes permisos para cambiar el estado de este NPL');
    }
    const result = await this.nplRepository.updateEstado(nplId, estado);
    if (!result) notFound();
    return result;
  }

  async deleteNpl(nplId: number, user: User): Promise<void> {
    const current = await this.getNpl(nplId);
    if (!NplPolicy.canDelete(user, current)) {
      throw new Error('No tienes permisos para eliminar este NPL');
    }
    await this.nplRepository.remove(nplId);
  }
}

export const nplService = new NplService(nplRepository);
