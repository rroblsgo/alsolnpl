#!/usr/bin/env python3
"""
Migración: operacion_enrichments — Sección B (ajuste valoraciones)
===================================================================
Cambios:
  Eliminados:
    - valor_mercado
    - valor_ejecucion_forzosa
    - precio_subasta
    - precio_venta

  Añadidos:
    + prestamo_hipoteca_detalles  TEXT

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_enrichment_seccion_b2.py
"""

import os

SEQ  = "0027"
NAME = "enrichment_seccion_b_valoraciones"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."operacion_enrichments"
  DROP COLUMN IF EXISTS "valor_mercado",
  DROP COLUMN IF EXISTS "valor_ejecucion_forzosa",
  DROP COLUMN IF EXISTS "precio_subasta",
  DROP COLUMN IF EXISTS "precio_venta",
  ADD COLUMN IF NOT EXISTS "prestamo_hipoteca_detalles" text;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
