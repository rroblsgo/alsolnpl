import Link from 'next/link';
import type { Route } from 'next';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import EditNpl from '@/src/fetatures/gestion_npl/components/EditNpl';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import DocumentsPanel from '@/src/fetatures/documents/components/DocumentsPanel';
import { documentService } from '@/src/fetatures/documents/services/DocumentService';
import { expedienteService } from '@/src/fetatures/expediente_npl/services/ExpedienteService';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const npl = await nplService.getNpl(Number(id));
  return {
    title: generatePageTitle(`Editar: ${npl.tituloOperacion}`),
  };
}

export default async function EditNplPage({ params, searchParams }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const { returnTo } = await searchParams;
  const nplId = Number(id);

  // Carga en paralelo: NPL, documentos del NPL, notas de expediente, usuarios
  const [npl, documents, expedienteNotas, userOptions] = await Promise.all([
    nplService.getNplForEdit(nplId, session.user),
    documentService.listByEntity('NPL', nplId),
    expedienteService.listByNpl(nplId),
    expedienteService.listUserOptions(),
  ]);

  // Documentos de cada nota (en paralelo)
  const notaDocsEntries = await Promise.all(
    expedienteNotas.map(async (nota) => {
      const docs = await documentService.listByEntity('EXPEDIENTE_NOTA', nota.id);
      return [nota.id, docs] as const;
    })
  );
  const notaDocsMap = Object.fromEntries(notaDocsEntries);

  return (
    <>
      <Heading className="text-center text-amber-500">Editar NPL</Heading>
      <Link
        href={(returnTo ?? '/dashboard/npl') as Route}
        className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-center text-xs font-bold text-white transition-colors hover:bg-orange-600 lg:text-xl"
      >
        Volver a NPLs
      </Link>
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <EditNpl
          npl={npl}
          returnTo={returnTo}
          expedienteNotas={expedienteNotas}
          notaDocsMap={notaDocsMap}
          userOptions={userOptions}
        />
      </div>

      {/* ── Documentos adjuntos al NPL ──────────────────────────────────── */}
      <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-1 text-base font-bold text-gray-900">
          Documentos adjuntos
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Añade escrituras, notas simples, tasaciones u otros documentos
          asociados a este NPL.
        </p>
        <DocumentsPanel
          entityType="NPL"
          entityId={nplId}
          initialDocuments={documents}
          uploadEndpoint="nplAdjuntosUploader"
          uploaderLabel="PDF, Word, Excel u otros archivos"
          uploaderAllowedContent="Hasta 10 archivos de 16 MB cada uno"
        />
      </div>
    </>
  );
}
