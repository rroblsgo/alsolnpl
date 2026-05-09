import { TaskPriority, TASK_PRIORITY_LABELS } from '../types/task.types';

const styles: Record<TaskPriority, string> = {
  ALTA: 'bg-red-100 text-red-700',
  MEDIA: 'bg-amber-100 text-amber-700',
  BAJA: 'bg-green-100 text-green-700',
};

type Props = { priority: TaskPriority };

export default function TaskPriorityBadge({ priority }: Props) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[priority]}`}>
      Prioridad {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
