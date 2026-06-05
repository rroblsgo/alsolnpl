-- Migration: 0036_npl_notas_observaciones
ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "notas_observaciones" text;
