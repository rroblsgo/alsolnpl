#!/usr/bin/env python3
"""
Migración: operacion_enrichments — status_promocion_npl
========================================================
Añade:
  + enum 'enrichment_status_promocion' (en_curso, desestimado, promocionado)
  + campo status_promocion_npl en operacion_enrichments

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_enrichment_status_promocion.py
"""

import os

SEQ  = "0030"
NAME = "enrichment_status_promocion"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

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
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
