#!/usr/bin/env python3
"""
Migración: user_table_preferences
===================================
Crea la tabla para guardar preferencias de columnas por usuario y tabla.

Ejecutar desde la raíz del proyecto:
  python3 scripts/migrate_user_table_preferences.py
"""

import os

SEQ  = "0034"
NAME = "user_table_preferences"

SQL = f"""\
-- Migration: {SEQ}_{NAME}

CREATE TABLE IF NOT EXISTS "public"."user_table_preferences" (
  "id"         serial PRIMARY KEY,
  "user_id"    text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "table_key"  text NOT NULL,
  "prefs"      jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE ("user_id", "table_key")
);
"""

out_dir  = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(SQL)

print(f"✅  Migración generada: {filepath}")
print(f"    Aplica con: psql <connection_string> -f {filepath}")
