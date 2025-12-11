import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema para criar evento
const createEventSchema = z.object({
  title: z.string().min(3).describe('Event title'),
  description: z.string().min(10).describe('Detailed event description'),
  localAddress: z.string().optional().describe('Physical address of the event'),
  localUrl: z.string().url().optional().describe('Link to the online event'),
  
  startDate: z.iso.datetime().describe('Start date and time of the event'),
  endDate: z.iso.datetime().describe('End date and time of the event'),
  
  price: z.number().min(0).default(0).describe('Event price, 0 for free events'),
  type: z.enum(['free', 'paid']).default('free'),
  
  requiresApproval: z.boolean().default(false).describe('If true, organizer must approve registrations'),
  registrationStart: z.iso.datetime().optional().describe('When registration opens'),
  registrationEnd: z.iso.datetime().optional().describe('When registration closes'),

  maxAttendees: z.number().int().positive().optional().describe('Maximum number of attendees'),
  allowedCheckins: z.number().int().positive().default(1).describe('Number of allowed check-ins per attendee'),
  
  status: z.enum(['draft', 'published']).optional(),
});

export class CreateEventDto extends createZodDto(createEventSchema) {}

// Schema para atualização (Partial torna tudo opcional)
export class UpdateEventDto extends createZodDto(createEventSchema.partial()) {}