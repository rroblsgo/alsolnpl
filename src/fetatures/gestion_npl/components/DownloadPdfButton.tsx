'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';

type Props = {
  nplId: number;
  tituloOperacion: string;
};

export default function DownloadPdfButton({ nplId, tituloOperacion }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/npl/${nplId}/pdf`);

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      // Crear blob y descargar
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const slug = tituloOperacion
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      a.download = `folleto-${slug}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al generar el PDF. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {loading ? 'Generando PDF...' : 'Descargar folleto PDF'}
      </button>
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
