import { auth } from '@/lib/auth';
import {
  ForgotPasswordInput,
  SetPasswordInput,
  SignInInput,
  SignUpInput,
} from '../schemas/authSchema';
import { authRepository, IAuthRepository } from './AuthRepository';
import { headers } from 'next/headers';
import { APIError } from 'better-auth';
import { ChangePasswordInput } from '../schemas/authSchema';
import { checkPassword } from '@/src/shared/utils/auth';

class AuthService {
  constructor(private authRepository: IAuthRepository) {}
  async register(credentials: SignUpInput) {
    const { name, email, password } = credentials;

    // revisar si el usuario existe
    const user = await this.authRepository.userExists(email);
    if (user) {
      return {
        error: 'Este E-mail ya está registrado',
        success: '',
      };
    }

    // gestionar el registro
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        callbackURL: '/dashboard',
      },
      headers: await headers(),
    });
    return {
      error: '',
      success: 'Cuenta creada correctamente. Revisa tu E-mail',
    };
  }

  async login(credentials: SignInInput) {
    const { email, password } = credentials;

    // revisar si el usuario existe
    const user = await this.authRepository.userExists(email);
    if (!user) {
      return {
        error: 'El usuario no existe',
        success: '',
      };
    }
    // verificar el password y si confirmó su cuenta
    try {
      await auth.api.signInEmail({
        body: {
          email,
          password,
          callbackURL: '/dashboard',
        },
        headers: await headers(),
      });
      return {
        error: '',
        success: 'Sesión iniciada correctamente',
      };
    } catch (error) {
      if (error instanceof APIError) {
        const messages: Record<number, string> = {
          401: 'Password incorrecto',
          403: 'Tu cuenta no ha sido verificada. Hemos enviado un email',
        };
        const errorMessage = messages[error.statusCode];
        if (errorMessage) {
          return {
            error: errorMessage,
            success: '',
          };
        }
      }
    }
    return {
      error: '',
      success: '',
    };
  }

  async requestPasswordReset(input: ForgotPasswordInput) {
    // revisar si el usuario existe
    const user = await this.authRepository.userExists(input.email);
    if (!user) {
      return {
        error: 'El usuario no existe',
        success: '',
      };
    }

    const { email } = input;
    await auth.api.requestPasswordReset({
      body: {
        email,
      },
    });

    return {
      error: '',
      success: 'Hemos enviado un email con instrucciones',
    };
  }

  async confirmPasswordReset(input: SetPasswordInput, token: string) {
    const { newPassword } = input;
    try {
      await auth.api.resetPassword({
        body: {
          newPassword,
          token,
        },
      });
      return {
        error: '',
        success: 'Password reestablecido correctamente',
      };
    } catch (error) {
      if (error instanceof APIError) {
        return {
          error: 'Token no válido o expirado',
          success: '',
        };
      }
    }
    return {
      error: '',
      success: '',
    };
  }
  async changePassword(input: ChangePasswordInput) {
    const { newPassword, currentPassword, revokeOtherSessions } = input;

    const isValid = await checkPassword(currentPassword);
    if (!isValid) {
      return {
        error: 'El password actual es incorrecto',
        success: '',
      };
    }
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: await headers(),
    });

    if (revokeOtherSessions) {
      await auth.api.revokeOtherSessions({
        headers: await headers(),
      });
    }
    return {
      error: '',
      success: 'El password se actualizó correctamente',
    };
  }

  async getSessions() {
    return await auth.api.listSessions({
      headers: await headers(),
    });
  }

  async getSession() {
    return await auth.api.getSession({
      headers: await headers(),
    });
  }
}

export const authService = new AuthService(authRepository);
