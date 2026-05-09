import { TaskStatus, TASK_STATUS_LABELS } from '../types/task.types';

const styles: Record<TaskStatus, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_CURSO: 'bg-blue-100 text-blue-800',
  COMPLETADA: 'bg-emerald-100 text-emerald-800',
  BLOQUEADA: 'bg-red-100 text-red-800',
  CANCELADA: 'bg-gray-200 text-gray-700',
};

type Props = { status: TaskStatus };

export default function TaskStatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
