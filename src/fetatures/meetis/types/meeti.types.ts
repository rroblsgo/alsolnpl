import {
  category,
  meeti,
  meetiLocations,
  meetiAttendees,
} from '@/src/db/schema';
import { SelectCommunity } from '../../communities/types/community.types';
import { User } from 'better-auth';

export type SelectCategory = typeof category.$inferSelect;

export type InsertBasicMeeti = typeof meeti.$inferInsert;
export type InsertMeetiLocation = typeof meetiLocations.$inferInsert;

export type SelectBasicMeeti = typeof meeti.$inferSelect;
export type SelectMeetiLocation = typeof meetiLocations.$inferSelect;

export type InsertMeeti = InsertBasicMeeti & {
  location?: Omit<InsertMeetiLocation, 'meetiId' | 'id'>;
};

export type SelectMeeti = SelectBasicMeeti & {
  location?: SelectMeetiLocation | null;
};

export type FullMeeti = SelectBasicMeeti & {
  location?: SelectMeetiLocation | null;
  category: SelectCategory;
  community: SelectCommunity;
  admin: User;
};

export type MeetiPermissions = {
  canConfirm: boolean;
  canCancel: boolean;
};

export type SelectMeetiAttendee = typeof meetiAttendees.$inferSelect;
export type SelectMeetiAttendeeWithUser = SelectMeetiAttendee & {
  user: {
    id: User['id'];
    name: User['name'];
    email: User['email'];
  };
};
