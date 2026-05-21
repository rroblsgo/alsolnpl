'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { OPERACIONES_CAMPOS } from '../types/fondo.types';
import { saveMapItemsAction } from '../actions/fondo-actions';
import {
  cargarOperacionesAction,
  getCarteraOperacionesStatusAction,
  eliminarNuevosCarteraAction,
} from '../actions/excel-actions';
import ExcelUploader from './ExcelUploader';
import type { MapItem, SelectCartera } from '../types/fondo.types';

const AUTOMAP: Record<string, string> = {
  'IDENTIFICADOR INMUEBLE':        'property_id',
  'IDENTIFICADOR EXPEDIENTE':      'expediente_id',
  'STRATEGY':                      'proc_legal_tipo',
  'WORKING STATUS':                'proc_legal_estado',
  'NPL / REO':                     'npl_reo',
  'DEUDA PRINCIPAL':               'deuda',
  'VALOR DE MERCADO':              'precio_venta_mercado',
  'RANGO PRESTAMO HIPOECARIO':     'rango_lien_prestamo',
  'RANGO PRESTAMO HIPOTECARIO':    'rango_lien_prestamo',
  'Legal number':                  'proc_legal_numero',
  'legalcourt':                    'proc_legal_court',
  'legal type':                    'proc_legal',
  'FASE LEGAL':                    'proc_legal_fase',
  'VALOR A EFECTOS DE SUBASTA':    'valor_tasacion_subasta',
  'Address ( DIRECCIÓN COMPLETA':  'direccion_completa',
  'ZIP':                           'cod_postal',
  'Town':                          'municipio',
  'Province':                      'provincia',
  'SQM':                           'superficie_const',
  'Cadastral Reference':           'referencia_catastral',
  'Idufir':                        'idufir',
  'Parcel':                        'parcel',
  'Registry Town':                 'registro_ciudad',
  'Registry Number':               'registro_numero',
  'Tipo Activo':                   'property_tipo',
};

function applyAutomap(columnas: string[]): Record<string, string> {
  return Object.fromEntries(columnas.map((col) => [col, AUTOMAP[col] ?? '']));
}

function snakeToCamel(s: string) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }

type StatusInfo = { total: number; nuevos: number; otrosStatus: number };

type Props = { cartera: SelectCartera; initialColumnas?: string[] };

export default function MapeoCartera({ cartera, initialColumnas = [] }: Props) {
  const router = useRouter();

  const [columnas, setColumnas] = useState<string[]>(() => {
    if (initialColumnas.length > 0) return initialColumnas;
    return ((cartera.mapItems as MapItem[]) ?? []).map((m) => m.columna_name_origen);
  });

  const [mapping, setMapping] = useState<Record<string, string>>(() => {
    const existing = (cartera.mapItems as MapItem[]) ?? [];
    if (existing.length > 0) return Object.fromEntries(existing.map((m) => [m.columna_name_origen, m.campo_operaciones]));
    if (initialColumnas.length > 0) return applyAutomap(initialColumnas);
    return {};
  });

  const [saving,    setSaving]    = useState(false);
  const [cargando,  setCargando]  = useState(false);
  const [resultado, setResultado] = useState<{ insertadas: number } | null>(null);

  // ── Confirmación de recarga ────────────────────────────────────────────────
  const [statusInfo,   setStatusInfo]   = useState<StatusInfo | null>(null);
  const [confirmando,  setConfirmando]  = useState(false);
  const [eliminando,   setEliminando]   = useState(false);

  const handleHeadersLoaded = useCallback((headers: string[]) => {
    setColumnas(headers);
    setMapping(applyAutomap(headers));
    setResultado(null);
    toast.success(`${headers.length} columnas detectadas`);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const mapItems: MapItem[] = columnas.filter((c) => mapping[c]).map((c) => ({ columna_name_origen: c, campo_operaciones: mapping[c] }));
    const { error, success } = await saveMapItemsAction(cartera.id, mapItems);
    setSaving(false);
    if (error) { toast.error(error); return; }
    toast.success(success);
    router.refresh();
  };

  // ── Iniciar proceso de carga (con comprobación previa) ────────────────────
  const handleIniciarCarga = async () => {
    setResultado(null);
    setConfirmando(false);
    setStatusInfo(null);

    const { total, nuevos, otrosStatus, error } = await getCarteraOperacionesStatusAction(cartera.id);
    if (error) { toast.error(error); return; }

    if (total === 0) {
      // Sin registros previos → cargar directamente
      await ejecutarCarga();
      return;
    }

    // Hay registros → pedir confirmación
    setStatusInfo({ total, nuevos, otrosStatus });
    setConfirmando(true);
  };

  // ── Confirmar: eliminar 'nuevo' y recargar ─────────────────────────────────
  const handleConfirmarRecarga = async () => {
    setEliminando(true);
    const { eliminados, error } = await eliminarNuevosCarteraAction(cartera.id);
    setEliminando(false);
    if (error) { toast.error(error); return; }
    if (eliminados > 0) toast.success(`${eliminados} registros 'Nuevo' eliminados`);
    setConfirmando(false);
    setStatusInfo(null);
    await ejecutarCarga();
  };

  const ejecutarCarga = async () => {
    setCargando(true);
    const { insertadas, error } = await cargarOperacionesAction(cartera.id);
    setCargando(false);
    if (error) { toast.error(error); return; }
    setResultado({ insertadas });
    toast.success(`${insertadas} operaciones cargadas`);
    router.refresh();
  };

  const asignadas  = columnas.filter((c) => mapping[c]).length;
  const mapItems   = (cartera.mapItems as MapItem[]) ?? [];
  const mapGuardado = mapItems.length > 0;

  return (
    <div className="space-y-6">

      {/* 1. Excel uploader */}
      <ExcelUploader carteraId={cartera.id} currentUrl={cartera.excelUrl} currentFile={cartera.excelFile} onHeadersLoaded={handleHeadersLoaded} />

      {/* 2. Tabla de mapeo */}
      {columnas.length > 0 && (
        <>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                {columnas.length} columnas · {asignadas} asignadas
                {asignadas < columnas.length && (
                  <span className="ml-2 text-xs text-amber-600">({columnas.length - asignadas} se ignorarán)</span>
                )}
              </p>
              {mapGuardado && <p className="text-xs text-emerald-700 mt-0.5">✓ Mapeo guardado</p>}
            </div>
            <button onClick={handleSave} disabled={saving || asignadas === 0}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar mapeo'}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-8 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Columna Excel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Campo Operaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {columnas.map((col, i) => (
                  <tr key={col} className={mapping[col] ? 'bg-emerald-50/30' : ''}>
                    <td className="px-4 py-2.5 text-xs text-gray-300 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{col}</td>
                    <td className="px-4 py-2.5">
                      <select value={mapping[col] ?? ''} onChange={(e) => setMapping((p) => ({ ...p, [col]: e.target.value }))}
                        className={`block w-full rounded-md border px-2 py-1.5 text-xs focus:outline-none focus:ring-1 ${mapping[col] ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-400 focus:ring-emerald-400' : 'border-gray-300 focus:border-blue-400 focus:ring-blue-400'}`}>
                        {OPERACIONES_CAMPOS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 3. Panel de carga */}
      {mapGuardado && cartera.excelUrl && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Cargar operaciones en base de datos</h3>
            <p className="text-xs text-gray-500 mt-1">
              Se insertan en tabla <code className="bg-gray-100 px-1 rounded">operaciones</code> con status <strong>Nuevo</strong> y fecha de hoy.
            </p>
          </div>

          {/* Diálogo de confirmación */}
          {confirmando && statusInfo && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800">⚠ Ya existen registros en esta cartera</p>
              <div className="text-xs text-amber-700 space-y-0.5">
                <p>Total registros: <strong>{statusInfo.total}</strong></p>
                <p>Con status <em>Nuevo</em> (se eliminarán): <strong className="text-red-600">{statusInfo.nuevos}</strong></p>
                <p>Con otro status (se conservarán): <strong className="text-emerald-600">{statusInfo.otrosStatus}</strong></p>
              </div>
              <p className="text-xs text-amber-700">
                Se eliminarán los <strong>{statusInfo.nuevos}</strong> registros con status <em>Nuevo</em> y se cargarán los del Excel.
                Los registros con otro status <strong>no se tocan</strong>.
              </p>
              {statusInfo.nuevos === 0 && (
                <p className="text-xs text-emerald-700 font-medium">
                  No hay registros con status Nuevo. Se añadirán los nuevos sin eliminar nada.
                </p>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={handleConfirmarRecarga} disabled={eliminando}
                  className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                  {eliminando ? 'Procesando...' : 'Confirmar recarga'}
                </button>
                <button onClick={() => { setConfirmando(false); setStatusInfo(null); }}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {resultado && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-sm font-semibold text-emerald-800">✓ {resultado.insertadas} operaciones cargadas</p>
            </div>
          )}

          {!confirmando && (
            <button onClick={handleIniciarCarga} disabled={cargando}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
              {cargando ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Cargando...</>
              ) : '⬆ Cargar operaciones'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
