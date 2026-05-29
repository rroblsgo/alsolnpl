import dynamic from 'next/dynamic';

export const DynamicEnrichmentLocation = dynamic(
  () => import('./EnrichmentLocation'),
  { ssr: false }
);
