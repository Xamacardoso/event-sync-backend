import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './infra/database/drizzle.module';
import { AuthModule } from './infra/auth/auth.module';
import { EventsModule } from './infra/events/events.module';
import { RegistrationsModule } from './infra/registrations/registration.module';
import { UsersModule } from './infra/users/users.module';
import { SocialModule } from './infra/social/social.module';

@Module({
  imports: [
    // Carrega o .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),
    // Carrega banco de dados
    DrizzleModule,
    AuthModule,
    EventsModule,
    RegistrationsModule,
    UsersModule,
    SocialModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }