-- ─────────────────────────────────────────────────────────────────────────────
-- Migración 0037: feature expediente_npl
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Ampliar el enum document_entity_type
ALTER TYPE document_entity_type ADD VALUE IF NOT EXISTS 'EXPEDIENTE_NOTA';

-- 2. Nuevos enums
CREATE TYPE expediente_tipo_nota AS ENUM (
  'comercial',
  'economico',
  'legal_proceso',
  'otros'
);

CREATE TYPE expediente_relevancia AS ENUM (
  'alta',
  'media',
  'baja'
);

CREATE TYPE expediente_status AS ENUM (
  'completar',
  'revisar',
  'ok'
);

-- 3. Tabla principal (REFERENCES users, no "user")
CREATE TABLE expediente_notas (
  id                     serial PRIMARY KEY,
  npl_id                 integer               NOT NULL REFERENCES npls(id) ON DELETE CASCADE,
  tipo_nota              expediente_tipo_nota  NOT NULL DEFAULT 'otros',
  relevancia_nota        expediente_relevancia NOT NULL DEFAULT 'media',
  status_nota            expediente_status     NOT NULL DEFAULT 'completar',
  nota_items             jsonb                 NOT NULL DEFAULT '[]'::jsonb,
  usuario_relacionado_id text                  REFERENCES users(id) ON DELETE SET NULL,
  creator_id             text                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at             timestamp             NOT NULL DEFAULT now(),
  updated_at             timestamp             NOT NULL DEFAULT now()
);

-- 4. Índices
CREATE INDEX idx_expediente_notas_npl_id ON expediente_notas(npl_id);
CREATE INDEX idx_expediente_notas_tipo   ON expediente_notas(tipo_nota);
CREATE INDEX idx_expediente_notas_status ON expediente_notas(status_nota);

-- 5. Comentarios
COMMENT ON TABLE expediente_notas IS
  'Notas del expediente de un NPL. Cada nota agrupa entradas cronológicas (nota_items JSONB).';
COMMENT ON COLUMN expediente_notas.nota_items IS
  'Array: [{fecha, titulo, contenido?, documentos_upload?[]}]';
