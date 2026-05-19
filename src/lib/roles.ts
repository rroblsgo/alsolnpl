// ─────────────────────────────────────────────────────────────────────────────
// src/lib/roles.ts
//
// Fuente única de verdad para roles y reglas de acceso de AlsolNPL.
// Importar desde aquí en proxy.ts, auth-server.ts, layouts y componentes.
// ─────────────────────────────────────────────────────────────────────────────

// ── Definición de roles ───────────────────────────────────────────────────────

export const ROLES = {
  // Usuarios internos — acceso a /dashboard
  ADMIN: 'admin',
  LEGAL: 'legal',
  COMERCIAL: 'comercial',
  VER_ONLY: 'ver_only',
  // Usuarios externos — acceso a /npl
  CLIENTE: 'cliente',
  AGENTE: 'agente',
  // Fallback better-auth — sin acceso a ninguna zona protegida
  USER: 'user',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

// ── Grupos de acceso ──────────────────────────────────────────────────────────

/**
 * Roles con acceso completo al dashboard (/dashboard/*).
 * Solo usuarios internos de Alsol Inmobiliaria.
 */
export const DASHBOARD_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.LEGAL,
  ROLES.COMERCIAL,
  ROLES.VER_ONLY,
];

/**
 * Roles con acceso a la zona semipública de activos (/npl/*).
 * Usuarios internos + clientes y agentes externos autenticados.
 */
export const NPL_ROLES: AppRole[] = [
  ...DASHBOARD_ROLES,
  ROLES.CLIENTE,
  ROLES.AGENTE,
];

/**
 * Roles con acceso de LECTURA a operaciones de fondos/carteras.
 * Todos los usuarios internos del dashboard.
 */
export const FONDOS_READ_ROLES: AppRole[] = [
  ROLES.ADMIN,
  ROLES.LEGAL,
  ROLES.COMERCIAL,
  ROLES.VER_ONLY,
];

/**
 * Roles con acceso de ESCRITURA a fondos y carteras (crear, editar, eliminar).
 * Solo administradores.
 */
export const FONDOS_WRITE_ROLES: AppRole[] = [ROLES.ADMIN];

// ── Funciones de comprobación ─────────────────────────────────────────────────

/** El usuario tiene alguno de los roles indicados */
export function hasRole(
  userRole: string | null | undefined,
  roles: AppRole[]
): boolean {
  if (!userRole) return false;
  return roles.includes(userRole as AppRole);
}

/** El usuario puede acceder al dashboard */
export function canAccessDashboard(role: string | null | undefined): boolean {
  return hasRole(role, DASHBOARD_ROLES);
}

/** El usuario puede acceder a la zona /npl */
export function canAccessNpl(role: string | null | undefined): boolean {
  return hasRole(role, NPL_ROLES);
}

// ── Etiquetas legibles para UI ────────────────────────────────────────────────

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  legal: 'Legal',
  comercial: 'Comercial',
  ver_only: 'Solo lectura',
  cliente: 'Cliente',
  agente: 'Agente',
  user: 'Usuario',
};
