import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '../db';
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
        required: false,
      },
    },
  },
  plugins: [nextCookies()], // siempre al final
});
