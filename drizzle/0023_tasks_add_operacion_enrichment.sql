-- Migration: 0023_tasks_add_operacion_enrichment
-- Vincula tasks con operaciones y enrichments para acopio de información

ALTER TABLE "public"."tasks"
  ADD COLUMN IF NOT EXISTS "operacion_id"  integer
    REFERENCES "public"."operaciones"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "enrichment_id" integer
    REFERENCES "public"."operacion_enrichments"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_operacion
  ON "public"."tasks"("operacion_id")
  WHERE "operacion_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_enrichment
  ON "public"."tasks"("enrichment_id")
  WHERE "enrichment_id" IS NOT NULL;
