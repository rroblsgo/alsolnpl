'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CarteraInput } from '../schemas/carteraSchema';
import { createCarteraAction } from '../actions/fondo-actions';

type Props = { fondoId: number };

export default function CarteraForm({ fondoId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Omit<CarteraInput, 'fondoId' | 'mapItems'>>({
    carteraName:        '',
    excelFile:          '',
    assetManager:       '',
    oficinaResponsable: '',
    comisionGestion:    '',
    fechaDefinicion:    '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.carteraName.trim()) {
      toast.error('El nombre de la cartera es obligatorio');
      return;
    }
    setLoading(true);
    const input: CarteraInput = { ...form, fondoId, mapItems: [] };
    const { error, success, carteraId } = await createCarteraAction(input);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success(success);
    setOpen(false);
    // Redirige al proceso de mapeo
    router.push(`/dashboard/fondos/carteras/${carteraId}/mapeo`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        + Nueva cartera
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Nueva cartera</h2>

            {[
              { name: 'carteraName',        label: 'Nombre de cartera *',   type: 'text'  },
              { name: 'excelFile',          label: 'Nombre fichero Excel',  type: 'text'  },
              { name: 'assetManager',       label: 'Asset Manager',         type: 'text'  },
              { name: 'oficinaResponsable', label: 'Oficina responsable',   type: 'text'  },
              { name: 'comisionGestion',    label: 'Comisión gestión (%)',  type: 'number'},
              { name: 'fechaDefinicion',    label: 'Fecha definición',      type: 'date'  },
            ].map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={(form as Record<string, string>)[name]}
                  onChange={handleChange}
                  step={type === 'number' ? '0.01' : undefined}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            ))}

            <p className="text-xs text-gray-500">
              Tras crear la cartera se abrirá el proceso de mapeo de columnas Excel → campos de operaciones.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Crear cartera y mapear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
