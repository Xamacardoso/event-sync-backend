import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const eventFilterSchema = z.object({
    title: z.string().optional(),
    type: z.enum(['free', 'paid']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
});

export class EventFilterDto extends createZodDto(eventFilterSchema) { }
