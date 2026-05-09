'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Route } from 'next';
import { Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { NplListItem } from '../types/npl.types';
import NplItem from './NplItem';
import DeleteNplDialog from './DeleteNplDialog';

const PAGE_SIZE = 10;

function getProvincias(npls: NplListItem[]) {
  const set = new Set(npls.map((n) => n.provincia).filter(Boolean) as string[]);
  return [...set].sort((a, b) => a.localeCompare(b, 'es'));
}

function getMunicipios(npls: NplListItem[], provincia: string) {
  const set = new Set(
    npls
      .filter((n) => !provincia || n.provincia === provincia)
      .map((n) => n.municipio)
      .filter(Boolean) as string[]
  );
  return [...set].sort((a, b) => a.localeCompare(b, 'es'));
}

type Props = { npls: NplListItem[] };

export default function NplList({ npls }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Estado local del input (respuesta inmediata al teclado) ─────────────
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
  useEffect(() => {
    setSearchInput(searchParams.get('q') ?? '');
  }, [searchParams]);
  const debouncedSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (debouncedSearch !== current) updateParams({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Leer filtros desde la URL ───────────────────────────────────────────
  const search = searchParams.get('q') ?? '';
  const filterProvincia = searchParams.get('provincia') ?? '';
  const filterMunicipio = searchParams.get('municipio') ?? '';
  const costeMin = searchParams.get('min') ?? '';
  const costeMax = searchParams.get('max') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  // ── Escribir filtros en la URL ──────────────────────────────────────────
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '') params.delete(key);
        else params.set(key, value);
      });
      if (!('page' in updates)) params.delete('page');
      router.replace(`${pathname}?${params.toString()}` as Route, {
        scroll: false,
      });
      console.log(params.toString());
    },
    [router, pathname, searchParams]
  );

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      updateParams({ [key]: e.target.value });

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    updateParams({ provincia: e.target.value, municipio: '' });

  // ── Filtrado + ordenado ─────────────────────────────────────────────────
  const provincias = useMemo(() => getProvincias(npls), [npls]);
  const municipios = useMemo(
    () => getMunicipios(npls, filterProvincia),
    [npls, filterProvincia]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const min = costeMin ? parseFloat(costeMin) : null;
    const max = costeMax ? parseFloat(costeMax) : null;

    return npls
      .filter((n) => {
        const matchSearch = !q || n.tituloOperacion.toLowerCase().includes(q);
        const matchProvincia =
          !filterProvincia || n.provincia === filterProvincia;
        const matchMunicipio =
          !filterMunicipio || n.municipio === filterMunicipio;
        const coste = n.costeAdquisicionCredito
          ? parseFloat(n.costeAdquisicionCredito)
          : null;
        const matchMin = min === null || (coste !== null && coste >= min);
        const matchMax = max === null || (coste !== null && coste <= max);
        return (
          matchSearch &&
          matchProvincia &&
          matchMunicipio &&
          matchMin &&
          matchMax
        );
      })
      .sort((a, b) => a.tituloOperacion.localeCompare(b.tituloOperacion, 'es'));
  }, [npls, search, filterProvincia, filterMunicipio, costeMin, costeMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const goToPage = (p: number) => updateParams({ page: String(p) });

  if (npls.length === 0) {
    return (
      <p className="mt-10 text-center text-lg">
        No hay NPLs aún:{' '}
        <Link
          href="/dashboard/npl/create"
          className="font-bold text-orange-500"
        >
          crea el primero
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <DeleteNplDialog />

      {/* ── Filtros ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl bg-white px-4 py-3 shadow-sm space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por título de operación…"
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 shrink-0 text-gray-400" />

          <select
            value={filterProvincia}
            onChange={handleProvinciaChange}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
          >
            <option value="">Todas las provincias</option>
            {provincias.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={filterMunicipio}
            onChange={handleChange('municipio')}
            disabled={!filterProvincia}
            className="rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none disabled:opacity-40"
          >
            <option value="">Todos los municipios</option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-xs font-medium text-gray-400">
              Coste adq.:
            </span>
            <input
              type="number"
              value={costeMin}
              onChange={handleChange('min')}
              placeholder="Mín €"
              min={0}
              className="w-24 rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              value={costeMax}
              onChange={handleChange('max')}
              placeholder="Máx €"
              min={0}
              className="w-24 rounded-md border border-gray-200 px-2 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
            />
          </div>

          <span className="ml-auto text-sm text-gray-400">
            {filtered.length} de {npls.length} NPLs
          </span>
        </div>
      </div>

      {/* ── Lista ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="rounded-xl bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
          No hay NPLs con los filtros seleccionados.
        </p>
      ) : (
        <ul
          role="list"
          className="divide-y divide-gray-100 rounded-xl bg-white px-6 shadow-sm"
        >
          {paginated.map((npl) => (
            <NplItem key={npl.id} npl={npl} />
          ))}
        </ul>
      )}

      {/* ── Paginación ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">
            Página <span className="font-semibold">{safePage}</span> de{' '}
            <span className="font-semibold">{totalPages}</span> ·{' '}
            {filtered.length} resultados
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - safePage) <= 1
              )
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === '...' ? (
                  <span key={`e-${idx}`} className="px-1 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`min-w-[2rem] rounded-md px-2 py-1 text-sm font-medium ${
                      p === safePage
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
