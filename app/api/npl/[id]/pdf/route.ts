import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { requireAuth } from '@/src/lib/auth-server';
import { nplService } from '@/src/fetatures/gestion_npl/services/NplService';
import { NplPolicy } from '@/src/fetatures/gestion_npl/policies/NplPolicy';
import { db } from '@/src/db';
import { nplDeudores } from '@/src/db/schema';
import { asc, eq } from 'drizzle-orm';
import NplPdfDocument from '@/src/fetatures/gestion_npl/pdf/NplPdfDocument';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── Autenticación ────────────────────────────────────────────────────────
    const { session } = await requireAuth();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const nplId = Number(id);

    if (isNaN(nplId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // ── Cargar datos ─────────────────────────────────────────────────────────
    const npl = await nplService.getNpl(nplId);

    if (!NplPolicy.canView(session.user, npl)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const deudores = await db
      .select()
      .from(nplDeudores)
      .where(eq(nplDeudores.nplId, nplId))
      .orderBy(asc(nplDeudores.esPrincipal), asc(nplDeudores.createdAt));

    // console.log(
    //   'HTML informacionInversor:',
    //   JSON.stringify(npl.informacionInversor)
    // );
    // ── Generar PDF ──────────────────────────────────────────────────────────
    const buffer = await renderToBuffer(
      React.createElement(NplPdfDocument, {
        npl,
        deudores,
        empresaNombre: process.env.PDF_EMPRESA_NOMBRE ?? 'ORENES PROPERTY FUND',
        empresaContacto: process.env.PDF_EMPRESA_CONTACTO ?? '',
        empresaWeb: process.env.PDF_EMPRESA_WEB ?? '',
      }) as React.ReactElement<DocumentProps>
    );

    // ── Nombre del archivo ───────────────────────────────────────────────────
    const slug = npl.tituloOperacion
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const filename = `folleto-${slug}.pdf`;

    // ── Respuesta ────────────────────────────────────────────────────────────
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF] Error generando folleto:', error);
    return NextResponse.json(
      { error: 'Error al generar el PDF' },
      { status: 500 }
    );
  }
}
