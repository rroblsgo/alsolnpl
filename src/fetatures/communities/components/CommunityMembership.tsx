'use client';

import { useState } from 'react';
import { CommunityPermissions } from '../types/community.types';
import { toggleMembershipAction } from '../actions/membership-actions';
import toast from 'react-hot-toast';

type Props = {
  permissions: CommunityPermissions;
  communityId: string;
};

export default function CommunityMembership({
  permissions,
  communityId,
}: Props) {
  const [canJoin, setCanJoin] = useState(permissions.canJoin);

  const handleClick = async () => {
    const result = await toggleMembershipAction(communityId);
    if (result?.success) {
      toast.success(result.message);
      setCanJoin(result.newPermissions.canJoin);
    } else {
      alert('Hubo un error al actualizar tu membresía');
    }
  };

  return (
    <>
      <button
        className={` ${canJoin ? 'bg-orange-500' : 'bg-red-500'}  font-bold text-lg w-full lg:w-auto px-5 py-2 rounded text-white cursor-pointer`}
        onClick={handleClick}
      >
        {canJoin ? 'Unirme a la Comunidad' : 'Abandonar la Comunidad'}
      </button>
    </>
  );
}
