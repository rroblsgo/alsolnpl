'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import { UploadDropzone } from '@/shared/utils/uploadthing';
import { saveExcelUrlAction } from '../actions/fondo-actions';
import { getExcelHeadersAction } from '../actions/excel-actions';

type Props = {
  carteraId: number;
  currentUrl?: string | null;
  currentFile?: string | null;
  onHeadersLoaded: (headers: string[]) => void;
};

export default function ExcelUploader({ carteraId, currentUrl, currentFile, onHeadersLoaded }: Props) {
  const [loading, setLoading] = useState(false);

  const handleLoadExisting = async () => {
    setLoading(true);
    const { headers, error } = await getExcelHeadersAction(carteraId);
    setLoading(false);
    if (error) toast.error(error);
    else {
      toast.success(`${headers.length} columnas detectadas`);
      onHeadersLoaded(headers);
    }
  };

  return (
    <div className="space-y-3">
      {/* Fichero actual */}
      {currentFile && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-emerald-800">Fichero vinculado</p>
            <p className="text-xs font-mono text-emerald-700 mt-0.5">✓ {currentFile}</p>
          </div>
          <button
            onClick={handleLoadExisting}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Leyendo...' : 'Releer columnas'}
          </button>
        </div>
      )}

      {/* Dropzone para subir / reemplazar */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-600">
          {currentFile ? 'Reemplazar Excel' : 'Subir fichero Excel'}
        </p>
        <UploadDropzone
          endpoint="excelUploader"
          className="ut-button:bg-emerald-600 hover:ut-button:bg-emerald-700 ut-label:text-gray-500"
          onClientUploadComplete={async (res) => {
            const file = res[0];
            // Guardar URL en cartera
            const { error } = await saveExcelUrlAction(carteraId, file.ufsUrl, file.name);
            if (error) { toast.error(error); return; }
            toast.success('Excel subido y vinculado');
            // Leer headers automáticamente
            setLoading(true);
            const { headers, error: hErr } = await getExcelHeadersAction(carteraId);
            setLoading(false);
            if (hErr) toast.error(hErr);
            else {
              toast.success(`${headers.length} columnas detectadas — revisa el mapeo`);
              onHeadersLoaded(headers);
            }
          }}
          onUploadError={(err) => { toast.error(`Error en la subida: ${err.message}`); }}
          appearance={{
            button: 'font-black py-3 w-full block h-auto after:bg-emerald-500 after:h-4 after:top-0',
            label: 'text-sm text-gray-500 hover:text-gray-800',
            allowedContent: 'text-xs text-gray-400',
          }}
          content={{
            button: 'Seleccionar fichero Excel',
            label: 'Elige un .xlsx o arrástralo aquí',
            allowedContent: 'Excel hasta 16 MB',
          }}
          config={{ cn: twMerge, mode: 'auto' }}
        />
      </div>
    </div>
  );
}
