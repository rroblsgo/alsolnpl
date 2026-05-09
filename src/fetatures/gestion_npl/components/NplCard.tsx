import Image from 'next/image';
import {
  NplListItem,
  NPL_TIPO_INMUEBLE_LABELS,
  NplEstado,
} from '../types/npl.types';
// import { calcularRentabilidad } from '../services/NplService';
import { calcularRentabilidad } from '../utils/npl-calc';

type Props = {
  npl: NplListItem;
};

const estadoBadgeStyles: Record<NplEstado, string> = {
  ACTIVO: 'bg-green-500',
  RESERVADO: 'bg-amber-500',
  VENDIDO: 'bg-blue-500',
  ARCHIVADO: 'bg-gray-400',
};

const estadoLabel: Record<NplEstado, string> = {
  ACTIVO: 'Activa',
  RESERVADO: 'Reservada',
  VENDIDO: 'Vendida',
  ARCHIVADO: 'Archivada',
};

const formatEuros = (v: string | null | undefined) => {
  if (!v) return null;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(parseFloat(v));
};

const formatM2 = (v: string | null | undefined) => {
  if (!v) return null;
  return `${parseFloat(v).toLocaleString('es-ES')} m²`;
};

export default function NplCard({ npl }: Props) {
  const { roiNeto } = calcularRentabilidad(npl);
  const imageSrc = npl.imagenAsociada || '/default.jpg';
  const location = [npl.municipio, npl.provincia].filter(Boolean).join(', ');

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl">
      {/* Imagen */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={npl.tituloOperacion}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Badge de estado estilo ribbon */}
        {npl.estado !== 'ACTIVO' && (
          <div
            className={`absolute right-0 top-5 ${estadoBadgeStyles[npl.estado]} px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow`}
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8% 50%)',
            }}
          >
            {estadoLabel[npl.estado]}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Ref catastral y estado */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-mono font-semibold text-gray-500 break-all">
            {npl.refCatastral || npl.referenciaOrigen || `NPL-${npl.id}`}
          </p>
          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${estadoBadgeStyles[npl.estado]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
            {estadoLabel[npl.estado]}
          </span>
        </div>

        {/* Localización */}
        {location && (
          <p className="flex items-center gap-1 text-sm text-gray-600">
            <svg
              className="h-4 w-4 shrink-0 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium uppercase tracking-wide">
              {location}
            </span>
          </p>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3 text-center">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Valor mercado
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatEuros(npl.precioMercado) ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Precio compra
            </p>
            <p className="text-sm font-bold text-gray-900">
              {formatEuros(npl.costeAdquisicionCredito) ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Rentabilidad
            </p>
            <p
              className={`text-sm font-bold ${roiNeto !== null && roiNeto > 0 ? 'text-green-600' : 'text-gray-900'}`}
            >
              {roiNeto !== null ? `${roiNeto.toFixed(2)} %` : '—'}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {npl.superficieConst && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
              {formatM2(npl.superficieConst)}
            </span>
          )}
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
            {NPL_TIPO_INMUEBLE_LABELS[npl.tipoInmueble]}
          </span>
          {npl.procedimiento && (
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-orange-700">
              {npl.procedimiento}
            </span>
          )}
        </div>

        {/* Fecha */}
        <p className="text-xs text-gray-400">
          Creada:{' '}
          {new Date(npl.createdAt).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>

        {/* CTA */}
        <a
          href={`/npl/${npl.id}`}
          className="mt-auto block w-full rounded-lg bg-blue-700 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-blue-800"
        >
          Ver Oportunidad
        </a>
      </div>
    </article>
  );
}
