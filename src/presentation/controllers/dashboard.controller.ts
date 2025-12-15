import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from '../../application/services/dashboard.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { CurrentUser } from '../../infra/auth/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Obter estatísticas do organizador' })
    getStats(@CurrentUser() user: any) {
        return this.dashboardService.getStats(user.userId);
    }
}
