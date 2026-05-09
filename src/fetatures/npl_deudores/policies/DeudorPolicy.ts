import { User } from 'better-auth';
import { SelectNpl } from '@/src/fetatures/gestion_npl/types/npl.types';

// OFFICE MODE: todos los usuarios autenticados tienen acceso completo.
// TODO (roles): cuando se implementen roles (admin, legal, comercial…),
// sustituir los `return true` por comprobaciones sobre `user.role`.
export class DeudorPolicy {
  static canCreate(_user: User, _npl: SelectNpl): boolean {
    return true;
  }

  static canEdit(_user: User, _npl: SelectNpl): boolean {
    return true;
  }

  static canDelete(_user: User, _npl: SelectNpl): boolean {
    return true;
  }
}
