import Link from 'next/link';
import { CommunityPermissions } from '../types/community.types';
import CommunityMembership from './CommunityMembership';

type Props = {
  permissions: CommunityPermissions;
  communityId: string;
};

export default function CommunityActionsPanel({
  permissions,
  communityId,
}: Props) {
  return (
    <div className="flex justify-end">
      {permissions.canEdit && (
        <Link
          href={`/dashboard/communities/${communityId}/edit`}
          className="rounded font-bold text-lg bg-orange-600 px-5 py-2 text-white"
          target="_blank"
        >
          Editar Comunidad
        </Link>
      )}
      {permissions.canJoin || permissions.canLeave ? (
        <CommunityMembership
          permissions={permissions}
          communityId={communityId}
        />
      ) : null}
    </div>
  );
}
