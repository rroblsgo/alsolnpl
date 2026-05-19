'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnSizingState,
} from '@tanstack/react-table';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, SlidersHorizontal, X, MapPin, Loader2,
} from 'lucide-react';
import type { SelectOperacion } from '@/src/db/schema/operaciones';
import type { MapItem } from '@/src/db/schema/fondos';
import { getCatastroDataAction, debugCatastroXmlAction } from '@/src/fetatures/gestion_npl/actions/catastro-actions';

// ─── Labels ───────────────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  expedienteId:         'Expediente',
  prestamoId:           'Préstamo',
  nplReo:               'NPL/REO',
  deudorNombre:         'Deudor',
  fechaAlta:            'Fecha alta',
  deuda:                'Deuda (€)',
  precioVentaMercado:   'Valor mercado (€)',
  rangoLienPrestamo:    'Rango lien',
  valorTasacionSubasta: 'Tasación subasta (€)',
  propertyId:           'Inmueble ID',
  propertyTipo:         'Tipo inmueble',
  propertyTipoOcupacion:'Ocupación',
  esVpo:                'VPO',
  esVulnerable:         'Vulnerable',
  provincia:            'Provincia',
  municipio:            'Municipio',
  codPostal:            'C.P.',
  direccionCompleta:    'Dirección',
  referenciaCatastral:  'Ref. catastral',
  idufir:               'IDUFIR',
  parcel:               'Parcela',
  superficieConst:      'Sup. const. (m²)',
  superficieUtil:       'Sup. útil (m²)',
  superficieFinca:      'Sup. finca (m²)',
  superficieRegistral:  'Sup. registral (m²)',
  anyConstruccion:      'Año construcción',
  procLegal:            'Proc. legal',
  procLegalTipo:        'Tipo proc.',
  procLegalFase:        'Fase proc.',
  procLegalNumero:      'Nº proc.',
  procLegalCourt:       'Juzgado',
  procLegalEstado:      'Estado proc.',
  registroProvincia:    'Registro prov.',
  registroCiudad:       'Registro ciudad',
  registroNumero:       'Registro nº',
  assetManager:         'Asset Manager',
  oficinaResponsable:   'Oficina',
  fechaTratamiento:     'Fecha tratamiento',
};

// Columnas donde el texto largo es frecuente → celda expandible al click
const EXPANDABLE_FIELDS = new Set([
  'direccionCompleta', 'procLegalCourt', 'idufir', 'referenciaCatastral',
  'deudorNombre', 'procLegalNumero',
]);

const NUMERIC_FIELDS = new Set([
  'deuda', 'precioVentaMercado', 'valorTasacionSubasta',
  'superficieConst', 'superficieUtil', 'superficieFinca', 'superficieRegistral',
]);

function fmtNumber(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  const n = parseFloat(String(val));
  return isNaN(n) ? String(val) : n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function fmtCell(key: string, val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (NUMERIC_FIELDS.has(key)) return fmtNumber(val);
  return String(val);
}

function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function getPopulatedFields(rows: SelectOperacion[], mapItems: MapItem[]): string[] {
  const mapped = new Set(mapItems.filter((m) => m.campo_operaciones).map((m) => snakeToCamel(m.campo_operaciones)));
  return Object.keys(FIELD_LABELS).filter((key) => {
    if (!mapped.has(key)) return false;
    return rows.some((r) => { const v = (r as Record<string, unknown>)[key]; return v !== null && v !== undefined && v !== ''; });
  });
}

// ─── Tooltip para texto largo ─────────────────────────────────────────────────
function LongTextCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 28;

  if (!isLong) return <span className="text-xs text-gray-700">{text}</span>;

  return (
    <span className="relative group">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-left text-xs text-gray-700 hover:text-blue-700 focus:outline-none"
        title="Click para ver texto completo"
      >
        {expanded ? (
          <span className="block max-w-xs whitespace-normal break-words text-blue-800 bg-blue-50 rounded px-1 py-0.5 ring-1 ring-blue-200">
            {text}
            <span className="ml-1 text-[10px] text-blue-400">[−]</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="max-w-[160px] truncate block">{text}</span>
            <span className="shrink-0 text-[10px] text-blue-400 group-hover:text-blue-600">[+]</span>
          </span>
        )}
      </button>
    </span>
  );
}

// ─── Celda referencia catastral ───────────────────────────────────────────────
function CatastralCell({ rc }: { rc: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 2500); };

  // Click normal → Google Maps
  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) return; // lo maneja handleCtrlClick
    if (rc.includes(',')) { showError('RC múltiple'); return; }
    setLoading(true);
    try {
      const result = await getCatastroDataAction(rc);
      if (!result.ok) { showError('Sin datos'); return; }
      const url = result.coords?.googleMapsUrl ?? result.pdfUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch { showError('Error'); }
    finally { setLoading(false); }
  }, [rc]);

  // Ctrl+click → XML catastral en nueva pestaña
  const handleCtrlClick = useCallback(async (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (rc.includes(',')) { showError('RC múltiple'); return; }
    setLoading(true);
    try {
      const result = await debugCatastroXmlAction(rc);
      if ('error' in result) { showError(result.error.substring(0, 30)); return; }
      // Abrir XML en nueva pestaña formateado
      const blob = new Blob([result.xml], { type: 'text/xml;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Limpiar la URL del blob tras un tiempo prudencial
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { showError('Error'); }
    finally { setLoading(false); }
  }, [rc]);

  if (error) return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
      <X className="h-3 w-3" />{error}
    </span>
  );

  return (
    <button
      onClick={handleClick}
      onClickCapture={handleCtrlClick}
      disabled={loading}
      title="Click → Google Maps  |  Ctrl+Click → XML Catastro"
      className="group inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-mono
        text-blue-700 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-wait disabled:opacity-60 transition-colors"
    >
      {loading
        ? <Loader2 className="h-3 w-3 animate-spin shrink-0" />
        : <MapPin className="h-3 w-3 shrink-0 text-blue-400 group-hover:text-blue-600 transition-colors" />
      }
      <span className="max-w-[160px] truncate">{rc}</span>
    </button>
  );
}

// ─── Filtro de columna ────────────────────────────────────────────────────────
function ColumnFilter({
  column, label,
}: {
  column: ReturnType<ReturnType<typeof useReactTable<SelectOperacion>>['getColumn']>;
  label: string;
}) {
  const uniqueValues = Array.from(column?.getFacetedUniqueValues?.() ?? new Map())
    .map(([v]) => v).filter((v) => v !== null && v !== undefined && v !== '')
    .sort((a, b) => String(a).localeCompare(String(b), 'es'));
  const current = (column?.getFilterValue() as string) ?? '';
  if (uniqueValues.length <= 1) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <select value={current} onChange={(e) => column?.setFilterValue(e.target.value || undefined)}
        className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none">
        <option value="">Todos</option>
        {uniqueValues.map((v) => <option key={String(v)} value={String(v)}>{fmtCell('', v)}</option>)}
      </select>
    </div>
  );
}

// ─── Resize handle ────────────────────────────────────────────────────────────
function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none
        hover:bg-blue-400 active:bg-blue-600 opacity-0 group-hover/th:opacity-100 transition-opacity"
    />
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
type Props = { operaciones: SelectOperacion[]; mapItems: MapItem[]; carteraName: string };

export default function OperacionesTable({ operaciones: rows, mapItems }: Props) {
  const [sorting,          setSorting]          = useState<SortingState>([]);
  const [globalFilter,     setGlobalFilter]     = useState('');
  const [columnFilters,    setColumnFilters]    = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing,     setColumnSizing]     = useState<ColumnSizingState>({});
  const [showFilters,      setShowFilters]      = useState(false);
  const [pageSize,         setPageSize]         = useState(25);

  const populatedFields = useMemo(() => getPopulatedFields(rows, mapItems), [rows, mapItems]);

  // Anchos por defecto por campo
  const defaultSize = (key: string) => {
    if (NUMERIC_FIELDS.has(key))                                      return 120;
    if (['direccionCompleta', 'procLegalCourt'].includes(key))        return 200;
    if (['idufir', 'referenciaCatastral', 'expedienteId'].includes(key)) return 160;
    return 130;
  };

  const columns = useMemo<ColumnDef<SelectOperacion>[]>(() => [
    {
      id: '_row', header: '#', size: 40,
      enableSorting: false, enableColumnFilter: false, enableResizing: false,
      cell: ({ row }) => <span className="text-xs text-gray-400 tabular-nums">{row.index + 1}</span>,
    },
    ...populatedFields.map((key): ColumnDef<SelectOperacion> => ({
      id: key,
      accessorFn: (row) => (row as Record<string, unknown>)[key],
      header: FIELD_LABELS[key] ?? key,
      size: defaultSize(key),
      minSize: 60,
      maxSize: 600,
      enableResizing: true,
      enableSorting: true,
      enableColumnFilter: true,
      cell: ({ getValue }) => {
        const val = getValue();
        if (key === 'referenciaCatastral') {
          if (!val || val === '') return <span className="text-xs text-gray-300">—</span>;
          return <CatastralCell rc={String(val)} />;
        }
        const text = fmtCell(key, val);
        if (text === '—') return <span className="text-xs text-gray-300">—</span>;
        if (NUMERIC_FIELDS.has(key)) return <span className="block text-right text-xs font-mono text-gray-700">{text}</span>;
        if (EXPANDABLE_FIELDS.has(key)) return <LongTextCell text={text} />;
        return <span className="block truncate max-w-[200px] text-xs text-gray-700">{text}</span>;
      },
    })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [populatedFields]);

  const table = useReactTable({
    data: rows,
    columns,
    columnResizeMode: 'onChange',
    state: { sorting, globalFilter, columnFilters, columnVisibility, columnSizing },
    onSortingChange:          setSorting,
    onGlobalFilterChange:     setGlobalFilter,
    onColumnFiltersChange:    setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange:     setColumnSizing,
    getCoreRowModel:          getCoreRowModel(),
    getSortedRowModel:        getSortedRowModel(),
    getFilteredRowModel:      getFilteredRowModel(),
    getPaginationRowModel:    getPaginationRowModel(),
    getFacetedRowModel:       getFacetedRowModel(),
    getFacetedUniqueValues:   getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
    globalFilterFn: 'includesString',
  });

  const handlePageSize = (n: number) => { setPageSize(n); table.setPageSize(n); };

  const activeFilters  = columnFilters.length;
  const filteredCount  = table.getFilteredRowModel().rows.length;
  const filterableCols = table.getAllColumns().filter((c) => c.id !== '_row' && !NUMERIC_FIELDS.has(c.id) && c.getCanFilter());

  return (
    <div className="space-y-3">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input type="text" placeholder="Buscar en todos los campos..." value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
          {globalFilter && (
            <button onClick={() => setGlobalFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            showFilters || activeFilters > 0 ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}>
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
          {activeFilters > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{activeFilters}</span>}
        </button>

        {(activeFilters > 0 || globalFilter) && (
          <button onClick={() => { setColumnFilters([]); setGlobalFilter(''); }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500">
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">
          {filteredCount < rows.length ? `${filteredCount} de ${rows.length} registros` : `${rows.length} registros`}
        </span>

        {/* Visibilidad */}
        <div className="relative group">
          <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Columnas ({table.getVisibleLeafColumns().length - 1})
          </button>
          <div className="absolute right-0 top-full z-20 mt-1 hidden group-hover:block w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Mostrar / ocultar</p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {table.getAllColumns().filter((c) => c.id !== '_row').map((col) => (
                <label key={col.id} className="flex items-center gap-2 cursor-pointer rounded px-1 py-0.5 hover:bg-gray-50">
                  <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()} className="h-3 w-3 rounded" />
                  <span className="text-xs text-gray-700 truncate">{FIELD_LABELS[col.id] ?? col.id}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Reset anchos */}
        {Object.keys(columnSizing).length > 0 && (
          <button onClick={() => setColumnSizing({})}
            className="text-xs text-gray-400 hover:text-gray-600">
            Reset anchos
          </button>
        )}
      </div>

      {/* ── Filtros ───────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex flex-wrap gap-4">
            {filterableCols.map((col) => (
              <ColumnFilter key={col.id} column={col} label={FIELD_LABELS[col.id] ?? col.id} />
            ))}
          </div>
        </div>
      )}

      {/* ── Leyenda catastral ─────────────────────────────────────────────── */}
      {populatedFields.includes('referenciaCatastral') && (
        <p className="text-[11px] text-gray-400">
          <span className="font-medium text-blue-500">Ref. catastral:</span>{' '}
          Click → Google Maps · <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px]">Ctrl</kbd>+Click → XML Catastro
        </p>
      )}

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table
          style={{ width: table.getTotalSize() }}
          className="divide-y divide-gray-100 text-xs"
        >
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted   = header.column.getIsSorted();
                  const canSort  = header.column.getCanSort();
                  const isCatastral = header.column.id === 'referenciaCatastral';
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize(), position: 'relative' }}
                      className={`group/th px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider
                        text-gray-500 whitespace-nowrap select-none
                        ${canSort ? 'cursor-pointer hover:bg-gray-100' : ''}
                        ${sorted  ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isCatastral && (
                          <span title="Click → Maps | Ctrl+Click → XML">
                            <MapPin className="h-3 w-3 text-blue-400" />
                          </span>
                        )}
                        {canSort && (
                          <span className="text-gray-300">
                            {sorted === 'asc'  ? <ChevronUp className="h-3 w-3 text-blue-600" /> :
                             sorted === 'desc' ? <ChevronDown className="h-3 w-3 text-blue-600" /> :
                             <ChevronsUpDown className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                      {/* Handle de resize */}
                      {header.column.getCanResize() && (
                        <ResizeHandle onMouseDown={header.getResizeHandler() as (e: React.MouseEvent) => void} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">
                  Sin registros que coincidan con los filtros aplicados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} style={{ width: cell.column.getSize() }} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Filas:</span>
          {[10, 25, 50, 100].map((n) => (
            <button key={n} onClick={() => handlePageSize(n)}
              className={`rounded px-2 py-0.5 font-medium transition-colors ${pageSize === n ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          Pág. {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          {[
            { label: '«', fn: () => table.setPageIndex(0),                         dis: !table.getCanPreviousPage() },
            { label: '‹', fn: () => table.previousPage(),                          dis: !table.getCanPreviousPage() },
            { label: '›', fn: () => table.nextPage(),                              dis: !table.getCanNextPage()     },
            { label: '»', fn: () => table.setPageIndex(table.getPageCount() - 1),  dis: !table.getCanNextPage()     },
          ].map(({ label, fn, dis }) => (
            <button key={label} onClick={fn} disabled={dis}
              className="rounded px-2.5 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
