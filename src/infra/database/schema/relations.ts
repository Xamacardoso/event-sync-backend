/** Esse arquivo serve para facilitar a buscas com entidades que se relacionam */

import { relations } from "drizzle-orm";
import { users } from "./users";
import { events } from "./events";
import { registrations, checkins } from "./registrations";

// Relacionamentos da tabela de eventos
export const eventRelations = relations(events, ({ one, many }) => ({
  // Um evento tem um organizador (usuário)
  organizer: one(users, {
    fields: [events.organizerId], // chave estrangeira na tabela de eventos
    references: [users.id], // chave primária na tabela de usuários
  }),

  // Um evento pode ter muitas inscrições
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one, many }) => ({
  // Uma inscrição pertence a um evento e a um usuário
  event: one(events, {
    fields: [registrations.eventId], // fk na tabela de inscrições
    references: [events.id],
  }),
  user: one(users, {
    fields: [registrations.userId],
    references: [users.id],
  }),
  checkins: many(checkins),
}));

export const checkinsRelations = relations(checkins, ({ one }) => ({
  registration: one(registrations, {
    fields: [checkins.registrationId],
    references: [registrations.id],
  }),
}));

// Relacionamentos para Mensagens
import { messages, friendships } from "./social_feedback";

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: 'requester',
  }),
  recipient: one(users, {
    fields: [friendships.recipientId],
    references: [users.id],
    relationName: 'recipient',
  }),
}));