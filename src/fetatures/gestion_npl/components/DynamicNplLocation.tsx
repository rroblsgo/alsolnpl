'use client';

import dynamic from 'next/dynamic';

export const DynamicNplLocation = dynamic(
  () => import('./NplLocation'),
  {
    loading: () => (
      <div className="h-80 w-full rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">Cargando mapa...</p>
      </div>
    ),
    ssr: false,
  }
);
