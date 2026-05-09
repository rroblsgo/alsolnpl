'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ClienteInput, ClienteSchema } from '../schemas/clienteSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { editClienteAction } from '../actions/cliente-actions';
import ClienteForm from './ClienteForm';
import { SelectCliente } from '../types/cliente.types';
import { ContactoItem } from '@/src/db/schema/clientes';

type Props = { cliente: SelectCliente };

// Convierte el JSONB de la BD a un array tipado con objetos {titulo, valor}
// Si viene null/undefined devuelve array vacío
function parseContactos(raw: unknown): { titulo: string; valor: string }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        titulo: String((item as ContactoItem).titulo ?? ''),
        valor:  String((item as ContactoItem).valor  ?? ''),
      }));
  }
  return [];
}

export default function EditCliente({ cliente }: Props) {
  const router = useRouter();

  const methods = useForm<ClienteInput>({
    resolver: zodResolver(ClienteSchema),
    mode: 'all',
    defaultValues: {
      nombre:       cliente.nombre,
      dni:          cliente.dni          ?? '',
      empresa:      cliente.empresa      ?? '',
      nif:          cliente.nif          ?? '',
      imagen:       cliente.imagen       ?? '',
      direccion:    cliente.direccion    ?? '',
      provincia:    cliente.provincia    ?? '',
      municipio:    cliente.municipio    ?? '',
      codigoPostal: cliente.codigoPostal ?? '',

      // ── JSONB: parsear correctamente para useFieldArray ──────────────────
      emails:    parseContactos(cliente.emails),
      telefonos: parseContactos(cliente.telefonos),
      contactos: parseContactos(cliente.contactos),

      perfilInversor:           cliente.perfilInversor           ?? undefined,
      ocupacionPrincipal:       cliente.ocupacionPrincipal       ?? undefined,
      rangoCapitalInvertir:     cliente.rangoCapitalInvertir      ?? undefined,
      activosInteresado:        cliente.activosInteresado         ?? [],
      experienciaPreviaDetalle: cliente.experienciaPreviaDetalle  ?? '',
      informadoNplDetalle:      cliente.informadoNplDetalle       ?? '',

      estado:             cliente.estado,
      fuenteCaptacion:    cliente.fuenteCaptacion    ?? undefined,
      notas:              cliente.notas              ?? '',
      consentimientoRgpd: cliente.consentimientoRgpd,
      fechaConsentimiento: cliente.fechaConsentimiento
        ? new Date(cliente.fechaConsentimiento).toISOString().split('T')[0]
        : '',
    },
  });

  const onSubmit = async (data: ClienteInput) => {
    const { error, success } = await editClienteAction(data, cliente.id);
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
        <FormSubmit value="Guardar cambios" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
