import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import {
  type AppRole,
  DASHBOARD_ROLES,
  NPL_ROLES,
  canAccessDashboard,
  canAccessNpl,
} from './roles';

// ── Sesión básica ─────────────────────────────────────────────────────────────

/**
 * Obtiene la sesión del servidor.
 * El objeto session.user incluye el campo `role` gracias a additionalFields.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// ── requireAuth ───────────────────────────────────────────────────────────────

/**
 * Comprueba si hay sesión activa.
 * No valida roles; úsalo en páginas públicas que necesitan saber si hay usuario.
 */
export async function requireAuth() {
  const session = await getServerSession();
  return {
    session,
    isAuth: !!session,
  };
}

// ── requireDashboard ──────────────────────────────────────────────────────────

/**
 * Protección SEGURA para rutas /dashboard/*.
 * Valida sesión + role contra la DB (no solo cookie).
 * Usar en dashboard/layout.tsx y en Server Actions sensibles.
 *
 * - Sin sesión      → redirige a /auth/login
 * - Role insuficiente → redirige a /unauthorized
 */
export async function requireDashboard() {
  const session = await getServerSession();

  if (!session) redirect('/auth/login');

  if (!canAccessDashboard(session.user.role)) {
    redirect('/unauthorized');
  }

  return session;
}

// ── requireNplAccess ──────────────────────────────────────────────────────────

/**
 * Protección SEGURA para rutas /npl/* (zona semipública).
 * Valida sesión + role contra la DB.
 *
 * - Sin sesión      → redirige a /auth/login?next=/npl
 * - Role insuficiente → redirige a /unauthorized
 */
export async function requireNplAccess() {
  const session = await getServerSession();

  if (!session) redirect('/auth/login?next=/npl');

  if (!canAccessNpl(session.user.role)) {
    redirect('/unauthorized');
  }

  return session;
}

// ── requireRole ───────────────────────────────────────────────────────────────

/**
 * Comprobación granular para roles específicos dentro del dashboard.
 * Usar en pages/actions que requieren un subconjunto de roles.
 *
 * @example
 *   const session = await requireRole([ROLES.ADMIN, ROLES.LEGAL]);
 */
export async function requireRole(roles: AppRole[]) {
  const session = await getServerSession();

  if (!session) redirect('/auth/login');

  const userRole = session.user.role as AppRole | undefined;
  if (!userRole || !roles.includes(userRole)) {
    redirect('/unauthorized');
  }

  return session;
}
