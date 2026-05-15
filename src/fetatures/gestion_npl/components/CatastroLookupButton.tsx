'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Search, ExternalLink, AlertCircle, CheckCircle2,
  Loader2, Bug, Map, X,
} from 'lucide-react';
import { NplInput } from '../schemas/nplSchema';
import {
  getCatastroDataAction,
  debugCatastroXmlAction,
  debugCatastroRccoorAction,
} from '../actions/catastro-actions';
import { useSession } from '@/src/lib/auth-client';
import { ROLES } from '@/src/lib/roles';
import type { CatastroInmueble, CatastroCoordenadas } from '@/src/lib/catastro/catastro.helper';

type PanelEstado =
  | { tipo: 'idle' }
  | { tipo: 'loading' }
  | { tipo: 'ok'; inmueble: CatastroInmueble; pdfUrl: string; coords: CatastroCoordenadas | null }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'debug'; xml: string };

export default function CatastroLookupButton() {
  const { watch, setValue } = useFormContext<NplInput>();
  const { data: session } = useSession();
  const [estado, setEstado] = useState<PanelEstado>({ tipo: 'idle' });

  const refCatastral = watch('refCatastral') ?? '';
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
    const { inmueble, pdfUrl } = estado;
    if (inmueble.direccionCompleta) setValue('direccion',     inmueble.direccionCompleta,            { shouldDirty: true });
    if (inmueble.municipio)         setValue('municipio',     inmueble.municipio,                    { shouldDirty: true });
    if (inmueble.provincia)         setValue('provincia',     inmueble.provincia,                    { shouldDirty: true });
    if (inmueble.codigoPostal)      setValue('codigoPostal',  inmueble.codigoPostal,                 { shouldDirty: true });
    if (inmueble.superficieConstruida !== null) setValue('superficieConst', String(inmueble.superficieConstruida), { shouldDirty: true });
    if (inmueble.anoConstruccion !== null)      setValue('anyConstruccion', String(inmueble.anoConstruccion),      { shouldDirty: true });
    const fecha = new Date().toLocaleDateString('es-ES');
    setValue('actuacionesSeguidas', `[Consulta Catastro ${fecha}] RC: ${inmueble.referenciaCatastral} | PDF: ${pdfUrl}`, { shouldDirty: true });
  }

  const btnLabel = estado.tipo === 'loading' ? 'Consultando...' : panelAbierto ? 'Cerrar Catastro' : 'Consultar Catastro';

  return (
    <div className="mt-1 space-y-2">

      {/* ── Barra de botones ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">

        <button
          type="button"
          onClick={handleConsultar}
          disabled={!refCatastral.trim() || estado.tipo === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {estado.tipo === 'loading' ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : panelAbierto ? <X className="h-3.5 w-3.5" />
            : <Search className="h-3.5 w-3.5" />}
          {btnLabel}
        </button>

        {/* Google Maps — solo cuando hay coords */}
        {estado.tipo === 'ok' && estado.coords && (
          <a
            href={estado.coords.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <Map className="h-3.5 w-3.5" />
            Ver en Google Maps
          </a>
        )}

        {/* Admin: XML datos + XML coords */}
        {isAdmin && (
          <>
            <button type="button" onClick={handleDebugDatos}
              disabled={!refCatastral.trim() || estado.tipo === 'loading'}
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-400 hover:bg-gray-100 disabled:opacity-40"
              title="XML datos (admin)">
              <Bug className="h-3 w-3" />XML
            </button>
            <button type="button" onClick={handleDebugCoords}
              disabled={!refCatastral.trim() || estado.tipo === 'loading'}
              className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-[10px] text-gray-400 hover:bg-gray-100 disabled:opacity-40"
              title="XML coordenadas (admin)">
              <Bug className="h-3 w-3" />COOR
            </button>
          </>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {estado.tipo === 'error' && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{estado.mensaje}</span>
        </div>
      )}

      {/* ── XML debug ────────────────────────────────────────────────────── */}
      {estado.tipo === 'debug' && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
          <p className="mb-1 text-[10px] font-semibold uppercase text-gray-500">XML crudo del Catastro (admin)</p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[10px] text-gray-700">
            {estado.xml}
          </pre>
        </div>
      )}

      {/* ── Panel resultado OK ────────────────────────────────────────────── */}
      {estado.tipo === 'ok' && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Inmueble encontrado en el Catastro
            </div>
            <a href={estado.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded border border-green-300 bg-white px-2 py-0.5 text-xs text-green-700 hover:bg-green-100 transition-colors">
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
              <dt className="text-gray-500">Uso principal</dt>
              <dd className="font-medium text-gray-800">{estado.inmueble.usoPrincipal || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Sup. construida</dt>
              <dd className="font-medium text-gray-800">
                {estado.inmueble.superficieConstruida !== null ? `${estado.inmueble.superficieConstruida} m²` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Año construcción</dt>
              <dd className="font-medium text-gray-800">{estado.inmueble.anoConstruccion ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Clase</dt>
              <dd className="font-medium text-gray-800">
                {estado.inmueble.clase === 'U' ? 'Urbano' : estado.inmueble.clase === 'R' ? 'Rústico' : estado.inmueble.clase || '—'}
              </dd>
            </div>
            {estado.coords && (
              <div>
                <dt className="text-gray-500">Coordenadas</dt>
                <dd className="font-mono text-[10px] font-medium text-gray-800">
                  {estado.coords.lat.toFixed(6)}, {estado.coords.lon.toFixed(6)}
                </dd>
              </div>
            )}
            {!estado.coords && (
              <div>
                <dt className="text-gray-500">Coordenadas</dt>
                <dd className="text-gray-400 italic text-[10px]">No disponibles</dd>
              </div>
            )}
          </dl>

          <button type="button" onClick={handleAutoRellenar}
            className="inline-flex items-center gap-1.5 rounded-md border border-green-400 bg-white px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors">
            ↙ Usar estos datos en el formulario
          </button>
          <p className="text-[10px] text-gray-500">
            Rellena dirección, municipio, provincia, CP, superficie y año. La URL del PDF queda en "Actuaciones seguidas".
          </p>
        </div>
      )}
    </div>
  );
}
