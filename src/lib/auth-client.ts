import { createAuthClient } from 'better-auth/react';

// API correcta para better-auth v1.x: sin genérico.
// useSession viene del cliente creado aquí, no de 'better-auth/react' directamente.
export const {
  signOut,
  useSession,
  revokeSession,
} = createAuthClient();

// ── Tipo extendido con role ───────────────────────────────────────────────────

type SessionUserWithRole = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  bio?: string | null;
  role?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Wrapper de useSession con el campo role tipado.
 * Úsalo en cualquier Client Component que necesite session.user.role.
 */
export function useSessionWithRole() {
  const result = useSession();
  return {
    ...result,
    data: result.data
      ? {
          ...result.data,
          user: result.data.user as SessionUserWithRole,
        }
      : null,
  };
}
