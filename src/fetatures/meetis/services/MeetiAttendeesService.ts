import { User } from 'better-auth';
import { IMeetiRepository, meetiRepository } from './MeetiRepository';
import {
  IMeetiAttendeesRepository,
  meetiAttendeesRepository,
} from './MeetiAttendeesRepository';
import { MeetiAttendeePolicy } from '../policies/MeetiAttendeePolicy';

class MeetiAttendeesService {
  constructor(
    private meetiAttendeesRepository: IMeetiAttendeesRepository,
    private meetiRepository: IMeetiRepository
  ) {}

  async toggleAttendance(meetiId: string, user: User) {
    const meeti = await this.meetiRepository.findById(meetiId);
    if (!meeti) throw new Error('Meeti no encontrado');

    const isAttending = await this.meetiAttendeesRepository.isUserAttending(
      user.id,
      meetiId
    );

    if (MeetiAttendeePolicy.canConfirm(user, meeti, isAttending)) {
      await this.meetiAttendeesRepository.insert(user.id, meeti.id);
      return {
        success: `Confirmaste tu asistencia al Meeti: ${meeti.title}`,
        error: '',
        newPermissions: {
          canConfirm: false,
          canCancel: true,
        },
      };
    }

    if (MeetiAttendeePolicy.canCancel(user, meeti, isAttending)) {
      await this.meetiAttendeesRepository.remove(user.id, meeti.id);
      return {
        success: `Cancelaste tu asistencia al Meeti: ${meeti.title}`,
        error: '',
        newPermissions: {
          canConfirm: true,
          canCancel: false,
        },
      };
    }
  }
}

export const meetiAttendeesService = new MeetiAttendeesService(
  meetiAttendeesRepository,
  meetiRepository
);
