'use client';

import { Search, X } from 'lucide-react';
import {
  EXPEDIENTE_TIPOS_NOTA,
  EXPEDIENTE_RELEVANCIAS,
  EXPEDIENTE_STATUSES,
  EXPEDIENTE_TIPO_NOTA_LABELS,
  EXPEDIENTE_RELEVANCIA_LABELS,
  EXPEDIENTE_STATUS_LABELS,
  ExpedienteTipoNota,
  ExpedienteRelevancia,
  ExpedienteStatus,
} from '../types/expediente.types';

export type ExpedienteFilters = {
  texto:      string;
  tipo:       ExpedienteTipoNota | '';
  relevancia: ExpedienteRelevancia | '';
  status:     ExpedienteStatus | '';
  usuario:    string;
  fechaDesde: string;
  fechaHasta: string;
};

export const EMPTY_FILTERS: ExpedienteFilters = {
  texto: '', tipo: '', relevancia: '', status: '', usuario: '', fechaDesde: '', fechaHasta: '',
};

type UserOption = { id: string; name: string };

type Props = {
  filters: ExpedienteFilters;
  onChange: (filters: ExpedienteFilters) => void;
  userOptions: UserOption[];
};

export default function ExpedienteNotaFilters({ filters, onChange, userOptions }: Props) {
  const hasActive = Object.values(filters).some((v) => v !== '');
  const set = (key: keyof ExpedienteFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  // Clase común para todos los selects e inputs de la misma fila
  const selectCls = 'w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400';

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {/* Texto — ocupa 2 cols en sm */}
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="mb-0.5 block text-xs text-gray-500">Buscar</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en títulos…"
              value={filters.texto}
              onChange={(e) => set('texto', e.target.value)}
              className={`${selectCls} pl-8`}
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="mb-0.5 block text-xs text-gray-500">Tipo</label>
          <select value={filters.tipo} onChange={(e) => set('tipo', e.target.value)} className={selectCls}>
            <option value="">Todos</option>
            {EXPEDIENTE_TIPOS_NOTA.map((t) => (
              <option key={t} value={t}>{EXPEDIENTE_TIPO_NOTA_LABELS[t]}</option>
            ))}
          </select>
        </div>

        {/* Relevancia */}
        <div>
          <label className="mb-0.5 block text-xs text-gray-500">Relevancia</label>
          <select value={filters.relevancia} onChange={(e) => set('relevancia', e.target.value)} className={selectCls}>
            <option value="">Toda</option>
            {EXPEDIENTE_RELEVANCIAS.map((r) => (
              <option key={r} value={r}>{EXPEDIENTE_RELEVANCIA_LABELS[r]}</option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="mb-0.5 block text-xs text-gray-500">Estado</label>
          <select value={filters.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>
            <option value="">Todos</option>
            {EXPEDIENTE_STATUSES.map((s) => (
              <option key={s} value={s}>{EXPEDIENTE_STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* Usuario — mismo wrapper que fechas */}
        <div>
          <label className="mb-0.5 block text-xs text-gray-500">Usuario</label>
          <select value={filters.usuario} onChange={(e) => set('usuario', e.target.value)} className={selectCls}>
            <option value="">Todos</option>
            {userOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label className="mb-0.5 block text-xs text-gray-500">Desde</label>
          <input type="date" value={filters.fechaDesde}
            onChange={(e) => set('fechaDesde', e.target.value)}
            className={selectCls} />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="mb-0.5 block text-xs text-gray-500">Hasta</label>
          <input type="date" value={filters.fechaHasta}
            onChange={(e) => set('fechaHasta', e.target.value)}
            className={selectCls} />
        </div>

      </div>

      {hasActive && (
        <button type="button" onClick={() => onChange(EMPTY_FILTERS)}
          className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800">
          <X className="h-3.5 w-3.5" /> Limpiar filtros
        </button>
      )}
    </div>
  );
}
