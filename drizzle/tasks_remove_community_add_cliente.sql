-- ============================================================
-- Migración: tasks — eliminar community_id, añadir cliente_id
-- Aplicar en VPS: psql -U <usuario> -d <base_datos> -f tasks_remove_community_add_cliente.sql
-- ============================================================

-- 1. Eliminar la FK constraint de community_id
--    (el nombre exacto depende de cómo Drizzle la generó; ajusta si es necesario)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_community_id_community_id_fk;

-- 2. Eliminar la columna community_id (y sus datos, que ya no tienen interés)
ALTER TABLE tasks DROP COLUMN IF EXISTS community_id;

-- 3. Añadir la columna cliente_id como FK opcional a la tabla clientes
--    SET NULL: si se elimina el cliente, la tarea pierde la referencia pero no se borra
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS cliente_id integer
    REFERENCES clientes(id) ON DELETE SET NULL;

-- 4. Verificación
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- ============================================================
-- NOTAS:
-- • community_id era NOT NULL con cascade, por eso hay que quitar
--   la constraint antes de la columna.
-- • cliente_id es nullable: una task puede existir sin cliente.
-- • Si usas Drizzle Migrate en lugar de SQL directo:
--     bun run drizzle-kit generate
--     bun run drizzle-kit migrate
-- ============================================================
