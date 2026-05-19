'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { deleteCarteraAction } from '../actions/fondo-actions';
import type { SelectCartera, MapItem } from '../types/fondo.types';

type Props = { carteras: SelectCartera[]; isAdmin: boolean };

export default function CarteraListPanel({ carteras, isAdmin }: Props) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    const { error, success } = await deleteCarteraAction(id);
    if (error) toast.error(error);
    if (success) { toast.success(success); router.refresh(); }
    setConfirmId(null);
  };

  if (carteras.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No hay carteras definidas para este fondo.</p>;
  }

  return (
    <div className="space-y-3">
      {carteras.map((c) => {
        const items = (c.mapItems as MapItem[]) ?? [];
        return (
          <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">{c.carteraName}</p>
              {c.excelFile && <p className="text-xs text-gray-400 font-mono">{c.excelFile}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {items.length > 0 ? `${items.length} columnas mapeadas` : 'Sin mapeo definido'}
                {c.assetManager && ` · ${c.assetManager}`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2 items-center justify-end">

              {/* Ver operaciones — visible para todos */}
              <Link href={`/dashboard/fondos/carteras/${c.id}/operaciones`}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                Ver operaciones
              </Link>

              {/* Mapeo y eliminar — solo admin */}
              {isAdmin && (
                <>
                  <Link href={`/dashboard/fondos/carteras/${c.id}/mapeo`}
                    className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100">
                    {items.length > 0 ? 'Ver/editar mapeo' : 'Definir mapeo'}
                  </Link>

                  {confirmId === c.id ? (
                    <>
                      <button onClick={() => handleDelete(c.id)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                        Confirmar
                      </button>
                      <button onClick={() => setConfirmId(null)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmId(c.id)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      Eliminar
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
