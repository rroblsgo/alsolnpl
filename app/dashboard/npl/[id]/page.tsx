import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import { NplPolicy } from '@/src/fetatures/gestion_npl/policies/NplPolicy';
import { calcularRentabilidad } from '@/src/fetatures/gestion_npl/utils/npl-calc';
import NplEscenariosRentabilidad from '@/src/fetatures/gestion_npl/components/NplEscenariosRentabilidad';
import {
  NPL_TIPO_INMUEBLE_LABELS,
  NPL_PROCEDIMIENTO_LABELS,
  NPL_ESTADO_LABELS,
  NPL_TIPO_REGISTRO_LABELS,
  NplListItem,
} from '@/src/fetatures/gestion_npl/types/npl.types';
import { deudorService } from '@/src/fetatures/npl_deudores/services/DeudorService';
import RichTextContent from '@/src/shared/components/ui/RichTextContent';
import NplStatusBadge from '@/src/fetatures/gestion_npl/components/NplStatusBadge';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import DownloadPdfButton from '@/src/fetatures/gestion_npl/components/DownloadPdfButton';
import { documentService } from '@/src/fetatures/documents/services/DocumentService';
import DocumentsList from '@/src/fetatures/documents/components/DocumentsList';
import { taskService } from '@/src/fetatures/tasks/services/TaskService';
import NplTasksSection from '@/src/fetatures/tasks/components/NplTasksSection';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const npl = await nplService.getNpl(Number(id));
  return { title: generatePageTitle(npl.tituloOperacion) };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: string | null | undefined) =>
  v
    ? new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(parseFloat(v))
    : null;

const fmtDate = (v: string | null | undefined) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime())
    ? v
    : d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-white p-6 shadow-sm ${className}`}>
      <h2 className="mb-4 border-b pb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function NplDetailDashboardPage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const npl = await nplService.getNpl(Number(id));

  if (!NplPolicy.canView(session.user, npl)) redirect('/dashboard/npl');

  const [deudores, rentabilidad, documents, nplTasks] = await Promise.all([
    deudorService.listByNpl(npl.id),
    Promise.resolve(calcularRentabilidad(npl)),
    documentService.listByEntity('NPL', npl.id),
    taskService.listTasksByNpl(npl.id),
  ]);

  const { escenarios } = rentabilidad;

  // Deuda actualizada = principal + intereses + costas
  const pN = npl.principal ? parseFloat(npl.principal) : 0;
  const iN = npl.intereses ? parseFloat(npl.intereses) : 0;
  const cN = npl.costas ? parseFloat(npl.costas) : 0;
  const deudaActualizada = pN + iN + cN > 0 ? pN + iN + cN : null;
  const limiteCostasPct = pN > 0 ? pN * 0.05 : null;

  return (
    <div className="space-y-6 pb-12">
      {/* ── Cabecera ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {npl.nuestroCodigoNpl && (
              <span className="font-mono text-sm font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-0.5">
                {npl.nuestroCodigoNpl}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {npl.tituloOperacion}
            </h1>
            <NplStatusBadge estado={npl.estado} />
            {npl.esPublico && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                Público
              </span>
            )}
          </div>
          {(npl.municipio || npl.provincia) && (
            <p className="mt-1 text-sm text-gray-500">
              📍{' '}
              {[npl.municipio, npl.provincia, npl.codigoPostal]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
          {(npl.referenciaOrigen || npl.fondo) && (
            <p className="mt-0.5 font-mono text-xs text-gray-400">
              {[npl.referenciaOrigen, npl.fondo].filter(Boolean).join(' — ')}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Link
            href={`/dashboard/npl/${npl.id}/edit`}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Editar
          </Link>
          <DownloadPdfButton
            nplId={npl.id}
            tituloOperacion={npl.tituloOperacion}
          />
          <Link
            href="/dashboard/npl"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {/* ── Imagen principal ─────────────────────────────────────────────── */}
      {npl.imagenAsociada && (
        <div className="overflow-hidden rounded-xl shadow-sm">
          <Image
            src={npl.imagenAsociada}
            alt={npl.tituloOperacion}
            width={1200}
            height={500}
            className="h-72 w-full object-cover"
          />
        </div>
      )}

      {npl.imagenesAdicionales?.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {npl.imagenesAdicionales.map((url, i) => (
            <Image
              key={url}
              src={url}
              alt={`Imagen ${i + 2}`}
              width={200}
              height={140}
              className="h-32 w-44 rounded-lg object-cover shadow-sm"
            />
          ))}
        </div>
      )}

      {/* ── A. Datos registrales ──────────────────────────────────────────── */}
      <Section title="A. Superficies y datos registrales">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DataRow
            label="Tipo de inmueble"
            value={NPL_TIPO_INMUEBLE_LABELS[npl.tipoInmueble]}
          />
          <DataRow
            label="Superficie construida"
            value={npl.superficieConst ? `${npl.superficieConst} m²` : null}
          />
          <DataRow
            label="Superficie parcela"
            value={npl.superficieParcela ? `${npl.superficieParcela} m²` : null}
          />
          <DataRow label="Año de construcción" value={npl.anyConstruccion} />
          <DataRow label="Ref. catastral" value={npl.refCatastral} />
          <DataRow label="Finca registral" value={npl.fincaRegistral} />
          {npl.superficieDetalles && (
            <div className="col-span-2 sm:col-span-3">
              <DataRow
                label="Detalles superficies"
                value={npl.superficieDetalles}
              />
            </div>
          )}
          {npl.distribucionResumida && (
            <div className="col-span-2 sm:col-span-3">
              <DataRow label="Distribución" value={npl.distribucionResumida} />
            </div>
          )}
          {npl.distribucion && npl.distribucion !== '<p></p>' && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-sm font-medium text-gray-500">
                Distribución detallada
              </dt>
              <dd className="mt-1">
                <RichTextContent html={npl.distribucion} />
              </dd>
            </div>
          )}
          {npl.datosRegistro && (
            <div className="col-span-2 sm:col-span-3">
              <DataRow label="Datos de registro" value={npl.datosRegistro} />
            </div>
          )}
          {npl.direccion && (
            <div className="col-span-2 sm:col-span-3">
              <DataRow label="Dirección" value={npl.direccion} />
            </div>
          )}
        </dl>
      </Section>

      {/* ── B. Rentabilidad ──────────────────────────────────────────────── */}
      <Section title="B. Rentabilidad">
        {/* Deuda actualizada — display calculado */}
        {deudaActualizada !== null && (
          <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div className="flex flex-wrap items-baseline gap-6 mb-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Deuda actualizada
                </span>
                <span className="ml-2 text-xl font-bold text-blue-900">
                  {fmt(String(deudaActualizada))}
                </span>
                {npl.fechaCalculada && (
                  <span className="ml-3 text-xs text-blue-500">
                    a {fmtDate(npl.fechaCalculada)}
                  </span>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <dt className="text-xs text-blue-500">Principal</dt>
                <dd className="font-medium text-blue-900">
                  {fmt(npl.principal) ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-blue-500">Intereses</dt>
                <dd className="font-medium text-blue-900">
                  {fmt(npl.intereses) ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-blue-500">
                  Costas
                  {limiteCostasPct && (
                    <span className="ml-1 text-blue-400">
                      (lím. 5%: {fmt(String(limiteCostasPct))})
                    </span>
                  )}
                </dt>
                <dd className="font-medium text-blue-900">
                  {fmt(npl.costas) ?? '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DataRow
            label="Coste adquisición crédito"
            value={fmt(npl.costeAdquisicionCredito)}
          />
          <DataRow label="Impuestos AJD" value={fmt(npl.impuestosAjd)} />
          <DataRow
            label="Costes notaría y registro"
            value={fmt(npl.costesNotariaRegistro)}
          />
          <DataRow label="Gastos dación" value={fmt(npl.gastosDacion)} />
          <DataRow label="Precio de mercado" value={fmt(npl.precioMercado)} />
          <DataRow
            label="Precio venta rápida"
            value={fmt(npl.precioVentaRapida)}
          />
          <DataRow
            label="Comisión intermediación"
            value={fmt(npl.comisionIntermediacion)}
          />
          <DataRow label="Puja probable" value={fmt(npl.pujaProbable)} />
          {npl.fechaCompra && (
            <DataRow label="Fecha de compra" value={fmtDate(npl.fechaCompra)} />
          )}
          {npl.fechaTerminacion && (
            <DataRow
              label="Fecha de terminación"
              value={fmtDate(npl.fechaTerminacion)}
            />
          )}
        </dl>

        {/* Gastos diversos */}
        {Array.isArray(npl.gastosDiversos) &&
          (npl.gastosDiversos as { titulo: string; valor: number }[]).length >
            0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Gastos diversos
              </h4>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(
                  npl.gastosDiversos as { titulo: string; valor: number }[]
                ).map((g, i) => (
                  <DataRow
                    key={i}
                    label={g.titulo}
                    value={fmt(String(g.valor))}
                  />
                ))}
              </dl>
            </div>
          )}

        {/* Información para el inversor */}
        {npl.informacionInversor && npl.informacionInversor !== '<p></p>' && (
          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-blue-600">
              Información para el inversor
            </p>
            <RichTextContent
              html={npl.informacionInversor}
              className="text-blue-800"
            />
          </div>
        )}
      </Section>

      {/* ── Escenarios de inversión ───────────────────────────────────────── */}
      <Section title="Escenarios de inversión">
        <NplEscenariosRentabilidad escenarios={escenarios} />
      </Section>

      {/* ── C. Estado procesal ───────────────────────────────────────────── */}
      <Section title="C. Estado real y procesal">
        {/* Tasación subasta */}
        {npl.tasacionSubasta && (
          <div className="mb-4 rounded-md bg-gray-50 border border-gray-200 px-4 py-2 inline-flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tasación subasta
            </span>
            <span className="text-base font-bold text-gray-900">
              {fmt(npl.tasacionSubasta)}
            </span>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DataRow
            label="Procedimiento"
            value={
              npl.procedimiento
                ? NPL_PROCEDIMIENTO_LABELS[npl.procedimiento]
                : null
            }
          />
          <DataRow label="Núm. procedimiento" value={npl.numProcedimiento} />
          <DataRow label="Juzgado" value={npl.juzgado} />
          <DataRow label="Ejecutante" value={npl.ejecutante} />
        </dl>

        {npl.autoDespachoEjecucion && (
          <div className="mt-4">
            <dt className="text-xs uppercase tracking-wide text-gray-400">
              Auto de despacho de ejecución
            </dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {npl.autoDespachoEjecucion}
            </dd>
          </div>
        )}

        {npl.prestamoHipotecaDetalles && (
          <div className="mt-3">
            <DataRow
              label="Préstamo / hipoteca"
              value={npl.prestamoHipotecaDetalles}
            />
          </div>
        )}

        {/* Actuaciones judiciales */}
        {Array.isArray(npl.actuacionesJudiciales) &&
          (npl.actuacionesJudiciales as { fecha: string; titulo: string }[])
            .length > 0 && (
            <div className="mt-5 border-t pt-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-gray-400">
                Actuaciones judiciales
              </p>
              <ul className="space-y-2">
                {(
                  npl.actuacionesJudiciales as {
                    fecha: string;
                    titulo: string;
                  }[]
                ).map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-mono text-xs text-gray-400 pt-0.5">
                      {fmtDate(a.fecha)}
                    </span>
                    <span className="text-gray-700">{a.titulo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Actuaciones seguidas */}
        {npl.actuacionesSeguidas && npl.actuacionesSeguidas !== '<p></p>' && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">
              Actuaciones seguidas
            </p>
            <RichTextContent
              html={npl.actuacionesSeguidas}
              className="text-gray-700"
            />
          </div>
        )}

        {/* Riesgos jurídicos */}
        {npl.riesgosJuridicos && npl.riesgosJuridicos !== '<p></p>' && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-amber-600">
              ⚠ Riesgos jurídicos
            </p>
            <RichTextContent
              html={npl.riesgosJuridicos}
              className="text-amber-800"
            />
          </div>
        )}

        {/* Notas internas */}
        {npl.notasInternas && npl.notasInternas !== '<p></p>' && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">
              Notas internas
            </p>
            <RichTextContent
              html={npl.notasInternas}
              className="text-gray-700"
            />
          </div>
        )}
      </Section>

      {/* ── D. Deudores ──────────────────────────────────────────────────── */}
      <Section title="D. Deudores / Hipotecantes / Fiadores">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {deudores.length === 0
              ? 'Sin registros.'
              : `${deudores.length} registro${deudores.length > 1 ? 's' : ''}.`}
          </p>
          <Link
            href={`/dashboard/npl/${npl.id}/deudores`}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Gestionar
          </Link>
        </div>

        {deudores.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {deudores.map((d) => (
              <li key={d.id} className="py-3 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {d.nombre}
                  </span>
                  {/* Badge tipo registro */}
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                    {NPL_TIPO_REGISTRO_LABELS[d.tipoRegistro] ?? d.tipoRegistro}
                  </span>
                  {d.esPrincipal && (
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                      Principal
                    </span>
                  )}
                  {d.dni && (
                    <span className="text-sm text-gray-500">DNI: {d.dni}</span>
                  )}
                </div>
                {d.direccionCompleta && (
                  <p className="text-sm text-gray-500">{d.direccionCompleta}</p>
                )}
                {d.estadoOcupacional && (
                  <p className="text-sm text-gray-500">{d.estadoOcupacional}</p>
                )}
                {d.vulnerabilidad && (
                  <p className="text-sm font-medium text-amber-700">
                    ⚠ {d.vulnerabilidad}
                  </p>
                )}
                {d.notas && (
                  <p className="text-sm italic text-gray-400">{d.notas}</p>
                )}
                {/* Otros datos (procurador, abogado, etc.) */}
                {Array.isArray(d.otrosDatos) &&
                  (d.otrosDatos as { titulo: string; nombre: string }[])
                    .length > 0 && (
                    <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {(
                        d.otrosDatos as { titulo: string; nombre: string }[]
                      ).map((od, i) => (
                        <div key={i} className="text-sm">
                          <dt className="inline text-xs text-gray-400 uppercase tracking-wide">
                            {od.titulo}:{' '}
                          </dt>
                          <dd className="inline text-gray-700">{od.nombre}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── E. Tareas / Actuaciones ──────────────────────────────────────── */}
      <NplTasksSection nplId={npl.id} tasks={nplTasks} />

      {/* ── Adjuntos ─────────────────────────────────────────────────────── */}
      <Section title="Documentos adjuntos">
        <DocumentsList documents={documents} />
      </Section>

      {/* ── Control interno ──────────────────────────────────────────────── */}
      <Section title="Control interno">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DataRow label="Estado" value={NPL_ESTADO_LABELS[npl.estado]} />
          <DataRow
            label="Visibilidad"
            value={npl.esPublico ? 'Público' : 'Privado'}
          />
          <DataRow
            label="Creado por"
            value={(npl as NplListItem).creatorName ?? '—'}
          />
          <DataRow
            label="Creado"
            value={new Date(npl.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
          <DataRow
            label="Actualizado"
            value={new Date(npl.updatedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </dl>
      </Section>
    </div>
  );
}
