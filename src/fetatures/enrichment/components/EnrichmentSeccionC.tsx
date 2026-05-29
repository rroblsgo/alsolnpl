'use client';

import { useFormContext } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';
import ProvinciasMunicipiosSelectEnrichment from './ProvinciasMunicipiosSelectEnrichment';
import CatastroLookupButtonEnrichment from './CatastroLookupButtonEnrichment';
import NotaSimpleUploader from './NotaSimpleUploader';
import { DynamicEnrichmentLocation } from './DynamicEnrichmentLocation';

const ESTADOS_CONSERVACION = [
  { value: 'nuevo',       label: 'Nuevo / Obra nueva' },
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'a_reformar',  label: 'A reformar' },
  { value: 'ruinoso',     label: 'Ruinoso' },
] as const;

const CERTS_ENERGETICOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const ESTADOS_OCUPACION = [
  { value: 'vacio',     label: 'Vacío' },
  { value: 'ocupado',   label: 'Ocupado' },
  { value: 'irregular', label: 'Ocupación irregular' },
] as const;

const TIPOS_OCUPANTE = [
  { value: 'propietario', label: 'Propietario / Deudor' },
  { value: 'inquilino',   label: 'Inquilino' },
  { value: 'tercero',     label: 'Tercero' },
  { value: 'okupa',       label: 'Okupa' },
] as const;

function CheckField({
  id, label, reg,
}: {
  id: string;
  label: string;
  reg: ReturnType<ReturnType<typeof useFormContext<EnrichmentFormValues>>['register']>;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        {...reg}
      />
      {label}
    </label>
  );
}

type Props = {
  enrichmentId:   number;
  notaSimpleUrl?: string | null;
  hasNotaSimple?: boolean;
};

export default function EnrichmentSeccionC({ enrichmentId, notaSimpleUrl, hasNotaSimple }: Props) {
  const { register, watch } = useFormContext<EnrichmentFormValues>();

  const estadoOcupacion     = watch('estadoOcupacion');
  const latitud             = watch('latitud');
  const longitud            = watch('longitud');
  const nombreVia           = watch('nombreVia');
  const referenciaCatastral = watch('referenciaCatastral');
  const superficieConst = watch('superficieConst');
  const superficieUtil  = watch('superficieUtil');
  const idufirA         = watch('idufir'); // IDUFIR proviene de sección A — display only

  const ratioUtil = (() => {
    const c = superficieConst ? parseFloat(String(superficieConst)) : null;
    const u = superficieUtil  ? parseFloat(String(superficieUtil))  : null;
    if (!c || !u || c === 0) return null;
    return ((u / c) * 100).toFixed(1);
  })();

  return (
    <div className="space-y-8">
      <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
        C. Datos inmueble
      </h3>

      {/* ── C0. Identificadores del inmueble ─────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Identificadores del inmueble
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="propertyId">Property ID</FormLabel>
            <FormInput
              id="propertyId"
              placeholder="Identificador del fondo"
              className="font-mono"
              {...register('propertyId')}
            />
          </div>
          <div>
            <FormLabel htmlFor="tipoInmueble">Tipo de inmueble</FormLabel>
            <FormInput
              id="tipoInmueble"
              placeholder="vivienda, local, solar..."
              {...register('tipoInmueble')}
            />
          </div>
        </div>
      </div>

      {/* ── C1. Localización ─────────────────────────────────────────── */}
      <div>
        <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
          Localización
        </h4>
        <p className="mb-3 text-xs text-gray-500">
          La comunidad autónoma se obtiene automáticamente al crear el enrichment.
          Provincia y municipio se normalizan contra el INE.
        </p>

        <div className="mb-4">
          <FormLabel htmlFor="comunidadAutonoma">Comunidad Autónoma</FormLabel>
          <FormInput
            id="comunidadAutonoma"
            placeholder="Obtenida automáticamente por provincia"
            {...register('comunidadAutonoma')}
          />
        </div>

        <ProvinciasMunicipiosSelectEnrichment />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FormLabel htmlFor="codPostal">Código postal</FormLabel>
            <FormInput id="codPostal" placeholder="41001" maxLength={10} {...register('codPostal')} />
          </div>
          <div>
            <FormLabel htmlFor="tipoVia">Tipo de vía</FormLabel>
            <FormInput id="tipoVia" placeholder="Calle, Avda., Plaza..." {...register('tipoVia')} />
          </div>
          <div className="sm:col-span-2">
            <FormLabel htmlFor="nombreVia">
              Nombre de vía{' '}
              <span className="font-normal text-gray-400 text-xs">
                (dirección del fondo como punto de partida)
              </span>
            </FormLabel>
            <FormInput id="nombreVia" placeholder="Calle Mayor, 12..." {...register('nombreVia')} />
          </div>
          <div>
            <FormLabel htmlFor="numero">Número</FormLabel>
            <FormInput id="numero" placeholder="12" {...register('numero')} />
          </div>
          <div>
            <FormLabel htmlFor="bloque">Bloque</FormLabel>
            <FormInput id="bloque" placeholder="A" {...register('bloque')} />
          </div>
          <div>
            <FormLabel htmlFor="planta">Planta</FormLabel>
            <FormInput id="planta" placeholder="2" {...register('planta')} />
          </div>
          <div>
            <FormLabel htmlFor="puerta">Puerta</FormLabel>
            <FormInput id="puerta" placeholder="B" {...register('puerta')} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="latitud">Latitud</FormLabel>
            <FormInput
              id="latitud"
              type="number"
              step="0.00000001"
              placeholder="37.38283"
              className="font-mono"
              {...register('latitud')}
            />
          </div>
          <div>
            <FormLabel htmlFor="longitud">Longitud</FormLabel>
            <FormInput
              id="longitud"
              type="number"
              step="0.00000001"
              placeholder="-5.97317"
              className="font-mono"
              {...register('longitud')}
            />
          </div>
        </div>
        <p className="mt-1 text-[10px] text-gray-400">
          Las coordenadas se pueden rellenar automáticamente consultando el Catastro (ver abajo).
        </p>

        {/* Mapa Leaflet — visible cuando hay coordenadas */}
        {latitud && longitud &&
          !isNaN(parseFloat(String(latitud))) &&
          !isNaN(parseFloat(String(longitud))) && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-medium text-gray-500">
              <span className="mr-1">📍</span>Ubicación del inmueble
            </p>
            <DynamicEnrichmentLocation
              lat={parseFloat(String(latitud))}
              lng={parseFloat(String(longitud))}
              direccion={nombreVia || null}
              titulo={referenciaCatastral || null}
            />
          </div>
        )}
      </div>

      {/* ── C2. Catastro ─────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Catastro
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FormLabel htmlFor="referenciaCatastral">Referencia catastral</FormLabel>
            <FormInput
              id="referenciaCatastral"
              placeholder="7574502VF9677N0006GQ"
              className="font-mono uppercase"
              maxLength={25}
              {...register('referenciaCatastral')}
            />
            <CatastroLookupButtonEnrichment />
          </div>
          <div>
            <FormLabel htmlFor="usoCatastral">Uso catastral</FormLabel>
            <FormInput
              id="usoCatastral"
              placeholder="Residencial, Industrial..."
              {...register('usoCatastral')}
            />
          </div>
          <div>
            <FormLabel htmlFor="valorRefCatastral">Valor referencia catastral (€)</FormLabel>
            <FormInput
              id="valorRefCatastral"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('valorRefCatastral')}
            />
          </div>
          <div>
            <FormLabel htmlFor="valorCatastral">Valor catastral (€)</FormLabel>
            <FormInput
              id="valorCatastral"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('valorCatastral')}
            />
          </div>
          <div>
            <FormLabel htmlFor="anyConstruccion">Año construcción</FormLabel>
            <FormInput
              id="anyConstruccion"
              type="number"
              step="1"
              min="1800"
              max="2100"
              placeholder="1985"
              {...register('anyConstruccion')}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FormLabel htmlFor="superficieConst">Sup. construida (m²)</FormLabel>
            <FormInput
              id="superficieConst"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('superficieConst')}
            />
          </div>
          <div>
            <FormLabel htmlFor="superficieUtil">
              Sup. útil (m²)
              {ratioUtil && (
                <span className="ml-1 font-normal text-emerald-600 text-xs">
                  ({ratioUtil}% s/const.)
                </span>
              )}
            </FormLabel>
            <FormInput
              id="superficieUtil"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('superficieUtil')}
            />
          </div>
          <div>
            <FormLabel htmlFor="superficieParcela">Sup. parcela (m²)</FormLabel>
            <FormInput
              id="superficieParcela"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('superficieParcela')}
            />
          </div>
          <div>
            <FormLabel htmlFor="zonasComunes">Zonas comunes (m²)</FormLabel>
            <FormInput
              id="zonasComunes"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('zonasComunes')}
            />
          </div>
        </div>
      </div>

      {/* ── C3. Registro de la Propiedad ─────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Registro de la Propiedad
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="idufirReg">
              IDUFIR{' '}
              <span className="font-normal text-gray-400 text-xs">(confirmado por nota simple — desde sección A)</span>
            </FormLabel>
            <div
              id="idufirReg"
              className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50
                         px-3 font-mono text-sm text-gray-600"
            >
              {idufirA || <span className="italic text-gray-400">—</span>}
            </div>
          </div>
          <div>
            <FormLabel htmlFor="fincaRegistral">
              Finca registral{' '}
              <span className="font-normal text-gray-400 text-xs">(= Parcela en operaciones)</span>
            </FormLabel>
            <FormInput
              id="fincaRegistral"
              placeholder="12345"
              className="font-mono"
              {...register('fincaRegistral')}
            />
          </div>
          <div>
            <FormLabel htmlFor="registroProvincia">Registro — Provincia</FormLabel>
            <FormInput id="registroProvincia" placeholder="Sevilla" {...register('registroProvincia')} />
          </div>
          <div>
            <FormLabel htmlFor="registroCiudad">Registro — Ciudad / Número</FormLabel>
            <FormInput id="registroCiudad" placeholder="Sevilla nº 1" {...register('registroCiudad')} />
          </div>
          <div>
            <FormLabel htmlFor="registroNumero">Nº registro</FormLabel>
            <FormInput id="registroNumero" className="font-mono" {...register('registroNumero')} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <FormLabel htmlFor="tomo">Tomo</FormLabel>
            <FormInput id="tomo" className="font-mono" {...register('tomo')} />
          </div>
          <div>
            <FormLabel htmlFor="libro">Libro</FormLabel>
            <FormInput id="libro" className="font-mono" {...register('libro')} />
          </div>
          <div>
            <FormLabel htmlFor="folio">Folio</FormLabel>
            <FormInput id="folio" className="font-mono" {...register('folio')} />
          </div>
        </div>

        {/* Nota simple — upload + extracción automática */}
        <NotaSimpleUploader
          enrichmentId={enrichmentId}
          notaSimpleUrl={notaSimpleUrl}
          hasNotaSimple={hasNotaSimple}
        />
      </div>

      {/* ── C4. Características ──────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Características
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="dormitorios">Dormitorios</FormLabel>
            <FormInput id="dormitorios" type="number" step="1" min="0" max="99" placeholder="3" {...register('dormitorios')} />
          </div>
          <div>
            <FormLabel htmlFor="banyos">Baños</FormLabel>
            <FormInput id="banyos" type="number" step="1" min="0" max="99" placeholder="1" {...register('banyos')} />
          </div>
          <div>
            <FormLabel htmlFor="plazasGaraje">Plazas de garaje</FormLabel>
            <FormInput id="plazasGaraje" type="number" step="1" min="0" max="20" placeholder="0" {...register('plazasGaraje')} />
          </div>
          <div>
            <FormLabel htmlFor="estadoConservacion">Estado de conservación</FormLabel>
            <select
              id="estadoConservacion"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              {...register('estadoConservacion')}
            >
              <option value="">— Selecciona —</option>
              {ESTADOS_CONSERVACION.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel htmlFor="certificadoEnergetico">Certificado energético</FormLabel>
            <select
              id="certificadoEnergetico"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              {...register('certificadoEnergetico')}
            >
              <option value="">— Selecciona —</option>
              {CERTS_ENERGETICOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-5">
          <CheckField id="garaje"   label="Garaje"   reg={register('garaje')} />
          <CheckField id="trastero" label="Trastero" reg={register('trastero')} />
          <CheckField id="ascensor" label="Ascensor" reg={register('ascensor')} />
          <CheckField id="jardin"   label="Jardín"   reg={register('jardin')} />
          <CheckField id="piscina"  label="Piscina"  reg={register('piscina')} />
        </div>
      </div>

      {/* ── C5. Ocupación ────────────────────────────────────────────── */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Ocupación
        </h4>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <FormLabel htmlFor="estadoOcupacion">Estado de ocupación</FormLabel>
            <select
              id="estadoOcupacion"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                         focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              {...register('estadoOcupacion')}
            >
              <option value="">— Selecciona —</option>
              {ESTADOS_OCUPACION.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
          </div>

          {(estadoOcupacion === 'ocupado' || estadoOcupacion === 'irregular') && (
            <div>
              <FormLabel htmlFor="tipoOcupante">Tipo de ocupante</FormLabel>
              <select
                id="tipoOcupante"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                           focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                {...register('tipoOcupante')}
              >
                <option value="">— Selecciona —</option>
                {TIPOS_OCUPANTE.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          {estadoOcupacion === 'ocupado' && (
            <>
              <div>
                <FormLabel htmlFor="rentaMensual">Renta mensual (€)</FormLabel>
                <FormInput
                  id="rentaMensual"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('rentaMensual')}
                />
              </div>
              <div>
                <FormLabel htmlFor="vencimientoAlquiler">Vencimiento contrato</FormLabel>
                <FormInput id="vencimientoAlquiler" type="date" {...register('vencimientoAlquiler')} />
              </div>
            </>
          )}
        </div>

        <div className="mt-4">
          <FormLabel htmlFor="restriccionesUrbanisticas">Restricciones urbanísticas</FormLabel>
          <textarea
            id="restriccionesUrbanisticas"
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Limitaciones de uso, protección urbanística, VPO..."
            {...register('restriccionesUrbanisticas')}
          />
        </div>
      </div>
    </div>
  );
}
