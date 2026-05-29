#!/usr/bin/env python3
"""
Sprint 5 — Nota simple: añade campos JSONB a operacion_enrichments.
Ejecutar desde la raíz del proyecto:
  python3 scripts/migrations/add_nota_simple_fields.py

Ajusta SEQ al siguiente número disponible en tu carpeta drizzle/.
"""

import os

SEQ  = "0024"
NAME = "add_nota_simple_fields"

SQL = f"""\
-- Migration: {SEQ}_{NAME}
-- Añade campos JSONB para almacenar datos extraídos de nota simple
-- y la URL del PDF subido a UploadThing

ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "nota_simple_url"          varchar(512),
  ADD COLUMN IF NOT EXISTS "nota_simple_fecha"        date,
  ADD COLUMN IF NOT EXISTS "nota_simple_csv"          varchar(50),
  ADD COLUMN IF NOT EXISTS "nota_simple_registro"     jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_registral"    jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_inmueble"     jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_titularidad"  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_cargas"       jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "nota_simple_otros"        jsonb NOT NULL DEFAULT '[]'::jsonb;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")
with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)
print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <conn> -f {filepath}")
