import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const userDetailsSchema = z.object({
    name: z.string().min(3).max(100),
    city: z.string().min(3).max(100).nullable(),
    photoUrl: z.string().url().nullable(),
    role: z.enum(['user', 'organizer']),
    organizerRating: z.number().min(0).max(5).optional(),
    visibilityParticipation: z.boolean(),
});

export class UserDetailsDto extends createZodDto(userDetailsSchema) { }

const updateUserSchema = z.object({
    name: z.string().min(3).max(100),
    city: z.string().min(3).max(100),
    photoUrl: z.string().url(),
}).partial(); // Partial torna todos os campos opcionais

export class UpdateUserDto extends createZodDto(updateUserSchema) { }