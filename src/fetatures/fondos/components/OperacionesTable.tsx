'use client';

import { useMemo, useState, useCallback, useRef } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  getFacetedRowModel, getFacetedUniqueValues,
  flexRender,
  type ColumnDef, type SortingState, type ColumnFiltersState,
  type VisibilityState, type ColumnSizingState, type ColumnOrderState,
} from '@tanstack/react-table';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, SlidersHorizontal, X, MapPin, Loader2, GripVertical, Trash2,
} from 'lucide-react';
import type { SelectOperacion } from '@/src/db/schema/operaciones';
import { STATUS_LABELS, STATUS_COLORS } from '@/src/db/schema/operaciones';
import type { MapItem } from '@/src/db/schema/fondos';
import { getCatastroDataAction, debugCatastroXmlAction } from '@/src/fetatures/gestion_npl/actions/catastro-actions';
import { deleteOperacionesAction } from '../actions/excel-actions';
import OperacionDetailModal from './OperacionDetailModal';
import toast from 'react-hot-toast';

const FIELD_LABELS: Record<string, string> = {
  expedienteId: 'Expediente', prestamoId: 'Préstamo', nplReo: 'NPL/REO',
  deudorNombre: 'Deudor', fechaAlta: 'Fecha alta',
  deuda: 'Deuda (€)', precioVentaMercado: 'Valor mercado (€)',
  rangoLienPrestamo: 'Rango lien', valorTasacionSubasta: 'Tasación subasta (€)',
  propertyId: 'Inmueble ID', propertyTipo: 'Tipo inmueble',
  propertyTipoOcupacion: 'Ocupación', esVpo: 'VPO', esVulnerable: 'Vulnerable',
  comunidadAutonoma: 'C. Autónoma',
  provincia: 'Provincia', municipio: 'Municipio', codPostal: 'C.P.',
  direccionCompleta: 'Dirección', referenciaCatastral: 'Ref. catastral',
  idufir: 'IDUFIR', parcel: 'Parcela',
  superficieConst: 'Sup. const. (m²)', superficieUtil: 'Sup. útil (m²)',
  superficieFinca: 'Sup. finca (m²)', superficieRegistral: 'Sup. registral (m²)',
  anyConstruccion: 'Año constr.', procLegal: 'Proc. legal',
  procLegalTipo: 'Tipo proc.', procLegalFase: 'Fase proc.',
  procLegalNumero: 'Nº proc.', procLegalCourt: 'Juzgado',
  procLegalEstado: 'Estado proc.', registroProvincia: 'Reg. prov.',
  registroCiudad: 'Reg. ciudad', registroNumero: 'Reg. nº',
  assetManager: 'Asset Manager', oficinaResponsable: 'Oficina',
  fechaTratamiento: 'Fecha trat.', statusTratamiento: 'Status',
};

const EXPANDABLE_FIELDS = new Set([
  'direccionCompleta', 'procLegalCourt', 'idufir',
  'referenciaCatastral', 'deudorNombre', 'procLegalNumero',
]);
const NUMERIC_FIELDS = new Set([
  'deuda', 'precioVentaMercado', 'valorTasacionSubasta',
  'superficieConst', 'superficieUtil', 'superficieFinca', 'superficieRegistral',
]);

function fmtNumber(val: unknown): string {
  const n = parseFloat(String(val));
  return isNaN(n) ? String(val) : n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
// Campos que se muestran siempre capitalizados
const CAPITALIZE_FIELDS = new Set(['comunidadAutonoma', 'provincia', 'municipio']);

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function fmtCell(key: string, val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (NUMERIC_FIELDS.has(key)) return fmtNumber(val);
  const str = String(val);
  if (CAPITALIZE_FIELDS.has(key)) return capitalize(str);
  return str;
}
function snakeToCamel(s: string) { return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()); }

function getPopulatedFields(rows: SelectOperacion[], mapItems: MapItem[]): string[] {
  const mapped = new Set(mapItems.filter(m => m.campo_operaciones).map(m => snakeToCamel(m.campo_operaciones)));
  return Object.keys(FIELD_LABELS).filter(key => {
    if (key === 'statusTratamiento' || key === 'fechaTratamiento') return true;
    if (!mapped.has(key)) return false;
    return rows.some(r => { const v = (r as Record<string, unknown>)[key]; return v !== null && v !== undefined && v !== ''; });
  });
}

function LongTextCell({ text }: { text: string }) {
  const [exp, setExp] = useState(false);
  if (text.length <= 28) return <span className="text-xs text-gray-700">{text}</span>;
  return (
    <button onClick={() => setExp(!exp)} className="text-left text-xs text-gray-700 hover:text-blue-700 focus:outline-none">
      {exp
        ? <span className="block max-w-xs whitespace-normal break-words text-blue-800 bg-blue-50 rounded px-1 py-0.5 ring-1 ring-blue-200">{text}<span className="ml-1 text-[10px] text-blue-400">[−]</span></span>
        : <span className="flex items-center gap-1"><span className="max-w-[160px] truncate block">{text}</span><span className="shrink-0 text-[10px] text-blue-400">[+]</span></span>
      }
    </button>
  );
}

function CatastralCell({ rc }: { rc: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showErr = (m: string) => { setError(m); setTimeout(() => setError(''), 2500); };

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) return;
    if (rc.includes(',')) { showErr('RC múltiple'); return; }
    setLoading(true);
    try {
      const r = await getCatastroDataAction(rc);
      if (!r.ok) { showErr('Sin datos'); return; }
      window.open(r.coords?.googleMapsUrl ?? r.pdfUrl, '_blank', 'noopener,noreferrer');
    } catch { showErr('Error'); } finally { setLoading(false); }
  }, [rc]);

  const handleCtrlClick = useCallback(async (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    if (rc.includes(',')) { showErr('RC múltiple'); return; }
    setLoading(true);
    try {
      const r = await debugCatastroXmlAction(rc);
      if ('error' in r) { showErr(r.error.substring(0, 30)); return; }
      const blob = new Blob([r.xml], { type: 'text/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { showErr('Error'); } finally { setLoading(false); }
  }, [rc]);

  if (error) return <span className="inline-flex items-center gap-1 text-xs text-amber-600"><X className="h-3 w-3" />{error}</span>;
  return (
    <button onClick={handleClick} onClickCapture={handleCtrlClick} disabled={loading}
      title="Click → Maps | Ctrl+Click → XML"
      className="group inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-mono text-blue-700 hover:bg-blue-50 disabled:opacity-60 transition-colors">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MapPin className="h-3 w-3 text-blue-400 group-hover:text-blue-600" />}
      <span className="max-w-[160px] truncate">{rc}</span>
    </button>
  );
}

function ColumnFilter({ column, label }: {
  column: ReturnType<ReturnType<typeof useReactTable<SelectOperacion>>['getColumn']>;
  label: string;
}) {
  const isCapitalize = CAPITALIZE_FIELDS.has(column?.id ?? '');

  // Deduplicar variantes de capitalización: 'madrid', 'Madrid', 'MADRID' → 'Madrid'
  const rawValues = Array.from(column?.getFacetedUniqueValues?.() ?? new Map())
    .map(([v]) => v).filter(v => v !== null && v !== undefined && v !== '');
  const seen = new Map<string, string>(); // normalizado -> valor display
  for (const v of rawValues) {
    const display = isCapitalize ? capitalize(String(v)) : String(v);
    const key = display.toLowerCase();
    if (!seen.has(key)) seen.set(key, display);
  }
  const uniqueValues = Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'es'));

  const current = (column?.getFilterValue() as string) ?? '';
  if (uniqueValues.length <= 1) return null;

  // El filtro compara en minúsculas para ser case-insensitive
  const handleChange = (display: string) => {
    if (!display) { column?.setFilterValue(undefined); return; }
    if (isCapitalize) {
      // Filtra todas las variantes que normalicen al mismo valor
      column?.setFilterValue(display);
    } else {
      column?.setFilterValue(display);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <select value={current} onChange={e => handleChange(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none">
        <option value="">Todos</option>
        {uniqueValues.map(v => <option key={v} value={v}>{STATUS_LABELS[v] ?? v}</option>)}
      </select>
    </div>
  );
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div onMouseDown={onMouseDown}
      className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize select-none hover:bg-blue-400 active:bg-blue-600 opacity-0 group-hover/th:opacity-100 transition-opacity" />
  );
}

function ColumnsPanel({ allColumns, columnOrder, onOrderChange }: {
  allColumns: ReturnType<ReturnType<typeof useReactTable<SelectOperacion>>['getAllColumns']>;
  columnOrder: ColumnOrderState;
  onOrderChange: (o: ColumnOrderState) => void;
}) {
  const draggableIds = columnOrder.filter(id => id !== '_sel' && id !== '_id');
  const dragItem     = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  const handleDragEnd = () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current) {
      dragItem.current = null; dragOverItem.current = null; return;
    }
    const newOrder = [...columnOrder];
    const fi = newOrder.indexOf(dragItem.current);
    const ti = newOrder.indexOf(dragOverItem.current);
    newOrder.splice(fi, 1); newOrder.splice(ti, 0, dragItem.current);
    onOrderChange(newOrder);
    dragItem.current = null; dragOverItem.current = null;
  };

  const colMap = Object.fromEntries(allColumns.map(c => [c.id, c]));

  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Columnas</p>
        <p className="text-[10px] text-gray-300">arrastra para reordenar</p>
      </div>
      {/* Fijas */}
      {['_sel','_id'].map(id => (
        <div key={id} className="mb-1 flex items-center gap-2 rounded px-1 py-1 bg-gray-50">
          <span className="h-3.5 w-3.5 shrink-0" />
          <input type="checkbox" checked className="h-3 w-3 rounded opacity-50" disabled />
          <span className="text-xs text-gray-400">{id === '_sel' ? 'Sel. (fija)' : 'ID (fija)'}</span>
        </div>
      ))}
      <div className="max-h-72 overflow-y-auto space-y-0.5">
        {draggableIds.map(id => {
          const col = colMap[id];
          if (!col) return null;
          return (
            <div key={id} draggable
              onDragStart={() => { dragItem.current = id; }}
              onDragEnter={() => { dragOverItem.current = id; }}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              className="flex items-center gap-2 cursor-grab active:cursor-grabbing rounded px-1 py-1 hover:bg-gray-50 select-none group/drag">
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-gray-300 group-hover/drag:text-gray-400" />
              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                <input type="checkbox" checked={col.getIsVisible()} onChange={col.getToggleVisibilityHandler()}
                  onClick={e => e.stopPropagation()} className="h-3 w-3 rounded" />
                <span className="text-xs text-gray-700 truncate">{FIELD_LABELS[id] ?? id}</span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Props = { operaciones: SelectOperacion[]; mapItems: MapItem[]; carteraName: string };

export default function OperacionesTable({ operaciones: initialRows, mapItems }: Props) {
  const [rows,          setRows]         = useState<SelectOperacion[]>(initialRows);
  const [sorting,       setSorting]      = useState<SortingState>([]);
  const [globalFilter,  setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters]= useState<ColumnFiltersState>([]);
  const [colVisibility, setColVisibility]= useState<VisibilityState>({});
  const [colSizing,     setColSizing]    = useState<ColumnSizingState>({});
  const [showFilters,   setShowFilters]  = useState(false);
  const [showColPanel,  setShowColPanel] = useState(false);
  const [pageSize,      setPageSize]     = useState(25);
  const [modalRow,      setModalRow]     = useState<SelectOperacion | null>(null);
  const [selected,      setSelected]     = useState<Set<number>>(new Set());
  const [confirmDel,    setConfirmDel]   = useState(false);
  const [deleting,      setDeleting]     = useState(false);

  const populatedFields = useMemo(() => getPopulatedFields(rows, mapItems), [rows, mapItems]);

  const [colOrder, setColOrder] = useState<ColumnOrderState>(() => ['_sel', '_id', ...populatedFields]);
  const prevFields = useRef<string[]>([]);
  if (prevFields.current.length === 0 && populatedFields.length > 0) prevFields.current = populatedFields;

  const defaultSize = (key: string) => {
    if (key === 'statusTratamiento') return 110;
    if (key === 'comunidadAutonoma') return 130;
    if (NUMERIC_FIELDS.has(key)) return 120;
    if (['direccionCompleta','procLegalCourt'].includes(key)) return 200;
    if (['idufir','referenciaCatastral','expedienteId'].includes(key)) return 160;
    return 130;
  };

  // Columna de selección
  const selColumn: ColumnDef<SelectOperacion> = {
    id: '_sel', header: '',  size: 36,
    enableSorting: false, enableColumnFilter: false, enableResizing: false,
    cell: ({ row }) => (
      <input type="checkbox" checked={selected.has(row.original.id)}
        onChange={e => setSelected(prev => {
          const next = new Set(prev);
          e.target.checked ? next.add(row.original.id) : next.delete(row.original.id);
          return next;
        })}
        className="h-3.5 w-3.5 rounded border-gray-300"
        onClick={e => e.stopPropagation()}
      />
    ),
  };

  const columns = useMemo<ColumnDef<SelectOperacion>[]>(() => [
    selColumn,
    {
      id: '_id', header: 'ID', size: 56,
      enableSorting: true, enableColumnFilter: false, enableResizing: false,
      accessorFn: r => r.id,
      cell: ({ row }) => (
        <button onClick={() => setModalRow(row.original)}
          className="w-full text-left font-mono text-xs font-semibold text-blue-700 hover:underline"
          title="Ver detalle">
          {row.original.id}
        </button>
      ),
    },
    ...populatedFields.map((key): ColumnDef<SelectOperacion> => ({
      id: key,
      accessorFn: r => (r as Record<string, unknown>)[key],
      header: FIELD_LABELS[key] ?? key,
      size: defaultSize(key), minSize: 60, maxSize: 600,
      enableResizing: true, enableSorting: true, enableColumnFilter: true,
      filterFn: CAPITALIZE_FIELDS.has(key)
        ? (row, columnId, filterValue) => {
            const val = (row.getValue(columnId) as string) ?? '';
            return capitalize(val).toLowerCase() === String(filterValue).toLowerCase();
          }
        : 'includesString',
      cell: ({ getValue }) => {
        const val = getValue();
        if (key === 'statusTratamiento') {
          if (!val) return <span className="text-xs text-gray-300">—</span>;
          const s = String(val);
          return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[s] ?? 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[s] ?? s}</span>;
        }
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
  ], [populatedFields, selected]);

  const table = useReactTable({
    data: rows, columns,
    columnResizeMode: 'onChange',
    state: { sorting, globalFilter, columnFilters, columnVisibility: colVisibility, columnSizing: colSizing, columnOrder: colOrder },
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters, onColumnVisibilityChange: setColVisibility,
    onColumnSizingChange: setColSizing, onColumnOrderChange: setColOrder,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(), getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
    globalFilterFn: 'includesString',
  });

  // Seleccionar / deseleccionar todos los visibles
  const visibleIds = table.getRowModel().rows.map(r => r.original.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelected(prev => { const next = new Set(prev); visibleIds.forEach(id => next.delete(id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); visibleIds.forEach(id => next.add(id)); return next; });
    }
  };

  // Eliminar seleccionados
  const handleDeleteSelected = async () => {
    setDeleting(true);
    const ids = Array.from(selected);
    const { eliminados, error } = await deleteOperacionesAction(ids);
    setDeleting(false);
    if (error) { toast.error(error); return; }
    toast.success(`${eliminados} registro${eliminados !== 1 ? 's' : ''} eliminado${eliminados !== 1 ? 's' : ''}`);
    setRows(prev => prev.filter(r => !selected.has(r.id)));
    setSelected(new Set());
    setConfirmDel(false);
  };

  const handlePageSize = (n: number) => { setPageSize(n); table.setPageSize(n); };
  const activeFilters  = columnFilters.length;
  const filteredCount  = table.getFilteredRowModel().rows.length;
  const filterableCols = table.getAllColumns().filter(c => c.id !== '_sel' && c.id !== '_id' && !NUMERIC_FIELDS.has(c.id) && c.getCanFilter());
  const handleOrderChange = (newOrder: ColumnOrderState) => { setColOrder(newOrder); table.setColumnOrder(newOrder); };

  return (
    <>
      <div className="space-y-3">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input type="text" placeholder="Buscar..." value={globalFilter} onChange={e => setGlobalFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-1.5 pl-8 pr-3 text-xs focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            {globalFilter && <button onClick={() => setGlobalFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-3.5 w-3.5" /></button>}
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${showFilters || activeFilters > 0 ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <SlidersHorizontal className="h-3.5 w-3.5" />Filtros
            {activeFilters > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{activeFilters}</span>}
          </button>

          {(activeFilters > 0 || globalFilter) && (
            <button onClick={() => { setColumnFilters([]); setGlobalFilter(''); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500">
              <X className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}

          {/* Eliminación múltiple */}
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">{selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</span>
              {!confirmDel ? (
                <button onClick={() => setConfirmDel(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              ) : (
                <>
                  <span className="text-xs text-red-600 font-medium">¿Confirmas?</span>
                  <button onClick={handleDeleteSelected} disabled={deleting}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                    {deleting ? '...' : 'Sí'}
                  </button>
                  <button onClick={() => setConfirmDel(false)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                    No
                  </button>
                </>
              )}
              <button onClick={() => { setSelected(new Set()); setConfirmDel(false); }}
                className="text-xs text-gray-400 hover:text-gray-600">Deseleccionar</button>
            </div>
          )}

          <span className="ml-auto text-xs text-gray-400">
            {filteredCount < rows.length ? `${filteredCount} de ${rows.length}` : `${rows.length} registros`}
          </span>

          <div className="relative">
            <button onClick={() => setShowColPanel(!showColPanel)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${showColPanel ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              Columnas ({table.getVisibleLeafColumns().filter(c => c.id !== '_sel').length - 1})
            </button>
            {showColPanel && <ColumnsPanel allColumns={table.getAllColumns()} columnOrder={colOrder} onOrderChange={handleOrderChange} />}
          </div>

          {(Object.keys(colSizing).length > 0 || colOrder.join() !== ['_sel','_id',...populatedFields].join()) && (
            <button onClick={() => { setColSizing({}); setColOrder(['_sel','_id',...populatedFields]); }}
              className="text-xs text-gray-400 hover:text-gray-600">Reset</button>
          )}
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap gap-4">
              {filterableCols.map(col => <ColumnFilter key={col.id} column={col} label={FIELD_LABELS[col.id] ?? col.id} />)}
            </div>
          </div>
        )}

        {/* Leyenda */}
        <p className="text-[11px] text-gray-400">
          <span className="font-medium text-blue-500">ID</span> → ver detalle y actualizar status
          {populatedFields.includes('referenciaCatastral') && (
            <> · <span className="font-medium text-blue-500">Ref. catastral</span>: Click → Maps · <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[10px]">Ctrl</kbd>+Click → XML</>
          )}
        </p>

        {/* Tabla */}
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-xl border border-gray-200 bg-white shadow-sm">
          <table style={{ width: table.getTotalSize() }} className="divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => {
                    const sorted = header.column.getIsSorted();
                    const canSort = header.column.getCanSort();
                    const isSel = header.column.id === '_sel';
                    const isCatastral = header.column.id === 'referenciaCatastral';
                    return (
                      <th key={header.id} style={{ width: header.getSize(), position: 'relative' }}
                        className={`group/th px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap select-none ${canSort ? 'cursor-pointer hover:bg-gray-100' : ''} ${sorted ? 'bg-blue-50 text-blue-700' : ''}`}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}>
                        {isSel ? (
                          <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll}
                            className="h-3.5 w-3.5 rounded border-gray-300" title="Seleccionar todos" />
                        ) : (
                          <div className="flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {isCatastral && <span title="Click → Maps | Ctrl+Click → XML"><MapPin className="h-3 w-3 text-blue-400" /></span>}
                            {canSort && (
                              <span className="text-gray-300">
                                {sorted === 'asc' ? <ChevronUp className="h-3 w-3 text-blue-600" /> :
                                 sorted === 'desc' ? <ChevronDown className="h-3 w-3 text-blue-600" /> :
                                 <ChevronsUpDown className="h-3 w-3" />}
                              </span>
                            )}
                          </div>
                        )}
                        {header.column.getCanResize() && <ResizeHandle onMouseDown={header.getResizeHandler() as (e: React.MouseEvent) => void} />}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} className="py-12 text-center text-sm text-gray-400">Sin registros</td></tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}
                    className={`hover:bg-blue-50/30 transition-colors ${selected.has(row.original.id) ? 'bg-blue-50' : ''}`}>
                    {row.getVisibleCells().map(cell => (
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

        {/* Paginación */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Filas:</span>
            {[10,25,50,100].map(n => (
              <button key={n} onClick={() => handlePageSize(n)}
                className={`rounded px-2 py-0.5 font-medium transition-colors ${pageSize === n ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{n}</button>
            ))}
          </div>
          <span className="text-xs text-gray-500">Pág. {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
          <div className="flex items-center gap-1">
            {[
              { l: '«', f: () => table.setPageIndex(0),                        d: !table.getCanPreviousPage() },
              { l: '‹', f: () => table.previousPage(),                         d: !table.getCanPreviousPage() },
              { l: '›', f: () => table.nextPage(),                             d: !table.getCanNextPage()     },
              { l: '»', f: () => table.setPageIndex(table.getPageCount() - 1), d: !table.getCanNextPage()     },
            ].map(({ l, f, d }) => (
              <button key={l} onClick={f} disabled={d}
                className="rounded px-2.5 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30">{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalRow && (
        <OperacionDetailModal
          operacion={modalRow}
          onClose={() => setModalRow(null)}
          onUpdated={updated => { setRows(prev => prev.map(r => r.id === updated.id ? updated : r)); setModalRow(null); }}
          onDeleted={id => { setRows(prev => prev.filter(r => r.id !== id)); setSelected(prev => { const n = new Set(prev); n.delete(id); return n; }); setModalRow(null); }}
        />
      )}
    </>
  );
}
