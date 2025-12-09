import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['user', 'organizer']);
export const eventTypeEnum = pgEnum('event_type', ['free', 'paid']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'finished', 'canceled']);
export const registrationStatusEnum = pgEnum('registration_status', ['pending', 'approved', 'rejected', 'waiting_payment', 'confirmed', 'canceled', 'checked_in']);
export const checkinMethodEnum = pgEnum('checkin_method', ['manual', 'qr']);
export const friendshipStatusEnum = pgEnum('friendship_status', ['pending', 'accepted', 'rejected']);