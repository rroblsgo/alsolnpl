import { User } from 'better-auth';
import { MeetiPolicy } from './MeetiPolicy';
import { SelectMeeti } from '../types/meeti.types';

export class MeetiAttendeePolicy {
  /**
   * Puede confirmar asistencia
   */
  static canConfirm(
    user: User,
    meeti: SelectMeeti,
    isAttending: boolean
  ): boolean {
    // No puede confirmar si:
    // - El evento ya pasó
    // - Es el admin/owner
    // - Ya está asistiendo
    if (MeetiPolicy.isPastMeeti(meeti)) return false;
    if (MeetiPolicy.isAdmin(user, meeti)) return false;
    if (isAttending) return false;

    return true;
  }

  /**
   * Puede cancelar asistencia
   */
  static canCancel(
    user: User,
    meeti: SelectMeeti,
    isAttending: boolean
  ): boolean {
    // No puede cancelar si:
    // - El evento ya pasó
    // - Es el admin/owner
    // - No está asistiendo
    if (MeetiPolicy.isPastMeeti(meeti)) return false;
    if (MeetiPolicy.isAdmin(user, meeti)) return false;
    if (!isAttending) return false;

    return true;
  }
}
