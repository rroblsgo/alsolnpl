#!/usr/bin/env python3
"""
Migración: operacion_enrichments — Sección B
=============================================
Cambios:
  Eliminados:
    - fecha_impago
    - fecha_ultimo_pago
    - principal_pendiente
    - intereses_devengados
    - deuda_total
    - gbv
    - tipo_interes
    - cuota_mensual
    - ltv
    - meses_impago

  Añadidos:
    + principal_afs     NUMERIC(14,2)
    + intereses_afs     NUMERIC(14,2)
    + costas_afs        NUMERIC(14,2)
    + fecha_afs         DATE
    + intereses         NUMERIC(14,2)
    + costas            NUMERIC(14,2)
    + fecha_calculada   DATE

  Nota: deuda_total_afs y deuda_actualizada son calculados en cliente, NO se almacenan.

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_enrichment_seccion_b.py
"""

import os

SEQ  = "0026"
NAME = "enrichment_seccion_b"

SQL = f"""\
-- Migration: {SEQ}_{NAME}
-- Sección B: eliminar campos obsoletos, añadir bloques AFS y deuda actualizada

ALTER TABLE "public"."operacion_enrichments"
  -- Eliminar campos obsoletos
  DROP COLUMN IF EXISTS "fecha_impago",
  DROP COLUMN IF EXISTS "fecha_ultimo_pago",
  DROP COLUMN IF EXISTS "principal_pendiente",
  DROP COLUMN IF EXISTS "intereses_devengados",
  DROP COLUMN IF EXISTS "deuda_total",
  DROP COLUMN IF EXISTS "gbv",
  DROP COLUMN IF EXISTS "tipo_interes",
  DROP COLUMN IF EXISTS "cuota_mensual",
  DROP COLUMN IF EXISTS "ltv",
  DROP COLUMN IF EXISTS "meses_impago",
  -- Añadir bloque AFS
  ADD COLUMN IF NOT EXISTS "principal_afs"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "intereses_afs"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "costas_afs"      numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_afs"       date,
  -- Añadir bloque deuda actualizada
  ADD COLUMN IF NOT EXISTS "intereses"       numeric(14,2),
  ADD COLUMN IF NOT EXISTS "costas"          numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_calculada" date;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
