'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { TaskInput, TaskSchema } from '../schemas/taskSchema';
import { Form, FormSubmit } from '@/src/shared/components/forms';
import TaskForm from './TaskForm';
import { createTaskAction } from '../actions/task-actions';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';
import { TaskFormOptions } from '../types/task.types';

type Props = { options: TaskFormOptions };

export default function CreateTask({ options }: Props) {
  const methods = useForm<TaskInput>({
    resolver: zodResolver(TaskSchema),
    mode: 'all',
    defaultValues: {
      title: '',
      description: '',
      notas: '',
      expediente: '',
      communityId: '',
      status: 'PENDIENTE',
      priority: 'MEDIA',
      category: 'OTRO',
      assigneeId: '',
      nplId: null,
      fechaPropuesta: null,
      fechaLimite: null,
    },
  });

  const onSubmit = async (data: TaskInput) => {
    const { error, success } = await createTaskAction(data);
    if (error) toast.error(error);
    if (success) {
      toast.success(success);
      redirect('/dashboard/tasks');
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
