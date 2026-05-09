import { User } from 'better-auth';
import { SelectNpl } from '../types/npl.types';

// OFFICE MODE: todos los usuarios autenticados tienen acceso completo.
// TODO (roles): cuando se implementen roles (admin, legal, comercial…),
// sustituir los `return true` por comprobaciones sobre `user.role`.
export class NplPolicy {
  static canView(_user: User, _npl: SelectNpl): boolean {
    return true;
  }

  static canEdit(_user: User, _npl: SelectNpl): boolean {
    return true;
  }

  static canDelete(_user: User, _npl: SelectNpl): boolean {
    return true;
  }

  static canChangeEstado(_user: User, _npl: SelectNpl): boolean {
    return true;
  }

  static canTogglePublico(_user: User, _npl: SelectNpl): boolean {
    return true;
  }
}
