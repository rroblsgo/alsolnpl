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
import { requireAuth } from '@/src/lib/auth-server';

export async function signUpAction(input: SignUpInput) {
  const data = SignUpSchema.safeParse(input);
  if (!data.success) {
    return {
      error: 'Hubo un error',
      success: '',
    };
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
    return {
      error: 'Hubo un error',
      success: '',
    };
  }
  const response = await authService.login(data.data);
  return response;
}

export async function forgotPasswordAction(input: ForgotPasswordInput) {
  const data = ForgotPasswordSchema.safeParse(input);
  if (!data.success) {
    return {
      error: 'Hubo un error',
      success: '',
    };
  }
  const response = await authService.requestPasswordReset(data.data);
  return response;
}

export async function setPasswordAction(
  input: SetPasswordInput,
  token: string
) {
  const data = SetPasswordSchema.safeParse(input);
  if (!data.success) {
    return {
      error: 'Hubo un error',
      success: '',
    };
  }
  const response = await authService.confirmPasswordReset(data.data, token);
  return response;
}

export async function changePasswordAction(input: ChangePasswordInput) {
  const { session } = await requireAuth();
  const data = ChangePasswordSchema.safeParse(input);
  if (!session || !data.success || !data.data) {
    return {
      error: 'Hubo un error',
      success: '',
    };
  }

  const result = await authService.changePassword(data.data);
  return result;
}
