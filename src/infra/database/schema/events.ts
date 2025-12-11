import { pgTable, uuid, text, timestamp, real, boolean, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { eventStatusEnum, eventTypeEnum } from './enums';

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizerId: uuid('organizer_id').references(() => users.id).notNull(),
  
  title: text('title').notNull(),
  description: text('description').notNull(),
  localAddress: text('local_address'),
  localUrl: text('local_url'),
  
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  
  price: real('price').default(0.0),
  type: eventTypeEnum('type').default('free'),
  
  requiresApproval: boolean('requires_approval').default(false),
  registrationStart: timestamp('registration_start'),
  registrationEnd: timestamp('registration_end'),

  maxAttendees: integer('max_attendees'),
  allowedCheckins: integer('allowed_checkins').default(1),
  
  status: eventStatusEnum('status').default('draft'),
  bannerUrl: text('banner_url'),
  workloadHours: integer('workload_hours').default(0),

  createdAt: timestamp('created_at').defaultNow(),
});