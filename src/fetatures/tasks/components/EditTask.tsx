'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { SelectTask, TaskFormOptions } from '../types/task.types';
import { TaskInput, TaskSchema } from '../schemas/taskSchema';
import { editTaskAction } from '../actions/task-actions';
import TaskForm from './TaskForm';

type Props = { task: SelectTask; options: TaskFormOptions; returnTo?: string };

export default function EditTask({ task, options, returnTo }: Props) {
  const router = useRouter();
  const methods = useForm<TaskInput>({
    resolver: zodResolver(TaskSchema),
    mode: 'all',
    defaultValues: {
      title: task.title,
      description: task.description,
      notas: task.notas ?? '',
      expediente: task.expediente,
      communityId: task.communityId,
      status: task.status,
      priority: task.priority,
      category: task.category,
      assigneeId: task.assigneeId,
      nplId: task.nplId ?? null,
      fechaPropuesta: task.fechaPropuesta ?? null,
      fechaLimite: task.fechaLimite ?? null,
    },
  });

  const onSubmit = async (data: TaskInput) => {
    const { error, success } = await editTaskAction(data, task.id);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push((returnTo ?? '/dashboard/tasks') as Route);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <TaskForm options={options} />
        <FormSubmit value="Guardar cambios" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
