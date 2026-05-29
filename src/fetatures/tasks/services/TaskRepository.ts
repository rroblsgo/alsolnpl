import { db } from '@/src/db';
import { task, users, npl, clientes, operacionEnrichments, operaciones } from '@/src/db/schema';
import { asc, eq, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import {
  InsertTask,
  SelectTask,
  TaskListItem,
  TaskStatus,
} from '../types/task.types';

export interface ITaskRepository {
  create(data: InsertTask): Promise<SelectTask>;
  findById(taskId: number): Promise<SelectTask | undefined>;
  listByUser(userId: string): Promise<TaskListItem[]>;
  listAll(): Promise<TaskListItem[]>;
  listByNpl(nplId: number): Promise<TaskListItem[]>;
  listByCliente(clienteId: number): Promise<TaskListItem[]>;
  listByEnrichment(enrichmentId: number): Promise<TaskListItem[]>;
  update(taskId: number, data: Partial<SelectTask>): Promise<SelectTask | undefined>;
  updateStatus(taskId: number, status: TaskStatus, completedAt: Date | null): Promise<SelectTask | undefined>;
  remove(taskId: number): Promise<void>;
  listClienteOptions(): Promise<Array<{ id: number; nombre: string }>>;
  listUserOptions(): Promise<Array<{ id: string; name: string; email: string }>>;
  listNplOptions(): Promise<Array<{ id: number; tituloOperacion: string }>>;
  listEnrichmentOptions(): Promise<Array<{ id: number; expedienteId: string | null; mainKey: string | null }>>;
}

const buildSelectFields = (
  creator: ReturnType<typeof alias>,
  assignee: ReturnType<typeof alias>,
) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  notas: task.notas,
  expediente: task.expediente,
  clienteId: task.clienteId,
  status: task.status,
  priority: task.priority,
  category: task.category,
  nplId: task.nplId,
  enrichmentId: task.enrichmentId,   // ← nuevo
  operacionId: task.operacionId,     // ← nuevo
  fechaPropuesta: task.fechaPropuesta,
  fechaLimite: task.fechaLimite,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  completedAt: task.completedAt,
  creatorId: task.creatorId,
  assigneeId: task.assigneeId,
  clienteNombre: clientes.nombre,
  creatorName: creator.name,
  assigneeName: assignee.name,
  nplTitulo: npl.tituloOperacion,
  expedienteRef: operaciones.expedienteId,  // ← nuevo: ref legible del enrichment
});

class TaskRepository implements ITaskRepository {
  async create(data: InsertTask) {
    const [result] = await db.insert(task).values(data).returning();
    return result;
  }

  async findById(taskId: number) {
    const [result] = await db
      .select()
      .from(task)
      .where(eq(task.id, taskId))
      .limit(1);
    return result;
  }

  private baseQuery(
    creator: ReturnType<typeof alias>,
    assignee: ReturnType<typeof alias>,
  ) {
    return db
      .select(buildSelectFields(creator, assignee))
      .from(task)
      .leftJoin(clientes, eq(task.clienteId, clientes.id))
      .innerJoin(creator, eq(task.creatorId, creator.id))
      .innerJoin(assignee, eq(task.assigneeId, assignee.id))
      .leftJoin(npl, eq(task.nplId, npl.id))
      .leftJoin(operacionEnrichments, eq(task.enrichmentId, operacionEnrichments.id))
      .leftJoin(operaciones, eq(operacionEnrichments.operacionId, operaciones.id));
  }

  async listByUser(userId: string): Promise<TaskListItem[]> {
    const creator = alias(users, 'task_creator');
    const assignee = alias(users, 'task_assignee');
    return this.baseQuery(creator, assignee)
      .where(or(eq(task.creatorId, userId), eq(task.assigneeId, userId)))
      .orderBy(sql`${task.fechaPropuesta} DESC NULLS LAST`) as Promise<TaskListItem[]>;
  }

  async listAll(): Promise<TaskListItem[]> {
    const creator = alias(users, 'task_creator');
    const assignee = alias(users, 'task_assignee');
    return this.baseQuery(creator, assignee)
      .orderBy(sql`${task.fechaPropuesta} DESC NULLS LAST`) as Promise<TaskListItem[]>;
  }

  async listByNpl(nplId: number): Promise<TaskListItem[]> {
    const creator = alias(users, 'task_creator');
    const assignee = alias(users, 'task_assignee');
    return this.baseQuery(creator, assignee)
      .where(eq(task.nplId, nplId))
      .orderBy(sql`${task.fechaPropuesta} DESC NULLS LAST`) as Promise<TaskListItem[]>;
  }

  async listByCliente(clienteId: number): Promise<TaskListItem[]> {
    const creator = alias(users, 'task_creator');
    const assignee = alias(users, 'task_assignee');
    return this.baseQuery(creator, assignee)
      .where(eq(task.clienteId, clienteId))
      .orderBy(sql`${task.fechaPropuesta} DESC NULLS LAST`) as Promise<TaskListItem[]>;
  }

  async listByEnrichment(enrichmentId: number): Promise<TaskListItem[]> {
    const creator = alias(users, 'task_creator');
    const assignee = alias(users, 'task_assignee');
    return this.baseQuery(creator, assignee)
      .where(eq(task.enrichmentId, enrichmentId))
      .orderBy(sql`${task.fechaPropuesta} DESC NULLS LAST`) as Promise<TaskListItem[]>;
  }

  async update(taskId: number, data: Partial<SelectTask>) {
    const [result] = await db
      .update(task)
      .set({ ...data })
      .where(eq(task.id, taskId))
      .returning();
    return result;
  }

  async updateStatus(taskId: number, status: TaskStatus, completedAt: Date | null) {
    const [result] = await db
      .update(task)
      .set({ status, completedAt })
      .where(eq(task.id, taskId))
      .returning();
    return result;
  }

  async remove(taskId: number) {
    await db.delete(task).where(eq(task.id, taskId));
  }

  async listClienteOptions() {
    return db
      .select({ id: clientes.id, nombre: clientes.nombre })
      .from(clientes)
      .orderBy(asc(clientes.nombre));
  }

  async listUserOptions() {
    return db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .orderBy(asc(users.name));
  }

  async listNplOptions() {
    return db
      .select({ id: npl.id, tituloOperacion: npl.tituloOperacion })
      .from(npl)
      .orderBy(asc(npl.tituloOperacion));
  }

  async listEnrichmentOptions() {
    return db
      .select({
        id:           operacionEnrichments.id,
        expedienteId: operaciones.expedienteId,
        mainKey:      operaciones.mainKey,
      })
      .from(operacionEnrichments)
      .leftJoin(operaciones, eq(operacionEnrichments.operacionId, operaciones.id))
      .orderBy(asc(operaciones.expedienteId));
  }
}

export const taskRepository = new TaskRepository();
