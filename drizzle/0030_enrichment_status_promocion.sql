-- Migration: 0030_enrichment_status_promocion

-- Crear el enum
DO $$ BEGIN
  CREATE TYPE "enrichment_status_promocion" AS ENUM (
    'en_curso', 'desestimado', 'promocionado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Añadir campo
ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "status_promocion_npl"
    "enrichment_status_promocion" NOT NULL DEFAULT 'en_curso';
