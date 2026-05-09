import { User } from 'better-auth';
import { SelectCliente } from '../types/cliente.types';

// OFFICE MODE: todos los usuarios autenticados tienen acceso completo.
// TODO (roles): cuando se implementen roles (admin, legal, comercial…),
// sustituir los `return true` por comprobaciones sobre `user.role`.
export class ClientePolicy {
  static canView(_user: User, _cliente: SelectCliente): boolean {
    return true;
  }
  static canEdit(_user: User, _cliente: SelectCliente): boolean {
    return true;
  }
  static canDelete(_user: User, _cliente: SelectCliente): boolean {
    return true;
  }
}
