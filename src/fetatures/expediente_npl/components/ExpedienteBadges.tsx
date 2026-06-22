import {
  ExpedienteTipoNota,
  ExpedienteRelevancia,
  ExpedienteStatus,
  EXPEDIENTE_TIPO_NOTA_LABELS,
  EXPEDIENTE_RELEVANCIA_LABELS,
  EXPEDIENTE_STATUS_LABELS,
} from '../types/expediente.types';

const tipoStyles: Record<ExpedienteTipoNota, string> = {
  comercial:     'bg-blue-100 text-blue-800',
  economico:     'bg-emerald-100 text-emerald-800',
  legal_proceso: 'bg-purple-100 text-purple-800',
  otros:         'bg-gray-100 text-gray-700',
};

export function TipoNotaBadge({ tipo }: { tipo: ExpedienteTipoNota }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoStyles[tipo]}`}>
      {EXPEDIENTE_TIPO_NOTA_LABELS[tipo]}
    </span>
  );
}

const relevanciaStyles: Record<ExpedienteRelevancia, string> = {
  alta:  'bg-red-100 text-red-800',
  media: 'bg-amber-100 text-amber-800',
  baja:  'bg-slate-100 text-slate-600',
};

export function RelevanciaBadge({ relevancia }: { relevancia: ExpedienteRelevancia }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${relevanciaStyles[relevancia]}`}>
      {EXPEDIENTE_RELEVANCIA_LABELS[relevancia]}
    </span>
  );
}

const statusStyles: Record<ExpedienteStatus, string> = {
  completar: 'bg-orange-100 text-orange-800',
  revisar:   'bg-yellow-100 text-yellow-800',
  ok:        'bg-emerald-100 text-emerald-800',
};

export function StatusNotaBadge({ status }: { status: ExpedienteStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[status]}`}>
      {EXPEDIENTE_STATUS_LABELS[status]}
    </span>
  );
}
