'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  updateOperacionStatusAction,
  deleteOperacionesAction,
} from '../actions/excel-actions';
import {
  operacionStatusEnum,
  STATUS_LABELS,
  STATUS_COLORS,
} from '@/src/db/schema/operaciones';
import type {
  SelectOperacion,
  OperacionStatus,
} from '@/src/db/schema/operaciones';
import InitEnrichmentButton from '@/src/fetatures/enrichment/components/InitEnrichmentButton';

const FIELD_LABELS: Record<string, string> = {
  id: 'ID',
  expedienteId: 'Expediente',
  prestamoId: 'Préstamo',
  nplReo: 'NPL/REO',
  deudorNombre: 'Deudor',
  fechaAlta: 'Fecha alta',
  deuda: 'Deuda (€)',
  precioVentaMercado: 'Valor mercado (€)',
  rangoLienPrestamo: 'Rango lien',
  valorTasacionSubasta: 'Tasación subasta (€)',
  propertyId: 'Inmueble ID',
  propertyTipo: 'Tipo inmueble',
  propertyTipoOcupacion: 'Ocupación',
  esVpo: 'VPO',
  esVulnerable: 'Vulnerable',
  comunidadAutonoma: 'Comunidad Autónoma',
  provincia: 'Provincia',
  municipio: 'Municipio',
  codPostal: 'C.P.',
  direccionCompleta: 'Dirección',
  referenciaCatastral: 'Ref. catastral',
  idufir: 'IDUFIR',
  parcel: 'Parcela',
  superficieConst: 'Sup. construida (m²)',
  superficieUtil: 'Sup. útil (m²)',
  superficieFinca: 'Sup. finca (m²)',
  superficieRegistral: 'Sup. registral (m²)',
  libro: 'Libro',
  tomo: 'Tomo',
  finca: 'Finca',
  folio: 'Folio',
  latitud: 'Latitud',
  longitud: 'Longitud',
  anyConstruccion: 'Año construcción',
  procLegal: 'Proc. legal',
  procLegalTipo: 'Tipo proc.',
  procLegalFase: 'Fase proc.',
  procLegalNumero: 'Nº proc.',
  procLegalCourt: 'Juzgado',
  procLegalEstado: 'Estado proc.',
  registroProvincia: 'Registro provincia',
  registroCiudad: 'Registro ciudad',
  registroNumero: 'Registro nº',
  assetManager: 'Asset Manager',
  oficinaResponsable: 'Oficina responsable',
  mainKey: 'Main Key',
  statusTratamiento: 'Status',
  fechaTratamiento: 'Fecha tratamiento',
};

const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: 'Identificación',
    fields: [
      'expedienteId',
      'prestamoId',
      'nplReo',
      'assetManager',
      'oficinaResponsable',
      'mainKey',
    ],
  },
  { title: 'Deudor', fields: ['deudorNombre', 'fechaAlta'] },
  {
    title: 'Financiero',
    fields: [
      'deuda',
      'precioVentaMercado',
      'valorTasacionSubasta',
      'rangoLienPrestamo',
    ],
  },
  {
    title: 'Inmueble',
    fields: [
      'propertyId',
      'propertyTipo',
      'propertyTipoOcupacion',
      'esVpo',
      'esVulnerable',
    ],
  },
  {
    title: 'Ubicación',
    fields: [
      'direccionCompleta',
      'comunidadAutonoma',
      'municipio',
      'provincia',
      'codPostal',
    ],
  },
  {
    title: 'Catastral / Reg.',
    fields: [
      'referenciaCatastral',
      'idufir',
      'parcel',
      'superficieConst',
      'superficieUtil',
      'superficieFinca',
      'superficieRegistral',
      'libro',
      'tomo',
      'finca',
      'folio',
      'latitud',
      'longitud',
      'anyConstruccion',
    ],
  },
  {
    title: 'Proc. Legal',
    fields: [
      'procLegal',
      'procLegalTipo',
      'procLegalFase',
      'procLegalNumero',
      'procLegalCourt',
      'procLegalEstado',
    ],
  },
  {
    title: 'Registro',
    fields: ['registroProvincia', 'registroCiudad', 'registroNumero'],
  },
];

function fmtVal(_key: string, val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Sí' : 'No';
  if (val instanceof Date) return val.toLocaleDateString('es-ES');
  return String(val);
}

type Props = {
  operacion: SelectOperacion;
  onClose: () => void;
  onUpdated: (updated: SelectOperacion) => void;
  onDeleted: (id: number) => void;
};

export default function OperacionDetailModal({
  operacion,
  onClose,
  onUpdated,
  onDeleted,
}: Props) {
  const [status, setStatus] = useState<OperacionStatus>(
    operacion.statusTratamiento ?? 'nuevo'
  );
  const [fecha, setFecha] = useState(
    operacion.fechaTratamiento ?? new Date().toISOString().slice(0, 10)
  );
  const [notas, setNotas] = useState(operacion.notasTratamiento ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { success, error } = await updateOperacionStatusAction(
      operacion.id,
      status,
      fecha,
      notas || undefined
    );
    setSaving(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(success);
    onUpdated({
      ...operacion,
      statusTratamiento: status,
      fechaTratamiento: fecha,
      notasTratamiento: notas || null,
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await deleteOperacionesAction([operacion.id]);
    setDeleting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success('Registro eliminado');
    onDeleted(operacion.id);
  };

  const statusValues = operacionStatusEnum.enumValues;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-mono text-sm font-bold text-gray-600">
              #{operacion.id}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {operacion.expedienteId ??
                  operacion.prestamoId ??
                  `Operación ${operacion.id}`}
              </p>
              {operacion.deudorNombre && (
                <p className="text-xs text-gray-500">
                  {operacion.deudorNombre}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Actualizar status */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700">
              Actualizar tratamiento
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OperacionStatus)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {statusValues.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Fecha tratamiento
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Notas de tratamiento */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notas / motivo de selección
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                placeholder="Anota aquí el motivo, observaciones o cualquier información relevante sobre el tratamiento de esta operación..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                           focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400
                           resize-none placeholder:text-gray-300"
              />
            </div>

            {/* Mostrar notas guardadas si existen y no estamos editando */}
            {operacion.notasTratamiento && operacion.notasTratamiento !== notas && (
              <div className="mt-2 rounded-lg bg-white/60 border border-blue-200 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-1">
                  Notas guardadas
                </p>
                <p className="text-xs text-gray-600 whitespace-pre-wrap">
                  {operacion.notasTratamiento}
                </p>
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {STATUS_LABELS[status] ?? status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Actualizar'}
                </button>
              </div>
            </div>
            {status === 'seleccionado' && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Siguiente paso
                </p>
                <InitEnrichmentButton
                  operacionId={operacion.id}
                  enrichmentId={null}
                />
              </div>
            )}
          </div>

          {/* Datos agrupados */}
          {SECTIONS.map((section) => {
            const visible = section.fields.filter((f) => {
              const v = (operacion as Record<string, unknown>)[f];
              return v !== null && v !== undefined && v !== '';
            });
            if (visible.length === 0) return null;
            return (
              <div key={section.title}>
                <h4 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                  {section.title}
                </h4>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
                  {visible.map((f) => (
                    <div key={f}>
                      <dt className="text-[10px] uppercase tracking-wide text-gray-400">
                        {FIELD_LABELS[f] ?? f}
                      </dt>
                      <dd className="mt-0.5 text-xs font-medium text-gray-800 break-words">
                        {fmtVal(f, (operacion as Record<string, unknown>)[f])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            );
          })}

          {/* Zona de eliminación */}
          <div className="rounded-xl border border-red-100 bg-red-50 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-600">
              Zona peligrosa
            </h3>
            {!confirmDel ? (
              <button
                onClick={() => setConfirmDel(true)}
                className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" /> Eliminar este registro
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-700">
                  ¿Confirmas la eliminación del registro{' '}
                  <strong>#{operacion.id}</strong>? Esta acción no se puede
                  deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                  <button
                    onClick={() => setConfirmDel(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
