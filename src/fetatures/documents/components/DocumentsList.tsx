import { FileText, Paperclip } from 'lucide-react';
import { DocumentListItem, DOCUMENT_CATEGORY_LABELS } from '../types/document.types';

function getExtension(doc: DocumentListItem): string {
  return doc.extension ?? doc.nombreArchivo?.split('.').pop()?.toLowerCase() ?? '';
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ extension }: { extension: string }) {
  const colorMap: Record<string, string> = {
    pdf: 'text-red-500',
    doc: 'text-blue-600',
    docx: 'text-blue-600',
    xls: 'text-green-600',
    xlsx: 'text-green-600',
    jpg: 'text-amber-500',
    jpeg: 'text-amber-500',
    png: 'text-amber-500',
  };
  return (
    <FileText
      className={`h-4 w-4 shrink-0 ${colorMap[extension] ?? 'text-gray-400'}`}
    />
  );
}

type Props = {
  documents: DocumentListItem[];
};

export default function DocumentsList({ documents }: Props) {
  if (documents.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-gray-400">
        <Paperclip className="h-4 w-4" />
        Sin documentos adjuntos
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {documents.map((doc) => {
        const ext = getExtension(doc);
        return (
          <li key={doc.id} className="flex items-start gap-3 py-3">
            <FileIcon extension={ext} />
            <div className="min-w-0 flex-1">
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-orange-600 hover:underline"
                title={doc.titulo}
              >
                {doc.titulo}
              </a>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {DOCUMENT_CATEGORY_LABELS[doc.categoria]}
                </span>
                {doc.nombreArchivo && (
                  <span className="text-xs text-gray-400 truncate max-w-[180px]" title={doc.nombreArchivo}>
                    {doc.nombreArchivo}
                  </span>
                )}
                {doc.tamano && (
                  <span className="text-xs text-gray-400">
                    {formatFileSize(doc.tamano)}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {new Date(doc.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                {doc.uploaderName && (
                  <span className="text-xs text-gray-400">
                    por {doc.uploaderName}
                  </span>
                )}
              </div>
              {doc.notas && (
                <p className="mt-1 text-xs italic text-gray-500">{doc.notas}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
