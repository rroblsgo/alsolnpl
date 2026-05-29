import { enrichmentRepository } from './EnrichmentRepository';
import { operacionesRepository } from '@/src/fetatures/fondos/services/OperacionesRepository';
import type { EnrichmentInput } from '../schemas/enrichmentSchema';
import type { SelectEnrichment } from '@/src/db/schema';
import {
  calcularCompletitudSeccion,
  type SeccionId,
} from '../types/enrichment.types';

// ── Normalización de CCAA (variantes del Excel → nombre canónico) ─────────────
const CCAA_VARIANTES: Record<string, string> = {
  'andalucia':                    'Andalucía',
  'andalucía':                    'Andalucía',
  'aragon':                       'Aragón',
  'aragón':                       'Aragón',
  'asturias':                     'Asturias',
  'principado de asturias':       'Asturias',
  'baleares':                     'Islas Baleares',
  'illes balears':                'Islas Baleares',
  'islas baleares':               'Islas Baleares',
  'canarias':                     'Canarias',
  'cantabria':                    'Cantabria',
  'castilla y leon':              'Castilla y León',
  'castilla y león':              'Castilla y León',
  'castilla la mancha':           'Castilla-La Mancha',
  'castilla-la mancha':           'Castilla-La Mancha',
  'cataluna':                     'Cataluña',
  'cataluña':                     'Cataluña',
  'catalunya':                    'Cataluña',
  'extremadura':                  'Extremadura',
  'galicia':                      'Galicia',
  'la rioja':                     'La Rioja',
  'rioja':                        'La Rioja',
  'madrid':                       'Comunidad de Madrid',
  'comunidad de madrid':          'Comunidad de Madrid',
  'murcia':                       'Región de Murcia',
  'region de murcia':             'Región de Murcia',
  'región de murcia':             'Región de Murcia',
  'navarra':                      'Comunidad Foral de Navarra',
  'comunidad foral de navarra':   'Comunidad Foral de Navarra',
  'pais vasco':                   'País Vasco',
  'país vasco':                   'País Vasco',
  'euskadi':                      'País Vasco',
  'comunidad valenciana':         'Comunidad Valenciana',
  'valencia':                     'Comunidad Valenciana',
  'ceuta':                        'Ceuta',
  'melilla':                      'Melilla',
};

function normalizarCCAA(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const key = norm(raw);
  return CCAA_VARIANTES[key] ?? null;
}
const PROVINCIA_A_CCAA: Record<string, string> = {
  'Almería': 'Andalucía', 'Cádiz': 'Andalucía', 'Córdoba': 'Andalucía',
  'Granada': 'Andalucía', 'Huelva': 'Andalucía', 'Jaén': 'Andalucía',
  'Málaga': 'Andalucía', 'Sevilla': 'Andalucía',
  'Huesca': 'Aragón', 'Teruel': 'Aragón', 'Zaragoza': 'Aragón',
  'Asturias': 'Asturias',
  'Islas Baleares': 'Islas Baleares',
  'Las Palmas': 'Canarias', 'Santa Cruz de Tenerife': 'Canarias',
  'Cantabria': 'Cantabria',
  'Ávila': 'Castilla y León', 'Burgos': 'Castilla y León', 'León': 'Castilla y León',
  'Palencia': 'Castilla y León', 'Salamanca': 'Castilla y León',
  'Segovia': 'Castilla y León', 'Soria': 'Castilla y León',
  'Valladolid': 'Castilla y León', 'Zamora': 'Castilla y León',
  'Albacete': 'Castilla-La Mancha', 'Ciudad Real': 'Castilla-La Mancha',
  'Cuenca': 'Castilla-La Mancha', 'Guadalajara': 'Castilla-La Mancha',
  'Toledo': 'Castilla-La Mancha',
  'Barcelona': 'Cataluña', 'Girona': 'Cataluña', 'Lleida': 'Cataluña',
  'Tarragona': 'Cataluña',
  'Badajoz': 'Extremadura', 'Cáceres': 'Extremadura',
  'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Ourense': 'Galicia',
  'Pontevedra': 'Galicia',
  'La Rioja': 'La Rioja',
  'Madrid': 'Comunidad de Madrid',
  'Murcia': 'Región de Murcia',
  'Navarra': 'Comunidad Foral de Navarra',
  'Álava': 'País Vasco', 'Guipúzcoa': 'País Vasco', 'Vizcaya': 'País Vasco',
  'Alicante': 'Comunidad Valenciana', 'Castellón': 'Comunidad Valenciana',
  'Valencia': 'Comunidad Valenciana',
  'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
};

function norm(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function resolverCCAA(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const n = norm(raw);
  const entry = Object.entries(PROVINCIA_A_CCAA).find(([p]) => norm(p) === n);
  return entry?.[1] ?? null;
}

// ── Service ───────────────────────────────────────────────────────────────────
class EnrichmentService {
  async getOrCreateForOperacion(
    operacionId: number,
    creatorId: string
  ): Promise<SelectEnrichment> {
    const existing = await enrichmentRepository.findByOperacionId(operacionId);
    if (existing) return existing;

    const operacion = await operacionesRepository.findById(operacionId);
    if (!operacion) throw new Error('Operación no encontrada');

    const ccaa = normalizarCCAA(operacion.comunidadAutonoma)
              ?? resolverCCAA(operacion.provincia);

    return enrichmentRepository.create({
      operacionId,
      creatorId,

      // A — identificadores
      sellerReference: operacion.expedienteId ?? undefined,
      idufir:          operacion.idufir        ?? undefined,

      // B — datos financieros básicos del fondo
      principalPendiente: operacion.deuda               ?? undefined,
      tasacionOriginal:   operacion.valorTasacionSubasta ?? undefined,
      valorMercado:       operacion.precioVentaMercado   ?? undefined,

      // C — identificadores de inmueble
      propertyId:   operacion.propertyId   ?? undefined,  // ← nuevo
      tipoInmueble: operacion.propertyTipo ?? undefined,  // ← nuevo

      // C — localización
      comunidadAutonoma: ccaa                       ?? undefined,
      codPostal:         operacion.codPostal         ?? undefined,
      nombreVia:         operacion.direccionCompleta ?? undefined,

      // C — catastro
      referenciaCatastral: operacion.referenciaCatastral ?? undefined,
      superficieConst:     operacion.superficieConst     ?? undefined,
      superficieUtil:      operacion.superficieUtil       ?? undefined,
      anyConstruccion:     operacion.anyConstruccion      ?? undefined,
      latitud:             operacion.latitud              ?? undefined,
      longitud:            operacion.longitud             ?? undefined,

      // C — registro
      // parcel y finca de operaciones → fincaRegistral en enrichment
      fincaRegistral:    operacion.parcel           ?? operacion.finca ?? undefined,
      libro:             operacion.libro             ?? undefined,
      tomo:              operacion.tomo              ?? undefined,
      folio:             operacion.folio             ?? undefined,
      registroProvincia: operacion.registroProvincia ?? undefined,
      registroCiudad:    operacion.registroCiudad    ?? undefined,
      registroNumero:    operacion.registroNumero    ?? undefined,

      // C — ocupación inferida
      estadoOcupacion: (() => {
        const raw = (operacion.propertyTipoOcupacion ?? '').toLowerCase();
        if (!raw || raw.includes('vac'))  return undefined;
        if (raw.includes('ocup'))         return 'ocupado';
        if (raw.includes('irreg') || raw.includes('okup')) return 'irregular';
        return undefined;
      })(),

      // D — procedimiento
      numeroProcedimiento: operacion.procLegalNumero  ?? undefined,
      juzgado:             operacion.procLegalCourt   ?? undefined,
      faseJudicial: (() => {
        const f = (operacion.procLegalFase ?? '').toLowerCase();
        if (f.includes('monit')) return 'monitorio';
        if (f.includes('ordin')) return 'ordinario';
        if (f.includes('ejecu')) return 'ejecucion';
        return undefined;
      })(),
      estadoLegal: (() => {
        const e = (operacion.procLegalEstado ?? '').toLowerCase();
        if (e.includes('prejud')) return 'prejudicial';
        if (e.includes('judic'))  return 'judicial';
        if (e.includes('final'))  return 'finalizado';
        return undefined;
      })(),
    });
  }

  async saveSeccion(
    enrichmentId: number,
    seccion: SeccionId,
    data: Partial<EnrichmentInput>
  ): Promise<SelectEnrichment | undefined> {
    const updated = await enrichmentRepository.update(enrichmentId, data as any);
    if (!updated) return undefined;

    const seccionCompletada = calcularCompletitudSeccion(seccion, updated);
    const seccionesCompletadas = {
      ...updated.seccionesCompletadas,
      [seccion]: seccionCompletada,
    };

    return enrichmentRepository.update(enrichmentId, { seccionesCompletadas });
  }

  async findByOperacionId(operacionId: number) {
    return enrichmentRepository.findByOperacionId(operacionId);
  }

  async findById(id: number) {
    return enrichmentRepository.findById(id);
  }

  async findSourcesByEnrichmentId(enrichmentId: number) {
    return enrichmentRepository.findSourcesByEnrichmentId(enrichmentId);
  }
}

export const enrichmentService = new EnrichmentService();
