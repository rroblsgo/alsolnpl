'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { UploadDropzone } from '@/shared/utils/uploadthing';
import { NplInput } from '../schemas/nplSchema';

type Props = {
  fieldName: 'imagenAsociada' | 'imagenesAdicionales';
  multiple: boolean;
};

export default function NplImageUploader({ fieldName, multiple }: Props) {
  const { setValue, getValues } = useFormContext<NplInput>();
  const [newImages, setNewImages] = useState<string[]>([]);

  // ─── Imagen principal (single) ────────────────────────────────────────────
  if (fieldName === 'imagenAsociada') {
    const currentImage = getValues('imagenAsociada') || null;
    const displayImage = newImages[0] || currentImage;

    return (
      <div className="space-y-3">
        <UploadDropzone
          endpoint="nplImageUploader"
          className="ut-button:bg-orange-600 hover:ut-button:bg-orange-700"
          onClientUploadComplete={(res) => {
            const url = res[0].ufsUrl;
            setNewImages([url]);
            setValue('imagenAsociada', url);
          }}
          appearance={{
            button:
              'font-black py-3 w-full block h-auto after:bg-orange-500 after:h-4 after:top-0',
            label: 'text-sm text-gray-500 hover:text-gray-800',
            allowedContent: 'text-sm',
          }}
          content={{
            button: 'Selecciona la imagen principal',
            label: 'Elige un archivo o arrástralo aquí',
            allowedContent: 'Máximo 1 imagen de 4 MB',
          }}
          config={{ cn: twMerge, mode: 'auto' }}
        />

        {displayImage && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              {newImages[0] ? 'Imagen subida:' : 'Imagen actual:'}
            </p>
            <div className="relative">
              <Image
                src={displayImage}
                alt="Imagen principal del NPL"
                width={300}
                height={200}
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setNewImages([]);
                  setValue('imagenAsociada', '');
                }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Imágenes adicionales (multiple) ─────────────────────────────────────
  const currentImages = getValues('imagenesAdicionales') || [];
  const allImages = [
    ...currentImages,
    ...newImages.filter((u) => !currentImages.includes(u)),
  ];

  const handleRemove = (url: string) => {
    const updated = allImages.filter((u) => u !== url);
    setValue('imagenesAdicionales', updated);
    setNewImages((prev) => prev.filter((u) => u !== url));
  };

  return (
    <div className="space-y-3">
      <UploadDropzone
        endpoint="nplImageUploader"
        className="ut-button:bg-orange-600 hover:ut-button:bg-orange-700"
        onClientUploadComplete={(res) => {
          const urls = res.map((f) => f.ufsUrl);
          setNewImages((prev) => [...prev, ...urls]);
          setValue('imagenesAdicionales', [...allImages, ...urls]);
        }}
        appearance={{
          button:
            'font-black py-3 w-full block h-auto after:bg-orange-500 after:h-4 after:top-0',
          label: 'text-sm text-gray-500 hover:text-gray-800',
          allowedContent: 'text-sm',
        }}
        content={{
          button: 'Añadir imágenes adicionales',
          label: 'Elige archivos o arrástralos aquí',
          allowedContent: 'Hasta 5 imágenes de 4 MB cada una',
        }}
        config={{ cn: twMerge, mode: 'auto' }}
      />

      {allImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            Imágenes ({allImages.length}):
          </p>
          <div className="flex flex-wrap gap-3">
            {allImages.map((url) => (
              <div key={url} className="relative">
                <Image
                  src={url}
                  alt="Imagen adicional"
                  width={120}
                  height={80}
                  className="rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
