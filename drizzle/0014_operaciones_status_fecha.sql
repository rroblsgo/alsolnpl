-- Añade status_tratamiento (enum) y asegura fecha_tratamiento con default NOW()

CREATE TYPE operacion_status AS ENUM (
  'nuevo',
  'analisis',
  'scoring',
  'seleccionado',
  'descartado',
  'comercializado',
  'ofertado',
  'reservado',
  'vendido',
  'cancelado'
);

ALTER TABLE "operaciones"
  ADD COLUMN IF NOT EXISTS "status_tratamiento" operacion_status NOT NULL DEFAULT 'nuevo',
  ALTER COLUMN "fecha_tratamiento" SET DEFAULT CURRENT_DATE;
