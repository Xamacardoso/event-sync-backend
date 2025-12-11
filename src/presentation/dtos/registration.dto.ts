import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']).describe('New registration status'),
});

export class UpdateRegistrationStatusDto extends createZodDto(updateStatusSchema) {}