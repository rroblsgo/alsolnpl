import { expedienteNotas } from '@/src/db/schema/expediente_npl';
import {
  expedienteTipoNotaEnum,
  expedienteRelevanciaEnum,
  expedienteStatusEnum,
} from '@/src/db/schema/expediente_npl';

export type InsertExpedienteNota = typeof expedienteNotas.$inferInsert;
export type SelectExpedienteNota = typeof expedienteNotas.$inferSelect;

export type ExpedienteTipoNota   = (typeof expedienteTipoNotaEnum.enumValues)[number];
export type ExpedienteRelevancia = (typeof expedienteRelevanciaEnum.enumValues)[number];
export type ExpedienteStatus     = (typeof expedienteStatusEnum.enumValues)[number];

// Tipo enriquecido para la lista (con joins a users)
export type ExpedienteNotaListItem = SelectExpedienteNota & {
  creatorName:            string | null;
  usuarioRelacionadoName: string | null;
};

// ─── Constantes para UI ───────────────────────────────────────────────────────

export const EXPEDIENTE_TIPOS_NOTA = [
  ...expedienteTipoNotaEnum.enumValues,
] as const;

export const EXPEDIENTE_RELEVANCIAS = [
  ...expedienteRelevanciaEnum.enumValues,
] as const;

export const EXPEDIENTE_STATUSES = [
  ...expedienteStatusEnum.enumValues,
] as const;

export const EXPEDIENTE_TIPO_NOTA_LABELS: Record<ExpedienteTipoNota, string> = {
  comercial:     'Comercial',
  economico:     'Económico',
  legal_proceso: 'Legal / Proceso',
  otros:         'Otros',
};

export const EXPEDIENTE_RELEVANCIA_LABELS: Record<ExpedienteRelevancia, string> = {
  alta:  'Alta',
  media: 'Media',
  baja:  'Baja',
};

export const EXPEDIENTE_STATUS_LABELS: Record<ExpedienteStatus, string> = {
  completar: 'Completar',
  revisar:   'Revisar',
  ok:        'OK',
};
