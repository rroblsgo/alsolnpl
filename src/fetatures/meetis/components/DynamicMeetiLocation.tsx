'use client';

import dynamic from 'next/dynamic';

export const DynamicMeetiLocation = dynamic(() => import('./MeetiLocation'), {
  loading: () => <p>Cargando ubicación...</p>,
  ssr: false,
});
