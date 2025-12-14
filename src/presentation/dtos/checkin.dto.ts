import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const checkInSchema = z.object({
  method: z.enum(['manual', 'qr']).default('manual'),
});

export class CheckInDto extends createZodDto(checkInSchema) {}