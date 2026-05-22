import { fondos, carteras } from "@/src/db/schema";

export type InsertFondo = typeof fondos.$inferInsert;
export type SelectFondo = typeof fondos.$inferSelect;
export type InsertCartera = typeof carteras.$inferInsert;
export type SelectCartera = typeof carteras.$inferSelect;

export type MapItem = {
  columna_name_origen: string;
  campo_operaciones: string;
};

// Tipo para listados con nombre del creador
export type FondoListItem = SelectFondo & { creatorName: string };

// Campos target disponibles en tabla operaciones para el mapper
export const OPERACIONES_CAMPOS = [
  { value: "", label: "— No asignar —" },
  { value: "asset_manager", label: "Asset Manager" },
  { value: "oficina_responsable", label: "Oficina Responsable" },
  { value: "expediente_id", label: "Expediente ID" },
  { value: "prestamo_id", label: "Préstamo ID" },
  { value: "npl_reo", label: "NPL / REO" },
  { value: "deudor_nombre", label: "Deudor Nombre" },
  { value: "fecha_alta", label: "Fecha Alta" },
  { value: "deuda", label: "Deuda" },
  { value: "precio_venta_mercado", label: "Precio Venta Mercado" },
  { value: "rango_lien_prestamo", label: "Rango Lien Préstamo" },
  { value: "valor_tasacion_subasta", label: "Valor Tasación Subasta" },
  { value: "property_id", label: "Property ID" },
  { value: "property_tipo", label: "Tipo Inmueble" },
  { value: "property_tipo_ocupacion", label: "Tipo Ocupación" },
  { value: "es_vpo", label: "Es VPO" },
  { value: "es_vulnerable", label: "Es Vulnerable" },
  { value: "comunidad_autonoma", label: "Comunidad Autónoma" },
  { value: "provincia", label: "Provincia" },
  { value: "municipio", label: "Municipio" },
  { value: "cod_postal", label: "Código Postal" },
  { value: "direccion_completa", label: "Dirección Completa" },
  { value: "referencia_catastral", label: "Referencia Catastral" },
  { value: "idufir", label: "IDUFIR" },
  { value: "parcel", label: "Parcela" },
  { value: "superficie_const", label: "Sup. Construida" },
  { value: "superficie_util", label: "Sup. Útil" },
  { value: "superficie_finca", label: "Sup. Finca" },
  { value: "superficie_registral", label: "Sup. Registral" },
  { value: "libro", label: "Libro" },
  { value: "tomo", label: "Tomo" },
  { value: "finca", label: "Finca" },
  { value: "folio", label: "Folio" },
  { value: "latitud", label: "Latitud" },
  { value: "longitud", label: "Longitud" },
  { value: "any_construccion", label: "Año Construcción" },
  { value: "proc_legal", label: "Proc. Legal" },
  { value: "proc_legal_tipo", label: "Proc. Legal Tipo" },
  { value: "proc_legal_fase", label: "Proc. Legal Fase" },
  { value: "proc_legal_numero", label: "Proc. Legal Número" },
  { value: "proc_legal_court", label: "Proc. Legal Juzgado" },
  { value: "proc_legal_estado", label: "Proc. Legal Estado" },
  { value: "registro_provincia", label: "Registro Provincia" },
  { value: "registro_ciudad", label: "Registro Ciudad" },
  { value: "registro_numero", label: "Registro Número" },
  { value: "fecha_tratamiento", label: "Fecha Tratamiento" },
] as const;

export type OperacionCampo = (typeof OPERACIONES_CAMPOS)[number]["value"];
