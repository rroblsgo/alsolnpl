#!/usr/bin/env python3
"""
Migración: npls — nuevos campos desde enrichment
=================================================
Sección A:
  + idufir               VARCHAR(50)
  + cru                  VARCHAR(50)
  + comunidad_autonoma   VARCHAR(100)
  + superficie_util      NUMERIC(10,2)
  + uso_catastral        VARCHAR(100)
  + valor_ref_catastral  NUMERIC(14,2)
  + valor_catastral      NUMERIC(14,2)

Sección C:
  + cargas               TEXT
  + embargos             TEXT

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_npl_nuevos_campos.py
"""

import os

SEQ  = "0031"
NAME = "npl_nuevos_campos"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "idufir"              varchar(50),
  ADD COLUMN IF NOT EXISTS "cru"                 varchar(50),
  ADD COLUMN IF NOT EXISTS "comunidad_autonoma"  varchar(100),
  ADD COLUMN IF NOT EXISTS "superficie_util"     numeric(10,2),
  ADD COLUMN IF NOT EXISTS "uso_catastral"       varchar(100),
  ADD COLUMN IF NOT EXISTS "valor_ref_catastral" numeric(14,2),
  ADD COLUMN IF NOT EXISTS "valor_catastral"     numeric(14,2),
  ADD COLUMN IF NOT EXISTS "cargas"              text,
  ADD COLUMN IF NOT EXISTS "embargos"            text;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
