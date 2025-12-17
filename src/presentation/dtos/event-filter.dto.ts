import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const eventFilterSchema = z.object({
    title: z.string().optional(),
    type: z.enum(['free', 'paid']).optional(),
    status: z.enum(['draft', 'published', 'canceled', 'finished']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.string().transform(Number).optional().default(1),
    limit: z.string().transform(Number).optional().default(10),
});

export class EventFilterDto extends createZodDto(eventFilterSchema) { }
