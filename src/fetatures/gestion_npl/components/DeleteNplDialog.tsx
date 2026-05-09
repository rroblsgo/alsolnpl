'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteNplAction } from '../actions/npl-actions';
import { useNplStore } from '../stores/npl.store';

export default function DeleteNplDialog() {
  const router = useRouter();
  const { deleteOpen, setDeleteOpen, selectedNpl, setSelectedNpl } = useNplStore();

  if (!deleteOpen || !selectedNpl) return null;

  const handleCancel = () => {
    setDeleteOpen(false);
    setSelectedNpl(null);
  };

  const handleConfirm = async () => {
    const { error, success } = await deleteNplAction(selectedNpl.id);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      setDeleteOpen(false);
      setSelectedNpl(null);
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">¿Eliminar NPL?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Vas a eliminar <span className="font-semibold">{selectedNpl.tituloOperacion}</span>.
          Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
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
