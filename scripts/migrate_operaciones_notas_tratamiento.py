#!/usr/bin/env python3
"""
Migración: operaciones — notas_tratamiento
==========================================
  + notas_tratamiento  TEXT

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_operaciones_notas_tratamiento.py
"""

import os

SEQ  = "0035"
NAME = "operaciones_notas_tratamiento"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."operaciones"
  ADD COLUMN IF NOT EXISTS "notas_tratamiento" text;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
