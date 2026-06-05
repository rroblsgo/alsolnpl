#!/usr/bin/env python3
"""
Migración: operacion_enrichments — Sección D
=============================================
Cambios:
  Eliminados:
    - estado_legal, fase_judicial, subfase_judicial
    - partido_judicial
    - total_cargas, cargas_preferentes, cargas_posteriores
    - ibi_pendiente, comunidad_pendiente, suministros_pendientes
    - usufructo, servidumbres
    - tipo_garantia, rango_garantia, garantia_cruzada

  Añadidos:
    + procedimiento            (enum: EJH, ETNJ, ETJ, PO, DESAHUCIO, OTRO)
    + ejecutante               VARCHAR(255)
    + auto_despacho_ejecucion  TEXT
    + actuaciones_judiciales   JSONB  [{fecha, titulo}]
    + riesgos_juridicos        TEXT
    + cargas                   TEXT
    + notas_internas           TEXT

  Se conservan: embargos (ya era TEXT), juzgado, numero_procedimiento,
                fecha_subasta, numero_subasta, fecha_adjudicacion, tipo_adjudicacion

Nota: el enum npl_procedimiento ya existe en BD (creado con gestion_npl).
      Si no existe, el ADD COLUMN fallará — en ese caso ejecutar primero
      la migración de gestion_npl.

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_enrichment_seccion_d.py
"""

import os

SEQ  = "0028"
NAME = "enrichment_seccion_d"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

ALTER TABLE "public"."operacion_enrichments"
  -- Eliminar campos obsoletos
  DROP COLUMN IF EXISTS "estado_legal",
  DROP COLUMN IF EXISTS "fase_judicial",
  DROP COLUMN IF EXISTS "subfase_judicial",
  DROP COLUMN IF EXISTS "partido_judicial",
  DROP COLUMN IF EXISTS "total_cargas",
  DROP COLUMN IF EXISTS "cargas_preferentes",
  DROP COLUMN IF EXISTS "cargas_posteriores",
  DROP COLUMN IF EXISTS "ibi_pendiente",
  DROP COLUMN IF EXISTS "comunidad_pendiente",
  DROP COLUMN IF EXISTS "suministros_pendientes",
  DROP COLUMN IF EXISTS "usufructo",
  DROP COLUMN IF EXISTS "servidumbres",
  DROP COLUMN IF EXISTS "tipo_garantia",
  DROP COLUMN IF EXISTS "rango_garantia",
  DROP COLUMN IF EXISTS "garantia_cruzada",
  -- Añadir nuevos campos
  ADD COLUMN IF NOT EXISTS "procedimiento"            "npl_procedimiento",
  ADD COLUMN IF NOT EXISTS "ejecutante"               varchar(255),
  ADD COLUMN IF NOT EXISTS "auto_despacho_ejecucion"  text,
  ADD COLUMN IF NOT EXISTS "actuaciones_judiciales"   jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "riesgos_juridicos"        text,
  ADD COLUMN IF NOT EXISTS "cargas"                   text,
  ADD COLUMN IF NOT EXISTS "notas_internas"           text;
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
print()
print("⚠️  Requisito: el enum 'npl_procedimiento' debe existir previamente en la BD.")
print("    Se creó con la migración de gestion_npl. Si no existe, ejecutar antes esa migración.")
