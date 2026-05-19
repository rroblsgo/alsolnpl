-- Corrige longitudes de VARCHAR en tabla operaciones
-- referencia_catastral: 10 -> 25  (catastral española = 20 chars)
-- idufir:               50 -> 50  (ok, ya era suficiente)
-- parcel:               10 -> 20  (margen)
-- direccion_completa:  100 -> 255 (direcciones largas)
-- proc_legal_court:     50 -> 100 (nombre juzgado largo)

ALTER TABLE "operaciones"
  ALTER COLUMN "referencia_catastral" TYPE VARCHAR(25),
  ALTER COLUMN "parcel"               TYPE VARCHAR(20),
  ALTER COLUMN "direccion_completa"   TYPE VARCHAR(255),
  ALTER COLUMN "proc_legal_court"     TYPE VARCHAR(100);
