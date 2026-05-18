'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import toast from 'react-hot-toast';
import { NplInput, NplSchema } from '../schemas/nplSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { editNplAction } from '../actions/npl-actions';
import NplForm from './NplForm';
import { SelectNpl } from '../types/npl.types';

type Props = {
  npl: SelectNpl;
  returnTo?: string;
};

const n2s = (v: string | null | undefined) => v ?? '';

export default function EditNpl({ npl, returnTo }: Props) {
  const router = useRouter();
  const methods = useForm<NplInput>({
    resolver: zodResolver(NplSchema),
    mode: 'all',
    defaultValues: {
      // A
      nuestroCodigoNpl: npl.nuestroCodigoNpl ?? '',
      tituloOperacion: npl.tituloOperacion,
      referenciaOrigen: npl.referenciaOrigen ?? '',
      fondo: npl.fondo ?? '',
      direccion: npl.direccion ?? '',
      municipio: npl.municipio ?? '',
      provincia: npl.provincia ?? '',
      codigoPostal: npl.codigoPostal ?? '',
      tipoInmueble: npl.tipoInmueble,
      distribucion: npl.distribucion ?? '',
      distribucionResumida: npl.distribucionResumida ?? '',
      superficieConst: n2s(npl.superficieConst),
      superficieParcela: n2s(npl.superficieParcela),
      superficieDetalles: npl.superficieDetalles ?? '',
      anyConstruccion: npl.anyConstruccion ? String(npl.anyConstruccion) : '',
      refCatastral: npl.refCatastral ?? '',
      latCatastro: n2s(npl.latCatastro),
      lngCatastro: n2s(npl.lngCatastro),
      fincaRegistral: npl.fincaRegistral ?? '',
      datosRegistro: npl.datosRegistro ?? '',
      imagenAsociada: npl.imagenAsociada ?? '',
      imagenesAdicionales: npl.imagenesAdicionales,
      // B
      costeAdquisicionCredito: n2s(npl.costeAdquisicionCredito),
      impuestosAjd: n2s(npl.impuestosAjd),
      costesNotariaRegistro: n2s(npl.costesNotariaRegistro),
      gastosDacion: n2s(npl.gastosDacion),
      precioMercado: n2s(npl.precioMercado),
      precioVentaRapida: n2s(npl.precioVentaRapida),
      comisionIntermediacion: n2s(npl.comisionIntermediacion),
      pujaProbable: n2s(npl.pujaProbable),
      fechaCompra: npl.fechaCompra ?? '',
      fechaTerminacion: npl.fechaTerminacion ?? '',
      gastosDiversos:
        (npl.gastosDiversos as { titulo: string; valor: number }[]) ?? [],
      informacionInversor: npl.informacionInversor ?? '',
      // C
      principal: n2s(npl.principal),
      intereses: n2s(npl.intereses),
      costas: n2s(npl.costas),
      fechaCalculada: npl.fechaCalculada ?? '',
      tasacionSubasta: n2s(npl.tasacionSubasta),
      procedimiento: npl.procedimiento ?? undefined,
      numProcedimiento: npl.numProcedimiento ?? '',
      juzgado: npl.juzgado ?? '',
      ejecutante: npl.ejecutante ?? '',
      autoDespachoEjecucion: npl.autoDespachoEjecucion ?? '',
      prestamoHipotecaDetalles: npl.prestamoHipotecaDetalles ?? '',
      actuacionesJudiciales:
        (npl.actuacionesJudiciales as { fecha: string; titulo: string }[]) ?? [],
      actuacionesSeguidas: npl.actuacionesSeguidas ?? '',
      riesgosJuridicos: npl.riesgosJuridicos ?? '',
      notasInternas: npl.notasInternas ?? '',
      // Control
      estado: npl.estado,
      esPublico: npl.esPublico,
    },
  });

  const onSubmit = async (data: NplInput) => {
    const { error, success } = await editNplAction(data, npl.id);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push((returnTo ?? '/dashboard/npl') as Route);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <NplForm nplId={npl.id} />
        <FormSubmit value="Guardar cambios" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
