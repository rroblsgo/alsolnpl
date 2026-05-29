import { CheckCircle2, Circle } from 'lucide-react';
import type { SeccionesCompletadas } from '@/src/db/schema';
import { ENRICHMENT_SECCIONES } from '../types/enrichment.types';

type Props = {
  secciones: SeccionesCompletadas;
  activeTab?: string;
};

export default function SeccionCompletitudBadge({ secciones, activeTab }: Props) {
  const completadas = Object.values(secciones).filter(Boolean).length;
  const total = Object.keys(secciones).length;
  const pct = Math.round((completadas / total) * 100);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
      {/* Barra de progreso */}
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            Completitud global
          </span>
          <span className="text-xs font-semibold text-gray-800">{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Indicadores por sección */}
      <div className="flex gap-1">
        {ENRICHMENT_SECCIONES.map((s) => {
          const done = secciones[s.id as keyof SeccionesCompletadas];
          const isActive = activeTab === s.id;
          return (
            <div
              key={s.id}
              title={s.label}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'ring-2 ring-orange-400 ring-offset-1'
                  : ''
              } ${
                done
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {s.id.toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
