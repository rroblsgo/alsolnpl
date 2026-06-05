'use client';

import { useState, useTransition, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FileText, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UploadButton } from '@/src/shared/utils/uploadthing';
import { extraerNotaSimpleAction, getNotaSimpleAction, type NotaSimpleExtraida, type NotaSimpleItem } from '../actions/nota-simple-actions';
import type { EnrichmentFormValues } from '../schemas/enrichmentSchema';

type Props = {
  enrichmentId:    number;
  notaSimpleUrl?:  string | null;
  hasNotaSimple?:  boolean;  // indica si hay datos en BD para cargar
};

type Estado =
  | { tipo: 'idle' }
  | { tipo: 'subiendo' }
  | { tipo: 'extrayendo' }
  | { tipo: 'ok'; data: NotaSimpleExtraida; pdfUrl: string }
  | { tipo: 'error'; mensaje: string };

// ── Subcomponente: sección JSONB desplegable ──────────────────────────────────
function SeccionNotaSimple({
  titulo, items, defaultOpen = false,
}: {
  titulo: string;
  items: NotaSimpleItem[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (items.length === 0) return null;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:bg-gray-50"
      >
        {titulo} <span className="text-gray-400">({items.length})</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && (
        <dl className="grid grid-cols-1 gap-1 px-3 pb-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="rounded-md bg-gray-50 px-2 py-1.5">
              <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                {item.nombre}
              </dt>
              <dd className="mt-0.5 text-xs text-gray-800 break-words">{item.contenido}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}


// Mapa de campos mapeados con su label legible y sección del enrichment
const CAMPO_LABELS: { key: string; label: string; seccion: string }[] = [
  { key: 'cru',                label: 'CRU',                    seccion: 'A' },
  { key: 'idufirReg',          label: 'IDUFIR Registro',        seccion: 'C' },
  { key: 'fincaRegistral',     label: 'Finca registral',        seccion: 'C' },
  { key: 'tomo',               label: 'Tomo',                   seccion: 'C' },
  { key: 'libro',              label: 'Libro',                  seccion: 'C' },
  { key: 'folio',              label: 'Folio',                  seccion: 'C' },
  { key: 'registroProvincia',  label: 'Registro provincia',     seccion: 'C' },
  { key: 'registroCiudad',     label: 'Registro ciudad',        seccion: 'C' },
  { key: 'registroNumero',     label: 'Nº registro',            seccion: 'C' },
  { key: 'referenciaCatastral',label: 'Ref. catastral',         seccion: 'C' },
  { key: 'superficieConst',    label: 'Sup. construida',        seccion: 'C' },
  { key: 'superficieUtil',     label: 'Sup. útil',              seccion: 'C' },
  { key: 'tasacionOriginal',   label: 'Tasación original',      seccion: 'B' },
  { key: 'juzgado',            label: 'Juzgado',                seccion: 'D' },
  { key: 'numeroProcedimiento',label: 'Nº procedimiento',       seccion: 'D' },
  { key: 'procedimiento',      label: 'Tipo procedimiento',     seccion: 'D' },
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function NotaSimpleUploader({ enrichmentId, notaSimpleUrl, hasNotaSimple }: Props) {
  const { setValue } = useFormContext<EnrichmentFormValues>();
  const [estado, setEstado] = useState<Estado>({ tipo: 'idle' });
  const [pdfUrlActual, setPdfUrlActual] = useState<string | null>(notaSimpleUrl ?? null);
  const [isPending, startTransition] = useTransition();
  const [mapeadosAplicados, setMapeadosAplicados] = useState(false);
  const [collapsed, setCollapsed] = useState(false);  // toggle panel datos

  // Cargar datos ya extraídos desde BD al montar (evita reprocesar)
  useEffect(() => {
    if (!hasNotaSimple || !notaSimpleUrl) return;
    startTransition(async () => {
      const result = await getNotaSimpleAction(enrichmentId);
      if (result.success && result.data) {
        setEstado({ tipo: 'ok', data: result.data, pdfUrl: result.data.pdfUrl });
        setPdfUrlActual(result.data.pdfUrl);
        // No aplicar mapeados al cargar — ya están en el form desde los defaultValues
        setMapeadosAplicados(true);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Aplica los campos mapeados al formulario RHF para que se vean en los inputs
  function aplicarMapeados(data: NotaSimpleExtraida) {
    const m = data.mapeados;
    if (m.cru)                setValue('cru',                m.cru);
    if (m.idufirReg)          setValue('idufirReg',          m.idufirReg);
    if (m.fincaRegistral)     setValue('fincaRegistral',     m.fincaRegistral);
    if (m.tomo)               setValue('tomo',               m.tomo);
    if (m.libro)              setValue('libro',              m.libro);
    if (m.folio)              setValue('folio',              m.folio);
    if (m.registroProvincia)  setValue('registroProvincia',  m.registroProvincia);
    if (m.registroCiudad)     setValue('registroCiudad',     m.registroCiudad);
    if (m.registroNumero)     setValue('registroNumero',     m.registroNumero);
    if (m.referenciaCatastral) setValue('referenciaCatastral', m.referenciaCatastral);
    if (m.superficieConst)    setValue('superficieConst',    m.superficieConst);
    if (m.superficieUtil)     setValue('superficieUtil',     m.superficieUtil);
    if (m.tasacionOriginal)   setValue('tasacionOriginal',   m.tasacionOriginal);
    if (m.juzgado)            setValue('juzgado',            m.juzgado);
    if (m.numeroProcedimiento) setValue('numeroProcedimiento', m.numeroProcedimiento);
    if (m.procedimiento)      setValue('procedimiento',      m.procedimiento as any);
    setMapeadosAplicados(true);
  }

  function handleExtract(pdfUrl: string) {
    setEstado({ tipo: 'extrayendo' });
    startTransition(async () => {
      const result = await extraerNotaSimpleAction(enrichmentId, pdfUrl);
      if (!result.success || !result.data) {
        setEstado({ tipo: 'error', mensaje: result.error ?? 'Error en la extracción' });
        toast.error('Error al procesar la nota simple');
        return;
      }
      setEstado({ tipo: 'ok', data: result.data, pdfUrl });
      setPdfUrlActual(pdfUrl);
      aplicarMapeados(result.data);
      toast.success('Nota simple procesada — campos actualizados en el formulario');
    });
  }

  const mapeadosCount = estado.tipo === 'ok'
    ? Object.values(estado.data.mapeados).filter(Boolean).length
    : 0;

  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50">
      {/* Cabecera con toggle */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => estado.tipo === 'ok' && setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-800">Nota simple registral</span>
          {estado.tipo === 'ok' && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Procesada {estado.data.fecha ? `· ${estado.data.fecha}` : ''}
            </span>
          )}
          {pdfUrlActual && estado.tipo !== 'ok' && (
            <span className="rounded-full bg-indigo-200 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
              PDF cargado
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {pdfUrlActual && (
            <a
              href={pdfUrlActual}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline"
            >
              <ExternalLink size={11} /> Ver PDF
            </a>
          )}
          {estado.tipo === 'ok' && (
            collapsed
              ? <ChevronDown size={15} className="text-indigo-400" />
              : <ChevronUp   size={15} className="text-indigo-400" />
          )}
        </div>
      </div>

      {!collapsed && <div className="border-t border-indigo-100 px-4 py-3 space-y-3">
        {/* Estado: idle o ya tiene PDF */}
        {(estado.tipo === 'idle') && (
          <div className="space-y-2">
            {pdfUrlActual ? (
              <div className="flex items-center gap-3">
                <p className="text-xs text-gray-600">
                  Ya hay una nota simple. Puedes subir una nueva para reemplazarla.
                </p>
                <button
                  type="button"
                  onClick={() => handleExtract(pdfUrlActual)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300
                             bg-white px-3 py-1.5 text-xs font-medium text-indigo-700
                             transition hover:bg-indigo-100"
                >
                  <RefreshCw size={12} /> Re-procesar
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-600">
                Sube el PDF de la nota simple para extraer automáticamente los datos registrales.
              </p>
            )}

            <UploadButton
              endpoint="notaSimpleUploader"
              onUploadBegin={() => setEstado({ tipo: 'subiendo' })}
              onClientUploadComplete={(res) => {
                const url = res?.[0]?.ufsUrl ?? res?.[0]?.url;
                if (url) handleExtract(url);
                else setEstado({ tipo: 'error', mensaje: 'No se obtuvo URL del archivo' });
              }}
              onUploadError={(err) => {
                setEstado({ tipo: 'error', mensaje: err.message });
                toast.error('Error al subir el PDF');
              }}
              appearance={{
                button: 'bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-medium',
                allowedContent: 'text-indigo-500 text-[10px]',
              }}
              content={{
                button: 'Subir nota simple (PDF)',
                allowedContent: 'PDF hasta 16MB',
              }}
            />
          </div>
        )}

        {/* Subiendo */}
        {estado.tipo === 'subiendo' && (
          <div className="flex items-center gap-2 text-xs text-indigo-700">
            <Loader2 size={14} className="animate-spin" />
            Subiendo PDF...
          </div>
        )}

        {/* Extrayendo */}
        {estado.tipo === 'extrayendo' && (
          <div className="flex items-center gap-2 text-xs text-indigo-700">
            <Loader2 size={14} className="animate-spin" />
            Procesando con IA — extrayendo datos registrales...
          </div>
        )}

        {/* Error */}
        {estado.tipo === 'error' && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="text-xs font-medium text-red-700">Error al procesar</p>
              <p className="text-[11px] text-red-600">{estado.mensaje}</p>
              <button
                type="button"
                onClick={() => setEstado({ tipo: 'idle' })}
                className="mt-1 text-[11px] text-red-600 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Resultado OK */}
        {estado.tipo === 'ok' && (
          <div className="space-y-2">
            {/* Resumen */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                Nota procesada correctamente
              </div>
              {estado.data.fecha && (
                <span className="text-xs text-gray-500">
                  Fecha: <strong>{estado.data.fecha}</strong>
                </span>
              )}
              {estado.data.csv && (
                <span className="font-mono text-[10px] text-gray-400">CSV: {estado.data.csv}</span>
              )}
              {mapeadosAplicados && mapeadosCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  ✓ {mapeadosCount} campo{mapeadosCount !== 1 ? 's' : ''} volcados
                </span>
              )}
            </div>

            {/* Campos volcados al formulario */}
            {estado.tipo === 'ok' && Object.keys(estado.data.mapeados).length > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Campos actualizados en el formulario
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CAMPO_LABELS.filter(({ key }) => (estado.data.mapeados as any)[key]).map(({ key, label, seccion }) => (
                    <span key={key}
                      className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-white px-2 py-0.5 text-[10px] text-emerald-800"
                      title={`Sección ${seccion}`}
                    >
                      <span className="font-bold text-emerald-500">{seccion}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Datos extraídos por secciones */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <SeccionNotaSimple titulo="Datos del Registro"       items={estado.data.registro}    defaultOpen={false} />
              <SeccionNotaSimple titulo="Identificación registral" items={estado.data.registral}   defaultOpen={true}  />
              <SeccionNotaSimple titulo="Descripción del inmueble" items={estado.data.inmueble}    defaultOpen={true}  />
              <SeccionNotaSimple titulo="Titularidad"              items={estado.data.titularidad} defaultOpen={true}  />
              <SeccionNotaSimple titulo="Cargas"                   items={estado.data.cargas}      defaultOpen={true}  />
              <SeccionNotaSimple titulo="Otros"                    items={estado.data.otros}       defaultOpen={false} />
            </div>

            <p className="text-[11px] text-gray-500">
              Los datos marcados en verde ya se han volcado en los campos del formulario.
              Revisa y guarda la sección C para confirmarlos en base de datos.
            </p>

            {/* Botón subir nueva */}
            <button
              type="button"
              onClick={() => setEstado({ tipo: 'idle' })}
              className="text-[11px] text-indigo-600 underline"
            >
              Subir otra nota simple
            </button>
          </div>
        )}
      </div>}
    </div>
  );
}
