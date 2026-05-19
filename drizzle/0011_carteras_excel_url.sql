-- Añade columna excel_url a carteras para almacenar la URL de UploadThing
ALTER TABLE "carteras" ADD COLUMN IF NOT EXISTS "excel_url" VARCHAR(512);
