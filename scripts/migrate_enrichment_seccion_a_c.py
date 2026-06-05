#!/usr/bin/env python3
"""
Migración: operacion_enrichments — Secciones A y C
====================================================
Cambios:
  Sección A:
    + titulo_operacion       VARCHAR(255)

  Sección C:
    - tipo_via               (eliminado)
    - zonas_comunes          (eliminado)
    + superficie_detalles    TEXT
    + distribucion_resumida  VARCHAR(255)
    + distribucion           TEXT
    + datos_registro         TEXT
    + notas_ocupacion        TEXT

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_enrichment_seccion_a_c.py

Ajusta SEQ al siguiente número disponible en tu carpeta drizzle/.
"""

import os

SEQ  = "0025"
NAME = "enrichment_seccion_a_c"

SQL = f"""\
-- Migration: {SEQ}_{NAME}
-- Sección A: + titulo_operacion
-- Sección C: - tipo_via, - zonas_comunes
--            + superficie_detalles, distribucion_resumida, distribucion
--            + datos_registro, notas_ocupacion

ALTER TABLE "public"."operacion_enrichments"
  -- Sección A
  ADD COLUMN IF NOT EXISTS "titulo_operacion"      varchar(255),
  -- Sección C — eliminar
  DROP COLUMN IF EXISTS "tipo_via",
  DROP COLUMN IF EXISTS "zonas_comunes",
  -- Sección C — añadir
  ADD COLUMN IF NOT EXISTS "superficie_detalles"   text,
  ADD COLUMN IF NOT EXISTS "distribucion_resumida" varchar(255),
  ADD COLUMN IF NOT EXISTS "distribucion"          text,
  ADD COLUMN IF NOT EXISTS "datos_registro"        text,
  ADD COLUMN IF NOT EXISTS "notas_ocupacion"       text;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
