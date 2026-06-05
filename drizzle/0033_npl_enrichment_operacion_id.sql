-- Migration: 0033_npl_enrichment_operacion_id

ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "enrichment_operacion_id" integer;
