import { enrichmentRepository } from './EnrichmentRepository';
import { operacionesRepository } from '@/src/fetatures/fondos/services/OperacionesRepository';
import type { EnrichmentInput } from '../schemas/enrichmentSchema';
import type { SelectEnrichment } from '@/src/db/schema';
import { nplDeudores } from '@/src/db/schema';
import {
  calcularCompletitudSeccion,
  type SeccionId,
} from '../types/enrichment.types';
import { nplRepository } from '@/src/fetatures/gestion_npl/services/NplRepository';
import { generarCodigoNpl } from '@/src/fetatures/gestion_npl/services/NplService';
import { enrichmentDeudoresRepository } from './EnrichmentDeudoresRepository';
import { db } from '@/src/db';

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
      principalAFS:     operacion.deuda               ?? undefined,
      tasacionOriginal: operacion.valorTasacionSubasta ?? undefined,

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
      procedimiento: (() => {
        const f = (operacion.procLegalFase ?? '').toUpperCase();
        if (f.includes('EJH') || f.includes('HIPOT')) return 'EJH';
        if (f.includes('ETNJ')) return 'ETNJ';
        if (f.includes('ETJ'))  return 'ETJ';
        if (f.includes('PO') || f.includes('ORDIN')) return 'PO';
        if (f.includes('DESAH')) return 'DESAHUCIO';
        return undefined;
      })() as any,
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

  // ── Promoción a NPL ─────────────────────────────────────────────────────────

  async promoverANpl(enrichmentId: number, creatorId: string) {
    const enrichment = await enrichmentRepository.findById(enrichmentId);
    if (!enrichment) throw new Error('Enrichment no encontrado');

    if (enrichment.nplId) {
      throw new Error(`Este enrichment ya fue promocionado (NPL #${enrichment.nplId})`);
    }

    // Verificar que todas las secciones están completas
    // Usamos seccionesCompletadas tal como está persistido en BD
    // (cada sección lo actualiza con su propia lógica al guardar)
    const secciones: SeccionId[] = ['a', 'b', 'c', 'd', 'e', 'f'];
    const sc = (enrichment.seccionesCompletadas ?? {}) as Record<string, boolean>;
    const incompletas = secciones.filter(s => !sc[s]);
    if (incompletas.length > 0) {
      throw new Error(`Secciones incompletas: ${incompletas.map(s => s.toUpperCase()).join(', ')}`);
    }

    // ── Normalización de enums ────────────────────────────────────────────────
    // tipoInmueble: el enrichment puede tener texto libre del Excel → mapear al enum NPL
    const TIPO_INMUEBLE_MAP: Record<string, string> = {
      vivienda: 'VIVIENDA', piso: 'VIVIENDA', apartamento: 'VIVIENDA',
      apartment: 'VIVIENDA', flat: 'VIVIENDA',
      local: 'LOCAL', 'local comercial': 'LOCAL', retail: 'LOCAL',
      oficina: 'OFICINA', office: 'OFICINA',
      garaje: 'GARAJE', garage: 'GARAJE', parking: 'GARAJE',
      trastero: 'TRASTERO',
      nave: 'NAVE_INDUSTRIAL', industrial: 'NAVE_INDUSTRIAL', warehouse: 'NAVE_INDUSTRIAL',
      solar: 'SOLAR', suelo: 'SOLAR', land: 'SOLAR',
      finca: 'FINCA_RUSTICA', rustica: 'FINCA_RUSTICA', rural: 'FINCA_RUSTICA',
    };
    const TIPO_INMUEBLE_VALID = ['VIVIENDA','LOCAL','OFICINA','GARAJE','TRASTERO','NAVE_INDUSTRIAL','SOLAR','FINCA_RUSTICA','OTRO'];
    const normTipoInmueble = (raw: string | null | undefined): string => {
      if (!raw) return 'OTRO';
      if (TIPO_INMUEBLE_VALID.includes(raw.toUpperCase())) return raw.toUpperCase();
      const lower = raw.toLowerCase();
      for (const [key, val] of Object.entries(TIPO_INMUEBLE_MAP)) {
        if (lower.includes(key)) return val;
      }
      return 'OTRO';
    };

    const PROCEDIMIENTO_VALID = ['EJH','ETNJ','ETJ','PO','DESAHUCIO','OTRO'];
    const normProcedimiento = (raw: string | null | undefined): string => {
      if (!raw) return 'EJH';
      if (PROCEDIMIENTO_VALID.includes(raw)) return raw;
      return 'EJH';
    };

    // Generar código NPL
    const ultimoId = await nplRepository.getLastId();
    const nuestroCodigoNpl = generarCodigoNpl(ultimoId);

    // Helper para convertir numeric strings a number
    const toNum = (v: unknown): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = parseFloat(String(v));
      return isNaN(n) ? null : n;
    };

    // Mapeo enrichment → NPL
    const nplData = {
      nuestroCodigoNpl,
      creatorId,
      propertyId:   enrichment.propertyId   ?? undefined,
      enrichmentId: enrichment.id,
      enrichmentOperacionId: enrichment.operacionId,

      // A — Identificadores / localización
      tituloOperacion:    enrichment.tituloOperacion    ?? 'Sin título',
      referenciaOrigen:   enrichment.sellerReference    ?? undefined,
      idufir:             enrichment.idufir             ?? undefined,
      cru:                enrichment.cru                ?? undefined,
      direccion:          enrichment.nombreVia          ?? undefined,
      municipio:          enrichment.municipio          ?? undefined,
      provincia:          enrichment.provincia          ?? undefined,
      comunidadAutonoma:  enrichment.comunidadAutonoma  ?? undefined,
      codigoPostal:       enrichment.codPostal          ?? undefined,

      // A — Inmueble
      tipoInmueble:       normTipoInmueble(enrichment.tipoInmueble) as any,
      refCatastral:       enrichment.referenciaCatastral ?? undefined,
      usoCatastral:       enrichment.usoCatastral        ?? undefined,
      valorRefCatastral:  enrichment.valorRefCatastral   ?? undefined,
      valorCatastral:     enrichment.valorCatastral      ?? undefined,
      latCatastro:        enrichment.latitud             ?? undefined,
      lngCatastro:        enrichment.longitud            ?? undefined,
      superficieConst:    enrichment.superficieConst     ?? undefined,
      superficieUtil:     enrichment.superficieUtil      ?? undefined,
      superficieParcela:  enrichment.superficieParcela   ?? undefined,
      superficieDetalles: enrichment.superficieDetalles  ?? undefined,
      distribucion:       enrichment.distribucion        ?? undefined,
      distribucionResumida: enrichment.distribucionResumida ?? undefined,
      anyConstruccion:    enrichment.anyConstruccion     ?? undefined,

      // A — Registro
      fincaRegistral:     enrichment.fincaRegistral      ?? undefined,
      datosRegistro:      enrichment.datosRegistro       ?? undefined,
      notasObservaciones: enrichment.notasObservaciones    ?? undefined,

      // B — Rentabilidad
      costeAdquisicionCredito: enrichment.costeAdquisicionCredito ?? undefined,
      impuestosAjd:            enrichment.impuestosAjd            ?? undefined,
      costesNotariaRegistro:   enrichment.costesNotariaRegistro   ?? undefined,
      gastosDacion:            enrichment.gastosDacion            ?? undefined,
      precioMercado:           enrichment.precioMercado           ?? undefined,
      precioVentaRapida:       enrichment.precioVentaRapida       ?? undefined,
      comisionIntermediacion:  enrichment.comisionIntermediacion  ?? undefined,
      pujaProbable:            enrichment.pujaProbable            ?? undefined,
      fechaCompra:             enrichment.fechaCompra             ?? undefined,
      fechaTerminacion:        enrichment.fechaTerminacion        ?? undefined,
      gastosDiversos:          enrichment.gastosDiversos          ?? [],

      // C — Deuda
      // principal = principalAFS + interesesAFS + costasAFS (deuda total AFS)
      // npl-calc: deuda_actualizada = principal + intereses + costas
      principal: (() => {
        const p = toNum(enrichment.principalAFS);
        const i = toNum(enrichment.interesesAFS);
        const c = toNum(enrichment.costasAFS);
        if (p === null && i === null && c === null) return undefined;
        return String((p ?? 0) + (i ?? 0) + (c ?? 0));
      })(),
      intereses:      enrichment.intereses      ?? undefined,
      costas:         enrichment.costas         ?? undefined,
      fechaCalculada: enrichment.fechaCalculada ?? undefined,

      // C — Tasaciones
      // tasacionSubasta ← tasacionOriginal del enrichment (dato histórico del título)
      // tasacionActual  ← tasacionActual del enrichment
      // fechaTasacion   ← fechaTasacion del enrichment
      tasacionSubasta: enrichment.tasacionOriginal ?? undefined,
      tasacionActual:  enrichment.tasacionActual   ?? undefined,
      fechaTasacion:   enrichment.fechaTasacion    ?? undefined,

      // C — Ocupación
      notasOcupacion: enrichment.notasOcupacion ?? undefined,

      // D — Procedimiento
      procedimiento:            normProcedimiento(enrichment.procedimiento) as any,
      numProcedimiento:         enrichment.numeroProcedimiento    ?? undefined,
      juzgado:                  enrichment.juzgado                ?? undefined,
      ejecutante:               enrichment.ejecutante             ?? undefined,
      autoDespachoEjecucion:    enrichment.autoDespachoEjecucion  ?? undefined,
      prestamoHipotecaDetalles: enrichment.prestamoHipotecaDetalles ?? undefined,
      actuacionesJudiciales:    enrichment.actuacionesJudiciales  ?? [],
      riesgosJuridicos:         enrichment.riesgosJuridicos       ?? undefined,
      cargas:                   enrichment.cargas                 ?? undefined,
      embargos:                 enrichment.embargos               ?? undefined,
      notasInternas:            enrichment.notasInternas          ?? undefined,
    };

    // Crear el NPL
    const nuevoNpl = await nplRepository.create(nplData as any);

    // Copiar deudores de enrichment_deudores → npl_deudores
    const deudores = await enrichmentDeudoresRepository.findByEnrichmentId(enrichmentId);
    if (deudores.length > 0) {
      await db.insert(nplDeudores).values(
        deudores.map(d => ({
          nplId:             nuevoNpl.id,
          esPrincipal:       d.esPrincipal,
          tipoRegistro:      d.tipoRegistro,
          nombre:            d.nombre,
          dni:               d.dni            ?? undefined,
          direccionCompleta: d.direccionCompleta ?? undefined,
          estadoOcupacional: d.estadoOcupacional ?? undefined,
          vulnerabilidad:    d.vulnerabilidad    ?? undefined,
          notas:             d.notas             ?? undefined,
          otrosDatos:        d.otrosDatos        ?? [],
        }))
      );
    }

    // Guardar nplId en enrichment y marcar como promocionado
    await enrichmentRepository.update(enrichmentId, {
      nplId: nuevoNpl.id,
      statusPromocionNpl: 'promocionado',
    } as any);

    // Actualizar operación a 'comercializado'
    const today = new Date().toISOString().slice(0, 10);
    await operacionesRepository.updateStatus(enrichment.operacionId, 'comercializado', today);

    return nuevoNpl;
  }

  async desestimar(enrichmentId: number) {
    const enrichment = await enrichmentRepository.findById(enrichmentId);
    if (!enrichment) throw new Error('Enrichment no encontrado');

    await enrichmentRepository.update(enrichmentId, {
      statusPromocionNpl: 'desestimado',
    } as any);

    const today = new Date().toISOString().slice(0, 10);
    await operacionesRepository.updateStatus(enrichment.operacionId, 'descartado', today);
  }
}

export const enrichmentService = new EnrichmentService();
