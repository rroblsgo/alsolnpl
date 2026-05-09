import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import { clienteService } from '@/src/fetatures/clientes/services/ClienteService';
import { ClientePolicy } from '@/src/fetatures/clientes/policies/ClientePolicy';
import {
  CLIENTE_PERFIL_LABELS,
  CLIENTE_OCUPACION_LABELS,
  CLIENTE_RANGO_CAPITAL_LABELS,
  CLIENTE_ESTADO_LABELS,
  CLIENTE_FUENTE_LABELS,
  ACTIVOS_INTERESADO_OPTIONS,
} from '@/src/fetatures/clientes/types/cliente.types';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import ClienteStatusBadge from '@/src/fetatures/clientes/components/ClienteStatusBadge';
import { ContactoItem } from '@/src/db/schema/clientes';
import RichTextContent from '@/src/shared/components/ui/RichTextContent';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const clienteId = Number(id);
  if (isNaN(clienteId)) notFound();
  const cliente = await clienteService.getCliente(clienteId);
  // const cliente = await clienteService.getCliente(Number(id));
  return { title: generatePageTitle(cliente.nombre) };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 border-b pb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h2>
      {children}
    </div>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

export default async function ClienteDetailPage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');
  const { id } = await params;
  const clienteId = Number(id);
  if (isNaN(clienteId)) notFound();
  const cliente = await clienteService.getCliente(clienteId);
  // const cliente = await clienteService.getCliente(Number(id));
  if (!ClientePolicy.canView(session.user, cliente))
    redirect('/dashboard/clientes');

  const emails = (cliente.emails as ContactoItem[]) ?? [];
  const telefonos = (cliente.telefonos as ContactoItem[]) ?? [];
  const contactos = (cliente.contactos as ContactoItem[]) ?? [];

  const activosLabels = cliente.activosInteresado
    .map(
      (a) => ACTIVOS_INTERESADO_OPTIONS.find((o) => o.value === a)?.label ?? a
    )
    .join(', ');

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {cliente.imagen ? (
            <Image
              src={cliente.imagen}
              alt={cliente.nombre}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-orange-200"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
              {cliente.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {cliente.nombre}
              </h1>
              <ClienteStatusBadge estado={cliente.estado} />
            </div>
            {cliente.empresa && (
              <p className="text-sm text-gray-500">{cliente.empresa}</p>
            )}
            {(cliente.municipio || cliente.provincia) && (
              <p className="text-sm text-gray-500">
                📍{' '}
                {[cliente.municipio, cliente.provincia]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/dashboard/clientes/${cliente.id}/edit`}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Editar
          </Link>
          <Link
            href="/dashboard/clientes"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            ← Volver
          </Link>
        </div>
      </div>

      {/* A. Datos básicos */}
      <Section title="A. Datos básicos">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DataRow label="DNI" value={cliente.dni} />
          <DataRow label="Empresa" value={cliente.empresa} />
          <DataRow label="NIF empresa" value={cliente.nif} />
          <DataRow label="Dirección" value={cliente.direccion} />
          <DataRow label="Municipio" value={cliente.municipio} />
          <DataRow label="Provincia" value={cliente.provincia} />
          <DataRow label="Código postal" value={cliente.codigoPostal} />
        </dl>
      </Section>

      {/* B. Contacto */}
      {(emails.length > 0 || telefonos.length > 0 || contactos.length > 0) && (
        <Section title="B. Contacto">
          <div className="space-y-4">
            {emails.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                  Emails
                </p>
                {emails.map((e, i) => (
                  <p key={i} className="text-sm">
                    <span className="text-gray-500">{e.titulo}:</span>{' '}
                    <a
                      href={`mailto:${e.valor}`}
                      className="text-orange-600 hover:underline"
                    >
                      {e.valor}
                    </a>
                  </p>
                ))}
              </div>
            )}
            {telefonos.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                  Teléfonos
                </p>
                {telefonos.map((t, i) => (
                  <p key={i} className="text-sm">
                    <span className="text-gray-500">{t.titulo}:</span> {t.valor}
                  </p>
                ))}
              </div>
            )}
            {contactos.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                  Otros contactos
                </p>
                {contactos.map((c, i) => (
                  <p key={i} className="text-sm">
                    <span className="text-gray-500">{c.titulo}:</span> {c.valor}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* C. Perfil inversor */}
      <Section title="C. Perfil inversor">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DataRow
            label="Perfil"
            value={
              cliente.perfilInversor
                ? CLIENTE_PERFIL_LABELS[cliente.perfilInversor]
                : null
            }
          />
          <DataRow
            label="Ocupación"
            value={
              cliente.ocupacionPrincipal
                ? CLIENTE_OCUPACION_LABELS[cliente.ocupacionPrincipal]
                : null
            }
          />
          <DataRow
            label="Capital a invertir"
            value={
              cliente.rangoCapitalInvertir
                ? CLIENTE_RANGO_CAPITAL_LABELS[cliente.rangoCapitalInvertir]
                : null
            }
          />
          {activosLabels && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Activos de interés
              </dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {cliente.activosInteresado.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700"
                  >
                    {ACTIVOS_INTERESADO_OPTIONS.find((o) => o.value === a)
                      ?.label ?? a}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {cliente.experienciaPreviaDetalle && (
            <div className="col-span-2 sm:col-span-3">
              <DataRow
                label="Experiencia previa"
                value={cliente.experienciaPreviaDetalle}
              />
            </div>
          )}
          {cliente.informadoNplDetalle && (
            <div className="col-span-2 sm:col-span-3">
              <DataRow
                label="Cómo conoce los NPL"
                value={cliente.informadoNplDetalle}
              />
            </div>
          )}
        </dl>
      </Section>

      {/* D. Gestión interna */}
      <Section title="D. Gestión interna">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DataRow
            label="Estado"
            value={CLIENTE_ESTADO_LABELS[cliente.estado]}
          />
          <DataRow
            label="Fuente captación"
            value={
              cliente.fuenteCaptacion
                ? CLIENTE_FUENTE_LABELS[cliente.fuenteCaptacion]
                : null
            }
          />
          <DataRow
            label="RGPD"
            value={
              cliente.consentimientoRgpd
                ? 'Consentimiento otorgado'
                : 'Sin consentimiento'
            }
          />
          {cliente.fechaConsentimiento && (
            <DataRow
              label="Fecha consentimiento"
              value={new Date(cliente.fechaConsentimiento).toLocaleDateString(
                'es-ES',
                { day: 'numeric', month: 'long', year: 'numeric' }
              )}
            />
          )}
          <DataRow
            label="Alta"
            value={new Date(cliente.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </dl>

        {cliente.notas && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
              Notas internas
            </p>
            <RichTextContent html={cliente.notas} className="text-gray-700" />
          </div>
        )}
      </Section>
    </div>
  );
}
