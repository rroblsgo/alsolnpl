-- Migration: 0021_enrichment_add_inmueble_fields
-- Añade property_id y tipo_inmueble a operacion_enrichments

ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "property_id"   varchar(50),
  ADD COLUMN IF NOT EXISTS "tipo_inmueble" varchar(100);
