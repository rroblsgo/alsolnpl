/**
 * GET /api/municipios?provincia=41
 * Devuelve los municipios de la provincia indicada.
 * Solo accesible desde el servidor/cliente autenticado dentro de la app.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db';
import { municipios } from '@/src/db/schema/municipios';
import { eq, asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const provinciaId = searchParams.get('provincia');

  if (!provinciaId || !/^\d{2}$/.test(provinciaId)) {
    return NextResponse.json(
      { error: 'Parámetro provincia inválido. Debe ser un código de 2 dígitos.' },
      { status: 400 }
    );
  }

  const rows = await db
    .select({
      municipioId: municipios.municipioId,
      nombre: municipios.nombre,
    })
    .from(municipios)
    .where(eq(municipios.provinciaId, provinciaId))
    .orderBy(asc(municipios.nombre));

  return NextResponse.json(rows);
}
