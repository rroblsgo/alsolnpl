import { User } from 'better-auth';
import { notFound } from 'next/navigation';
import { FondoInput } from '../schemas/fondoSchema';
import { CarteraInput } from '../schemas/carteraSchema';
import { FondoPolicy } from '../policies/FondoPolicy';
import { fondoRepository } from './FondoRepository';
import { FondoListItem, SelectFondo, SelectCartera } from '../types/fondo.types';
import type { MapItem } from '@/src/db/schema/fondos';

class FondoService {
  async createFondo(data: FondoInput, creatorId: string): Promise<SelectFondo> {
    return fondoRepository.create({
      ...data,
      dni:             data.dni             || null,
      empresa:         data.empresa         || null,
      nif:             data.nif             || null,
      imagen:          data.imagen          || null,
      direccion:       data.direccion       || null,
      provincia:       data.provincia       || null,
      municipio:       data.municipio       || null,
      codigoPostal:    data.codigoPostal    || null,
      comisionGestion: data.comisionGestion || null,
      notas:           data.notas           || null,
      creatorId,
    });
  }

  async getFondo(id: number): Promise<SelectFondo> {
    const fondo = await fondoRepository.findById(id);
    if (!fondo) notFound();
    return fondo;
  }

  async getFondoForEdit(id: number, user: User): Promise<SelectFondo> {
    const fondo = await this.getFondo(id);
    if (!FondoPolicy.canEdit(user, fondo)) throw new Error('Sin permisos para editar este fondo');
    return fondo;
  }

  async listFondos(): Promise<FondoListItem[]> {
    return fondoRepository.listAll();
  }

  async updateFondo(id: number, data: FondoInput, user: User): Promise<SelectFondo> {
    const current = await this.getFondo(id);
    if (!FondoPolicy.canEdit(user, current)) throw new Error('Sin permisos');
    const result = await fondoRepository.update(id, {
      ...data,
      dni:             data.dni             || null,
      empresa:         data.empresa         || null,
      nif:             data.nif             || null,
      imagen:          data.imagen          || null,
      direccion:       data.direccion       || null,
      provincia:       data.provincia       || null,
      municipio:       data.municipio       || null,
      codigoPostal:    data.codigoPostal    || null,
      comisionGestion: data.comisionGestion || null,
      notas:           data.notas           || null,
    });
    if (!result) notFound();
    return result;
  }

  async deleteFondo(id: number, user: User): Promise<void> {
    const current = await this.getFondo(id);
    if (!FondoPolicy.canDelete(user, current)) throw new Error('Sin permisos');
    await fondoRepository.remove(id);
  }

  // ─── Carteras ─────────────────────────────────────────────────────────────
  async createCartera(data: CarteraInput): Promise<SelectCartera> {
    return fondoRepository.createCartera({
      ...data,
      excelFile:          data.excelFile          || null,
      excelUrl:           data.excelUrl           || null,
      assetManager:       data.assetManager       || null,
      oficinaResponsable: data.oficinaResponsable || null,
      comisionGestion:    data.comisionGestion     || null,
      fechaDefinicion:    data.fechaDefinicion     || null,
    });
  }

  async getCarterasByFondo(fondoId: number): Promise<SelectCartera[]> {
    return fondoRepository.findCarterasByFondo(fondoId);
  }

  async getCartera(id: number): Promise<SelectCartera> {
    const cartera = await fondoRepository.findCarteraById(id);
    if (!cartera) notFound();
    return cartera;
  }

  async updateCarteraExcelUrl(id: number, excelUrl: string, excelFile: string): Promise<SelectCartera> {
    const result = await fondoRepository.updateCartera(id, { excelUrl, excelFile });
    if (!result) notFound();
    return result;
  }

  async updateCarteraMapItems(id: number, mapItems: MapItem[]): Promise<SelectCartera> {
    const result = await fondoRepository.updateCartera(id, { mapItems });
    if (!result) notFound();
    return result;
  }

  async deleteCartera(id: number): Promise<void> {
    await fondoRepository.removeCartera(id);
  }
}

export const fondoService = new FondoService();
