'use client';

import { X } from 'lucide-react';
import { NotaExpedienteItem } from '@/src/db/schema/expediente_npl';

type Props = {
  item: NotaExpedienteItem;
  onClose: () => void;
};

export default function ExpedienteContentModal({ item, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl bg-white shadow-2xl">
        {/* Cabecera */}
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">
              {new Date(item.fecha).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
            <h3 className="text-base font-bold text-gray-900">{item.titulo}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Contenido */}
        <div className="px-6 py-5">
          {item.contenido ? (
            <div
              className="prose prose-sm max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: item.contenido }}
            />
          ) : (
            <p className="text-sm italic text-gray-400">Sin contenido.</p>
          )}
        </div>
      </div>
    </div>
  );
}
