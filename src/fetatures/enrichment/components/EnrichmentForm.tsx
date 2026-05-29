'use client';

import { useState, useTransition } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

import { EnrichmentFormSchema, type EnrichmentFormValues, type EnrichmentInput } from '../schemas/enrichmentSchema';
import { saveEnrichmentSeccionAction } from '../actions/enrichment-actions';
import type { SelectEnrichment } from '@/src/db/schema';
import type { SelectEnrichmentDeudor } from '@/src/db/schema';
import type { SeccionId, SeccionesCompletadas } from '../types/enrichment.types';
import { ENRICHMENT_SECCIONES } from '../types/enrichment.types';

import SeccionCompletitudBadge from './SeccionCompletitudBadge';
import EnrichmentSeccionA from './EnrichmentSeccionA';
import EnrichmentSeccionB from './EnrichmentSeccionB';
import EnrichmentSeccionC from './EnrichmentSeccionC';
import EnrichmentSeccionD from './EnrichmentSeccionD';
import EnrichmentSeccionE from './EnrichmentSeccionE';
import EnrichmentSeccionF from './EnrichmentSeccionF';
import EnrichmentCreateTaskButton from './EnrichmentCreateTaskButton';

type Props = {
  enrichment:      SelectEnrichment;
  operacionId:     number;
  expediente:      string;
  initialDeudores: SelectEnrichmentDeudor[];
  users:           { id: string; name: string; email: string }[];
  currentUserId:   string;
};

function asEnum<T>(val: string | null | undefined): T | undefined {
  return (val ?? undefined) as T | undefined;
}

const SECCION_CAMPOS: Record<SeccionId, (keyof EnrichmentFormValues)[]> = {
  a: ['sellerReference', 'originalLender', 'idufir', 'cru'],
  b: [
    'fechaOriginacion', 'fechaImpago', 'fechaClasificacionNpl', 'fechaUltimoPago',
    'fechaVencimiento', 'fechaCompraCartera', 'fechaInicioAccionLegal',
    'principalOriginal', 'principalPendiente', 'interesesDevengados', 'deudaTotal',
    'gbv', 'tipoInteres', 'cuotaMensual', 'ltv', 'mesesImpago',
    'tasacionOriginal', 'tasacionActual', 'fechaTasacion', 'valorMercado',
    'valorEjecucionForzosa', 'precioSubasta', 'precioVenta',
  ],
  c: [
    'propertyId', 'tipoInmueble',
    'comunidadAutonoma', 'provincia', 'municipio', 'municipioId', 'codPostal',
    'tipoVia', 'nombreVia', 'numero', 'bloque', 'planta', 'puerta',
    'latitud', 'longitud',
    'referenciaCatastral', 'usoCatastral', 'valorRefCatastral', 'valorCatastral',
    'superficieConst', 'superficieUtil', 'superficieParcela', 'zonasComunes',
    'anyConstruccion',
    'idufirReg', 'fincaRegistral', 'libro', 'tomo', 'folio',
    'registroProvincia', 'registroCiudad', 'registroNumero',
    'dormitorios', 'banyos', 'garaje', 'plazasGaraje', 'trastero',
    'ascensor', 'jardin', 'piscina', 'estadoConservacion', 'certificadoEnergetico',
    'estadoOcupacion', 'tipoOcupante', 'rentaMensual', 'vencimientoAlquiler',
    'restriccionesUrbanisticas',
  ],
  d: [
    'estadoLegal', 'faseJudicial', 'subfaseJudicial', 'juzgado', 'partidoJudicial',
    'numeroProcedimiento', 'fechaSubasta', 'numeroSubasta', 'fechaAdjudicacion',
    'tipoAdjudicacion',
    'totalCargas', 'cargasPreferentes', 'cargasPosteriores', 'ibiPendiente',
    'comunidadPendiente', 'suministrosPendientes', 'embargos', 'usufructo', 'servidumbres',
    'tipoGarantia', 'rangoGarantia', 'garantiaCruzada',
  ],
  e: [
    'numeroDeudores', 'tieneAvalistas', 'provinciaDeudor', 'situacionLaboral',
    'nivelIngresos', 'ratingSolvencia', 'notasDeudores',
  ],
  f: [
    'estrategiaRecuperacion', 'prioridad', 'oportunidadInversion', 'recuperacionEsperada',
    'plazoRecuperacion', 'riesgoRating', 'clusterGeografico', 'gestorAsignado',
    'notasObservaciones', 'estadoDocumentacion', 'escrituraDisponible', 'antiguedadNotaSimple',
  ],
};

// Configuración de tareas sugeridas por sección
const TASK_SUGGESTIONS: Partial<Record<SeccionId, {
  title: string;
  description: string;
  category: 'DUE_DILIGENCE' | 'LEGAL' | 'VALORACION' | 'CATASTRO' | 'ADMINISTRATIVO' | 'OTRO';
}>> = {
  b: {
    title: 'Solicitar tasación actualizada',
    description: 'Encargar tasación oficial del inmueble para actualizar valor de mercado y datos financieros.',
    category: 'VALORACION',
  },
  c: {
    title: 'Solicitar nota simple registral',
    description: 'Obtener nota simple del Registro de la Propiedad para confirmar titularidad, cargas y datos registrales.',
    category: 'DUE_DILIGENCE',
  },
  d: {
    title: 'Consultar estado procedimiento judicial',
    description: 'Verificar estado actualizado del procedimiento judicial, fase y próximas actuaciones.',
    category: 'LEGAL',
  },
};

export default function EnrichmentForm({
  enrichment,
  operacionId,
  expediente,
  initialDeudores,
  users,
  currentUserId,
}: Props) {
  const [activeTab, setActiveTab]           = useState<SeccionId>('a');
  const [isPending, startTransition]        = useTransition();
  const [seccionesState, setSeccionesState] = useState(enrichment.seccionesCompletadas);

  const methods = useForm<EnrichmentFormValues>({
    defaultValues: {
      // A
      sellerReference: enrichment.sellerReference ?? '',
      originalLender:  enrichment.originalLender  ?? '',
      idufir:          enrichment.idufir           ?? '',
      cru:             enrichment.cru              ?? '',
      // B — fechas
      fechaOriginacion:       enrichment.fechaOriginacion       ?? '',
      fechaImpago:            enrichment.fechaImpago            ?? '',
      fechaClasificacionNpl:  enrichment.fechaClasificacionNpl  ?? '',
      fechaUltimoPago:        enrichment.fechaUltimoPago        ?? '',
      fechaVencimiento:       enrichment.fechaVencimiento       ?? '',
      fechaCompraCartera:     enrichment.fechaCompraCartera     ?? '',
      fechaInicioAccionLegal: enrichment.fechaInicioAccionLegal ?? '',
      // B — financieros
      principalOriginal:   enrichment.principalOriginal   ?? '',
      principalPendiente:  enrichment.principalPendiente  ?? '',
      interesesDevengados: enrichment.interesesDevengados ?? '',
      deudaTotal:          enrichment.deudaTotal          ?? '',
      gbv:                 enrichment.gbv                 ?? '',
      tipoInteres:         enrichment.tipoInteres         ?? '',
      cuotaMensual:        enrichment.cuotaMensual        ?? '',
      ltv:                 enrichment.ltv                 ?? '',
      mesesImpago:         enrichment.mesesImpago != null ? String(enrichment.mesesImpago) : undefined,
      // B — valoraciones
      tasacionOriginal:      enrichment.tasacionOriginal      ?? '',
      tasacionActual:        enrichment.tasacionActual        ?? '',
      fechaTasacion:         enrichment.fechaTasacion         ?? '',
      valorMercado:          enrichment.valorMercado          ?? '',
      valorEjecucionForzosa: enrichment.valorEjecucionForzosa ?? '',
      precioSubasta:         enrichment.precioSubasta         ?? '',
      precioVenta:           enrichment.precioVenta           ?? '',
      // C — identificadores
      propertyId:   enrichment.propertyId   ?? '',
      tipoInmueble: enrichment.tipoInmueble ?? '',
      // C — localización
      comunidadAutonoma: enrichment.comunidadAutonoma ?? '',
      provincia:         enrichment.provincia         ?? '',
      municipio:         enrichment.municipio         ?? '',
      municipioId:       enrichment.municipioId != null ? String(enrichment.municipioId) : undefined,
      codPostal:         enrichment.codPostal         ?? '',
      tipoVia:           enrichment.tipoVia           ?? '',
      nombreVia:         enrichment.nombreVia         ?? '',
      numero:            enrichment.numero            ?? '',
      bloque:            enrichment.bloque            ?? '',
      planta:            enrichment.planta            ?? '',
      puerta:            enrichment.puerta            ?? '',
      latitud:           enrichment.latitud           ?? '',
      longitud:          enrichment.longitud          ?? '',
      // C — catastro
      referenciaCatastral: enrichment.referenciaCatastral ?? '',
      usoCatastral:        enrichment.usoCatastral        ?? '',
      valorRefCatastral:   enrichment.valorRefCatastral   ?? '',
      valorCatastral:      enrichment.valorCatastral      ?? '',
      superficieConst:     enrichment.superficieConst     ?? '',
      superficieUtil:      enrichment.superficieUtil       ?? '',
      superficieParcela:   enrichment.superficieParcela   ?? '',
      zonasComunes:        enrichment.zonasComunes         ?? '',
      anyConstruccion:     enrichment.anyConstruccion != null ? String(enrichment.anyConstruccion) : undefined,
      // C — registro
      idufirReg:         enrichment.idufirReg         ?? '',
      fincaRegistral:    enrichment.fincaRegistral    ?? '',
      libro:             enrichment.libro             ?? '',
      tomo:              enrichment.tomo              ?? '',
      folio:             enrichment.folio             ?? '',
      registroProvincia: enrichment.registroProvincia ?? '',
      registroCiudad:    enrichment.registroCiudad    ?? '',
      registroNumero:    enrichment.registroNumero    ?? '',
      // C — características
      dormitorios:  enrichment.dormitorios != null ? String(enrichment.dormitorios) : undefined,
      banyos:       enrichment.banyos != null ? String(enrichment.banyos) : undefined,
      garaje:       enrichment.garaje       ?? false,
      plazasGaraje: enrichment.plazasGaraje != null ? String(enrichment.plazasGaraje) : undefined,
      trastero:     enrichment.trastero     ?? false,
      ascensor:     enrichment.ascensor     ?? false,
      jardin:       enrichment.jardin       ?? false,
      piscina:      enrichment.piscina      ?? false,
      estadoConservacion:    asEnum<'nuevo'|'buen_estado'|'a_reformar'|'ruinoso'>(enrichment.estadoConservacion),
      certificadoEnergetico: asEnum<'A'|'B'|'C'|'D'|'E'|'F'|'G'>(enrichment.certificadoEnergetico),
      estadoOcupacion:       asEnum<'vacio'|'ocupado'|'irregular'>(enrichment.estadoOcupacion),
      tipoOcupante:          asEnum<'propietario'|'inquilino'|'tercero'|'okupa'>(enrichment.tipoOcupante),
      rentaMensual:          enrichment.rentaMensual        ?? '',
      vencimientoAlquiler:   enrichment.vencimientoAlquiler ?? '',
      restriccionesUrbanisticas: enrichment.restriccionesUrbanisticas ?? '',
      // D
      estadoLegal:         asEnum<'prejudicial'|'judicial'|'finalizado'>(enrichment.estadoLegal),
      faseJudicial:        asEnum<'monitorio'|'ordinario'|'ejecucion'>(enrichment.faseJudicial),
      subfaseJudicial:     enrichment.subfaseJudicial     ?? '',
      juzgado:             enrichment.juzgado             ?? '',
      partidoJudicial:     enrichment.partidoJudicial     ?? '',
      numeroProcedimiento: enrichment.numeroProcedimiento ?? '',
      fechaSubasta:        enrichment.fechaSubasta        ?? '',
      numeroSubasta:       enrichment.numeroSubasta       ?? '',
      fechaAdjudicacion:   enrichment.fechaAdjudicacion   ?? '',
      tipoAdjudicacion:    asEnum<'acreedor'|'tercero'|'desierta'>(enrichment.tipoAdjudicacion),
      totalCargas:           enrichment.totalCargas           ?? '',
      cargasPreferentes:     enrichment.cargasPreferentes     ?? '',
      cargasPosteriores:     enrichment.cargasPosteriores     ?? '',
      ibiPendiente:          enrichment.ibiPendiente          ?? '',
      comunidadPendiente:    enrichment.comunidadPendiente    ?? '',
      suministrosPendientes: enrichment.suministrosPendientes ?? '',
      embargos:              enrichment.embargos              ?? '',
      usufructo:             enrichment.usufructo             ?? false,
      servidumbres:          enrichment.servidumbres          ?? '',
      tipoGarantia:          enrichment.tipoGarantia          ?? '',
      rangoGarantia:         enrichment.rangoGarantia         ?? '',
      garantiaCruzada:       enrichment.garantiaCruzada       ?? false,
      // E — scoring agregado
      numeroDeudores:   enrichment.numeroDeudores != null ? String(enrichment.numeroDeudores) : undefined,
      tieneAvalistas:   enrichment.tieneAvalistas  ?? false,
      provinciaDeudor:  enrichment.provinciaDeudor ?? '',
      situacionLaboral: asEnum<'empleado'|'desempleado'|'autonomo'|'jubilado'|'otro'>(enrichment.situacionLaboral),
      nivelIngresos:    asEnum<'alto'|'medio'|'bajo'>(enrichment.nivelIngresos),
      ratingSolvencia:  enrichment.ratingSolvencia ?? '',
      notasDeudores:    enrichment.notasDeudores   ?? '',
      // F
      estrategiaRecuperacion: asEnum<'reo'|'venta_directa'|'reestructuracion'|'dacion'|'otro'>(enrichment.estrategiaRecuperacion),
      prioridad:              asEnum<'alta'|'media'|'baja'>(enrichment.prioridad),
      oportunidadInversion:   enrichment.oportunidadInversion ?? '',
      recuperacionEsperada:   enrichment.recuperacionEsperada ?? '',
      plazoRecuperacion:      enrichment.plazoRecuperacion != null ? String(enrichment.plazoRecuperacion) : undefined,
      riesgoRating:           asEnum<'alto'|'medio'|'bajo'>(enrichment.riesgoRating),
      clusterGeografico:      enrichment.clusterGeografico    ?? '',
      gestorAsignado:         enrichment.gestorAsignado       ?? '',
      notasObservaciones:     enrichment.notasObservaciones   ?? '',
      estadoDocumentacion:    asEnum<'completa'|'incompleta'|'pendiente'>(enrichment.estadoDocumentacion),
      escrituraDisponible:    enrichment.escrituraDisponible  ?? false,
      antiguedadNotaSimple:   enrichment.antiguedadNotaSimple ?? '',
    },
  });

  function handleGuardarSeccion() {
    const allValues = methods.getValues();
    const campos    = SECCION_CAMPOS[activeTab];
    const seccionData: Partial<EnrichmentFormValues> = {};
    for (const campo of campos) {
      (seccionData as any)[campo] = (allValues as any)[campo];
    }

    startTransition(async () => {
      const result = await saveEnrichmentSeccionAction(enrichment.id, activeTab, seccionData);
      if (result.error) { toast.error(result.error); return; }
      toast.success(result.success);
      if (result.seccionesCompletadas) {
        setSeccionesState(result.seccionesCompletadas as SeccionesCompletadas);
      }
    });
  }

  const taskSuggestion = TASK_SUGGESTIONS[activeTab];

  return (
    <FormProvider {...methods}>
      <div className="space-y-5">
        <SeccionCompletitudBadge secciones={seccionesState} activeTab={activeTab} />

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {ENRICHMENT_SECCIONES.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}
                  {seccionesState[tab.id as keyof typeof seccionesState] && (
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido */}
        <div className="min-h-[500px]">
          {activeTab === 'a' && <EnrichmentSeccionA />}
          {activeTab === 'b' && <EnrichmentSeccionB />}
          {activeTab === 'c' && (
            <EnrichmentSeccionC
              enrichmentId={enrichment.id}
              notaSimpleUrl={(enrichment as any).notaSimpleUrl}
              hasNotaSimple={!!(enrichment as any).notaSimpleUrl}
            />
          )}
          {activeTab === 'd' && <EnrichmentSeccionD />}
          {activeTab === 'e' && (
            <EnrichmentSeccionE
              enrichmentId={enrichment.id}
              initialDeudores={initialDeudores}
              onSeccionComplete={(completa) => {
                setSeccionesState(prev => ({ ...prev, e: completa }));
              }}
            />
          )}
          {activeTab === 'f' && <EnrichmentSeccionF />}
        </div>

        {/* Footer: guardar + crear tarea */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          {/* Botón crear tarea (solo en secciones B, C, D) */}
          <div>
            {taskSuggestion && (
              <EnrichmentCreateTaskButton
                enrichmentId={enrichment.id}
                operacionId={operacionId}
                expediente={expediente}
                defaultTitle={taskSuggestion.title}
                defaultDescription={taskSuggestion.description}
                defaultCategory={taskSuggestion.category}
                users={users}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {/* Guardar sección (no en E, que tiene su propio botón) */}
          {activeTab !== 'e' && (
            <button
              type="button"
              onClick={handleGuardarSeccion}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm
                         font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={16} />
              {isPending ? 'Guardando...' : `Guardar sección ${activeTab.toUpperCase()}`}
            </button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
