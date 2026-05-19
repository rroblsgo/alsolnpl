'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteFondoAction } from '../actions/fondo-actions';

type Props = { fondoId: number; fondoNombre: string };

export default function DeleteFondoDialog({ fondoId, fondoNombre }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const { error, success } = await deleteFondoAction(fondoId);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push('/dashboard/fondos');
      router.refresh();
    }
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
      >
        Eliminar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900">¿Eliminar fondo?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Se eliminará <strong>{fondoNombre}</strong> y todas sus carteras asociadas. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
