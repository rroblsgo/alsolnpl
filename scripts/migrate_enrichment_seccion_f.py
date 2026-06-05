#!/usr/bin/env python3
"""
Migración: operacion_enrichments — Sección F
=============================================
Añade los campos de rentabilidad idénticos a gestion_npl:
    + coste_adquisicion_credito  NUMERIC(14,2)
    + impuestos_ajd              NUMERIC(14,2)
    + costes_notaria_registro    NUMERIC(14,2)
    + gastos_dacion              NUMERIC(14,2)
    + comision_intermediacion    NUMERIC(14,2)
    + puja_probable              NUMERIC(14,2)
    + precio_mercado             NUMERIC(14,2)
    + precio_venta_rapida        NUMERIC(14,2)
    + fecha_compra               DATE
    + fecha_terminacion          DATE
    + gastos_diversos            JSONB [{titulo, valor}]

Los campos de estrategia existentes no se modifican.

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_enrichment_seccion_f.py
"""

import os

SEQ  = "0029"
NAME = "enrichment_seccion_f_rentabilidad"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "coste_adquisicion_credito" numeric(14,2),
  ADD COLUMN IF NOT EXISTS "impuestos_ajd"             numeric(14,2),
  ADD COLUMN IF NOT EXISTS "costes_notaria_registro"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "gastos_dacion"             numeric(14,2),
  ADD COLUMN IF NOT EXISTS "comision_intermediacion"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "puja_probable"             numeric(14,2),
  ADD COLUMN IF NOT EXISTS "precio_mercado"            numeric(14,2),
  ADD COLUMN IF NOT EXISTS "precio_venta_rapida"       numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_compra"              date,
  ADD COLUMN IF NOT EXISTS "fecha_terminacion"         date,
  ADD COLUMN IF NOT EXISTS "gastos_diversos"           jsonb NOT NULL DEFAULT '[]'::jsonb;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
