'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Search, ExternalLink, AlertCircle, CheckCircle2,
  Loader2, Bug, Map, X,
} from 'lucide-react';
import type { EnrichmentInput } from '../schemas/enrichmentSchema';
import {
  getCatastroDataAction,
  debugCatastroXmlAction,
  debugCatastroRccoorAction,
} from '@/src/fetatures/gestion_npl/actions/catastro-actions';
import { useSessionWithRole } from '@/src/lib/auth-client';
import { ROLES } from '@/src/lib/roles';
import type { CatastroInmueble, CatastroCoordenadas } from '@/src/lib/catastro/catastro.helper';

type PanelEstado =
  | { tipo: 'idle' }
  | { tipo: 'loading' }
  | { tipo: 'ok'; inmueble: CatastroInmueble; pdfUrl: string; coords: CatastroCoordenadas | null }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'debug'; xml: string };

export default function CatastroLookupButtonEnrichment() {
  const { watch, setValue } = useFormContext<EnrichmentInput>();
  const { data: session } = useSessionWithRole();
  const [estado, setEstado] = useState<PanelEstado>({ tipo: 'idle' });

  // Enrichment usa 'referenciaCatastral' (no 'refCatastral' como en NplInput)
  const refCatastral = watch('referenciaCatastral') ?? '';
  const isAdmin = session?.user?.role === ROLES.ADMIN;
  const panelAbierto = estado.tipo !== 'idle';

  async function handleConsultar() {
    if (!refCatastral.trim()) return;
    if (panelAbierto) { setEstado({ tipo: 'idle' }); return; }
    setEstado({ tipo: 'loading' });
    const resultado = await getCatastroDataAction(refCatastral.trim());
    if (!resultado.ok) { setEstado({ tipo: 'error', mensaje: resultado.error }); return; }
    setEstado({ tipo: 'ok', inmueble: resultado.inmueble, pdfUrl: resultado.pdfUrl, coords: resultado.coords });
  }

  async function handleDebugDatos() {
    if (!refCatastral.trim()) return;
    setEstado({ tipo: 'loading' });
    const r = await debugCatastroXmlAction(refCatastral.trim());
    if ('error' in r) { setEstado({ tipo: 'error', mensaje: r.error }); }
    else { setEstado({ tipo: 'debug', xml: `=== DATOS ===\n${r.xml}` }); }
  }

  async function handleDebugCoords() {
    if (!refCatastral.trim()) return;
    setEstado({ tipo: 'loading' });
    const r = await debugCatastroRccoorAction(refCatastral.trim());
    if ('error' in r) { setEstado({ tipo: 'error', mensaje: r.error }); }
    else { setEstado({ tipo: 'debug', xml: `=== URL ===\n${r.url}\n\n=== COORDS XML ===\n${r.xml}` }); }
  }

  function handleAutoRellenar() {
    if (estado.tipo !== 'ok') return;
    const { inmueble, coords } = estado;

    // Campos de localización — nombres de EnrichmentInput
    if (inmueble.municipio)    setValue('municipio',    inmueble.municipio,    { shouldDirty: true });
    if (inmueble.provincia)    setValue('provincia',    inmueble.provincia,    { shouldDirty: true });
    if (inmueble.codigoPostal) setValue('codPostal',    inmueble.codigoPostal, { shouldDirty: true });

    // Dirección completa del Catastro → nombreVia (campo libre de partida)
    if (inmueble.direccionCompleta)
      setValue('nombreVia', inmueble.direccionCompleta, { shouldDirty: true });

    // Uso catastral
    if (inmueble.usoPrincipal)
      setValue('usoCatastral', inmueble.usoPrincipal, { shouldDirty: true });

    // Superficie y año
    if (inmueble.superficieConstruida !== null)
      setValue('superficieConst', inmueble.superficieConstruida, { shouldDirty: true });
    if (inmueble.anoConstruccion !== null)
      setValue('anyConstruccion', inmueble.anoConstruccion, { shouldDirty: true });

    // Coordenadas — nombres de EnrichmentInput (latitud/longitud, no latCatastro/lngCatastro)
    if (coords?.lat) setValue('latitud',  coords.lat, { shouldDirty: true });
    if (coords?.lon) setValue('longitud', coords.lon, { shouldDirty: true });
  }

  const btnLabel =
    estado.tipo === 'loading' ? 'Consultando...' :
    panelAbierto              ? 'Cerrar Catastro' :
                                'Consultar Catastro';

  return (
    <div className="mt-1 space-y-2">

      {/* ── Barra de botones ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Consultar / Cerrar */}
        <button
          type="button"
          onClick={handleConsultar}
          disabled={!refCatastral.trim() || estado.tipo === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50
                     px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors
                     hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estado.tipo === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : panelAbierto           ? <X       className="h-3.5 w-3.5" />
            :                          <Search  className="h-3.5 w-3.5" />}
          {btnLabel}
        </button>

        {/* Google Maps — click normal */}
        {estado.tipo === 'ok' && estado.coords && (
          <a
            href={estado.coords.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver inmueble en Google Maps"
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50
                       px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            <Map className="h-3.5 w-3.5" />
            Google Maps
          </a>
        )}

        {/* XML catastro — Ctrl+Click abre XML datos en nueva pestaña */}
        {refCatastral.trim() && (
          <a
            href={`https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejeroCodigos.asmx/Consulta_DNPRC_Codigos?CodigoProvincia=&CodigoMunicipio=&CodigoMunicipioINE=&RC=${refCatastral.trim().toUpperCase()}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver datos del Catastro en XML"
            className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50
                       px-2 py-1.5 text-[10px] text-gray-500 transition-colors hover:bg-gray-100"
          >
            <ExternalLink className="h-3 w-3" />
            XML Catastro
          </a>
        )}

        {/* Admin: debug XML datos + coords */}
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={handleDebugDatos}
              disabled={!refCatastral.trim() || estado.tipo === 'loading'}
              title="XML datos crudos (admin)"
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50
                         px-2 py-1.5 text-[10px] text-gray-400 hover:bg-gray-100 disabled:opacity-40"
            >
              <Bug className="h-3 w-3" />XML
            </button>
            <button
              type="button"
              onClick={handleDebugCoords}
              disabled={!refCatastral.trim() || estado.tipo === 'loading'}
              title="XML coordenadas crudas (admin)"
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50
                         px-2 py-1.5 text-[10px] text-gray-400 hover:bg-gray-100 disabled:opacity-40"
            >
              <Bug className="h-3 w-3" />COOR
            </button>
          </>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {estado.tipo === 'error' && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50
                        px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{estado.mensaje}</span>
        </div>
      )}

      {/* ── XML debug (admin) ─────────────────────────────────────────── */}
      {estado.tipo === 'debug' && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
          <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">
            XML crudo del Catastro (admin)
          </p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[10px] text-gray-700">
            {estado.xml}
          </pre>
        </div>
      )}

      {/* ── Panel resultado OK ───────────────────────────────────────── */}
      {estado.tipo === 'ok' && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Inmueble encontrado en el Catastro
            </div>
            <a
              href={estado.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-green-300 bg-white
                         px-2 py-0.5 text-xs text-green-700 transition-colors hover:bg-green-100"
            >
              <ExternalLink className="h-3 w-3" />Ver ficha PDF
            </a>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="col-span-2">
              <dt className="text-gray-500">Dirección</dt>
              <dd className="font-medium text-gray-800">{estado.inmueble.direccionCompleta || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Municipio</dt>
              <dd className="font-medium text-gray-800">
                {estado.inmueble.municipio || '—'}
                {estado.inmueble.provincia ? ` (${estado.inmueble.provincia})` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Uso catastral</dt>
              <dd className="font-medium text-gray-800">{estado.inmueble.usoPrincipal || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Sup. construida</dt>
              <dd className="font-medium text-gray-800">
                {estado.inmueble.superficieConstruida !== null
                  ? `${estado.inmueble.superficieConstruida} m²`
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Año construcción</dt>
              <dd className="font-medium text-gray-800">{estado.inmueble.anoConstruccion ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Clase</dt>
              <dd className="font-medium text-gray-800">
                {estado.inmueble.clase === 'U' ? 'Urbano'
                  : estado.inmueble.clase === 'R' ? 'Rústico'
                  : estado.inmueble.clase || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Coordenadas</dt>
              <dd className="font-mono text-[10px] font-medium text-gray-800">
                {estado.coords
                  ? `${estado.coords.lat.toFixed(6)}, ${estado.coords.lon.toFixed(6)}`
                  : <span className="text-gray-400 italic">No disponibles</span>}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleAutoRellenar}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-400 bg-white
                       px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
          >
            ↙ Usar estos datos en el formulario
          </button>
          <p className="text-[10px] text-gray-500">
            Rellena municipio, provincia, CP, dirección, uso catastral, superficie, año y coordenadas.
          </p>
        </div>
      )}
    </div>
  );
}
