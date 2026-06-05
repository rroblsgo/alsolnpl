-- Migration: 0031_npl_nuevos_campos

ALTER TABLE "public"."npls"
  ADD COLUMN IF NOT EXISTS "idufir"              varchar(50),
  ADD COLUMN IF NOT EXISTS "cru"                 varchar(50),
  ADD COLUMN IF NOT EXISTS "comunidad_autonoma"  varchar(100),
  ADD COLUMN IF NOT EXISTS "superficie_util"     numeric(10,2),
  ADD COLUMN IF NOT EXISTS "uso_catastral"       varchar(100),
  ADD COLUMN IF NOT EXISTS "valor_ref_catastral" numeric(14,2),
  ADD COLUMN IF NOT EXISTS "valor_catastral"     numeric(14,2),
  ADD COLUMN IF NOT EXISTS "cargas"              text,
  ADD COLUMN IF NOT EXISTS "embargos"            text;
