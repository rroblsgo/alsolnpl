#!/usr/bin/env python3
"""
Añade los campos property_id y tipo_inmueble a operacion_enrichments.
Ejecutar desde la raíz del proyecto:
  python3 scripts/migrations/add_enrichment_inmueble_fields.py

Ajusta SEQ al siguiente número disponible en tu carpeta drizzle/.
"""

import os

SEQ  = "0021"
NAME = "enrichment_add_inmueble_fields"

SQL = f"""\
-- Migration: {SEQ}_{NAME}
-- Añade property_id y tipo_inmueble a operacion_enrichments

ALTER TABLE "public"."operacion_enrichments"
  ADD COLUMN IF NOT EXISTS "property_id"   varchar(50),
  ADD COLUMN IF NOT EXISTS "tipo_inmueble" varchar(100);
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
