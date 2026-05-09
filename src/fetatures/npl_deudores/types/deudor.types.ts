import { nplDeudores } from '@/src/db/schema';

export type InsertNplDeudor = typeof nplDeudores.$inferInsert;
export type SelectNplDeudor = typeof nplDeudores.$inferSelect;

export type NplDeudorListItem = SelectNplDeudor;
