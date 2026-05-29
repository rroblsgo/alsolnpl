'use server';

import { z } from 'zod';
import { requireAuth } from '@/src/lib/auth-server';
import { enrichmentDeudoresRepository } from '../services/EnrichmentDeudoresRepository';
import { enrichmentRepository } from '../services/EnrichmentRepository';
import type { SeccionesCompletadas } from '../types/enrichment.types';

// ── Schema de un deudor ───────────────────────────────────────────────────────
const DeudorSchema = z.object({
  esPrincipal:       z.boolean().default(false),
  tipoRegistro:      z.enum(['DEUDOR', 'HIPOTECANTE', 'FIADOR']).default('DEUDOR'),
  nombre:            z.string().min(1, 'El nombre es obligatorio').max(255),
  dni:               z.string().max(20).optional().nullable(),
  direccionCompleta: z.string().optional().nullable(),
  estadoOcupacional: z.string().optional().nullable(),
  vulnerabilidad:    z.string().optional().nullable(),
  notas:             z.string().optional().nullable(),
  otrosDatos:        z.array(z.object({
    titulo: z.string(),
    nombre: z.string(),
  })).default([]),
});

export type DeudorInput = z.infer<typeof DeudorSchema>;

/**
 * Guarda (reemplaza) todos los deudores de un enrichment.
 * Operación atómica: borra los existentes e inserta los nuevos.
 */
export async function saveEnrichmentDeudoresAction(
  enrichmentId: number,
  deudores: DeudorInput[]
) {
  const { session } = await requireAuth();
  if (!session) return { success: '', error: 'No estás autenticado' };

  const parsed = z.array(DeudorSchema).safeParse(deudores);
  if (!parsed.success) {
    return { success: '', error: 'Revisa los datos de los deudores' };
  }

  try {
    await enrichmentDeudoresRepository.replaceAll(enrichmentId, parsed.data);

    // Actualizar completitud sección E: completa si hay al menos un deudor con nombre
    const seccionECompleta = parsed.data.length > 0 &&
      parsed.data.some(d => d.nombre.trim().length > 0);

    const current = await enrichmentRepository.findById(enrichmentId);
    if (current) {
      const seccionesCompletadas: SeccionesCompletadas = {
        ...current.seccionesCompletadas as SeccionesCompletadas,
        e: seccionECompleta,
      };
      await enrichmentRepository.update(enrichmentId, { seccionesCompletadas } as any);
    }

    return {
      success: 'Deudores guardados correctamente',
      error: '',
      seccionECompleta,
    };
  } catch (e) {
    return { success: '', error: e instanceof Error ? e.message : 'Error al guardar deudores' };
  }
}

/** Obtiene los deudores de un enrichment */
export async function getEnrichmentDeudoresAction(enrichmentId: number) {
  await requireAuth();
  return enrichmentDeudoresRepository.findByEnrichmentId(enrichmentId);
}
