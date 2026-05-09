import { User } from 'better-auth';
import { SelectCommunity } from '../types/community.types';

export class CommunityPolicy {
  static isAdmin(user: User, community: SelectCommunity): boolean {
    return user.id === community.createdBy;
  }

  static canEdit(user: User, community: SelectCommunity): boolean {
    return this.isAdmin(user, community);
  }

  static canDelete(user: User, community: SelectCommunity): boolean {
    return this.isAdmin(user, community);
  }

  static canViewMembers(user: User, community: SelectCommunity): boolean {
    return this.isAdmin(user, community);
  }
}
