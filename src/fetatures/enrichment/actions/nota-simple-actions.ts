'use server';

import { requireAuth } from '@/src/lib/auth-server';
import { enrichmentRepository } from '../services/EnrichmentRepository';

// ── Tipo de respuesta de extracción ───────────────────────────────────────────
export type NotaSimpleItem = { nombre: string; contenido: string };

export type NotaSimpleExtraida = {
  registro: NotaSimpleItem[];
  registral: NotaSimpleItem[];
  inmueble: NotaSimpleItem[];
  titularidad: NotaSimpleItem[];
  cargas: NotaSimpleItem[];
  otros: NotaSimpleItem[];
  fecha: string | null;
  csv: string | null;
  mapeados: {
    cru?: string;
    idufirReg?: string;
    fincaRegistral?: string;
    tomo?: string;
    libro?: string;
    folio?: string;
    registroProvincia?: string;
    registroCiudad?: string;
    registroNumero?: string;
    referenciaCatastral?: string;
    superficieConst?: string;
    superficieUtil?: string;
    tasacionOriginal?: string;
    juzgado?: string;
    numeroProcedimiento?: string;
    procedimiento?: string;
  };
};

/**
 * Carga los datos de nota simple ya almacenados en BD.
 * Se llama al montar el componente si hay notaSimpleUrl.
 */
export async function getNotaSimpleAction(enrichmentId: number): Promise<{
  success: boolean;
  data?: NotaSimpleExtraida & { pdfUrl: string };
  error?: string;
}> {
  await requireAuth();
  try {
    const enrichment = await enrichmentRepository.findById(enrichmentId);
    if (!enrichment || !(enrichment as any).notaSimpleUrl) {
      return { success: false };
    }
    const e = enrichment as any;
    const data: NotaSimpleExtraida & { pdfUrl: string } = {
      pdfUrl: e.notaSimpleUrl,
      fecha: e.notaSimpleFecha ?? null,
      csv: e.notaSimpleCsv ?? null,
      registro: e.notaSimpleRegistro ?? [],
      registral: e.notaSimpleRegistral ?? [],
      inmueble: e.notaSimpleInmueble ?? [],
      titularidad: e.notaSimpleTitularidad ?? [],
      cargas: e.notaSimpleCargas ?? [],
      otros: e.notaSimpleOtros ?? [],
      mapeados: {
        cru: e.cru ?? undefined,
        idufirReg: e.idufirReg ?? undefined,
        fincaRegistral: e.fincaRegistral ?? undefined,
        tomo: e.tomo ?? undefined,
        libro: e.libro ?? undefined,
        folio: e.folio ?? undefined,
        registroProvincia: e.registroProvincia ?? undefined,
        registroCiudad: e.registroCiudad ?? undefined,
        registroNumero: e.registroNumero ?? undefined,
        referenciaCatastral: e.referenciaCatastral ?? undefined,
        superficieConst: e.superficieConst ?? undefined,
        superficieUtil: e.superficieUtil ?? undefined,
        tasacionOriginal: e.tasacionOriginal ?? undefined,
        juzgado: e.juzgado ?? undefined,
        numeroProcedimiento: e.numeroProcedimiento ?? undefined,
        procedimiento: e.procedimiento ?? undefined,
      },
    };
    return { success: true, data };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ── Prompt para Claude ────────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `Eres un extractor de datos de Notas Simples del Registro de la Propiedad español.
Analiza el PDF adjunto y extrae TODA la información disponible.

Devuelve SOLO un objeto JSON válido con esta estructura exacta (sin texto adicional, sin markdown):
{
  "registro": [{"nombre": "...", "contenido": "..."}],
  "registral": [{"nombre": "...", "contenido": "..."}],
  "inmueble": [{"nombre": "...", "contenido": "..."}],
  "titularidad": [{"nombre": "...", "contenido": "..."}],
  "cargas": [{"nombre": "...", "contenido": "..."}],
  "otros": [{"nombre": "...", "contenido": "..."}],
  "fecha": "YYYY-MM-DD o null",
  "csv": "código CSV o null",
  "mapeados": {
    "cru": "Código Registral Único si existe",
    "idufirReg": "IDUFIR si existe",
    "fincaRegistral": "número de finca",
    "tomo": "tomo",
    "libro": "libro",
    "folio": "folio",
    "registroProvincia": "provincia del registro",
    "registroCiudad": "ciudad/número del registro (ej: Sevilla nº 1)",
    "registroNumero": "número de registro",
    "referenciaCatastral": "ref catastral si consta",
    "superficieConst": "superficie construida en m2, solo número",
    "superficieUtil": "superficie útil en m2, solo número",
    "tasacionOriginal": "tasación para subasta si consta, solo número",
    "juzgado": "juzgado del procedimiento de ejecución si consta",
    "numeroProcedimiento": "número del procedimiento de ejecución si consta",
    "procedimiento": "tipo de procedimiento: EJH, ETNJ, ETJ, PO, DESAHUCIO u OTRO"
  }
}

Reglas para las secciones:
- "registro": datos del registrador, dirección, fecha emisión, identificador solicitud
- "registral": finca nº, municipio registral, IDUFIR, CRU, referencia catastral
- "inmueble": descripción completa del inmueble, superficies, anejos, cuota
- "titularidad": todos los titulares con nombre, NIF, porcentaje, título adquisición
- "cargas": todas las cargas/hipotecas con acreedor, principal, intereses, procedimientos
- "otros": información de protección de datos omitida, solo datos relevantes adicionales

Para "mapeados", si un campo no existe en el documento usa null (no lo incluyas).
Para "fecha" usa la fecha de emisión de la nota en formato YYYY-MM-DD.`;

// En desarrollo usa Haiku (~10x más barato). En producción usa Sonnet.
// const CLAUDE_MODEL = process.env.NODE_ENV === 'production'
//   ? 'claude-sonnet-4-20250514'
//   : 'claude-haiku-4-5-20251001';

// const CLAUDE_MODEL = 'claude-haiku-4-5-20251001'; // ~$0.006 por nota en cualquier entorno
const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // ~$0.06 por nota en cualquier entorno
/**
 * Extrae datos de una nota simple PDF ya subida a UploadThing.
 * El PDF se descarga desde la URL pública de UploadThing y se envía a Claude.
 */
export async function extraerNotaSimpleAction(
  enrichmentId: number,
  pdfUrl: string
): Promise<{ success: boolean; data?: NotaSimpleExtraida; error?: string }> {
  const { session } = await requireAuth();
  if (!session) return { success: false, error: 'No autenticado' };

  try {
    // 1. Descargar el PDF desde UploadThing
    const pdfRes = await fetch(pdfUrl);
    if (!pdfRes.ok) throw new Error('No se pudo descargar el PDF');
    const pdfBuffer = await pdfRes.arrayBuffer();
    const base64 = Buffer.from(pdfBuffer).toString('base64');

    // 2. Llamar a Claude con el PDF
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64,
                },
              },
              { type: 'text', text: EXTRACTION_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      throw new Error(`Error API Claude: ${err}`);
    }

    const claudeData = await claudeRes.json();
    const rawText =
      claudeData.content
        ?.filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('') ?? '';

    // 3. Parsear JSON de respuesta
    const clean = rawText.replace(/```json\n?|```/g, '').trim();
    const extraida: NotaSimpleExtraida = JSON.parse(clean);

    // 4. Guardar en BD
    await enrichmentRepository.update(enrichmentId, {
      notaSimpleUrl: pdfUrl,
      notaSimpleFecha: extraida.fecha ?? undefined,
      notaSimpleCsv: extraida.csv ?? undefined,
      notaSimpleRegistro: extraida.registro,
      notaSimpleRegistral: extraida.registral,
      notaSimpleInmueble: extraida.inmueble,
      notaSimpleTitularidad: extraida.titularidad,
      notaSimpleCargas: extraida.cargas,
      notaSimpleOtros: extraida.otros,
      // También actualizar los campos mapeados directamente
      ...(extraida.mapeados.cru && { cru: extraida.mapeados.cru }),
      ...(extraida.mapeados.idufirReg && {
        idufirReg: extraida.mapeados.idufirReg,
      }),
      ...(extraida.mapeados.fincaRegistral && {
        fincaRegistral: extraida.mapeados.fincaRegistral,
      }),
      ...(extraida.mapeados.tomo && { tomo: extraida.mapeados.tomo }),
      ...(extraida.mapeados.libro && { libro: extraida.mapeados.libro }),
      ...(extraida.mapeados.folio && { folio: extraida.mapeados.folio }),
      ...(extraida.mapeados.registroProvincia && {
        registroProvincia: extraida.mapeados.registroProvincia,
      }),
      ...(extraida.mapeados.registroCiudad && {
        registroCiudad: extraida.mapeados.registroCiudad,
      }),
      ...(extraida.mapeados.registroNumero && {
        registroNumero: extraida.mapeados.registroNumero,
      }),
      ...(extraida.mapeados.referenciaCatastral && {
        referenciaCatastral: extraida.mapeados.referenciaCatastral,
      }),
      ...(extraida.mapeados.superficieConst && {
        superficieConst: extraida.mapeados.superficieConst,
      }),
      ...(extraida.mapeados.superficieUtil && {
        superficieUtil: extraida.mapeados.superficieUtil,
      }),
      ...(extraida.mapeados.tasacionOriginal && {
        tasacionOriginal: extraida.mapeados.tasacionOriginal,
      }),
      ...(extraida.mapeados.juzgado && { juzgado: extraida.mapeados.juzgado }),
      ...(extraida.mapeados.numeroProcedimiento && {
        numeroProcedimiento: extraida.mapeados.numeroProcedimiento,
      }),
      ...(extraida.mapeados.procedimiento && {
        procedimiento: extraida.mapeados.procedimiento,
      }),
    } as any);

    return { success: true, data: extraida };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido';
    return { success: false, error: msg };
  }
}
