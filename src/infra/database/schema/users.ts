import { pgTable, uuid, text, boolean, real, timestamp } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  city: text('city'),
  photoUrl: text('photo_url'),

  visibilityParticipation: boolean('visibility_participation').default(true),
  organizerRating: real('organizer_rating').default(0),
  
  role: userRoleEnum('role').default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});