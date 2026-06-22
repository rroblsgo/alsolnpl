'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SolicitudInversionInput,
  SolicitudInversionSchema,
} from '../schemas/solicitudSchema';
import {
  PROCEDENCIA_SOLICITUD_OPTIONS,
  TIPO_SOLICITUD_OPTIONS,
} from '../types/solicitud.types';
import { solicitudInversionAction } from '../actions/solicitud-inversion-action';

type Props = {
  nplId: number;
  nplTitulo: string;
};

export function SolicitudInversionModal({ nplId, nplTitulo }: Props) {
  const [open, setOpen]         = useState(false);
  const [serverMsg, setServerMsg] = useState<{ success: string; error: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SolicitudInversionInput>({
    resolver: zodResolver(SolicitudInversionSchema),
    defaultValues: {
      nplId,
      nplTitulo,
      procedenciaSolicitud: 'web',
      tipoSolicitud:        'informacion_activos',
      textoSolicitud:       '',
    },
  });

  const handleOpen = () => {
    setServerMsg(null);
    reset({ nplId, nplTitulo, procedenciaSolicitud: 'web', tipoSolicitud: 'informacion_activos', textoSolicitud: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setServerMsg(null);
  };

  const onSubmit = async (values: SolicitudInversionInput) => {
    setServerMsg(null);
    const result = await solicitudInversionAction(values);
    setServerMsg(result);
    if (result.success) {
      // Mantener modal abierto para mostrar el mensaje de éxito
      reset();
    }
  };

  return (
    <>
      {/* Botón de apertura */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-lg bg-[#E8631A] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#d05a16] focus:outline-none focus:ring-2 focus:ring-[#E8631A] focus:ring-offset-2 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        Solicitud de inversión
      </button>

      {/* Backdrop + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="solicitud-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2
                id="solicitud-modal-title"
                className="text-lg font-semibold text-[#1E3A5F]"
              >
                Solicitud de inversión
              </h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Info contextual del activo */}
              <div className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
                <span className="font-medium">Activo:</span> {nplTitulo}
              </div>

              {serverMsg?.success ? (
                <div className="rounded-lg bg-green-50 px-4 py-4 text-sm text-green-800 text-center space-y-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium">{serverMsg.success}</p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Campos ocultos */}
                  <input type="hidden" {...register('nplId', { valueAsNumber: true })} />
                  <input type="hidden" {...register('nplTitulo')} />

                  {/* Procedencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Procedencia de la solicitud
                    </label>
                    <select
                      {...register('procedenciaSolicitud')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A5F] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                    >
                      {PROCEDENCIA_SOLICITUD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {errors.procedenciaSolicitud && (
                      <p className="mt-1 text-xs text-red-600">{errors.procedenciaSolicitud.message}</p>
                    )}
                  </div>

                  {/* Tipo solicitud */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de solicitud
                    </label>
                    <select
                      {...register('tipoSolicitud')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A5F] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                    >
                      {TIPO_SOLICITUD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {errors.tipoSolicitud && (
                      <p className="mt-1 text-xs text-red-600">{errors.tipoSolicitud.message}</p>
                    )}
                  </div>

                  {/* Texto solicitud */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tu mensaje <span className="text-gray-400 font-normal">(mín. 10 caracteres)</span>
                    </label>
                    <textarea
                      {...register('textoSolicitud')}
                      rows={5}
                      placeholder="Describe tu interés o consulta sobre este activo…"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:border-[#1E3A5F] focus:outline-none focus:ring-1 focus:ring-[#1E3A5F]"
                    />
                    {errors.textoSolicitud && (
                      <p className="mt-1 text-xs text-red-600">{errors.textoSolicitud.message}</p>
                    )}
                  </div>

                  {/* Error de servidor */}
                  {serverMsg?.error && (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                      {serverMsg.error}
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#E8631A] px-5 py-2 text-sm font-semibold text-white hover:bg-[#d05a16] disabled:opacity-60 transition-colors"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Enviando…
                        </>
                      ) : (
                        'Enviar solicitud'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
