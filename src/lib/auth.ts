import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '../db';
import { users } from '../db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { AuthEmailService } from '../emails/services/AuthEmailService';

export const auth = betterAuth({
  trustedOrigins: ['http://102.168.1.50:3000'],
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { name, email } = user;
      await AuthEmailService.sendPasswordResetToken({ name, email, url });
    },
  },
  emailVerification: {
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { name, email } = user;
      await AuthEmailService.sendVerificationEmail({ name, email, url });
    },
  },
  user: {
    additionalFields: {
      bio: {
        type: 'string',
        required: false,   // opcional → string | null | undefined en el tipo inferido
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },

    },
  },
  databaseHooks: {
    session: {
      create: {
        // Se ejecuta tras crear cualquier sesión nueva (= sign-in exitoso).
        // Cubre todos los roles: admin, legal, comercial, ver_only, cliente, agente, user.
        after: async (session) => {
          db.update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, session.userId))
            .execute()
            .catch(() => {}); // fire-and-forget — no crítico
        },
      },
    },
  },
  plugins: [nextCookies()], // siempre al final
});
