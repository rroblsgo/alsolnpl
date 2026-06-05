#!/usr/bin/env python3
"""
Migración: npls — campo enrichment_operacion_id
================================================
  + enrichment_operacion_id  INTEGER
    Guarda el operacionId del enrichment de procedencia
    para poder navegar directamente al enrichment desde el NPL.

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_npl_enrichment_link.py
"""

import os

SEQ  = "0033"
NAME = "npl_enrichment_operacion_id"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "enrichment_operacion_id" integer;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
