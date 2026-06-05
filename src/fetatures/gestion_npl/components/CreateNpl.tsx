'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';
import { NplInput, NplSchema } from '../schemas/nplSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import { createNplAction } from '../actions/npl-actions';
import NplForm from './NplForm';

export default function CreateNpl() {
  const methods = useForm<NplInput>({
    resolver: zodResolver(NplSchema),
    mode: 'all',
    defaultValues: {
      // Procedencia
      propertyId:   '',
      enrichmentId: null,
      enrichmentOperacionId: null,
      // A
      nuestroCodigoNpl: '',
      tituloOperacion: '',
      referenciaOrigen: '',
      fondo: '',
      idufir: '',
      cru: '',
      direccion: '',
      municipio: '',
      provincia: '',
      comunidadAutonoma: '',
      codigoPostal: '',
      tipoInmueble: 'VIVIENDA',
      distribucion: '',
      distribucionResumida: '',
      superficieConst: '',
      superficieUtil: '',
      superficieParcela: '',
      superficieDetalles: '',
      anyConstruccion: '',
      refCatastral: '',
      usoCatastral: '',
      valorRefCatastral: '',
      valorCatastral: '',
      fincaRegistral: '',
      datosRegistro: '',
      notasObservaciones: '',
      imagenAsociada: '',
      imagenesAdicionales: [],
      // B
      costeAdquisicionCredito: '',
      impuestosAjd: '',
      costesNotariaRegistro: '',
      gastosDacion: '',
      precioMercado: '',
      precioVentaRapida: '',
      comisionIntermediacion: '',
      pujaProbable: '',
      fechaCompra: '',
      fechaTerminacion: '',
      gastosDiversos: [],
      informacionInversor: '',
      // C
      principal: '',
      intereses: '',
      costas: '',
      fechaCalculada: '',
      tasacionSubasta: '',
      tasacionActual:  '',
      fechaTasacion:   '',
      procedimiento: 'EJH',
      numProcedimiento: '',
      juzgado: '',
      ejecutante: '',
      autoDespachoEjecucion: '',
      prestamoHipotecaDetalles: '',
      actuacionesJudiciales: [],
      actuacionesSeguidas: '',
      riesgosJuridicos: '',
      cargas: '',
      embargos: '',
      notasInternas: '',
      notasOcupacion: '',
      // Control
      estado: 'ACTIVO',
      esPublico: false,
    },
  });

  const onSubmit = async (data: NplInput) => {
    const { error, success } = await createNplAction(data);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      redirect('/dashboard/npl');
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <NplForm />
        <FormSubmit value="Crear NPL" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
