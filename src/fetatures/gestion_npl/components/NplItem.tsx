import { NplListItem, NPL_TIPO_INMUEBLE_LABELS } from '../types/npl.types';
import NplStatusBadge from './NplStatusBadge';
import NplActions from './NplActions';

type Props = {
  npl: NplListItem;
};

const formatEuros = (v: string | null | undefined) => {
  if (!v) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(parseFloat(v));
};

const formatM2 = (v: string | null | undefined) => {
  if (!v) return '—';
  return `${parseFloat(v).toLocaleString('es-ES')} m²`;
};

export default function NplItem({ npl }: Props) {
  return (
    <li className="space-y-3 py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-gray-900">
              {npl.tituloOperacion}
            </span>
            <NplStatusBadge estado={npl.estado} />
            {npl.esPublico && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-600/20 ring-inset">
                Público
              </span>
            )}
          </div>

          {(npl.municipio || npl.provincia) && (
            <p className="mt-1 text-sm text-gray-500">
              📍 {[npl.municipio, npl.provincia].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Tipo:</span>{' '}
              {NPL_TIPO_INMUEBLE_LABELS[npl.tipoInmueble]}
            </p>
            {npl.superficieConst && (
              <p>
                <span className="font-semibold">Superficie:</span>{' '}
                {formatM2(npl.superficieConst)}
              </p>
            )}
            {npl.precioMercado && (
              <p>
                <span className="font-semibold">Precio mercado:</span>{' '}
                {formatEuros(npl.precioMercado)}
              </p>
            )}
            {npl.costeAdquisicionCredito && (
              <p>
                <span className="font-semibold">Coste adquisición:</span>{' '}
                {formatEuros(npl.costeAdquisicionCredito)}
              </p>
            )}
            {npl.refCatastral && (
              <p>
                <span className="font-semibold">Ref. catastral:</span>{' '}
                {npl.refCatastral}
              </p>
            )}
            <p>
              <span className="font-semibold">Creado:</span>{' '}
              {new Date(npl.createdAt).toLocaleDateString('es-ES')}
            </p>
            <p>
              <span className="font-semibold">Por:</span>{' '}
              <span className="text-gray-500">{npl.creatorName}</span>
            </p>
          </div>
        </div>

        <NplActions npl={npl} />
      </div>
    </li>
  );
}
