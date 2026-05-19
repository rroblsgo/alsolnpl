import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireDashboard } from '@/src/lib/auth-server';
import { ROLES, hasRole } from '@/src/lib/roles';
import { fondoService } from '@/src/fetatures/fondos/services/FondoService';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import RichTextContent from '@/src/shared/components/ui/RichTextContent';
import CarteraListPanel from '@/src/fetatures/fondos/components/CarteraListPanel';
import CarteraForm from '@/src/fetatures/fondos/components/CarteraForm';
import DeleteFondoDialog from '@/src/fetatures/fondos/components/DeleteFondoDialog';
import type { ContactoItem } from '@/src/db/schema/fondos';
import type { MapItem } from '@/src/db/schema/fondos';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fondoId = Number(id);
  if (isNaN(fondoId)) notFound();
  const fondo = await fondoService.getFondo(fondoId);
  return { title: generatePageTitle(fondo.nombre) };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 border-b pb-2 text-sm font-bold uppercase tracking-wider text-gray-500">{title}</h2>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

export default async function FondoDetailPage({ params }: Props) {
  const session = await requireDashboard();
  const isAdmin = hasRole(session.user.role, [ROLES.ADMIN]);

  const { id } = await params;
  const fondoId = Number(id);
  if (isNaN(fondoId)) notFound();

  const [fondo, carteras] = await Promise.all([
    fondoService.getFondo(fondoId),
    fondoService.getCarterasByFondo(fondoId),
  ]);

  const emails    = (fondo.emails    as ContactoItem[]) ?? [];
  const telefonos = (fondo.telefonos as ContactoItem[]) ?? [];
  const contactos = (fondo.contactos as ContactoItem[]) ?? [];

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {fondo.imagen ? (
            <Image src={fondo.imagen} alt={fondo.nombre} width={64} height={64}
              className="h-16 w-16 rounded-lg object-cover ring-2 ring-blue-200" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 text-2xl font-bold text-blue-700">
              {fondo.nombre.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{fondo.nombre}</h1>
            {fondo.empresa && <p className="text-sm text-gray-500">{fondo.empresa}</p>}
            {(fondo.municipio || fondo.provincia) && (
              <p className="text-sm text-gray-500">
                📍 {[fondo.municipio, fondo.provincia].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {isAdmin && (
            <>
              <Link href={`/dashboard/fondos/${fondo.id}/edit`}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                Editar
              </Link>
              <DeleteFondoDialog fondoId={fondo.id} fondoNombre={fondo.nombre} />
            </>
          )}
          <Link href="/dashboard/fondos"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            ← Volver
          </Link>
        </div>
      </div>

      {/* A. Datos básicos */}
      <Section title="A. Datos básicos">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DataRow label="DNI"           value={fondo.dni} />
          <DataRow label="Empresa"       value={fondo.empresa} />
          <DataRow label="NIF empresa"   value={fondo.nif} />
          <DataRow label="Dirección"     value={fondo.direccion} />
          <DataRow label="Municipio"     value={fondo.municipio} />
          <DataRow label="Provincia"     value={fondo.provincia} />
          <DataRow label="Código postal" value={fondo.codigoPostal} />
        </dl>
      </Section>

      {/* B. Contacto */}
      {(emails.length > 0 || telefonos.length > 0 || contactos.length > 0) && (
        <Section title="B. Contacto">
          <div className="space-y-4">
            {emails.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Emails</p>
                {emails.map((e, i) => (
                  <p key={i} className="text-sm">
                    <span className="text-gray-500">{e.titulo}:</span>{' '}
                    <a href={`mailto:${e.valor}`} className="text-blue-600 hover:underline">{e.valor}</a>
                  </p>
                ))}
              </div>
            )}
            {telefonos.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Teléfonos</p>
                {telefonos.map((t, i) => (
                  <p key={i} className="text-sm"><span className="text-gray-500">{t.titulo}:</span> {t.valor}</p>
                ))}
              </div>
            )}
            {contactos.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Otros contactos</p>
                {contactos.map((c, i) => (
                  <p key={i} className="text-sm"><span className="text-gray-500">{c.titulo}:</span> {c.valor}</p>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* C. Perfil inversor */}
      {fondo.comisionGestion && (
        <Section title="C. Perfil inversor">
          <DataRow label="Comisión de gestión" value={`${fondo.comisionGestion}%`} />
        </Section>
      )}

      {/* D. Notas */}
      {fondo.notas && (
        <Section title="D. Gestión interna">
          <RichTextContent html={fondo.notas} className="text-gray-700" />
        </Section>
      )}

      {/* E. Carteras */}
      <Section title="E. Carteras">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {carteras.length} cartera{carteras.length !== 1 ? 's' : ''} definida{carteras.length !== 1 ? 's' : ''}
          </p>
          {isAdmin && <CarteraForm fondoId={fondo.id} />}
        </div>
        <CarteraListPanel carteras={carteras} isAdmin={isAdmin} />
      </Section>
    </div>
  );
}
