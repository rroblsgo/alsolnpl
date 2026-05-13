-- ============================================================
-- Migración: añadir columna `role` a la tabla `users`
-- Aplicar en VPS: psql -U <usuario> -d <base_datos> -f add_role_to_users.sql
-- ============================================================

-- 1. Añadir la columna con valor por defecto 'user'
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- 2. Asignar roles a los usuarios ya existentes
--    ⚠️  Edita los emails antes de ejecutar.
--    Roles disponibles: admin | legal | comercial | ver_only | cliente | agente

-- Administrador técnico
UPDATE users SET role = 'admin'     WHERE email = 'johndoe@gmail.com';
UPDATE users SET role = 'admin'     WHERE email = 'rroblesgo@gmail.com';
UPDATE users SET role = 'admin'     WHERE email = 'federico@gmail.com';

-- Equipo interno
UPDATE users SET role = 'legal'     WHERE email = 'adauta@gmail.com';
UPDATE users SET role = 'comercial' WHERE email = 'alejandro@gmail.com';
UPDATE users SET role = 'ver_only'  WHERE email = 'adrian@gmail.com';

-- Usuarios externos
UPDATE users SET role = 'cliente'   WHERE email = 'jonrahm@gmail.com';
UPDATE users SET role = 'agente'    WHERE email = 'janedoe@gmail.com';
UPDATE users SET role = 'agente'    WHERE email = 'jane@gmail.com';

-- 3. Verificación: mostrar usuarios y sus roles asignados
SELECT id, name, email, role, created_at
  FROM users
 ORDER BY created_at;

-- ============================================================
-- NOTAS:
-- • Si usas Drizzle Migrate puedes generar la migración con:
--     bun run drizzle-kit generate
--     bun run drizzle-kit migrate
--   Drizzle detectará la nueva columna en auth-schema.ts.
-- • NO borres la columna ni cambies el default sin actualizar
--   proxy.ts, auth.ts y roles.ts en consecuencia.
-- ============================================================
