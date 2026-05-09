import { UploadDropzone } from '@/shared/utils/uploadthing';
import { CommunityInput } from '@/src/fetatures/communities/schemas/communitySchema';
import Image from 'next/image';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { FormError } from '../forms';
import { MeetiInput } from '@/src/fetatures/meetis/schemas/meetiSchema';
import { ProfileInput } from '@/src/fetatures/profile/schemas/profileSchema';

type Props = {
  uploadedImageLabel: string;
};

export default function UploadImage({ uploadedImageLabel }: Props) {
  const {
    formState: { errors },
    setValue,
    clearErrors,
    getValues,
  } = useFormContext<CommunityInput | MeetiInput | ProfileInput>();
  const [uploadedImage, setUploadedImage] = useState('');
  const currentImage = getValues('image') ? getValues('image') : null;

  return (
    <>
      <UploadDropzone
        endpoint="meetiUploader"
        className="ut-button:bg-orange-600 hover:ut-button:bg-orange-700"
        onClientUploadComplete={(res) => {
          setUploadedImage(res[0].ufsUrl);
          setValue('image', res[0].ufsUrl);
          clearErrors('image');
        }}
        appearance={{
          button:
            'font-black py-3 w-full block h-auto after:bg-orange-500 after:h-4 after:top-0',
          label: 'text-sm text-gray-500 hover:text-gray-800',
          allowedContent: 'text-sm',
        }}
        content={{
          button: 'Selecciona una imagen para tu comunidad',
          label: 'Elige un archivo o arrástralo aquí',
          allowedContent: 'Máximo 1 imagen de 1 MB',
        }}
        config={{
          cn: twMerge,
          mode: 'auto',
        }}
      />

      {errors.image && <FormError>{errors.image.message}</FormError>}

      {uploadedImage && (
        <>
          <p className="text-lg font-bold">{uploadedImageLabel}</p>
          <Image
            src={uploadedImage}
            alt="Imagen subida"
            width={300}
            height={300}
          />
        </>
      )}

      {currentImage && !uploadedImage && (
        <>
          <p className="text-lg font-bold">Imagen actual:</p>
          <Image
            src={currentImage}
            alt="Imagen actual"
            width={300}
            height={300}
          />
        </>
      )}
    </>
  );
}
