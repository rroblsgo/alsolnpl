ALTER TABLE "npls" ADD COLUMN IF NOT EXISTS "lat_catastro" numeric(12, 8);
ALTER TABLE "npls" ADD COLUMN IF NOT EXISTS "lng_catastro" numeric(12, 8);
