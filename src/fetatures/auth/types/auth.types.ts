import { auth } from '@/src/lib/auth';

/**
 * Tipo base inferido de better-auth, que incluye los additionalFields
 * (role, bio) como opcionales gracias a required: false en auth.ts.
 *
 * Este tipo es compatible con:
 *  - session.user  (mejor-auth, incluye role)
 *  - registros Drizzle de la tabla users (no incluyen role en la query join)
 *
 * Si en alguna query Drizzle necesitas el role, añade el campo explícitamente
 * en el select o usa el objeto de sesión del servidor.
 */
export type User = typeof auth.$Infer.Session.user;
