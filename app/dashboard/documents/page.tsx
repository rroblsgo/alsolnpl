import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/src/lib/auth-server';
import Heading from '@/src/shared/components/typography/Heading';
import { generatePageTitle } from '@/src/shared/utils/metadata';
import { documentService } from '@/src/fetatures/documents/services/DocumentService';
import DocumentsDashboardList from '@/src/fetatures/documents/components/DocumentsDashboardList';

export const metadata: Metadata = {
  title: generatePageTitle('Documentos'),
};

export default async function DocumentsPage() {
  const { session } = await requireAuth();
  if (!session) redirect('/auth/login');

  const documents = await documentService.listAllWithEntity();

  return (
    <>
      <Heading className="text-center text-amber-500">Documentos</Heading>
      <p className="mt-2 text-center text-sm text-gray-500">
        Todos los documentos adjuntos a NPLs y tareas
      </p>
      <DocumentsDashboardList documents={documents} />
    </>
  );
}
