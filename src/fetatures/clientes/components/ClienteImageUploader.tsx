'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { UploadDropzone } from '@/shared/utils/uploadthing';
import { ClienteInput } from '../schemas/clienteSchema';

export default function ClienteImageUploader() {
  const { setValue, getValues } = useFormContext<ClienteInput>();
  const [newImage, setNewImage] = useState<string>('');

  const currentImage = getValues('imagen') || null;
  const displayImage = newImage || currentImage;

  return (
    <div className="space-y-3">
      <UploadDropzone
        endpoint="meetiUploader"
        className="ut-button:bg-orange-600 hover:ut-button:bg-orange-700"
        onClientUploadComplete={(res) => {
          const url = res[0].ufsUrl;
          setNewImage(url);
          setValue('imagen', url);
        }}
        appearance={{
          button: 'font-black py-3 w-full block h-auto after:bg-orange-500 after:h-4 after:top-0',
          label: 'text-sm text-gray-500 hover:text-gray-800',
          allowedContent: 'text-sm',
        }}
        content={{
          button: 'Selecciona imagen del cliente',
          label: 'Elige un archivo o arrástralo aquí',
          allowedContent: 'Máximo 1 imagen de 1 MB',
        }}
        config={{ cn: twMerge, mode: 'auto' }}
      />

      {displayImage && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            {newImage ? 'Imagen subida:' : 'Imagen actual:'}
          </p>
          <div className="relative inline-block">
            <Image
              src={displayImage}
              alt="Imagen del cliente"
              width={120}
              height={120}
              className="rounded-full object-cover ring-2 ring-orange-200"
            />
            <button
              type="button"
              onClick={() => { setNewImage(''); setValue('imagen', ''); }}
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
