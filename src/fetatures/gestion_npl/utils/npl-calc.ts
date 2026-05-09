import { SelectNpl } from '../types/npl.types';

// ── Helpers ────────────────────────────────────────────────────────────────────
const toNum = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : parseFloat(v as string);
  return isNaN(n) ? null : n;
};

const diffDias = (
  desde: string | null | undefined,
  hasta: string | null | undefined
): number | null => {
  if (!desde || !hasta) return null;
  const d1 = new Date(desde).getTime();
  const d2 = new Date(hasta).getTime();
  if (isNaN(d1) || isNaN(d2)) return null;
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
};

// ── Tipos ──────────────────────────────────────────────────────────────────────
export type EscenarioCaso = {
  label: string;
  ingreso: number | null;
  coste: number | null;
  beneficio: number | null;
  roi: number | null;
  roiAnual: number | null;
  dias: number | null;
};

export type Escenario = {
  titulo: string;
  icono: string;
  principal: boolean;
  inversionBase: number | null; // x = v01+v05+v06+v10
  costeExtra: string | null; // descripción legible del extra sobre x
  casoA: EscenarioCaso;
  casoB: EscenarioCaso;
};

export type NplRentabilidad = {
  inversionTotal: number | null;
  beneficioNeto: number | null;
  roiNeto: number | null;
  escenarios: Escenario[];
};

// ── Cálculo de un caso ────────────────────────────────────────────────────────
function calcCaso(
  label: string,
  ingreso: number | null,
  coste: number | null,
  dias: number | null
): EscenarioCaso {
  const beneficio = ingreso !== null && coste !== null ? ingreso - coste : null;
  const roi =
    beneficio !== null && coste !== null && coste > 0
      ? (beneficio / coste) * 100
      : null;
  const roiAnual =
    roi !== null && dias !== null && dias > 0 ? (roi * 365) / dias : null;
  return { label, ingreso, coste, beneficio, roi, roiAnual, dias };
}

// ── Tipo de entrada flexible (formulario o SelectNpl) ─────────────────────────
type NplCalcInput = Partial<{
  costeAdquisicionCredito: string | number | null;
  impuestosAjd: string | number | null;
  costesNotariaRegistro: string | number | null;
  comisionIntermediacion: string | number | null;
  // principal reemplaza a derechoCobroPrincipal
  principal: string | number | null;
  /** @deprecated usar `principal` */
  derechoCobroPrincipal: string | number | null;
  intereses: string | number | null;
  costas: string | number | null;
  gastosDacion: string | number | null;
  precioMercado: string | number | null;
  precioVentaRapida: string | number | null;
  pujaProbable: string | number | null;
  fechaCompra: string | null;
  fechaTerminacion: string | null;
  gastosDiversos: { titulo: string; valor: number }[] | null;
}>;

// ── Función principal ──────────────────────────────────────────────────────────
export function calcularRentabilidad(
  npl: NplCalcInput | SelectNpl
): NplRentabilidad {
  const d = npl as NplCalcInput;

  // ── Variables base (v01..v11) ──────────────────────────────────────────────
  const v01 = toNum(d.costeAdquisicionCredito);
  // Soporta tanto el campo nuevo `principal` como el legacy `derechoCobroPrincipal`
  const v02 = toNum(d.principal ?? d.derechoCobroPrincipal);
  // v03/v04 no intervienen en costes pero se usan para info
  const v05 = toNum(d.impuestosAjd);
  const v06 = toNum(d.costesNotariaRegistro);
  const v07 = toNum(d.gastosDacion);
  const v08 = toNum(d.precioMercado);
  const v09 = toNum(d.precioVentaRapida);
  const v10 = toNum(d.comisionIntermediacion);
  const v11 = toNum(d.pujaProbable);

  const dias = diffDias(d.fechaCompra, d.fechaTerminacion);

  // ── x = v01 + v05 + v06 + v10 ─────────────────────────────────────────────
  // Si falta alguno de los obligatorios, x es null
  const x = v01 !== null ? v01 + (v05 ?? 0) + (v06 ?? 0) + (v10 ?? 0) : null;

  // ── Gastos diversos ────────────────────────────────────────────────────────
  const gastosArr = (d.gastosDiversos ?? []) as {
    titulo: string;
    valor: number;
  }[];

  // ITP separado del resto
  const itpGasto = gastosArr.find((g) =>
    g.titulo.toLowerCase().includes('itp')
  );
  const vItp = itpGasto ? Number(itpGasto.valor) || 0 : 0;

  // y = suma gastos EXCEPTO itp
  const y = gastosArr
    .filter((g) => !g.titulo.toLowerCase().includes('itp'))
    .reduce((acc, g) => acc + (Number(g.valor) || 0), 0);

  // ── Costes por escenario ───────────────────────────────────────────────────
  // Esc 1: x
  const costeEsc1 = x;

  // Esc 2 (Dación): x + y + v07
  const costeEsc2 = x !== null ? x + y + (v07 ?? 0) : null;

  // Esc 3 (Adjudicación subasta): x + y + itp
  const costeEsc3 = x !== null ? x + y + vItp : null;

  // Esc 4 (Acta exoneración): x + y
  const costeEsc4 = x !== null ? x + y : null;

  // ── Escenario 1: Recuperación en subasta ──────────────────────────────────
  // El ingreso es la deuda actualizada (principal + intereses + costas)
  const v03 = toNum(d.intereses);
  const v04 = toNum(d.costas);
  const deudaActualizada =
    v02 !== null || v03 !== null || v04 !== null
      ? (v02 ?? 0) + (v03 ?? 0) + (v04 ?? 0)
      : null;

  const esc1: Escenario = {
    titulo: 'Recuperación en subasta',
    icono: '🏛',
    principal: false,
    inversionBase: x,
    costeExtra: null,
    casoA: calcCaso('Deuda actualizada', deudaActualizada, costeEsc1, dias),
    casoB: calcCaso('Puja probable', v11, costeEsc1, dias),
  };

  // ── Escenario 2: Dación en pago y venta ───────────────────────────────────
  const esc2: Escenario = {
    titulo: 'Dación en pago y venta',
    icono: '↩',
    principal: false,
    inversionBase: x,
    costeExtra:
      [
        y > 0 ? `gastos div. ${y.toFixed(2)} €` : null,
        v07 ? `dación ${v07.toFixed(2)} €` : null,
      ]
        .filter(Boolean)
        .join(' + ') || null,
    casoA: calcCaso('Precio mercado', v08, costeEsc2, dias),
    casoB: calcCaso('Venta rápida', v09, costeEsc2, dias),
  };

  // ── Escenario 3: Adjudicación en subasta y venta (PRINCIPAL) ──────────────
  const esc3: Escenario = {
    titulo: 'Adjudicación en subasta y venta',
    icono: '✦',
    principal: true,
    inversionBase: x,
    costeExtra:
      [
        y > 0 ? `gastos div. ${y.toFixed(2)} €` : null,
        vItp > 0 ? `ITP ${vItp.toFixed(2)} €` : null,
      ]
        .filter(Boolean)
        .join(' + ') || null,
    casoA: calcCaso('Precio mercado', v08, costeEsc3, dias),
    casoB: calcCaso('Venta rápida', v09, costeEsc3, dias),
  };

  // ── Escenario 4: Acta exoneración y venta ─────────────────────────────────
  const esc4: Escenario = {
    titulo: 'Acta exoneración y venta',
    icono: '⊘',
    principal: false,
    inversionBase: x,
    costeExtra: y > 0 ? `gastos div. ${y.toFixed(2)} €` : null,
    casoA: calcCaso('Precio mercado', v08, costeEsc4, dias),
    casoB: calcCaso('Venta rápida', v09, costeEsc4, dias),
  };

  return {
    inversionTotal: x,
    beneficioNeto: esc3.casoA.beneficio,
    roiNeto: esc3.casoA.roi,
    // Orden visual: principal primero, luego los demás
    escenarios: [esc3, esc1, esc2, esc4],
  };
}
