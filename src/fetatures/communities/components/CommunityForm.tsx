import {
  FormError,
  FormInput,
  FormLabel,
  FormTextarea,
} from '@/src/shared/components/forms';
import { useFormContext } from 'react-hook-form';
import { CommunityInput } from '../schemas/communitySchema';
import UploadImage from '@/components/upload/UploadImage';

export default function CommunityForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CommunityInput>();

  return (
    <>
      <FormLabel htmlFor="name">Nombre Comunidad</FormLabel>
      <FormInput
        id="name"
        type="text"
        placeholder="Título Comunidad"
        {...register('name')}
      />
      {errors.name && <FormError>{errors.name.message}</FormError>}

      <FormLabel>Imagen Comunidad</FormLabel>
      <UploadImage uploadedImageLabel="Imagen Publicada Comunidad:" />

      <FormLabel htmlFor="description">Descripción Comunidad</FormLabel>
      <FormTextarea
        id="description"
        placeholder="Descripción Comunidad"
        {...register('description')}
      />
      {errors.description && (
        <FormError>{errors.description.message}</FormError>
      )}
    </>
  );
}
