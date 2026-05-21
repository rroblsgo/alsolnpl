'use server';

import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';
import { fondoService } from '../services/FondoService';
import { operacionesRepository } from '../services/OperacionesRepository';
import { db } from '@/src/db';
import { operaciones } from '@/src/db/schema/operaciones';
import type { MapItem } from '@/src/db/schema/fondos';
import type { InsertOperacion } from '@/src/db/schema/operaciones';

// ─── Tipos por campo ──────────────────────────────────────────────────────────
const NUMERIC_FIELDS = new Set([
  'deuda', 'precioVentaMercado', 'valorTasacionSubasta',
  'superficieConst', 'superficieUtil', 'superficieFinca', 'superficieRegistral',
  'latitud', 'longitud',
]);
const INTEGER_FIELDS = new Set(['anyConstruccion']);
const BOOLEAN_FIELDS = new Set(['esVpo']);
const DATE_FIELDS    = new Set(['fechaAlta']);   // fechaTratamiento la ponemos nosotros

const VARCHAR_LIMITS: Record<string, number> = {
  assetManager: 100, oficinaResponsable: 100, expedienteId: 50, prestamoId: 50,
  nplReo: 20, deudorNombre: 100, rangoLienPrestamo: 10, propertyId: 50,
  propertyTipo: 100, propertyTipoOcupacion: 100, esVulnerable: 100,
  provincia: 50, municipio: 50, codPostal: 10, direccionCompleta: 255,
  referenciaCatastral: 25, idufir: 50, parcel: 20,
  libro: 50, tomo: 50, finca: 50, folio: 50,
  procLegal: 50, procLegalTipo: 50, procLegalFase: 50,
  procLegalNumero: 50, procLegalCourt: 100, procLegalEstado: 50,
  registroProvincia: 50, registroCiudad: 50, registroNumero: 50,
};

// ─── Consultar estado previo de una cartera ───────────────────────────────────
export async function getCarteraOperacionesStatusAction(
  carteraId: number
): Promise<{ total: number; nuevos: number; otrosStatus: number; error: string }> {
  await requireRole([ROLES.ADMIN]);
  try {
    const cartera = await fondoService.getCartera(carteraId);
    const rows = await operacionesRepository.findByCartera(carteraId);
    const nuevos = rows.filter((r) => r.statusTratamiento === 'nuevo').length;
    return { total: rows.length, nuevos, otrosStatus: rows.length - nuevos, error: '' };
  } catch (e) {
    return { total: 0, nuevos: 0, otrosStatus: 0, error: (e as Error).message };
  }
}

// ─── Eliminar registros 'nuevo' de una cartera ────────────────────────────────
export async function eliminarNuevosCarteraAction(
  carteraId: number
): Promise<{ eliminados: number; error: string }> {
  await requireRole([ROLES.ADMIN]);
  try {
    const eliminados = await operacionesRepository.deleteNuevosByCartera(carteraId);
    return { eliminados, error: '' };
  } catch (e) {
    return { eliminados: 0, error: (e as Error).message };
  }
}

// ─── Leer headers del Excel ───────────────────────────────────────────────────
export async function getExcelHeadersAction(
  carteraId: number
): Promise<{ headers: string[]; error: string }> {
  await requireRole([ROLES.ADMIN]);
  const cartera = await fondoService.getCartera(carteraId);
  if (!cartera.excelUrl) return { headers: [], error: 'La cartera no tiene fichero Excel vinculado' };
  try {
    const buffer = await fetchExcelBuffer(cartera.excelUrl);
    return { headers: extractHeaders(buffer), error: '' };
  } catch (e) {
    return { headers: [], error: `Error leyendo el Excel: ${(e as Error).message}` };
  }
}

// ─── Cargar operaciones ───────────────────────────────────────────────────────
export async function cargarOperacionesAction(
  carteraId: number
): Promise<{ insertadas: number; error: string }> {
  await requireRole([ROLES.ADMIN]);

  const cartera = await fondoService.getCartera(carteraId);
  if (!cartera.excelUrl) return { insertadas: 0, error: 'La cartera no tiene fichero Excel vinculado' };

  const mapItems = (cartera.mapItems as MapItem[]) ?? [];
  if (mapItems.length === 0) return { insertadas: 0, error: 'Define y guarda el mapeo antes de cargar' };

  try {
    const buffer = await fetchExcelBuffer(cartera.excelUrl);
    const rows   = parseRows(buffer);
    if (rows.length === 0) return { insertadas: 0, error: 'El fichero no contiene filas de datos' };

    const colMap: Record<string, string> = {};
    for (const item of mapItems) {
      if (item.campo_operaciones) colMap[item.columna_name_origen] = snakeToCamel(item.campo_operaciones);
    }

    // Fecha de hoy en formato ISO para fecha_tratamiento
    const hoy = new Date().toISOString().slice(0, 10);

    const inserts: InsertOperacion[] = rows.map((row) => {
      const op: Record<string, unknown> = {
        fondoId:           cartera.fondoId,
        carteraId:         cartera.id,
        statusTratamiento: 'nuevo',
        fechaTratamiento:  hoy,
      };
      for (const [colOrigen, campoCamel] of Object.entries(colMap)) {
        const raw = row[colOrigen];
        if (raw === undefined || raw === null || raw === '') continue;
        const casted = castValue(campoCamel, raw);
        if (casted !== null) op[campoCamel] = casted;
      }
      return op as InsertOperacion;
    });

    const BATCH = 100;
    let total = 0;
    for (let i = 0; i < inserts.length; i += BATCH) {
      await db.insert(operaciones).values(inserts.slice(i, i + BATCH));
      total += inserts.slice(i, i + BATCH).length;
    }
    return { insertadas: total, error: '' };
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    console.error('[cargarOperaciones]', msg);
    return { insertadas: 0, error: `Error en la carga: ${msg}` };
  }
}

// ─── Actualizar status y fecha de una operación ───────────────────────────────
export async function updateOperacionStatusAction(
  id: number,
  statusTratamiento: string,
  fechaTratamiento: string
): Promise<{ success: string; error: string }> {
  // Cualquier usuario interno puede actualizar el status
  const VALID = ['nuevo','analisis','scoring','seleccionado','descartado',
                 'comercializado','ofertado','reservado','vendido','cancelado'];
  if (!VALID.includes(statusTratamiento)) return { success: '', error: 'Status no válido' };
  try {
    await operacionesRepository.updateStatus(id, statusTratamiento as never, fechaTratamiento);
    return { success: 'Operación actualizada', error: '' };
  } catch (e) {
    return { success: '', error: (e as Error).message };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchExcelBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo descargar el Excel (HTTP ${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function extractHeaders(buffer: Buffer): string[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx') as typeof import('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '' });
  if (!rows.length) return [];
  return (rows[0] as string[]).map(String).filter(Boolean);
}

function parseRows(buffer: Buffer): Record<string, unknown>[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx') as typeof import('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: null, raw: true });
}

function castValue(campoCamel: string, raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;
  if (NUMERIC_FIELDS.has(campoCamel)) {
    const n = Number(raw); return isNaN(n) ? null : n.toString();
  }
  if (INTEGER_FIELDS.has(campoCamel)) {
    const n = parseInt(String(raw), 10); return isNaN(n) ? null : n;
  }
  if (BOOLEAN_FIELDS.has(campoCamel)) {
    const s = String(raw).toLowerCase().trim();
    if (['true','1','si','sí','yes'].includes(s)) return true;
    if (['false','0','no'].includes(s)) return false;
    return null;
  }
  if (DATE_FIELDS.has(campoCamel)) return parseExcelDate(raw);
  const limit = VARCHAR_LIMITS[campoCamel] ?? 255;
  const str = String(raw).trim();
  if (raw === 0 && str === '0') return null;
  if (str.length > limit) return null;
  return str;
}

function parseExcelDate(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    if (raw === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx') as typeof import('xlsx');
    const d = XLSX.SSF.parse_date_code(raw);
    if (!d) return null;
    return `${d.y.toString().padStart(4,'0')}-${d.m.toString().padStart(2,'0')}-${d.d.toString().padStart(2,'0')}`;
  }
  const s = String(raw).trim();
  if (!s || s === '0') return null;
  const dm = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
  return null;
}

function snakeToCamel(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}
