'use client';

import { useState } from 'react';
import { MeetiPermissions } from '../types/meeti.types';
import { toggleAttendance } from '../actions/attendance-actions';
import toast from 'react-hot-toast';

type Props = {
  meetiId: string;
  permissions: MeetiPermissions;
};
export default function AttendanceToggleButton({
  meetiId,
  permissions,
}: Props) {
  const [canConfirm, setCanConfirm] = useState(permissions.canConfirm);

  const handleClick = async () => {
    const result = await toggleAttendance(meetiId, canConfirm);
    if (result?.error) {
      toast.error(result.error);
    }

    if (result?.success) {
      toast.success(result.success);
      setCanConfirm(result.newPermissions.canConfirm);
    }
  };

  return (
    <button
      className={` ${canConfirm ? 'bg-orange-500' : 'bg-red-500'}  font-bold text-lg w-full lg:w-auto px-5 py-2 rounded text-white cursor-pointer`}
      onClick={handleClick}
    >
      {canConfirm ? 'Confirmar Asistencia' : 'Cancelar Asistencia'}
    </button>
  );
}
