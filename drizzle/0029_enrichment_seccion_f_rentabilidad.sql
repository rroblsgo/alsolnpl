-- Migration: 0029_enrichment_seccion_f_rentabilidad

ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "coste_adquisicion_credito" numeric(14,2),
  ADD COLUMN IF NOT EXISTS "impuestos_ajd"             numeric(14,2),
  ADD COLUMN IF NOT EXISTS "costes_notaria_registro"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "gastos_dacion"             numeric(14,2),
  ADD COLUMN IF NOT EXISTS "comision_intermediacion"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "puja_probable"             numeric(14,2),
  ADD COLUMN IF NOT EXISTS "precio_mercado"            numeric(14,2),
  ADD COLUMN IF NOT EXISTS "precio_venta_rapida"       numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_compra"              date,
  ADD COLUMN IF NOT EXISTS "fecha_terminacion"         date,
  ADD COLUMN IF NOT EXISTS "gastos_diversos"           jsonb NOT NULL DEFAULT '[]'::jsonb;
