import type { User } from 'better-auth';
import { ROLES } from '@/src/lib/roles';
import type { SelectFondo } from '../types/fondo.types';

export class FondoPolicy {
  private static isAdmin(user: User): boolean {
    return (user as User & { role?: string }).role === ROLES.ADMIN;
  }

  static canView(_user: User, _fondo: SelectFondo): boolean {
    // Cualquier usuario interno puede ver el detalle de un fondo
    return true;
  }

  static canEdit(user: User, _fondo: SelectFondo): boolean {
    return this.isAdmin(user);
  }

  static canDelete(user: User, _fondo: SelectFondo): boolean {
    return this.isAdmin(user);
  }
}
