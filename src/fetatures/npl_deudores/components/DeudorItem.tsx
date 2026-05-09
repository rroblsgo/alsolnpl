'use client';

import Link from 'next/link';
import { SelectNplDeudor } from '../types/deudor.types';
import { useDeudorStore } from '../stores/deudor.store';
import { NPL_TIPO_REGISTRO_LABELS } from '@/src/fetatures/gestion_npl/types/npl.types';

type Props = {
  deudor: SelectNplDeudor;
  nplId: number;
};

const TIPO_COLORS: Record<string, string> = {
  DEUDOR: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  HIPOTECANTE: 'bg-purple-100 text-purple-700 ring-purple-600/20',
  FIADOR: 'bg-yellow-100 text-yellow-700 ring-yellow-600/20',
};

export default function DeudorItem({ deudor, nplId }: Props) {
  const { setDeleteOpen, setSelectedDeudor } = useDeudorStore();
  const tipoLabel = NPL_TIPO_REGISTRO_LABELS[deudor.tipoRegistro] ?? deudor.tipoRegistro;
  const tipoColor = TIPO_COLORS[deudor.tipoRegistro] ?? 'bg-gray-100 text-gray-700';

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        {/* Nombre + badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-900">{deudor.nombre}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tipoColor}`}
          >
            {tipoLabel}
          </span>
          {deudor.esPrincipal && (
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-600/20 ring-inset">
              Principal
            </span>
          )}
        </div>

        {/* DNI */}
        {deudor.dni && (
          <p className="text-sm text-gray-500">
            <span className="font-medium">DNI:</span> {deudor.dni}
          </p>
        )}

        {/* Dirección */}
        {deudor.direccionCompleta && (
          <p className="text-sm text-gray-500 line-clamp-1">
            <span className="font-medium">Dirección:</span> {deudor.direccionCompleta}
          </p>
        )}

        {/* Estado ocupacional */}
        {deudor.estadoOcupacional && (
          <p className="text-sm text-gray-500 line-clamp-1">
            <span className="font-medium">Ocupación:</span> {deudor.estadoOcupacional}
          </p>
        )}

        {/* Vulnerabilidad */}
        {deudor.vulnerabilidad && (
          <p className="text-sm text-gray-500 line-clamp-1">
            <span className="font-medium">Vulnerabilidad:</span> {deudor.vulnerabilidad}
          </p>
        )}

        {/* Otros datos */}
        {Array.isArray(deudor.otrosDatos) && (deudor.otrosDatos as { titulo: string; nombre: string }[]).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {(deudor.otrosDatos as { titulo: string; nombre: string }[]).map((od, i) => (
              <span key={i} className="text-xs text-gray-500">
                <span className="font-medium">{od.titulo}:</span> {od.nombre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/dashboard/npl/${nplId}/deudores/${deudor.id}/edit`}
          className="rounded-md bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100"
        >
          Editar
        </Link>
        <button
          onClick={() => {
            setSelectedDeudor(deudor);
            setDeleteOpen(true);
          }}
          className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
