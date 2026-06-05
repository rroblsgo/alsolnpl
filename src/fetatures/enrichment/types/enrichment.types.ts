import { operacionEnrichments, enrichmentSources } from '@/src/db/schema';

export type InsertEnrichment       = typeof operacionEnrichments.$inferInsert;
export type SelectEnrichment       = typeof operacionEnrichments.$inferSelect;
export type InsertEnrichmentSource = typeof enrichmentSources.$inferInsert;
export type SelectEnrichmentSource = typeof enrichmentSources.$inferSelect;

export type SeccionesCompletadas = {
  a: boolean; b: boolean; c: boolean;
  d: boolean; e: boolean; f: boolean;
};

export const ENRICHMENT_SECCIONES = [
  { id: 'a', label: 'A. Identificadores y referencias' },
  { id: 'b', label: 'B. Datos préstamo' },
  { id: 'c', label: 'C. Datos inmueble' },
  { id: 'd', label: 'D. Procedimiento judicial' },
  { id: 'e', label: 'E. Deudores' },
  { id: 'f', label: 'F. Estrategia' },
] as const;

export type SeccionId = (typeof ENRICHMENT_SECCIONES)[number]['id'];

export const ENRICHMENT_FUENTES = [
  { value: 'fondo_banco',  label: 'Fondo / Banco' },
  { value: 'catastro',     label: 'Catastro' },
  { value: 'registro',     label: 'Registro (Nota simple)' },
  { value: 'juzgado',      label: 'Juzgado / Lexnet' },
  { value: 'visita_campo', label: 'Visita / Campo' },
  { value: 'elaboracion',  label: 'Elaboración Alsol' },
  { value: 'otro',         label: 'Otro' },
] as const;

// Campos mínimos requeridos por sección para marcarla como completa
export const CAMPOS_REQUERIDOS_SECCION: Record<SeccionId, (keyof SelectEnrichment)[]> = {
  a: ['sellerReference', 'originalLender'],
  b: ['principalAFS', 'fechaAFS', 'tasacionActual'],
  c: ['referenciaCatastral', 'provincia', 'municipio'],
  d: ['procedimiento', 'numeroProcedimiento'],
  e: ['numeroDeudores'],
  f: ['estrategiaRecuperacion', 'prioridad', 'riesgoRating'],
};

export function calcularCompletitudSeccion(
  seccion: SeccionId,
  enrichment: Partial<SelectEnrichment>
): boolean {
  const campos = CAMPOS_REQUERIDOS_SECCION[seccion];
  return campos.every(c => {
    const v = enrichment[c];
    return v !== null && v !== undefined && v !== '';
  });
}

export function calcularCompletitudTotal(enrichment: Partial<SelectEnrichment>): number {
  const secciones: SeccionId[] = ['a', 'b', 'c', 'd', 'e', 'f'];
  const completadas = secciones.filter(s => calcularCompletitudSeccion(s, enrichment)).length;
  return Math.round((completadas / secciones.length) * 100);
}
