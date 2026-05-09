#!/usr/bin/env python3
"""
Genera migración SQL para cambiar los valores del enum npl_procedimiento.
Estrategia segura para PostgreSQL:
  1. Crear el nuevo tipo
  2. Migrar la columna al nuevo tipo con USING
  3. Eliminar el tipo antiguo

Ejecutar desde la raíz del proyecto:
    python scripts/gen_migration_procedimiento.py
"""

import pathlib

SQL = """\
-- ============================================================
-- Migration: cambio enum npl_procedimiento
-- Valores anteriores: EJECUCION_HIPOTECARIA, DACION_EN_PAGO,
--                     ACUERDO_EXTRAJUDICIAL, SUBASTA, OTRO
-- Valores nuevos:     EJH, ETNJ, ETJ, PO, DESAHUCIO, OTRO
-- ============================================================

-- ─── 1. Crear el nuevo tipo ───────────────────────────────────────────────────
CREATE TYPE npl_procedimiento_new AS ENUM (
  'EJH',
  'ETNJ',
  'ETJ',
  'PO',
  'DESAHUCIO',
  'OTRO'
);

-- ─── 2. Convertir la columna al nuevo tipo ────────────────────────────────────
-- Los valores actuales se mapean a los nuevos:
--   EJECUCION_HIPOTECARIA -> EJH
--   DACION_EN_PAGO        -> OTRO  (no tiene equivalente directo)
--   ACUERDO_EXTRAJUDICIAL -> OTRO
--   SUBASTA               -> OTRO
--   OTRO                  -> OTRO
ALTER TABLE npls
  ALTER COLUMN procedimiento TYPE npl_procedimiento_new
  USING (
    CASE procedimiento::text
      WHEN 'EJECUCION_HIPOTECARIA' THEN 'EJH'
      WHEN 'DACION_EN_PAGO'        THEN 'OTRO'
      WHEN 'ACUERDO_EXTRAJUDICIAL' THEN 'OTRO'
      WHEN 'SUBASTA'               THEN 'OTRO'
      ELSE 'OTRO'
    END
  )::npl_procedimiento_new;

-- ─── 3. Cambiar el default de la columna ─────────────────────────────────────
ALTER TABLE npls
  ALTER COLUMN procedimiento SET DEFAULT 'EJH'::npl_procedimiento_new;

-- ─── 4. Eliminar el tipo antiguo y renombrar el nuevo ────────────────────────
DROP TYPE npl_procedimiento;
ALTER TYPE npl_procedimiento_new RENAME TO npl_procedimiento;
"""

out_dir = pathlib.Path("drizzle")
out_dir.mkdir(exist_ok=True)

existing = sorted([f for f in out_dir.glob("*.sql")])
next_num = (int(existing[-1].name.split("_")[0]) + 1) if existing else 0

filename = out_dir / f"{next_num:04d}_procedimiento_enum.sql"

with open(filename, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"Fichero generado: {filename}")
print()
print("PASOS:")
print("  1. Revisa el mapping CASE para los valores existentes en tu BD.")
print("  2. psql $DATABASE_URL -f", filename)
print("  3. Marca como aplicado en Drizzle:")
print(f"     psql $DATABASE_URL -c \"INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ('{filename.stem}', extract(epoch from now()) * 1000);\"")
