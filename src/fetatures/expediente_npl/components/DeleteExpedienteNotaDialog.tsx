'use client';

import toast from 'react-hot-toast';
import { deleteExpedienteNotaAction } from '../actions/expediente-actions';

type Props = {
  notaId: number;
  notaTitulo: string;
  open: boolean;
  onClose: () => void;
  onDeleted: (id: number) => void;
};

export default function DeleteExpedienteNotaDialog({
  notaId,
  notaTitulo,
  open,
  onClose,
  onDeleted,
}: Props) {
  if (!open) return null;

  const handleConfirm = async () => {
    const { error, success } = await deleteExpedienteNotaAction(notaId);
    if (error) { toast.error(error); return; }
    toast.success(success);
    onDeleted(notaId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">¿Eliminar nota?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Vas a eliminar la nota{' '}
          <span className="font-semibold">"{notaTitulo}"</span>.
          Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
