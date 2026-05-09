'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ClienteInput, ClienteSchema } from '../schemas/clienteSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { createClienteAction } from '../actions/cliente-actions';
import ClienteForm from './ClienteForm';

export default function CreateCliente() {
  const router = useRouter();

  const methods = useForm<ClienteInput>({
    resolver: zodResolver(ClienteSchema),
    mode: 'all',
    defaultValues: {
      nombre: '', dni: '', empresa: '', nif: '', imagen: '',
      direccion: '', provincia: '', municipio: '', codigoPostal: '',
      emails: [], telefonos: [], contactos: [],
      perfilInversor: undefined, ocupacionPrincipal: undefined,
      rangoCapitalInvertir: undefined, activosInteresado: [],
      experienciaPreviaDetalle: '', informadoNplDetalle: '',
      estado: 'PROSPECTO', fuenteCaptacion: undefined,
      notas: '', consentimientoRgpd: false, fechaConsentimiento: '',
    },
  });

  const onSubmit = async (data: ClienteInput) => {
    const { error, success } = await createClienteAction(data);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push('/dashboard/clientes');
      router.refresh();
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <ClienteForm />
        <FormSubmit value="Crear cliente" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
