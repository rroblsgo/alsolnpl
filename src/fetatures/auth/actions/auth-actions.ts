'use server';

import { getClientIp } from '@/src/shared/utils/ip';
import {
  ChangePasswordInput,
  ChangePasswordSchema,
  ForgotPasswordInput,
  ForgotPasswordSchema,
  SetPasswordInput,
  SetPasswordSchema,
  SignInInput,
  SignInSchema,
  SignUpInput,
  SignUpSchema,
} from '../schemas/authSchema';
import { authService } from '../services/AuthService';
import { rateLimit } from '@/src/lib/limiter';
import { getMinutesDiffFromNow } from '@/src/shared/utils/date';
import { requireRole } from '@/src/lib/auth-server';
import { ROLES } from '@/src/lib/roles';

/**
 * signUpAction — solo ejecutable por usuarios con role 'admin'.
 * requireRole redirige a /unauthorized si el role no es suficiente,
 * pero también devolvemos error en la validación por si se llamara
 * directamente desde un cliente malicioso sin pasar por la page.
 */
export async function signUpAction(input: SignUpInput) {
  // Validación de role en el servidor — barrera real de seguridad
  await requireRole([ROLES.ADMIN]);

  const data = SignUpSchema.safeParse(input);
  if (!data.success) {
    return { error: 'Datos inválidos', success: '' };
  }

  const response = await authService.register(data.data);
  return response;
}

export async function signInAction(input: SignInInput) {
  const ip = await getClientIp();
  const { success, reset } = await rateLimit.limit(ip);

  if (!success) {
    return {
      error: `Límite alcanzado. Intenta de nuevo en ${getMinutesDiffFromNow(reset)} minutos.`,
      success: '',
    };
  }

  const data = SignInSchema.safeParse(input);
  if (!data.success) {
    return { error: 'Hubo un error', success: '' };
  }

  const response = await authService.login(data.data);
  return response;
}

export async function forgotPasswordAction(input: ForgotPasswordInput) {
  const data = ForgotPasswordSchema.safeParse(input);
  if (!data.success) {
    return { error: 'Hubo un error', success: '' };
  }
  return authService.requestPasswordReset(data.data);
}

export async function setPasswordAction(input: SetPasswordInput, token: string) {
  const data = SetPasswordSchema.safeParse(input);
  if (!data.success) {
    return { error: 'Hubo un error', success: '' };
  }
  return authService.confirmPasswordReset(data.data, token);
}

export async function changePasswordAction(input: ChangePasswordInput) {
  const session = await requireRole([
    ROLES.ADMIN, ROLES.LEGAL, ROLES.COMERCIAL, ROLES.VER_ONLY,
  ]);
  const data = ChangePasswordSchema.safeParse(input);
  if (!session || !data.success || !data.data) {
    return { error: 'Hubo un error', success: '' };
  }
  return authService.changePassword(data.data);
}
