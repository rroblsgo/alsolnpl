import { ClienteEstado, CLIENTE_ESTADO_LABELS } from '../types/cliente.types';

type Props = { estado: ClienteEstado };

const estadoStyles: Record<ClienteEstado, string> = {
  PROSPECTO:  'bg-blue-100 text-blue-700 ring-blue-600/20',
  ACTIVO:     'bg-green-100 text-green-700 ring-green-600/20',
  INACTIVO:   'bg-gray-100 text-gray-600 ring-gray-500/20',
  DESCARTADO: 'bg-red-100 text-red-700 ring-red-600/20',
};

export default function ClienteStatusBadge({ estado }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${estadoStyles[estado]}`}>
      {CLIENTE_ESTADO_LABELS[estado]}
    </span>
  );
}
