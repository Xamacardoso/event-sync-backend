import { Controller, Post, Param, UseGuards, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from '../../application/services/registrations.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { CurrentUser } from '../../infra/auth/current-user.decorator';
import { UpdateRegistrationStatusDto } from '../dtos/registration.dto';

@ApiTags('Registrations')
@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('events/:id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register current user to an event' })
  register(@Param('id') eventId: string, @CurrentUser() user: any) {
    return this.registrationsService.register(user.userId, eventId);
  }

  @Get('events/:id/registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all registrations for an event (Organizer only)' })
  listRegistrations(@Param('id') eventId: string, @CurrentUser() user: any) {
    return this.registrationsService.findAllByEvent(user.userId, eventId);
  }

  @Patch('registrations/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or Reject a registration (Organizer only)' })
  updateStatus(
      @Param('id') registrationId: string, 
      @CurrentUser() user: any,
      @Body() dto: UpdateRegistrationStatusDto
  ) {
    return this.registrationsService.updateStatus(user.userId, registrationId, dto.status as any);
  }
}