import { Metadata } from 'next';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import NplGrid from '@/src/fetatures/gestion_npl/components/NplGrid';

export const metadata: Metadata = {
  title: 'Oportunidades de Inversión NPL',
  description: 'Explora nuestras oportunidades de inversión en crédito hipotecario NPL.',
};

export default async function NplPublicPage() {
  const npls = await nplService.listPublicNpls();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Cabecera */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Oportunidades de Inversión
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Crédito hipotecario garantizado — rentabilidades superiores al mercado
          </p>
        </div>

        {npls.length > 0 ? (
          <NplGrid npls={npls} />
        ) : (
          <div className="py-24 text-center">
            <p className="text-lg text-gray-500">
              No hay oportunidades disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
