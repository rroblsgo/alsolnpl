import { notifications } from '@/src/db/schema';

export type SelectNotification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
