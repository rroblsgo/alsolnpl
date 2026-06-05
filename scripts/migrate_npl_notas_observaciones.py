#!/usr/bin/env python3
"""
Migración: npls — notas_observaciones
======================================
  + notas_observaciones  TEXT
"""
import os
SEQ, NAME = "0036", "npl_notas_observaciones"
SQL = f'-- Migration: {SEQ}_{NAME}\nALTER TABLE "public"."npls"\n  ADD COLUMN IF NOT EXISTS "notas_observaciones" text;\n'
out_dir = "drizzle"
os.makedirs(out_dir, exist_ok=True)
filepath = os.path.join(out_dir, f"{SEQ}_{NAME}.sql")
open(filepath, "w").write(SQL)
print(f"✅  {filepath}")
