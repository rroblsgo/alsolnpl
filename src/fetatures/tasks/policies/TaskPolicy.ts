import { User } from 'better-auth';
import { SelectTask } from '../types/task.types';

// OFFICE MODE: todos los usuarios autenticados tienen acceso completo.
// TODO (roles): cuando se implementen roles (admin, legal, comercial…),
// sustituir los `return true` por comprobaciones sobre `user.role`.
export class TaskPolicy {
  static canView(_user: User, _task: SelectTask) {
    return true;
  }

  static canEdit(_user: User, _task: SelectTask) {
    return true;
  }

  static canDelete(_user: User, _task: SelectTask) {
    return true;
  }

  static canChangeStatus(_user: User, _task: SelectTask) {
    return true;
  }
}
