import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';
import { events } from './events';
import { friendshipStatusEnum } from './enums';

// Amizade
export const friendships = pgTable('friendships', {
  id: uuid('id').defaultRandom().primaryKey(),
  requesterId: uuid('requester_id').references(() => users.id).notNull(),
  recipientId: uuid('recipient_id').references(() => users.id).notNull(),
  status: friendshipStatusEnum('status').default('pending'),
  timestamp: timestamp('timestamp_friendship').defaultNow(),
});

// Mensagem
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  recipientId: uuid('recipient_id').references(() => users.id).notNull(),
  type: text('type').default('text'),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url'),
  timestamp: timestamp('timestamp_message').defaultNow(),
});

// Avaliação
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  timestamp: timestamp('timestamp_review').defaultNow(),
});

// Certificado
export const certificates = pgTable('certificates', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').references(() => events.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  pdfUrl: text('pdf_url').notNull(),
  issueDate: timestamp('issue_date').defaultNow(),
  validationCode: text('validation_code').notNull(),
});