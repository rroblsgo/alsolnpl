'use client';

import { useMemo, useState } from 'react';
import type { SelectOperacion } from '@/src/db/schema/operaciones';
import OperacionesTable from './OperacionesTable';

// Genera mapItems sintéticos a partir de los campos que tienen datos
// en el conjunto global de operaciones, excluyendo fondoId/carteraId
const EXCLUDED = new Set(['fondoId', 'carteraId', 'createdAt', 'updatedAt']);

const FIELD_TO_SNAKE: Record<string, string> = {
  expedienteId: 'expediente_id', prestamoId: 'prestamo_id', nplReo: 'npl_reo',
  deudorNombre: 'deudor_nombre', fechaAlta: 'fecha_alta', deuda: 'deuda',
  precioVentaMercado: 'precio_venta_mercado', rangoLienPrestamo: 'rango_lien_prestamo',
  valorTasacionSubasta: 'valor_tasacion_subasta', propertyId: 'property_id',
  propertyTipo: 'property_tipo', propertyTipoOcupacion: 'property_tipo_ocupacion',
  esVpo: 'es_vpo', esVulnerable: 'es_vulnerable',
  comunidadAutonoma: 'comunidad_autonoma',
  provincia: 'provincia',
  municipio: 'municipio', codPostal: 'cod_postal', direccionCompleta: 'direccion_completa',
  referenciaCatastral: 'referencia_catastral', idufir: 'idufir', parcel: 'parcel',
  superficieConst: 'superficie_const', superficieUtil: 'superficie_util',
  superficieFinca: 'superficie_finca', superficieRegistral: 'superficie_registral',
  libro: 'libro', tomo: 'tomo', finca: 'finca', folio: 'folio',
  latitud: 'latitud', longitud: 'longitud', anyConstruccion: 'any_construccion',
  procLegal: 'proc_legal', procLegalTipo: 'proc_legal_tipo', procLegalFase: 'proc_legal_fase',
  procLegalNumero: 'proc_legal_numero', procLegalCourt: 'proc_legal_court',
  procLegalEstado: 'proc_legal_estado', registroProvincia: 'registro_provincia',
  registroCiudad: 'registro_ciudad', registroNumero: 'registro_numero',
  assetManager: 'asset_manager', oficinaResponsable: 'oficina_responsable',
  statusTratamiento: 'status_tratamiento', fechaTratamiento: 'fecha_tratamiento',
};

type Props = { operaciones: SelectOperacion[] };

export default function OperacionesGlobalTable({ operaciones }: Props) {
  // Construye mapItems sintéticos: todos los campos que tienen al menos un valor
  const mapItems = useMemo(() => {
    return Object.entries(FIELD_TO_SNAKE)
      .filter(([camel]) => !EXCLUDED.has(camel))
      .filter(([camel]) =>
        operaciones.some((r) => {
          const v = (r as Record<string, unknown>)[camel];
          return v !== null && v !== undefined && v !== '';
        })
      )
      .map(([, snake]) => ({ columna_name_origen: snake, campo_operaciones: snake }));
  }, [operaciones]);

  return (
    <OperacionesTable
      operaciones={operaciones}
      mapItems={mapItems}
      carteraName="Global"
    />
  );
}
