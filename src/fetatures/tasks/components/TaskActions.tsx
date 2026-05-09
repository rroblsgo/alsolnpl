'use client';

import toast from 'react-hot-toast';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteTaskAction,
  updateTaskStatusAction,
} from '../actions/task-actions';
import { TaskStatus } from '../types/task.types';

type Props = {
  taskId: number;
};

export default function TaskActions({ taskId }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateStatus = (status: TaskStatus) => {
    startTransition(async () => {
      const { error, success } = await updateTaskStatusAction(
        { status },
        taskId
      );
      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success(success);
      }
      router.refresh();
    });
  };

  const removeTask = () => {
    startTransition(async () => {
      const { error, success } = await deleteTaskAction(taskId);
      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success(success);
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => updateStatus('EN_CURSO')}
        className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Marcar en curso
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => updateStatus('COMPLETADA')}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Completar
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => updateStatus('BLOQUEADA')}
        className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Bloquear
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => updateStatus('CANCELADA')}
        className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={removeTask}
        className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}
