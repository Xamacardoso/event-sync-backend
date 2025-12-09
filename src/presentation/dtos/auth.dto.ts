import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Schema de Registro
const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(30, 'Password must be at most 30 characters'),
  // Opcionais no cadastro inicial
  city: z.string().optional(),
  role: z.enum(['user', 'organizer']).default('user').optional(),
});

// Cria a classe DTO (Data Transfer Object)
export class RegisterDto extends createZodDto(registerSchema) {}

// Schema de Login
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(30, 'Password must be at most 30 characters'),
});

export class LoginDto extends createZodDto(loginSchema) {}