import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema para criar evento
const createEventSchema = z.object({
  title: z.string().min(3).describe('Event title'),
  description: z.string().min(10).describe('Detailed event description'),
  localAddress: z.string().optional().describe('Physical address of the event'),
  localUrl: z.string().url().or(z.literal('')).optional().describe('Link to the online event'),

  startDate: z.string().datetime().describe('Start date and time of the event'),
  endDate: z.string().datetime().describe('End date and time of the event'),

  price: z.number().min(0).default(0).describe('Event price, 0 for free events'),
  type: z.enum(['free', 'paid']).default('free'),

  requiresApproval: z.boolean().default(false).describe('If true, organizer must approve registrations'),
  registrationStart: z.string().datetime().optional().describe('When registration opens'),
  registrationEnd: z.string().datetime().optional().describe('When registration closes'),

  maxAttendees: z.number().int().positive().optional().describe('Maximum number of attendees'),
  allowedCheckins: z.number().int().positive().default(1).describe('Number of allowed check-ins per attendee'),

  status: z.enum(['draft', 'published']).optional(),
});

export class CreateEventDto extends createZodDto(createEventSchema) { }

// Schema para atualização (Partial torna tudo opcional)
export class UpdateEventDto extends createZodDto(createEventSchema.partial()) { }

const eventFilterSchema = z.object({
  title: z.string().optional().describe('Filtrar por título (busca parcial)'),
  type: z.enum(['free', 'paid']).optional().describe('Filtrar por tipo'),

  status: z.enum(['draft', 'published', 'canceled', 'finished']).optional().describe('Filtrar por status'),

  // Datas recebidas como string ISO
  startDate: z.string().datetime().optional().describe('Eventos a partir desta data'),
  endDate: z.string().datetime().optional().describe('Eventos até esta data'),
});

export class EventFilterDto extends createZodDto(eventFilterSchema) { }