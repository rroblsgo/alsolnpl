import { requireNplAccess } from '@/src/lib/auth-server';

/**
 * Layout de la zona /npl — Capa 2 de protección.
 *
 * requireNplAccess() valida sesión + role contra la DB.
 * Roles permitidos: admin, legal, comercial, ver_only, cliente, agente.
 * Role 'user' (sin asignar) → redirige a /unauthorized.
 * Sin sesión → redirige a /auth/login?next=/npl.
 *
 * Este layout envuelve tanto /npl (listado) como /npl/[id] (detalle).
 * No necesita UI propia: hereda el Header/Footer del PublicLayout padre.
 */
export default async function NplLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validación segura: sesión real + role en NPL_ROLES
  await requireNplAccess();

  return <>{children}</>;
}
