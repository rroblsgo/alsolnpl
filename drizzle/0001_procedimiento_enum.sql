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
