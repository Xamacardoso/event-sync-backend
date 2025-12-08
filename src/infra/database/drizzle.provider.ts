import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE_CONNECTION';

export const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');
    
    // Cria o cliente postgres
    const client = postgres(connectionString!);
    
    // Inicializa o drizzle
    return drizzle(client, { schema });
  },
  inject: [ConfigService],
};