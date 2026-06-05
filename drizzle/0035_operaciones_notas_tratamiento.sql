-- Migration: 0035_operaciones_notas_tratamiento

ALTER TABLE "public"."operaciones"
  ADD COLUMN IF NOT EXISTS "notas_tratamiento" text;
