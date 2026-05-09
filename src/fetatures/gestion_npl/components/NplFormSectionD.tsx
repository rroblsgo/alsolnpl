'use client';

import Link from 'next/link';

type Props = {
  // Solo presente en modo edición — permite mostrar el enlace a gestión de deudores
  nplId?: number;
};

export default function NplFormSectionD({ nplId }: Props) {
  if (!nplId) {
    return (
      <div className="space-y-4">
        <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
          D. Deudores
        </h3>
        <div className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-sm text-orange-800">
          <p className="font-semibold">Gestión de deudores</p>
          <p className="mt-1 text-orange-700">
            Los deudores se gestionan una vez guardado el NPL. Después de crear
            el NPL, accede a su detalle y usa el botón{' '}
            <span className="font-semibold">Gestionar deudores</span> para
            añadir el deudor principal y deudores adicionales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        D. Deudores
      </h3>
      <p className="text-sm text-gray-500">
        Los deudores se gestionan desde una sección dedicada donde puedes
        añadir, editar y eliminar tantos deudores como necesite el NPL, marcando
        cuál es el deudor principal.
      </p>
      <Link
        href={`/dashboard/npl/${nplId}/deudores`}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Gestionar deudores
      </Link>
    </div>
  );
}
