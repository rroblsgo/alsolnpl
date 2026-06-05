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
  // Convierte "" a null para campos numéricos (string que va a numeric en PG)
  const n = (v: string | null | undefined): string | null =>
    (v === '' || v === null || v === undefined) ? null : v;
  // Convierte "" a null para campos de texto
  const d = (v: string | null | undefined): string | null =>
    (v === '' || v === null || v === undefined) ? null : v;

  return {
    ...data,
    // Identificadores
    nuestroCodigoNpl: n(data.nuestroCodigoNpl),
    fondo:            n(data.fondo),
    // Numéricas — superficies
    superficieConst:     n(data.superficieConst),
    superficieUtil:      n(data.superficieUtil),
    superficieParcela:   n(data.superficieParcela),
    anyConstruccion:     data.anyConstruccion ? parseInt(data.anyConstruccion) : null,
    // Numéricas — valores catastrales
    valorRefCatastral: n(data.valorRefCatastral),
    valorCatastral:    n(data.valorCatastral),
    // Coordenadas
    latCatastro: n(data.latCatastro),
    lngCatastro: n(data.lngCatastro),
    // Numéricas — financieras B
    costeAdquisicionCredito: n(data.costeAdquisicionCredito),
    impuestosAjd:            n(data.impuestosAjd),
    costesNotariaRegistro:   n(data.costesNotariaRegistro),
    gastosDacion:            n(data.gastosDacion),
    precioMercado:           n(data.precioMercado),
    precioVentaRapida:       n(data.precioVentaRapida),
    comisionIntermediacion:  n(data.comisionIntermediacion),
    pujaProbable:            n(data.pujaProbable),
    // Numéricas — deuda C
    principal:  n(data.principal),
    intereses:  n(data.intereses),
    costas:     n(data.costas),
    // Numéricas — tasaciones
    tasacionSubasta: n(data.tasacionSubasta),
    tasacionActual:  n(data.tasacionActual),
    // Fechas
    fechaCompra:      d(data.fechaCompra),
    fechaTerminacion: d(data.fechaTerminacion),
    fechaCalculada:   d(data.fechaCalculada),
    fechaTasacion:    d(data.fechaTasacion),
    // Texto opcionales → null si vacío
    usoCatastral:            d(data.usoCatastral),
    datosRegistro:           d(data.datosRegistro),
    distribucionResumida:    d(data.distribucionResumida),
    superficieDetalles:      d(data.superficieDetalles),
    numProcedimiento:        d(data.numProcedimiento),
    autoDespachoEjecucion:   d(data.autoDespachoEjecucion),
    prestamoHipotecaDetalles: d(data.prestamoHipotecaDetalles),
    actuacionesSeguidas:     d(data.actuacionesSeguidas),
    ejecutante:              d(data.ejecutante),
    juzgado:                 d(data.juzgado),
    riesgosJuridicos:        d(data.riesgosJuridicos),
    cargas:                  d(data.cargas),
    embargos:                d(data.embargos),
    notasInternas:           d(data.notasInternas),
    notasOcupacion:          d(data.notasOcupacion),
    notasObservaciones:      d(data.notasObservaciones),
    informacionInversor:     d(data.informacionInversor),
    // JSONB
    actuacionesJudiciales: data.actuacionesJudiciales ?? [],
    gastosDiversos:        data.gastosDiversos ?? [],
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
