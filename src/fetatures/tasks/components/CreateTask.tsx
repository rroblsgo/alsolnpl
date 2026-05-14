'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { TaskInput, TaskSchema } from '../schemas/taskSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import TaskForm from './TaskForm';
import { createTaskAction } from '../actions/task-actions';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { TaskFormOptions } from '../types/task.types';

type Props = { options: TaskFormOptions };

function defaultDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
}

export default function CreateTask({ options }: Props) {
  const router = useRouter();
  const { today, tomorrow } = defaultDates();

  const methods = useForm<TaskInput>({
    resolver: zodResolver(TaskSchema),
    mode: 'all',
    defaultValues: {
      title: '',
      description: '',
      notas: '',
      expediente: '',
      clienteId: null,
      status: 'PENDIENTE',
      priority: 'MEDIA',
      category: 'OTRO',
      assigneeId: '',
      nplId: null,
      fechaPropuesta: today,
      fechaLimite: tomorrow,
    },
  });

  const onSubmit = async (data: TaskInput) => {
    const { error, success } = await createTaskAction(data);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      router.push('/dashboard/tasks');
      router.refresh();
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        <TaskForm options={options} />
        <FormSubmit value="Crear tarea" className="mt-6 text-white" />
      </Form>
    </FormProvider>
  );
}
