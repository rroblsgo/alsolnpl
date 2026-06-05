-- Migration: 0034_user_table_preferences

CREATE TABLE IF NOT EXISTS "public"."user_table_preferences" (
  "id"         serial PRIMARY KEY,
  "user_id"    text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "table_key"  text NOT NULL,
  "prefs"      jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  UNIQUE ("user_id", "table_key")
);
