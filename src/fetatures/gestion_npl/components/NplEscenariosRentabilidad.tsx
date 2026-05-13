'use client';

import { useState } from 'react';
import { Escenario, EscenarioCaso } from '../utils/npl-calc';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (v: number | null) => {
  if (v === null) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(v);
};

const colorBeneficio = (v: number | null) =>
  v === null ? 'text-gray-400' : v >= 0 ? 'text-emerald-600' : 'text-red-600';

// ── Columna de caso ───────────────────────────────────────────────────────────
function ColumnaCaso({
  caso,
  principal,
  isSecond,
}: {
  caso: EscenarioCaso;
  principal: boolean;
  isSecond: boolean;
}) {
  return (
    <div
      className={`flex-1 space-y-1.5 text-sm min-w-0 ${
        isSecond ? 'sm:pl-4 sm:border-l sm:border-dashed sm:border-gray-300' : ''
      }`}
    >
      {/* Etiqueta de variante solo en la segunda columna */}
      {isSecond && (
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">
          Variante — {caso.label}
        </p>
      )}

      <div className="flex justify-between text-gray-500">
        <span>Ingreso ({caso.label})</span>
        <span className="font-medium text-gray-700 tabular-nums">{fmtEur(caso.ingreso)}</span>
      </div>

      <div
        className={`flex justify-between font-semibold border-t pt-1.5 ${colorBeneficio(caso.beneficio)}`}
      >
        <span>Beneficio</span>
        <span className={`tabular-nums ${principal && !isSecond ? 'text-base' : ''}`}>
          {fmtEur(caso.beneficio)}
        </span>
      </div>

      <div className={`flex justify-between ${colorBeneficio(caso.roi)}`}>
        <span className="text-gray-500 font-normal text-xs">ROI neto</span>
        <span className={`font-bold tabular-nums ${principal && !isSecond ? 'text-base' : 'text-sm'}`}>
          {caso.roi !== null ? `${caso.roi.toFixed(2)} %` : '—'}
          {caso.roiAnual !== null && (
            <span className="ml-1 text-xs font-normal text-gray-400">
              ({caso.roiAnual.toFixed(2)} % anual)
            </span>
          )}
        </span>
      </div>

      {caso.dias !== null && (
        <div className="flex justify-between text-gray-400 text-xs">
          <span>Plazo</span>
          <span className="tabular-nums">{caso.dias} días</span>
        </div>
      )}
    </div>
  );
}

// ── Tarjeta de escenario (una fila completa) ──────────────────────────────────
function TarjetaEscenario({ escenario }: { escenario: Escenario }) {
  const { titulo, icono, principal, inversionBase, costeExtra, casoA, casoB } = escenario;
  const costeTotal = casoA.coste;
  const tieneDosColumnas = casoB.label !== casoA.label;

  return (
    <div
      className={`rounded-xl border p-4 ${
        principal
          ? 'border-blue-400 bg-blue-50 ring-1 ring-blue-300'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none mt-0.5">{icono}</span>
          <h4
            className={`text-sm font-bold uppercase tracking-wide leading-tight ${
              principal ? 'text-blue-800' : 'text-gray-700'
            }`}
          >
            {titulo}
            {principal && (
              <span className="ml-2 text-[10px] font-medium bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full normal-case">
                Principal
              </span>
            )}
          </h4>
        </div>
        {costeTotal !== null && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Coste total</p>
            <p className="text-sm font-bold text-gray-800 tabular-nums">{fmtEur(costeTotal)}</p>
            {inversionBase !== null && costeExtra && (
              <p className="text-xs text-gray-400 mt-0.5">
                {fmtEur(inversionBase)} base + {costeExtra}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mb-3" />

      {/*
        CasoA y CasoB en columnas adyacentes.
        En móvil se apilan; en sm+ van lado a lado separados por línea discontinua.
      */}
      <div className="flex flex-col sm:flex-row gap-4">
        <ColumnaCaso caso={casoA} principal={principal} isSecond={false} />
        {tieneDosColumnas && (
          <ColumnaCaso caso={casoB} principal={false} isSecond={true} />
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function NplEscenariosRentabilidad({
  escenarios,
}: {
  escenarios: Escenario[];
  inversionTotal?: number | null;
}) {
  const [visibles, setVisibles] = useState<Record<string, boolean>>(
    Object.fromEntries(escenarios.map((e) => [e.titulo, true]))
  );

  const toggleVisible = (titulo: string) =>
    setVisibles((prev) => ({ ...prev, [titulo]: !prev[titulo] }));

  const sinDatos = escenarios.every(
    (e) => e.casoA.ingreso === null && e.casoA.coste === null
  );

  if (sinDatos) {
    return (
      <p className="text-sm text-gray-400 italic">
        Completa los campos de rentabilidad para ver los escenarios.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selector de escenarios visibles */}
      <div className="flex flex-wrap gap-3 pb-2 border-b border-gray-100">
        {escenarios.map((e) => (
          <label
            key={e.titulo}
            className="flex items-center gap-1.5 cursor-pointer select-none text-sm"
          >
            <input
              type="checkbox"
              checked={visibles[e.titulo] ?? true}
              onChange={() => toggleVisible(e.titulo)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-600">
              {e.icono} {e.titulo}
            </span>
          </label>
        ))}
      </div>

      {/* Un escenario por fila, CasoA y CasoB en columnas dentro de cada uno */}
      <div className="space-y-3">
        {escenarios
          .filter((e) => visibles[e.titulo] ?? true)
          .map((esc) => (
            <TarjetaEscenario key={esc.titulo} escenario={esc} />
          ))}
      </div>
    </div>
  );
}
