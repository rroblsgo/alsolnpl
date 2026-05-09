import z from 'zod';

export const BaseAuthSchema = z.object({
  name: z.string().trim().min(1, { error: 'Name es requerido' }),
  email: z.email({ error: 'El E-mail no es válido' }),
  password: z
    .string()
    .trim()
    .min(8, { error: 'El password debe tener mínimo 8 caracteres' }),
  passwordConfirm: z
    .string()
    .trim()
    .min(1, { error: 'El password de confirmación es requerido' }),
  newPassword: z
    .string()
    .trim()
    .min(8, { error: 'El password debe tener mínimo 8 caracteres' }),
  currentPassword: z
    .string()
    .trim()
    .min(1, { error: 'El password no puede estar vacío' }),
});

export const SignInSchema = BaseAuthSchema.pick({
  email: true,
}).extend({
  password: z.string().trim().min(1, { error: 'El password es requerido' }),
});

export const SignUpSchema = BaseAuthSchema.pick({
  name: true,
  email: true,
  password: true,
  passwordConfirm: true,
}).refine((data) => data.password === data.passwordConfirm, {
  error: 'Los passwords no coinciden',
  path: ['passwordConfirm'],
});

export const ForgotPasswordSchema = BaseAuthSchema.pick({
  email: true,
});

export const SetPasswordSchema = BaseAuthSchema.pick({
  newPassword: true,
  passwordConfirm: true,
}).refine((data) => data.newPassword === data.passwordConfirm, {
  error: 'Los passwords no coinciden',
  path: ['passwordConfirm'],
});

export const CheckPasswordSchema = z.object({
  password: z.string().min(1, { error: 'El password es requerido' }),
});

export const ChangePasswordSchema = BaseAuthSchema.pick({
  currentPassword: true,
  newPassword: true,
  passwordConfirm: true,
})
  .extend({
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.passwordConfirm, {
    error: 'Los passwords no son iguales',
    path: ['passwordConfirm'],
  });

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type SetPasswordInput = z.infer<typeof SetPasswordSchema>;
export type CheckPasswordInput = z.infer<typeof CheckPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
