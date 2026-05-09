#!/usr/bin/env python3
"""
Genera el fichero SQL de migración para alsolnpl v2.
Ejecutar desde la raíz del proyecto:
    python scripts/gen_migration_v2.py

El fichero resultante se coloca en drizzle/ con el nombre adecuado.
IMPORTANTE: revisar y ajustar el número de secuencia (NNNN) antes de aplicar.
"""

import pathlib

SQL = """\
-- ============================================================
-- Migration: alsolnpl v2 - Cambios estructurales NPL + deudores
-- ============================================================

-- ─── 0. Nuevo ENUM tipo_registro ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE npl_tipo_registro AS ENUM ('DEUDOR', 'HIPOTECANTE', 'FIADOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ─── 1. Tabla npls — nuevas columnas ─────────────────────────────────────────

-- Sección A
ALTER TABLE npls ADD COLUMN IF NOT EXISTS nuestro_codigo_npl varchar(10);
ALTER TABLE npls ADD COLUMN IF NOT EXISTS fondo varchar(100);

-- Sección C (campos nuevos o renombrados)
ALTER TABLE npls ADD COLUMN IF NOT EXISTS principal numeric(14,2);
ALTER TABLE npls ADD COLUMN IF NOT EXISTS fecha_calculada date;
ALTER TABLE npls ADD COLUMN IF NOT EXISTS num_procedimiento varchar(50);
ALTER TABLE npls ADD COLUMN IF NOT EXISTS auto_despacho_ejecucion text;
ALTER TABLE npls ADD COLUMN IF NOT EXISTS actuaciones_judiciales jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE npls ADD COLUMN IF NOT EXISTS riesgos_juridicos text;
ALTER TABLE npls ADD COLUMN IF NOT EXISTS notas_internas text;

-- ─── 2. Migración de datos de columnas renombradas ───────────────────────────

-- derecho_cobro_principal -> principal
UPDATE npls
SET principal = derecho_cobro_principal
WHERE principal IS NULL AND derecho_cobro_principal IS NOT NULL;

-- nig -> num_procedimiento
UPDATE npls
SET num_procedimiento = nig
WHERE num_procedimiento IS NULL AND nig IS NOT NULL;

-- auto_despacho_juez -> auto_despacho_ejecucion
UPDATE npls
SET auto_despacho_ejecucion = auto_despacho_juez
WHERE auto_despacho_ejecucion IS NULL AND auto_despacho_juez IS NOT NULL;

-- importe_despachado: guardar valor en notas_internas para no perder datos
UPDATE npls
SET notas_internas = CONCAT(
  COALESCE(notas_internas, ''),
  '[Migración v2] importe_despachado anterior: ' || importe_despachado::text
)
WHERE importe_despachado IS NOT NULL AND notas_internas NOT LIKE '%Migraci%';

-- ─── 3. Columnas obsoletas (comentadas — descomentar tras confirmar datos) ────
-- ALTER TABLE npls DROP COLUMN IF EXISTS derecho_cobro_principal;
-- ALTER TABLE npls DROP COLUMN IF EXISTS nig;
-- ALTER TABLE npls DROP COLUMN IF EXISTS procuradores;
-- ALTER TABLE npls DROP COLUMN IF EXISTS ejecutados;
-- ALTER TABLE npls DROP COLUMN IF EXISTS importe_despachado;
-- ALTER TABLE npls DROP COLUMN IF EXISTS auto_despacho_juez;
-- NOTA: informacion_inversor sigue en uso, no eliminar.

-- ─── 4. Tabla npl_deudores — nuevas columnas ─────────────────────────────────
ALTER TABLE npl_deudores
  ADD COLUMN IF NOT EXISTS tipo_registro npl_tipo_registro NOT NULL DEFAULT 'DEUDOR';

ALTER TABLE npl_deudores
  ADD COLUMN IF NOT EXISTS otros_datos jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ─── 5. Índices ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS npls_nuestro_codigo_npl_idx ON npls (nuestro_codigo_npl);
CREATE INDEX IF NOT EXISTS npl_deudores_tipo_registro_idx ON npl_deudores (tipo_registro);
"""

out_dir = pathlib.Path("drizzle")
out_dir.mkdir(exist_ok=True)

existing = sorted([f for f in out_dir.glob("*.sql")])
next_num = (int(existing[-1].name.split("_")[0]) + 1) if existing else 0

filename = out_dir / f"{next_num:04d}_alsolnpl_v2.sql"

with open(filename, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"Fichero generado: {filename}")
print()
print("PASOS:")
print("  1. Revisa el SQL.")
print("  2. bun run db:migrate  (o psql -f <fichero>)")
print("  3. Cuando confirmes los datos migrados, descomenta los DROP COLUMN.")
