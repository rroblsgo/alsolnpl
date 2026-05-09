'use client';

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-red-600">
        Error al cargar el meeti
      </h1>
      <p className="mt-2 text-gray-700">{error.message}</p>
    </div>
  );
}
