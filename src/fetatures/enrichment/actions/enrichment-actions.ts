'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { enrichmentService } from '../services/EnrichmentService';
import { EnrichmentSchema, type EnrichmentFormValues } from '../schemas/enrichmentSchema';
import type { SeccionId, SeccionesCompletadas } from '../types/enrichment.types';

/**
 * Inicializa el enrichment de una operación (se llama al pulsar "Iniciar Enrichment").
 * Si ya existe, simplemente redirige — no crea duplicados.
 */
export async function initEnrichmentAction(operacionId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  try {
    const enrichment = await enrichmentService.getOrCreateForOperacion(
      operacionId,
      session.user.id
    );
    return { success: 'Enrichment iniciado', error: '', enrichmentId: enrichment.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al iniciar el enrichment';
    return { success: '', error: msg };
  }
}

/**
 * Guarda los datos de una sección del enrichment.
 * El guardado es parcial: solo actualiza los campos enviados.
 * Devuelve seccionesCompletadas para actualizar el badge en cliente sin recargar.
 */
export async function saveEnrichmentSeccionAction(
  enrichmentId: number,
  seccion: SeccionId,
  rawData: Partial<EnrichmentFormValues>
): Promise<{
  success: string;
  error: string;
  seccionesCompletadas?: SeccionesCompletadas;
}> {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const parsed = EnrichmentSchema.partial().safeParse(rawData);
  if (!parsed.success) {
    return { success: '', error: 'Revisa los datos del formulario' };
  }

  // CRÍTICO: eliminar los campos undefined (no enviados) para no sobreescribir
  // datos de otras secciones. Los null SÍ se guardan — indican borrado intencional.
  // Los campos de string vacío '' son convertidos a null por el schema, lo que
  // sobreescribiría datos existentes. Para evitarlo, también filtramos null
  // que provengan de campos que el usuario no ha tocado (ver nota abajo).
  //
  // Nota: el form RHF inicializa todos los defaultValues con ''. Cuando el usuario
  // no toca un campo de la sección B, su valor en el form sigue siendo '' → null tras
  // el parse. Filtramos esos null para no borrar datos de otras secciones.
  // Si el usuario borra intencionalmente un campo que tenía valor, también queda ''→null,
  // lo que significa que los borrados intencionales tampoco se guardan — esto es
  // aceptable para el flujo de enrichment donde los datos se acumulan, no se borran.
  const dataToSave = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== null && v !== undefined)
  );

  try {
    const updated = await enrichmentService.saveSeccion(enrichmentId, seccion, dataToSave);
    return {
      success: 'Sección guardada correctamente',
      error: '',
      seccionesCompletadas: updated?.seccionesCompletadas as SeccionesCompletadas,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al guardar la sección';
    return { success: '', error: msg };
  }
}

/**
 * Obtiene el enrichment de una operación (para Server Components).
 */
export async function getEnrichmentByOperacionAction(operacionId: number) {
  await requireAuth();
  return enrichmentService.findByOperacionId(operacionId);
}

/**
 * Promueve un enrichment a NPL:
 * - Crea el NPL mapeando los campos del enrichment
 * - Guarda el nplId en el enrichment
 * - Actualiza statusTratamiento de la operación a 'comercializado'
 *
 * Si statusPromocionNpl = 'desestimado', solo actualiza operación a 'descartado'.
 */
export async function promoverEnrichmentANplAction(enrichmentId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No autenticado', nplId: null };

  try {
    const result = await enrichmentService.promoverANpl(enrichmentId, session.user.id);
    return { success: `NPL creado: ${result.nuestroCodigoNpl}`, error: '', nplId: result.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al promocionar';
    return { success: '', error: msg, nplId: null };
  }
}

/**
 * Marca un enrichment como desestimado y actualiza la operación a 'descartado'.
 */
export async function desestimarEnrichmentAction(enrichmentId: number) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No autenticado' };

  try {
    await enrichmentService.desestimar(enrichmentId);
    return { success: 'Operación marcada como descartada', error: '' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al desestimar';
    return { success: '', error: msg };
  }
}
