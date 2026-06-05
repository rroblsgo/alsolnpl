-- Migration: 0026_enrichment_seccion_b
-- Sección B: eliminar campos obsoletos, añadir bloques AFS y deuda actualizada

ALTER TABLE "public"."operacion_enrichments"
  -- Eliminar campos obsoletos
  DROP COLUMN IF EXISTS "fecha_impago",
  DROP COLUMN IF EXISTS "fecha_ultimo_pago",
  DROP COLUMN IF EXISTS "principal_pendiente",
  DROP COLUMN IF EXISTS "intereses_devengados",
  DROP COLUMN IF EXISTS "deuda_total",
  DROP COLUMN IF EXISTS "gbv",
  DROP COLUMN IF EXISTS "tipo_interes",
  DROP COLUMN IF EXISTS "cuota_mensual",
  DROP COLUMN IF EXISTS "ltv",
  DROP COLUMN IF EXISTS "meses_impago",
  -- Añadir bloque AFS
  ADD COLUMN IF NOT EXISTS "principal_afs"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "intereses_afs"   numeric(14,2),
  ADD COLUMN IF NOT EXISTS "costas_afs"      numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_afs"       date,
  -- Añadir bloque deuda actualizada
  ADD COLUMN IF NOT EXISTS "intereses"       numeric(14,2),
  ADD COLUMN IF NOT EXISTS "costas"          numeric(14,2),
  ADD COLUMN IF NOT EXISTS "fecha_calculada" date;
