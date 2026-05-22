-- Añade comunidad_autonoma y main_key con índice único

ALTER TABLE "operaciones"
  ADD COLUMN IF NOT EXISTS "comunidad_autonoma" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "main_key"           VARCHAR(160);

-- Rellenar main_key para registros existentes
UPDATE "operaciones"
SET "main_key" = CONCAT_WS('|',
  COALESCE(NULLIF(expediente_id, ''), '_'),
  COALESCE(NULLIF(prestamo_id,   ''), '_'),
  COALESCE(NULLIF(property_id,   ''), '_')
)
WHERE "main_key" IS NULL;

-- Índice único (admite NULL por si algún campo está vacío, usamos partial)
CREATE UNIQUE INDEX IF NOT EXISTS uq_operaciones_main_key
  ON "operaciones" ("main_key")
  WHERE "main_key" IS NOT NULL;
