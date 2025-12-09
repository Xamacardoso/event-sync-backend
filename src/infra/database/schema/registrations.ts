import { pgTable, uuid, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';
import { checkinMethodEnum, registrationStatusEnum } from './enums';

export const registrations = pgTable('registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  status: registrationStatusEnum('status').default('pending'),
  
  registrationDate: timestamp('timestamp_registration').defaultNow(),
  paymentDate: timestamp('timestamp_payment'),
  
  checkinsCount: integer('checkins_count').default(0),
  certificateIssued: boolean('certificate_issued').default(false),
});

export const checkins = pgTable('checkins', {
  id: uuid('id').defaultRandom().primaryKey(),
  registrationId: uuid('registration_id').references(() => registrations.id).notNull(),
  timestamp: timestamp('timestamp_checkin').defaultNow(),
  method: checkinMethodEnum('method').notNull(),
});