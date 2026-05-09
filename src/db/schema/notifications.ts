import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { task } from './task';

export const notificationTypeEnum = [
  'general',
  'task_modified',
  'task_completed',
  'meeti_joined',
] as const;

export type NotificationType = (typeof notificationTypeEnum)[number];

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  actorName: varchar('actor_name', { length: 60 }).notNull(),
  message: varchar('message', { length: 100 }).notNull(),
  target: varchar('target', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 })
    .$type<NotificationType>()
    .notNull()
    .default('general'),
  taskId: integer('task_id').references(() => task.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  read: boolean('read').default(false),
});
