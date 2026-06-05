-- Migration: 0027_enrichment_seccion_b_valoraciones

ALTER TABLE "public"."operacion_enrichments"
  DROP COLUMN IF EXISTS "valor_mercado",
  DROP COLUMN IF EXISTS "valor_ejecucion_forzosa",
  DROP COLUMN IF EXISTS "precio_subasta",
  DROP COLUMN IF EXISTS "precio_venta",
  ADD COLUMN IF NOT EXISTS "prestamo_hipoteca_detalles" text;
