import { Controller, Post, Param, UseGuards, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from '../../application/services/registrations.service';
import { JwtAuthGuard } from '../../infra/auth/jwt-auth.guard';
import { CurrentUser } from '../../infra/auth/current-user.decorator';
import { UpdateRegistrationStatusDto } from '../dtos/registration.dto';
import { CheckInDto } from '../dtos/checkin.dto';

@ApiTags('Registrations')
@Controller()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) { }

  @Post('events/:id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register current user to an event' })
  register(@Param('id') eventId: string, @CurrentUser() user: any) {
    return this.registrationsService.register(user.userId, eventId);
  }

  @Patch('registrations/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel current user registration from an event' })
  cancelRegistration(@Param('id') registrationId: string, @CurrentUser() user: any) {
    return this.registrationsService.cancelRegistration(user.userId, registrationId);
  }

  @Get('events/:id/registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all registrations for an event (Organizer only)' })
  listRegistrations(@Param('id') eventId: string, @CurrentUser() user: any) {
    return this.registrationsService.findAllByEvent(user.userId, eventId);
  }

  @Get('events/:id/participants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List public participants for an event' })
  listParticipants(@Param('id') eventId: string) {
    return this.registrationsService.findParticipantsByEvent(eventId);
  }

  @Get('registrations/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all registrations for the current user (Participant only)' })
  listMyRegistrations(@CurrentUser() user: any) {
    return this.registrationsService.findMyRegistrations(user.userId);
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

  @Get('registrations/:id/card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Virtual Card details (Participant)' })
  getCard(@Param('id') registrationId: string, @CurrentUser() user: any) {
    return this.registrationsService.getTvCard(user.userId, registrationId);
  }

  @Post('registrations/:id/check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform Check-in (Organizer)' })
  @ApiResponse({ status: 201, description: 'Check-in successful' })
  @ApiResponse({ status: 409, description: 'Already checked in' })
  checkIn(
    @Param('id') registrationId: string,
    @CurrentUser() user: any,
    @Body() dto: CheckInDto) {
    // O ID na URL é o da inscrição (lido do QR Code)
    // O user.userId é quem está bipando (o organizador)
    return this.registrationsService.checkIn(user.userId, registrationId, dto.method);
  }

  @Get('registrations/:id/certificate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Certificate Data (Participant only, after event)' })
  @ApiResponse({ status: 200, description: 'Certificate data retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Not checked in or event not ended' })
  getCertificate(@Param('id') registrationId: string, @CurrentUser() user: any) {
    return this.registrationsService.getCertificateData(user.userId, registrationId);
  }
}