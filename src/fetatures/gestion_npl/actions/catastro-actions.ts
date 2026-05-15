'use server';

import { consultarCatastroRC, type CatastroResult } from '@/src/lib/catastro/catastro.helper';
import { requireAuth } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';

export async function getCatastroDataAction(
  referenciaCatastral: string
): Promise<CatastroResult> {
  return consultarCatastroRC(referenciaCatastral);
}

/** XML datos del inmueble — solo admin */
export async function debugCatastroXmlAction(
  referenciaCatastral: string
): Promise<{ xml: string } | { error: string }> {
  const { session } = await requireAuth();
  if (session?.user?.role !== ROLES.ADMIN) return { error: 'Acceso restringido a administradores.' };

  const rc = referenciaCatastral.trim().toUpperCase();
  const params = new URLSearchParams({ CodigoProvincia: '', CodigoMunicipio: '', CodigoMunicipioINE: '', RC: rc });
  const url = `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejeroCodigos.asmx/Consulta_DNPRC_Codigos?${params.toString()}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'text/xml' }, cache: 'no-store' });
    return { xml: await res.text() };
  } catch (e) { return { error: String(e) }; }
}

/** XML coordenadas (Consulta_CPMRC) — solo admin */
export async function debugCatastroRccoorAction(
  referenciaCatastral: string
): Promise<{ xml: string; url: string } | { error: string }> {
  const { session } = await requireAuth();
  if (session?.user?.role !== ROLES.ADMIN) return { error: 'Acceso restringido a administradores.' };

  const rc = referenciaCatastral.trim().toUpperCase();

  // Primero obtenemos cpro/cmun del WS de datos
  const datosParams = new URLSearchParams({ CodigoProvincia: '', CodigoMunicipio: '', CodigoMunicipioINE: '', RC: rc });
  const datosRes = await fetch(
    `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejeroCodigos.asmx/Consulta_DNPRC_Codigos?${datosParams.toString()}`,
    { headers: { Accept: 'text/xml' }, cache: 'no-store' }
  );
  const datosXml = await datosRes.text();
  const tagVal = (name: string) => datosXml.match(new RegExp(`<${name}[^>]*>([^<]*)<\/${name}>`, 'i'))?.[1].trim() ?? '';
  // Consulta_CPMRC requiere NOMBRES (np=provincia, nm=municipio), no códigos numéricos
  const np = tagVal('np');
  const nm = tagVal('nm');

  const params = new URLSearchParams({ SRS: 'EPSG:4326', Provincia: np, Municipio: nm, RC: rc.slice(0, 14) });
  const url = `https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_CPMRC?${params.toString()}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'text/xml' }, cache: 'no-store' });
    return { xml: await res.text(), url };
  } catch (e) { return { error: String(e) }; }
}
