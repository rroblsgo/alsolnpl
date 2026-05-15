/**
 * catastro.helper.ts
 *
 * Consulta los Web Services públicos del Catastro:
 *  - OVCCallejeroCodigos / Consulta_DNPRC_Codigos → datos descriptivos del inmueble
 *  - OVCCoordenadas / Consulta_CPMRC              → coordenadas (lat/lon) a partir de
 *                                                   Provincia + Municipio + RC
 *
 * No requieren autenticación.
 * Nota: Consulta_RCCOOR es el sentido INVERSO (coordenadas → RC), no sirve aquí.
 *       Consulta_CPMRC es el correcto: RC → coordenadas, usando cpro/cmun del primer WS.
 */

const WS_BASE = 'https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC';
const WS_DATOS  = `${WS_BASE}/OVCCallejeroCodigos.asmx/Consulta_DNPRC_Codigos`;
const WS_COORDS = `${WS_BASE}/OVCCoordenadas.asmx/Consulta_CPMRC`;

const CATASTRO_PDF_BASE =
  'https://www1.sedecatastro.gob.es/CYCBienInmueble/SECImprimirDatos.aspx';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CatastroInmueble {
  referenciaCatastral: string;
  tipoVia: string;
  nombreVia: string;
  numeroPortal: string;
  escalera: string;
  planta: string;
  puerta: string;
  municipio: string;
  provincia: string;
  codigoPostal: string;
  /** Dirección completa ya formateada por el Catastro (campo <ldt>) */
  direccionCompleta: string;
  clase: 'U' | 'R' | string;
  usoPrincipal: string;
  superficieConstruida: number | null;
  anoConstruccion: number | null;
}

export interface CatastroCoordenadas {
  lat: number;
  lon: number;
  googleMapsUrl: string;
}

export type CatastroResult =
  | { ok: true; inmueble: CatastroInmueble; pdfUrl: string; coords: CatastroCoordenadas | null }
  | { ok: false; error: string };

// ─── Parseo XML mínimo ────────────────────────────────────────────────────────

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([^<]*)<\/${name}>`, 'i'));
  return m ? m[1].trim() : '';
}

// ─── Coordenadas via Consulta_CPMRC ──────────────────────────────────────────
// Parámetros: SRS + Provincia (NOMBRE, <np>) + Municipio (NOMBRE, <nm>) + RC (14 chars)
// Respuesta:  <coordenadas><coord><geo><xcen>lon</xcen><ycen>lat</ycen></geo>

async function obtenerCoordenadas(
  rc: string,
  provincia: string,  // nombre de provincia, campo <np> del primer WS
  municipio: string,  // nombre de municipio, campo <nm> del primer WS
): Promise<CatastroCoordenadas | null> {
  try {
    const params = new URLSearchParams({
      SRS:       'EPSG:4326',
      Provincia:  provincia,
      Municipio:  municipio,
      // Consulta_CPMRC solo acepta RC de 14 posiciones (parcela, sin identificador de inmueble)
      RC:         rc.slice(0, 14),
    });
    const res = await fetch(`${WS_COORDS}?${params.toString()}`, {
      headers: { Accept: 'text/xml' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const xml = await res.text();

    // <xcen> = longitud,  <ycen> = latitud  (EPSG:4326)
    const xcen = parseFloat(tag(xml, 'xcen'));
    const ycen = parseFloat(tag(xml, 'ycen'));
    if (isNaN(xcen) || isNaN(ycen)) return null;

    return {
      lon: xcen,
      lat: ycen,
      googleMapsUrl: `https://www.google.com/maps?q=${ycen},${xcen}&z=18&t=k`,
    };
  } catch {
    return null;
  }
}

// ─── Consulta principal ───────────────────────────────────────────────────────

export async function consultarCatastroRC(
  referenciaCatastral: string
): Promise<CatastroResult> {
  const rc = referenciaCatastral.trim().toUpperCase();
  if (!rc) return { ok: false, error: 'La referencia catastral está vacía.' };

  // ── 1. Datos del inmueble ─────────────────────────────────────────────────
  let xml: string;
  try {
    const params = new URLSearchParams({
      CodigoProvincia: '',
      CodigoMunicipio: '',
      CodigoMunicipioINE: '',
      RC: rc,
    });
    const res = await fetch(`${WS_DATOS}?${params.toString()}`, {
      headers: { Accept: 'text/xml' },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, error: `El servicio del Catastro devolvió HTTP ${res.status}.` };
    xml = await res.text();
  } catch (e) {
    return { ok: false, error: `No se pudo conectar con el Catastro: ${String(e)}` };
  }

  // ── Errores del WS ────────────────────────────────────────────────────────
  const codError = tag(xml, 'cod');
  if (codError && codError !== '0') {
    return { ok: false, error: tag(xml, 'des') || `RC no encontrada (cod ${codError}).` };
  }

  // ── Códigos internos: <loine><cp> y <loine><cm> ───────────────────────────
  const del = tag(xml, 'cp');
  const mun = tag(xml, 'cm');
  if (!del || !mun) {
    return { ok: false, error: 'El Catastro no devolvió los códigos de provincia/municipio.' };
  }

  // ── 2. Coordenadas — ahora que tenemos del/mun, llamada paralela ──────────
  // Consulta_CPMRC usa nombres, no códigos
  const nombreProvincia = tag(xml, 'np');
  const nombreMunicipio = tag(xml, 'nm');
  const coords = await obtenerCoordenadas(rc, nombreProvincia, nombreMunicipio);

  // ── Resto de campos ───────────────────────────────────────────────────────
  const cn    = tag(xml, 'cn');
  const clase = cn === 'RU' ? 'R' : 'U';

  const tipoVia   = tag(xml, 'tv');
  const nombreVia = tag(xml, 'nv');
  const numero    = tag(xml, 'pnp');
  const escalera  = tag(xml, 'es');
  const planta    = tag(xml, 'pt');
  const puerta    = tag(xml, 'pu');
  const municipio = tag(xml, 'nm');
  const provincia = tag(xml, 'np');
  const cp        = tag(xml, 'dp');

  const ldt = tag(xml, 'ldt');
  const direccionCompleta = ldt || [
    tipoVia, nombreVia, numero,
    escalera ? `Es:${escalera}` : '',
    planta   ? `Pl:${planta}`   : '',
    puerta   ? `Pt:${puerta}`   : '',
  ].filter(Boolean).join(' ');

  const superfCons = parseFloat(tag(xml, 'sfc'));
  const ano        = parseInt(tag(xml, 'ant'), 10);

  const inmueble: CatastroInmueble = {
    referenciaCatastral: rc,
    tipoVia, nombreVia, numeroPortal: numero,
    escalera, planta, puerta,
    municipio, provincia, codigoPostal: cp,
    direccionCompleta, clase,
    usoPrincipal: tag(xml, 'luso'),
    superficieConstruida: isNaN(superfCons) ? null : superfCons,
    anoConstruccion: isNaN(ano) ? null : ano,
  };

  const pdfUrl = `${CATASTRO_PDF_BASE}?RefC=${rc}&del=${del}&mun=${mun}&UrbRus=${clase}&final=`;

  return { ok: true, inmueble, pdfUrl, coords };
}
