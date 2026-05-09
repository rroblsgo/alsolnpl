'use client';

import Heading from '@/src/shared/components/typography/Heading';

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="py-10 text-center">
      <Heading level={2} className="text-red-600">
        Error al cargar el Meeti
      </Heading>
      <p className="mt-2 text-gray-700 text-2xl">{error.message}</p>
    </div>
  );
}
