import {
  category,
  meeti,
  meetiLocations,
  meetiAttendees,
} from '@/src/db/schema';
import { SelectCommunity } from '../../communities/types/community.types';

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

/**
 * Tipo del admin tal como lo devuelve Drizzle en el join.
 * Drizzle infiere los campos de la tabla users pero NO incluye
 * additionalFields de better-auth (role, bio) a menos que estén
 * explícitamente en el schema Drizzle.
 * Usamos Pick con los campos reales del schema para ser precisos.
 */
export type MeetiAdmin = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FullMeeti = SelectBasicMeeti & {
  location?: SelectMeetiLocation | null;
  category: SelectCategory;
  community: SelectCommunity;
  admin: MeetiAdmin;
};

export type MeetiPermissions = {
  canConfirm: boolean;
  canCancel: boolean;
};

export type SelectMeetiAttendee = typeof meetiAttendees.$inferSelect;
export type SelectMeetiAttendeeWithUser = SelectMeetiAttendee & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};
