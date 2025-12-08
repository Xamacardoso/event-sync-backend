import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './infra/database/drizzle.module';

@Module({
  imports: [
    // Carrega o .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    // Carrega banco de dados
    DrizzleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}