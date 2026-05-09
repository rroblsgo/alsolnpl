'use client';

import { useMemo } from 'react';
import { NplListItem, NPL_ESTADO_LABELS } from '../types/npl.types';
import { useNplStore } from '../stores/npl.store';
import NplCard from './NplCard';

type Props = {
  npls: NplListItem[];
};

const FILTROS = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'ACTIVO', label: NPL_ESTADO_LABELS.ACTIVO },
  { value: 'RESERVADO', label: NPL_ESTADO_LABELS.RESERVADO },
  { value: 'VENDIDO', label: NPL_ESTADO_LABELS.VENDIDO },
] as const;

export default function NplGrid({ npls }: Props) {
  const { filtroEstado, setFiltroEstado } = useNplStore();

  const filtered = useMemo(() => {
    if (filtroEstado === 'TODAS') return npls;
    return npls.filter((n) => n.estado === filtroEstado);
  }, [npls, filtroEstado]);

  const countByEstado = useMemo(() => {
    return {
      TODAS: npls.length,
      ACTIVO: npls.filter((n) => n.estado === 'ACTIVO').length,
      RESERVADO: npls.filter((n) => n.estado === 'RESERVADO').length,
      VENDIDO: npls.filter((n) => n.estado === 'VENDIDO').length,
    };
  }, [npls]);

  return (
    <div className="space-y-6">
      {/* Tabs de filtro */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroEstado(f.value)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtroEstado === f.value
                ? 'bg-blue-700 text-white shadow'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
            <span
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold ${
                filtroEstado === f.value
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {countByEstado[f.value]}
            </span>
          </button>
        ))}
      </div>

      {/* Grid de cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((npl) => (
            <NplCard key={npl.id} npl={npl} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-gray-500">
          No hay oportunidades en esta categoría por el momento.
        </p>
      )}
    </div>
  );
}
