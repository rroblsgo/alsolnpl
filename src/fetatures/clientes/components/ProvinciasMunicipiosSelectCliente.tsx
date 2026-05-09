'use client';

/**
 * ProvinciasMunicipiosSelectCliente
 *
 * Versión del selector provincia/municipio adaptada al formulario de clientes.
 * Reutiliza la misma lógica y la API /api/municipios ya implementada,
 * pero tipada con ClienteInput en lugar de NplInput.
 */

import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormError, FormLabel } from '@/src/shared/components/forms';
import { ClienteInput } from '../schemas/clienteSchema';
import { PROVINCIAS } from '@/src/fetatures/gestion_npl/data/provincias';

type MunicipioOption = { municipioId: string; nombre: string };

function resolveProvinciaCode(nombre: string | undefined | null): string | null {
  if (!nombre) return null;
  const exact = PROVINCIAS.find((p) => p.name === nombre);
  if (exact) return exact.code;
  const normalize = (s: string) =>
    s.split('/')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const t = normalize(nombre);
  return PROVINCIAS.find((p) => normalize(p.name) === t)?.code ?? null;
}

async function fetchMunicipiosByCode(code: string): Promise<MunicipioOption[]> {
  const res = await fetch(`/api/municipios?provincia=${code}`);
  return res.json();
}

export default function ProvinciasMunicipiosSelectCliente() {
  const { register, setValue, getValues, formState: { errors } } =
    useFormContext<ClienteInput>();

  const provinciaWatch = useWatch({ name: 'provincia' });
  const [municipioOptions, setMunicipioOptions] = useState<MunicipioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const loadedCodeRef = useRef<string | null>(null);
  const mountedRef = useRef(false);

  async function loadMunicipios(code: string, restoreMunicipio?: string) {
    setLoading(true);
    try {
      const data = await fetchMunicipiosByCode(code);
      setMunicipioOptions(data);
      if (restoreMunicipio) {
        setTimeout(() => setValue('municipio', restoreMunicipio), 50);
      }
    } catch (e) {
      console.error('Error cargando municipios:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    const initialProvincia = getValues('provincia');
    const initialMunicipio = getValues('municipio');
    const code = resolveProvinciaCode(initialProvincia);
    if (!code) return;
    loadedCodeRef.current = code;
    loadMunicipios(code, initialMunicipio || undefined);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mountedRef.current) return;
    const code = resolveProvinciaCode(provinciaWatch);
    if (!code || code === loadedCodeRef.current) return;
    loadedCodeRef.current = code;
    setValue('municipio', '');
    loadMunicipios(code);
  }, [provinciaWatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!mountedRef.current) return;
    if (!provinciaWatch) {
      setMunicipioOptions([]);
      setValue('municipio', '');
      loadedCodeRef.current = null;
    }
  }, [provinciaWatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const provinciaCode = resolveProvinciaCode(provinciaWatch || getValues('provincia'));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <FormLabel htmlFor="provincia">Provincia</FormLabel>
        <select
          id="provincia"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          {...register('provincia')}
        >
          <option value="">— Selecciona provincia —</option>
          {PROVINCIAS.map((p) => (
            <option key={p.code} value={p.name}>{p.name}</option>
          ))}
        </select>
        {errors.provincia && <FormError>{errors.provincia.message}</FormError>}
      </div>
      <div>
        <FormLabel htmlFor="municipio">Municipio</FormLabel>
        <select
          id="municipio"
          disabled={!provinciaCode || loading}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
          {...register('municipio')}
        >
          {loading ? (
            <option value="">Cargando municipios...</option>
          ) : !provinciaCode ? (
            <option value="">— Selecciona primero la provincia —</option>
          ) : (
            <>
              <option value="">— Selecciona municipio —</option>
              {municipioOptions.map((m) => (
                <option key={m.municipioId} value={m.nombre}>{m.nombre}</option>
              ))}
            </>
          )}
        </select>
        {errors.municipio && <FormError>{errors.municipio.message}</FormError>}
      </div>
    </div>
  );
}
