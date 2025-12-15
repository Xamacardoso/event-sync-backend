import { Module } from '@nestjs/common';
import { DashboardController } from '../../presentation/controllers/dashboard.controller';
import { DashboardService } from '../../application/services/dashboard.service';
import { DrizzleModule } from '../database/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }
