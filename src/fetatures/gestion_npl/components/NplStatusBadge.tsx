import { NplEstado, NPL_ESTADO_LABELS } from '../types/npl.types';

type Props = {
  estado: NplEstado;
};

const estadoStyles: Record<NplEstado, string> = {
  ACTIVO: 'bg-green-100 text-green-700 ring-green-600/20',
  RESERVADO: 'bg-amber-100 text-amber-700 ring-amber-600/20',
  VENDIDO: 'bg-blue-100 text-blue-700 ring-blue-600/20',
  ARCHIVADO: 'bg-gray-100 text-gray-600 ring-gray-500/20',
};

export default function NplStatusBadge({ estado }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${estadoStyles[estado]}`}
    >
      {NPL_ESTADO_LABELS[estado]}
    </span>
  );
}
