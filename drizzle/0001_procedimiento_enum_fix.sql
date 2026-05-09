BEGIN;

-- 1. Quitar el default actual
ALTER TABLE npls ALTER COLUMN procedimiento DROP DEFAULT;

-- 2. Cambiar el tipo con el mapping
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

-- 3. Eliminar tipo antiguo y renombrar
DROP TYPE npl_procedimiento;
ALTER TYPE npl_procedimiento_new RENAME TO npl_procedimiento;

-- 4. Restaurar el default con el tipo ya renombrado
ALTER TABLE npls
  ALTER COLUMN procedimiento SET DEFAULT 'EJH'::npl_procedimiento;

COMMIT;