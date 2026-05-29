#!/usr/bin/env python3
"""
Sprint 4 — Deudores, Lista enrichments, Tasks vinculadas.
Genera dos ficheros SQL de migración.
Ejecutar desde la raíz del proyecto:
  python3 scripts/migrations/sprint4_enrichment_deudores_tasks.py

Ajusta SEQ_A y SEQ_B al siguiente par disponible en tu carpeta drizzle/.
"""

import os

SEQ_A = "0022"
SEQ_B = "0023"

# ── Migración A: enrichment_deudores ─────────────────────────────────────────
SQL_A = f"""\
-- Migration: {SEQ_A}_enrichment_deudores
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
"""

# ── Migración B: tasks + operacion_id + enrichment_id ────────────────────────
SQL_B = f"""\
-- Migration: {SEQ_B}_tasks_add_operacion_enrichment
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
"""

out_dir = "drizzle"
os.makedirs(out_dir, exist_ok=True)

for seq, name, sql in [
    (SEQ_A, "enrichment_deudores",             SQL_A),
    (SEQ_B, "tasks_add_operacion_enrichment",  SQL_B),
]:
    filepath = os.path.join(out_dir, f"{seq}_{name}.sql")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"✅  {filepath}")

print("\nAplica con:")
print(f"  psql <conn> -f drizzle/{SEQ_A}_enrichment_deudores.sql")
print(f"  psql <conn> -f drizzle/{SEQ_B}_tasks_add_operacion_enrichment.sql")
