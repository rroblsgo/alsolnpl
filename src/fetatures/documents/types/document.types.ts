import { document } from '@/src/db/schema/document';
import {
  documentEntityTypeEnum,
  documentCategoryEnum,
} from '@/src/db/schema';

export type InsertDocument = typeof document.$inferInsert;
export type SelectDocument = typeof document.$inferSelect;

export type DocumentEntityType =
  (typeof documentEntityTypeEnum.enumValues)[number];
export type DocumentCategory =
  (typeof documentCategoryEnum.enumValues)[number];

export const DOCUMENT_ENTITY_TYPES = [
  ...documentEntityTypeEnum.enumValues,
] as const;
export const DOCUMENT_CATEGORIES = [
  ...documentCategoryEnum.enumValues,
] as const;

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  ESCRITURA: 'Escritura',
  NOTA_SIMPLE: 'Nota simple',
  TASACION: 'Tasación',
  CONTRATO: 'Contrato',
  JUDICIAL: 'Judicial',
  CATASTRO: 'Catastro',
  IDENTIFICACION: 'Identificación',
  FINANCIERO: 'Financiero',
  CORRESPONDENCIA: 'Correspondencia',
  FOTOGRAFIA: 'Fotografía',
  OTRO: 'Otro',
};

export type DocumentListItem = SelectDocument & {
  uploaderName: string | null;
};
