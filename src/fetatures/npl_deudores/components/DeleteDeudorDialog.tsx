'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteDeudorAction } from '../actions/deudor-actions';
import { useDeudorStore } from '../stores/deudor.store';

type Props = { nplId: number };

export default function DeleteDeudorDialog({ nplId }: Props) {
  const router = useRouter();
  const { deleteOpen, setDeleteOpen, selectedDeudor, setSelectedDeudor } = useDeudorStore();

  if (!deleteOpen || !selectedDeudor) return null;

  const handleCancel = () => {
    setDeleteOpen(false);
    setSelectedDeudor(null);
  };

  const handleConfirm = async () => {
    const { error, success } = await deleteDeudorAction(selectedDeudor.id, nplId);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      setDeleteOpen(false);
      setSelectedDeudor(null);
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">¿Eliminar deudor?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Vas a eliminar a{' '}
          <span className="font-semibold">{selectedDeudor.nombre}</span>.
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
