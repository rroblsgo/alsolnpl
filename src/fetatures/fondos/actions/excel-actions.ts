'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { fondoService } from '../services/FondoService';
import { db } from '@/src/db';
import { operaciones } from '@/src/db/schema/operaciones';
import type { MapItem } from '@/src/db/schema/fondos';
import type { InsertOperacion } from '@/src/db/schema/operaciones';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';

// ─── Tipos por campo (camelCase, igual que Drizzle) ───────────────────────────

const NUMERIC_FIELDS = new Set([
  'deuda',
  'precioVentaMercado',
  'valorTasacionSubasta',
  'superficieConst',
  'superficieUtil',
  'superficieFinca',
  'superficieRegistral',
  'latitud',
  'longitud',
]);

const INTEGER_FIELDS = new Set(['anyConstruccion']);

const BOOLEAN_FIELDS = new Set(['esVpo']);

const DATE_FIELDS = new Set(['fechaAlta', 'fechaTratamiento']);

// Límites VARCHAR por campo (los que no están aquí usan 255 por defecto)
const VARCHAR_LIMITS: Record<string, number> = {
  assetManager: 100,
  oficinaResponsable: 100,
  expedienteId: 50,
  prestamoId: 50,
  nplReo: 20,
  deudorNombre: 100,
  rangoLienPrestamo: 10,
  propertyId: 50,
  propertyTipo: 100,
  propertyTipoOcupacion: 100,
  esVulnerable: 100,
  provincia: 50,
  municipio: 50,
  codPostal: 10,
  direccionCompleta: 255,
  referenciaCatastral: 25,
  idufir: 50,
  parcel: 20,
  libro: 50,
  tomo: 50,
  finca: 50,
  folio: 50,
  procLegal: 50,
  procLegalTipo: 50,
  procLegalFase: 50,
  procLegalNumero: 50,
  procLegalCourt: 100,
  procLegalEstado: 50,
  registroProvincia: 50,
  registroCiudad: 50,
  registroNumero: 50,
};

// ─── Leer headers del Excel vinculado a una cartera ───────────────────────────
export async function getExcelHeadersAction(
  carteraId: number
): Promise<{ headers: string[]; error: string }> {
  // const { session } = await requireAuth();
  // if (!session) return { headers: [], error: 'No autenticado' };

  // getExcelHeadersAction — admin lee headers
  await requireRole([ROLES.ADMIN]);

  // cargarOperacionesAction — solo admin carga
  await requireRole([ROLES.ADMIN]);

  const cartera = await fondoService.getCartera(carteraId);
  if (!cartera.excelUrl)
    return {
      headers: [],
      error: 'La cartera no tiene fichero Excel vinculado',
    };

  try {
    const buffer = await fetchExcelBuffer(cartera.excelUrl);
    const headers = extractHeaders(buffer);
    return { headers, error: '' };
  } catch (e) {
    return {
      headers: [],
      error: `Error leyendo el Excel: ${(e as Error).message}`,
    };
  }
}

// ─── Cargar operaciones desde el Excel usando el mapeo guardado ───────────────
export async function cargarOperacionesAction(
  carteraId: number
): Promise<{ insertadas: number; error: string }> {
  // const { session } = await requireAuth();
  // if (!session) return { insertadas: 0, error: 'No autenticado' };

  // getExcelHeadersAction — admin lee headers
  await requireRole([ROLES.ADMIN]);

  // cargarOperacionesAction — solo admin carga
  await requireRole([ROLES.ADMIN]);

  const cartera = await fondoService.getCartera(carteraId);

  if (!cartera.excelUrl)
    return {
      insertadas: 0,
      error: 'La cartera no tiene fichero Excel vinculado',
    };

  const mapItems = (cartera.mapItems as MapItem[]) ?? [];
  if (mapItems.length === 0)
    return {
      insertadas: 0,
      error: 'Define y guarda el mapeo de columnas antes de cargar',
    };

  try {
    const buffer = await fetchExcelBuffer(cartera.excelUrl);
    const rows = parseRows(buffer);

    if (rows.length === 0)
      return { insertadas: 0, error: 'El fichero no contiene filas de datos' };

    // columna_origen -> campoCamelCase
    const colMap: Record<string, string> = {};
    for (const item of mapItems) {
      if (item.campo_operaciones) {
        colMap[item.columna_name_origen] = snakeToCamel(item.campo_operaciones);
      }
    }

    const inserts: InsertOperacion[] = rows.map((row) => {
      const op: Record<string, unknown> = {
        fondoId: cartera.fondoId,
        carteraId: cartera.id,
      };
      for (const [colOrigen, campoCamel] of Object.entries(colMap)) {
        const raw = row[colOrigen];
        if (raw === undefined || raw === null || raw === '') continue;
        const casted = castValue(campoCamel, raw);
        if (casted !== null) op[campoCamel] = casted;
      }
      return op as InsertOperacion;
    });

    // Insertar en lotes de 100
    const BATCH = 100;
    let total = 0;
    for (let i = 0; i < inserts.length; i += BATCH) {
      const batch = inserts.slice(i, i + BATCH);
      await db.insert(operaciones).values(batch);
      total += batch.length;
    }

    return { insertadas: total, error: '' };
  } catch (e) {
    const msg = (e as Error).message ?? String(e);
    console.error('[cargarOperaciones]', msg);
    return { insertadas: 0, error: `Error en la carga: ${msg}` };
  }
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

async function fetchExcelBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`No se pudo descargar el Excel (HTTP ${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

function extractHeaders(buffer: Buffer): string[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx') as typeof import('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: '',
  });
  if (!rows.length) return [];
  return (rows[0] as string[]).map(String).filter(Boolean);
}

function parseRows(buffer: Buffer): Record<string, unknown>[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const XLSX = require('xlsx') as typeof import('xlsx');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: null,
    raw: true,
  });
}

/**
 * Convierte el valor raw del Excel al tipo correcto para cada campo de Drizzle.
 * Nunca lanza excepción: devuelve null si el valor no es convertible.
 */
function castValue(campoCamel: string, raw: unknown): unknown {
  if (raw === null || raw === undefined) return null;

  // ── Numeric (decimal) ──────────────────────────────────────────────────────
  if (NUMERIC_FIELDS.has(campoCamel)) {
    const n = Number(raw);
    if (isNaN(n)) return null;
    // PG numeric acepta string con punto decimal
    return n.toString();
  }

  // ── Integer ────────────────────────────────────────────────────────────────
  if (INTEGER_FIELDS.has(campoCamel)) {
    const n = parseInt(String(raw), 10);
    return isNaN(n) ? null : n;
  }

  // ── Boolean ────────────────────────────────────────────────────────────────
  if (BOOLEAN_FIELDS.has(campoCamel)) {
    const s = String(raw).toLowerCase().trim();
    if (s === 'true' || s === '1' || s === 'si' || s === 'sí' || s === 'yes')
      return true;
    if (s === 'false' || s === '0' || s === 'no') return false;
    return null;
  }

  // ── Date ───────────────────────────────────────────────────────────────────
  if (DATE_FIELDS.has(campoCamel)) {
    return parseExcelDate(raw);
  }

  // ── VARCHAR: convertir a string, descartar si supera el límite del campo ───
  const limit = VARCHAR_LIMITS[campoCamel] ?? 255;
  const str = String(raw).trim();

  // Si el valor es "0" numérico (celda vacía que xlsx convierte a 0), lo ignoramos
  if (raw === 0 && str === '0') return null;

  // Si supera el límite, no guardamos nada (evita truncar datos parciales)
  if (str.length > limit) return null;

  return str;
}

/**
 * Parsea fechas de Excel:
 * - número serial (días desde 1900-01-01)
 * - string "DD/MM/YYYY" o "YYYY-MM-DD"
 */
function parseExcelDate(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;

  if (typeof raw === 'number') {
    if (raw === 0) return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx') as typeof import('xlsx');
    const date = XLSX.SSF.parse_date_code(raw);
    if (!date) return null;
    const y = date.y.toString().padStart(4, '0');
    const m = date.m.toString().padStart(2, '0');
    const d = date.d.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const s = String(raw).trim();
  if (!s || s === '0') return null;

  // DD/MM/YYYY
  const dm = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);

  return null;
}

/** snake_case -> camelCase */
function snakeToCamel(snake: string): string {
  return snake.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}
