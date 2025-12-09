import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './infra/database/drizzle.module';
import { AuthModule } from './infra/auth/auth.module';

@Module({
  imports: [
    // Carrega o .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    // Carrega banco de dados
    DrizzleModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}