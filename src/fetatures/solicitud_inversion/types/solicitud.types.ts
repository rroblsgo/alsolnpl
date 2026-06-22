// ─── Tipos y constantes para el módulo Solicitud de Inversión ────────────────

export const PROCEDENCIA_SOLICITUD_OPTIONS = [
  { value: 'web',      label: 'Web' },
  { value: 'telefono', label: 'Teléfono' },
  { value: 'email',    label: 'Email' },
  { value: 'otro',     label: 'Otro' },
] as const;

export type ProcedenciaSolicitud =
  (typeof PROCEDENCIA_SOLICITUD_OPTIONS)[number]['value'];

export const TIPO_SOLICITUD_OPTIONS = [
  { value: 'informacion_activos',       label: 'Información de activos' },
  { value: 'visita_consulta_comercial', label: 'Visita / Consulta comercial' },
  { value: 'formalizar_inversion',      label: 'Formalizar inversión' },
  { value: 'otros',                     label: 'Otros' },
] as const;

export type TipoSolicitud =
  (typeof TIPO_SOLICITUD_OPTIONS)[number]['value'];
