import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleProvider } from './drizzle.provider';

@Global() // Importante: Global permite usar o banco em qualquer lugar sem reimportar
@Module({
  imports: [ConfigModule],
  providers: [DrizzleProvider],
  exports: [DrizzleProvider],
})
export class DrizzleModule {}