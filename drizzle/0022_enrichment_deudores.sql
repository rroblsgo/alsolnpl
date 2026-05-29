-- Migration: 0022_enrichment_deudores
-- Tabla de deudores vinculada a operacion_enrichments
-- Misma estructura que npl_deudores para facilitar la promoción a NPL

CREATE TABLE IF NOT EXISTS "public"."enrichment_deudores" (
  "id"                  serial PRIMARY KEY,
  "enrichment_id"       integer NOT NULL
                          REFERENCES "public"."operacion_enrichments"("id")
                          ON DELETE CASCADE,
  "es_principal"        boolean NOT NULL DEFAULT false,
  -- Reutiliza el enum npl_tipo_registro (DEUDOR / HIPOTECANTE / FIADOR)
  "tipo_registro"       "public"."npl_tipo_registro" NOT NULL DEFAULT 'DEUDOR',
  "nombre"              varchar(255) NOT NULL,
  "dni"                 varchar(20),
  "direccion_completa"  text,
  "estado_ocupacional"  text,
  "vulnerabilidad"      text,
  "notas"               text,
  "otros_datos"         jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at"          timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrichment_deudores_enrichment
  ON "public"."enrichment_deudores"("enrichment_id");
