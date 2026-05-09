import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAuth } from '@/src/lib/auth-server';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import Heading from '@/src/shared/components/typography/Heading';
import { documentRepository } from '@/src/fetatures/documents/services/DocumentRepository';
import DocumentDetailCard from '@/src/fetatures/documents/components/DocumentDetailCard';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const doc = await documentRepository.findByIdWithUploader(Number(id));
  return {
    title: generatePageTitle(doc?.titulo ?? 'Documento'),
  };
}

export default async function DocumentDetailPage({ params }: Props) {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const { id } = await params;
  const doc = await documentRepository.findByIdWithUploader(Number(id));
  if (!doc) notFound();

  // Resolve the parent entity name dynamically
  let entityTitle: string | null = null;
  let entityEditUrl: string;
  if (doc.entityType === 'NPL') {
    const { nplService } = await import(
      '@/src/fetatures/gestion_npl/services/NplService'
    );
    const npl = await nplService.getNpl(doc.entityId).catch(() => null);
    entityTitle = npl?.tituloOperacion ?? null;
    entityEditUrl = `/dashboard/npl/${doc.entityId}/edit`;
  } else {
    const { taskService } = await import(
      '@/src/fetatures/tasks/services/TaskService'
    );
    const task = await taskService.getTask(doc.entityId).catch(() => null);
    entityTitle = task?.title ?? null;
    entityEditUrl = `/dashboard/tasks/${doc.entityId}/edit`;
  }

  return (
    <>
      <Heading className="text-center text-amber-500">Documento</Heading>
      <Link
        href="/dashboard/documents"
        className="mt-5 inline-block rounded-lg bg-orange-500 px-10 py-3 text-center text-xs font-bold text-white transition-colors hover:bg-orange-600 lg:text-xl"
      >
        ← Volver a documentos
      </Link>
      <div className="mt-8">
        <DocumentDetailCard
          doc={doc}
          entityTitle={entityTitle}
          entityEditUrl={entityEditUrl}
        />
      </div>
    </>
  );
}
