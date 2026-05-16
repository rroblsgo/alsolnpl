import { notFound } from 'next/navigation';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import { calcularRentabilidad } from '@/src/fetatures/gestion_npl/utils/npl-calc';
import { NPL_TIPO_INMUEBLE_LABELS } from '@/src/fetatures/gestion_npl/types/npl.types';
import RichTextContent from '@/src/shared/components/ui/RichTextContent';
import Image from 'next/image';
import Link from 'next/link';
import { DynamicNplLocation } from '@/src/fetatures/gestion_npl/components/DynamicNplLocation';

type Props = { params: Promise<{ id: string }> };

const fmt = (v: string | null | undefined) =>
  v
    ? new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(parseFloat(v))
    : '—';

export default async function NplDetailPage({ params }: Props) {
  const { id } = await params;
  const npl = await nplService.getNpl(Number(id));
  if (!npl.esPublico) notFound();

  const { roiNeto, inversionTotal, beneficioNeto } = calcularRentabilidad(npl);
  // console.log(inversionTotal);
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        {/* Cabecera */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {npl.tituloOperacion}
          </h1>
          {npl.municipio && (
            <p className="mt-1 text-gray-500">
              📍 {[npl.municipio, npl.provincia].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Imagen */}
        {npl.imagenAsociada && (
          <Image
            src={npl.imagenAsociada}
            alt={npl.tituloOperacion}
            className="w-full h-72 object-cover rounded-xl"
            width={800}
            height={600}
          />
        )}

        {/* Mapa Catastro */}
        {npl.latCatastro && npl.lngCatastro && (
          <div className="rounded-xl bg-white p-6 shadow space-y-3">
            <h2 className="font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
              📍 Ubicación
            </h2>
            {npl.direccion && (
              <p className="text-sm text-gray-500">{npl.direccion}</p>
            )}
            <DynamicNplLocation
              lat={parseFloat(npl.latCatastro)}
              lng={parseFloat(npl.lngCatastro)}
              direccion={[npl.direccion, npl.municipio, npl.provincia].filter(Boolean).join(', ')}
              titulo={npl.tituloOperacion}
            />
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Precio mercado', value: fmt(npl.precioMercado) },
            { label: 'Precio compra', value: fmt(npl.costeAdquisicionCredito) },
            {
              label: 'Beneficio neto',
              value: beneficioNeto ? fmt(String(beneficioNeto)) : '—',
            },
            {
              label: 'ROI neto',
              value: roiNeto ? `${roiNeto.toFixed(2)} %` : '—',
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg bg-white p-4 shadow text-center"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Datos registrales */}
        <div className="rounded-xl bg-white p-6 shadow space-y-3">
          <h2 className="font-semibold text-gray-900 border-b pb-2">
            Datos registrales
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400">Tipo</dt>
              <dd className="font-medium">
                {NPL_TIPO_INMUEBLE_LABELS[npl.tipoInmueble]}
              </dd>
            </div>
            {npl.superficieConst && (
              <div>
                <dt className="text-gray-400">Superficie</dt>
                <dd className="font-medium">{npl.superficieConst} m²</dd>
              </div>
            )}
            {npl.refCatastral && (
              <div>
                <dt className="text-gray-400">Ref. catastral</dt>
                <dd className="font-medium font-mono">{npl.refCatastral}</dd>
              </div>
            )}
            {npl.anyConstruccion && (
              <div>
                <dt className="text-gray-400">Año construcción</dt>
                <dd className="font-medium">{npl.anyConstruccion}</dd>
              </div>
            )}
            {npl.distribucionResumida && (
              <div className="col-span-2">
                <dt className="text-gray-400">Distribución</dt>
                <dd className="font-medium">{npl.distribucionResumida}</dd>
              </div>
            )}
            {npl.distribucion && npl.distribucion !== '<p></p>' && (
              <div className="col-span-2">
                <dt className="text-gray-400">Distribución detallada</dt>
                <dd className="mt-1 font-medium">
                  <RichTextContent html={npl.distribucion} />
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Información para el inversor — renderizado como HTML rico */}
        {npl.informacionInversor && (
          <div className="rounded-xl bg-blue-50 p-6 shadow space-y-2">
            <h2 className="font-semibold text-blue-900 border-b border-blue-200 pb-2">
              Información para el inversor
            </h2>
            <RichTextContent
              html={npl.informacionInversor}
              className="text-blue-800"
            />
          </div>
        )}

        {/* Actuaciones seguidas — renderizado como HTML rico */}
        {npl.actuacionesSeguidas && (
          <div className="rounded-xl bg-blue-50 p-6 shadow space-y-2">
            <h2 className="font-semibold text-blue-900 border-b border-blue-200 pb-2">
              Actuaciones seguidas
            </h2>
            <RichTextContent
              html={npl.actuacionesSeguidas}
              className="text-blue-800"
            />
          </div>
        )}

        <Link
          href="/npl"
          className="inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          ← Volver a oportunidades
        </Link>
      </div>
    </main>
  );
}
