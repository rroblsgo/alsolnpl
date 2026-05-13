/**
 * proxy.ts  —  AlsolNPL · Capa 1 de protección de rutas
 *
 * ARQUITECTURA EN DOS CAPAS:
 *
 *  Capa 1 (este fichero): comprobación ligera de cookie de sesión.
 *    → Redirige rápido si no hay sesión. No valida roles (no hace DB query).
 *    → Evita renderizado innecesario de páginas protegidas.
 *
 *  Capa 2 (layouts): requireDashboard() / requireNplAccess() en layout.tsx.
 *    → Valida sesión real + role contra la DB.
 *    → Es la barrera de seguridad real; no puede saltarse con una cookie falsa.
 *
 * RUNTIME: Node.js (Next.js 16 proxy corre siempre en Node.js).
 *
 * NOTA SOBRE ROLES EN EL PROXY:
 *   getSessionCookie solo confirma que existe la cookie, no su contenido ni
 *   roles. La comprobación de roles se hace SIEMPRE en la Capa 2.
 *   No intentar leer roles aquí: requeriría una DB query que pertenece al layout.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Siempre dejar pasar las rutas de auth y API ────────────────────────
  // Imprescindible: si bloqueamos /api/auth/* better-auth no puede funcionar.
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // ── 2. Comprobar existencia de cookie de sesión ───────────────────────────
  const session = getSessionCookie(request);

  // ── 3. /dashboard/* → requiere sesión ────────────────────────────────────
  // La validación real de role la hace requireDashboard() en app/dashboard/layout.tsx
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── 4. /npl/* → requiere sesión ──────────────────────────────────────────
  // La validación real de role la hace requireNplAccess() en app/(public)/npl/layout.tsx
  if (pathname.startsWith('/npl')) {
    if (!session) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── 5. Resto de rutas → libre ─────────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Ejecutar el proxy en todas las rutas excepto:
     * - _next/static  (ficheros estáticos)
     * - _next/image   (optimización de imágenes)
     * - favicon.ico, robots.txt, sitemap.xml
     * - archivos con extensión (imágenes, fuentes, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
