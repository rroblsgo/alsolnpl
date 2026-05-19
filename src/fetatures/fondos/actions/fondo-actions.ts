'use server';

import { requireRole } from '@/src/lib/auth-server';
import { ROLES, DASHBOARD_ROLES } from '@/src/lib/roles';
import { FondoInput, FondoSchema } from '../schemas/fondoSchema';
import { CarteraInput, CarteraSchema } from '../schemas/carteraSchema';
import { fondoService } from '../services/FondoService';
import type { MapItem } from '@/src/db/schema/fondos';

// ─── Helpers de acceso ────────────────────────────────────────────────────────

/** Solo admin puede escribir fondos/carteras */
async function requireAdmin() {
  return requireRole([ROLES.ADMIN]);
}

// ─── Fondos ───────────────────────────────────────────────────────────────────

export async function createFondoAction(input: FondoInput) {
  const session = await requireAdmin();
  const data = FondoSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información del formulario' };
  await fondoService.createFondo(data.data, session.user.id);
  return { success: 'Fondo creado correctamente', error: '' };
}

export async function editFondoAction(input: FondoInput, id: number) {
  const session = await requireAdmin();
  const data = FondoSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información del formulario' };
  await fondoService.updateFondo(id, data.data, session.user);
  return { success: 'Fondo actualizado correctamente', error: '' };
}

export async function deleteFondoAction(id: number) {
  const session = await requireAdmin();
  await fondoService.deleteFondo(id, session.user);
  return { success: 'Fondo eliminado correctamente', error: '' };
}

// ─── Carteras ─────────────────────────────────────────────────────────────────

export async function createCarteraAction(input: CarteraInput) {
  const session = await requireAdmin();
  const data = CarteraSchema.safeParse(input);
  if (!data.success) return { success: '', error: 'Revisa la información de la cartera', carteraId: null };
  const cartera = await fondoService.createCartera(data.data);
  return { success: 'Cartera creada correctamente', error: '', carteraId: cartera.id };
}

export async function saveExcelUrlAction(carteraId: number, excelUrl: string, excelFile: string) {
  await requireAdmin();
  await fondoService.updateCarteraExcelUrl(carteraId, excelUrl, excelFile);
  return { success: 'Excel vinculado correctamente', error: '' };
}

export async function saveMapItemsAction(carteraId: number, mapItems: MapItem[]) {
  await requireAdmin();
  await fondoService.updateCarteraMapItems(carteraId, mapItems);
  return { success: 'Mapeo guardado correctamente', error: '' };
}

export async function deleteCarteraAction(id: number) {
  await requireAdmin();
  await fondoService.deleteCartera(id);
  return { success: 'Cartera eliminada correctamente', error: '' };
}
