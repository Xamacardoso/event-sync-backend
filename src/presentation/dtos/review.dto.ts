import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateReviewSchema = z.object({
    eventId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

export class CreateReviewDto extends createZodDto(CreateReviewSchema) { }
