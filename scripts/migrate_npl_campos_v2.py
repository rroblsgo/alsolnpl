#!/usr/bin/env python3
"""
Migración: npls — campos adicionales v2
========================================
  + property_id       VARCHAR(50)
  + enrichment_id     INTEGER
  + tasacion_actual   NUMERIC(14,2)
  + fecha_tasacion    DATE
  + notas_ocupacion   TEXT

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_npl_campos_v2.py
"""

import os

SEQ  = "0032"
NAME = "npl_campos_v2"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "property_id"     varchar(50),
  ADD COLUMN IF NOT EXISTS "enrichment_id"   integer,
  ADD COLUMN IF NOT EXISTS "tasacion_actual" numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_tasacion"  date,
  ADD COLUMN IF NOT EXISTS "notas_ocupacion" text;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
