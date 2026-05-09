'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteClienteAction } from '../actions/cliente-actions';
import { useClienteStore } from '../stores/cliente.store';

export default function DeleteClienteDialog() {
  const router = useRouter();
  const { deleteOpen, setDeleteOpen, selectedCliente, setSelectedCliente } = useClienteStore();

  if (!deleteOpen || !selectedCliente) return null;

  const handleCancel = () => { setDeleteOpen(false); setSelectedCliente(null); };

  const handleConfirm = async () => {
    const { error, success } = await deleteClienteAction(selectedCliente.id);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      setDeleteOpen(false);
      setSelectedCliente(null);
      router.refresh();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">¿Eliminar cliente?</h2>
        <p className="mt-2 text-sm text-gray-600">
          Vas a eliminar a <span className="font-semibold">{selectedCliente.nombre}</span>.
          Esta acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
